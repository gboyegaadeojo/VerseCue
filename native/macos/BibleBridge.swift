// VerseCue Bible bridge for macOS (experimental). Same one-line JSON protocol as the Windows helper.
// Operations: "inspect" (read-only summary of ProPresenter's accessibility tree, used once to verify element names),
// "prepare" (type an exact reference into ProPresenter's Bible search) and "prepare-chapter" (a whole chapter,
// then scroll the spoken verse into view). It never clicks a slide, never selects one and never triggers output.
import Cocoa
import ApplicationServices

struct Failure: Error { let code: String }
func require(_ ok: Bool, _ code: String) throws { if !ok { throw Failure(code: code) } }
let started = Date()
func elapsedMs() -> Int { Int(Date().timeIntervalSince(started) * 1000) }
func emit(_ object: [String: Any], to handle: FileHandle) {
    if let data = try? JSONSerialization.data(withJSONObject: object), let line = String(data: data, encoding: .utf8) { handle.write((line + "\n").data(using: .utf8)!) }
}
var timings: [String: Int] = [:]
func stage(_ name: String) { timings[name] = elapsedMs(); emit(["stage": name, "elapsedMs": elapsedMs()], to: FileHandle.standardError) }

func value(_ el: AXUIElement, _ name: String) -> AnyObject? { var v: AnyObject?; return AXUIElementCopyAttributeValue(el, name as CFString, &v) == .success ? v : nil }
func text(_ el: AXUIElement, _ name: String) -> String? { value(el, name) as? String }
func kids(_ el: AXUIElement) -> [AXUIElement] { (value(el, kAXChildrenAttribute) as? [AXUIElement]) ?? [] }
func role(_ el: AXUIElement) -> String { text(el, kAXRoleAttribute) ?? "" }
func frame(_ el: AXUIElement) -> CGRect? {
    guard let p = value(el, kAXPositionAttribute), let s = value(el, kAXSizeAttribute) else { return nil }
    var point = CGPoint.zero, size = CGSize.zero
    AXValueGetValue(p as! AXValue, .cgPoint, &point); AXValueGetValue(s as! AXValue, .cgSize, &size)
    return CGRect(origin: point, size: size)
}
// Bounded depth-first walk; ProPresenter windows can hold thousands of elements.
func walk(_ root: AXUIElement, limit: Int = 25000, _ visit: (AXUIElement, Int) -> Bool) {
    var stack: [(AXUIElement, Int)] = [(root, 0)], seen = 0
    while let (el, depth) = stack.popLast(), seen < limit { seen += 1; if !visit(el, depth) { return }; if depth < 40 { for child in kids(el).reversed() { stack.append((child, depth + 1)) } } }
}
func canonical(_ s: String?) -> String {
    var t = (s ?? "").trimmingCharacters(in: .whitespacesAndNewlines).replacingOccurrences(of: "\u{2013}", with: "-").replacingOccurrences(of: "\u{2014}", with: "-")
    t = t.replacingOccurrences(of: #"\s+"#, with: " ", options: .regularExpression)
    t = t.replacingOccurrences(of: #"^Psalms\b"#, with: "Psalm", options: [.regularExpression, .caseInsensitive])
    return t.lowercased()
}

func proPresenter() throws -> NSRunningApplication {
    let apps = NSWorkspace.shared.runningApplications.filter { ($0.localizedName ?? "").range(of: "ProPresenter", options: .caseInsensitive) != nil || ($0.bundleIdentifier ?? "").lowercased().contains("renewedvision") }
    try require(apps.count == 1, "ONE_PROPRESENTER_INSTANCE_REQUIRED")
    return apps[0]
}
// The Bible search field: an editable text field whose label, description, placeholder or identifier mentions the Bible reference.
func referenceField(in root: AXUIElement) -> [AXUIElement] {
    var found: [AXUIElement] = []
    walk(root) { el, _ in
        let r = role(el)
        if r == kAXTextFieldRole || r == "AXSearchField" || r == kAXComboBoxRole {
            let words = [text(el, kAXIdentifierAttribute), text(el, kAXDescriptionAttribute), text(el, kAXPlaceholderValueAttribute), text(el, kAXTitleAttribute), text(el, kAXHelpAttribute)].compactMap { $0 }.joined(separator: " ")
            if words.range(of: #"bible|reference|scripture|passage|verse"#, options: [.regularExpression, .caseInsensitive]) != nil { found.append(el) }
        }
        return true
    }
    return found
}
func labels(in root: AXUIElement) -> [(AXUIElement, String)] {
    var out: [(AXUIElement, String)] = []
    walk(root) { el, _ in
        if role(el) == kAXStaticTextRole, let v = text(el, kAXValueAttribute) ?? text(el, kAXTitleAttribute), v.range(of: #"^[1-3]?\s?[A-Za-z ]+ [0-9]+:[0-9]+"#, options: .regularExpression) != nil { out.append((el, v)) }
        return true
    }
    return out
}

func inspect(_ app: NSRunningApplication) -> [String: Any] {
    let root = AXUIElementCreateApplication(app.processIdentifier)
    var nodes: [[String: Any]] = []
    walk(root, limit: 6000) { el, depth in
        var node: [String: Any] = ["d": depth, "role": role(el)]
        for (key, attr) in [("id", kAXIdentifierAttribute), ("desc", kAXDescriptionAttribute), ("title", kAXTitleAttribute), ("placeholder", kAXPlaceholderValueAttribute), ("subrole", kAXSubroleAttribute)] { if let v = text(el, attr), !v.isEmpty { node[key] = String(v.prefix(80)) } }
        // Only short values (references, labels); never long text.
        if let v = text(el, kAXValueAttribute), !v.isEmpty, v.count <= 40 { node["value"] = v }
        if let f = frame(el) { node["frame"] = [Int(f.minX), Int(f.minY), Int(f.width), Int(f.height)] }
        nodes.append(node); return nodes.count < 6000
    }
    return ["ok": true, "state": "inspection-only", "app": app.localizedName ?? "", "bundle": app.bundleIdentifier ?? "", "version": (app.bundleURL.flatMap { Bundle(url: $0)?.infoDictionary?["CFBundleShortVersionString"] as? String }) ?? "", "referenceFields": referenceField(in: root).count, "nodes": nodes, "outputRequests": 0]
}

func pressReturn(pid: pid_t) throws {
    let source = CGEventSource(stateID: .hidSystemState)
    guard let down = CGEvent(keyboardEventSource: source, virtualKey: 0x24, keyDown: true), let up = CGEvent(keyboardEventSource: source, virtualKey: 0x24, keyDown: false) else { throw Failure(code: "KEYBOARD_INPUT_BLOCKED") }
    down.postToPid(pid); up.postToPid(pid)
}

// Scroll the slide grid until the verse label is inside its scroll area. Scrolling only; nothing is clicked or selected.
func scrollToVerse(root: AXUIElement, reference: String, verse: Int, chapterVerses: Int) -> Bool {
    let target = canonical(reference + ":" + String(verse))
    func find() -> AXUIElement? { labels(in: root).first { canonical($0.1) == target }?.0 }
    func scrollArea(of el: AXUIElement) -> AXUIElement? { var cur: AnyObject? = value(el, kAXParentAttribute); while let p = cur { let e = p as! AXUIElement; if role(e) == kAXScrollAreaRole { return e }; cur = value(e, kAXParentAttribute) }; return nil }
    guard let anchor = find() ?? labels(in: root).first(where: { canonical($0.1).hasPrefix(canonical(reference) + ":") })?.0, let area = scrollArea(of: anchor), let areaFrame = frame(area) else { return false }
    func visible(_ el: AXUIElement) -> Bool { guard let f = frame(el) else { return false }; return f.minY >= areaFrame.minY && f.maxY <= areaFrame.maxY }
    if let label = find(), visible(label) { return true }
    guard let bar = value(area, kAXVerticalScrollBarAttribute) else { return false }
    let scrollBar = bar as! AXUIElement
    var position = chapterVerses > 1 ? Double(verse - 1) / Double(chapterVerses - 1) : 0
    for _ in 0..<8 {
        AXUIElementSetAttributeValue(scrollBar, kAXValueAttribute as CFString, NSNumber(value: max(0, min(1, position))))
        Thread.sleep(forTimeInterval: 0.15)
        if let label = find() { if visible(label) { return true }; if let f = frame(label) { position += Double(f.midY - areaFrame.midY) / Double(max(1, areaFrame.height)) * 0.25 } }
        else { position += 0.05 }
    }
    return false
}

func run(_ request: [String: Any]) throws -> [String: Any] {
    stage("validate-target")
    let operation = request["operation"] as? String ?? "inspect"
    try require(["inspect", "prepare", "prepare-chapter"].contains(operation), "UNKNOWN_OPERATION")
    try require(AXIsProcessTrusted(), "ACCESSIBILITY_PERMISSION_REQUIRED")
    let app = try proPresenter(); stage("target-process-found")
    if operation == "inspect" { return inspect(app) }
    let chapter = operation == "prepare-chapter"
    guard let reference = request["reference"] as? String, let translation = request["translation"] as? String else { throw Failure(code: "INVALID_PREPARE_REQUEST") }
    let shape = chapter ? #"^[1-3]?[A-Za-z ]+ [1-9][0-9]{0,2}$"# : #"^[1-3]?[A-Za-z ]+ [1-9][0-9]{0,2}:[1-9][0-9]{0,2}(-([1-9][0-9]{0,2}:)?[1-9][0-9]{0,2})?$"#
    try require(reference.count <= 100 && reference.range(of: shape, options: .regularExpression) != nil, "INVALID_REFERENCE_SHAPE")
    let focusVerse = request["focusVerse"] as? Int ?? 0, chapterVerses = request["chapterVerses"] as? Int ?? 0
    if chapter { try require(chapterVerses >= 1 && chapterVerses <= 176 && focusVerse >= 1 && focusVerse <= chapterVerses, "INVALID_FOCUS_VERSE") }
    let root = AXUIElementCreateApplication(app.processIdentifier)
    let fields = referenceField(in: root); try require(fields.count == 1, fields.isEmpty ? "OPEN_BIBLES_VIEW_IN_PROPRESENTER" : "REFERENCE_INPUT_AMBIGUOUS")
    let field = fields[0]; stage("reference-control-verified")
    try require(app.activate(options: []), "COULD_NOT_FOCUS_PROPRESENTER"); Thread.sleep(forTimeInterval: 0.2)
    AXUIElementSetAttributeValue(field, kAXFocusedAttribute as CFString, kCFBooleanTrue)
    try require(AXUIElementSetAttributeValue(field, kAXValueAttribute as CFString, reference as CFString) == .success, "REFERENCE_NOT_EDITABLE")
    try require(canonical(text(field, kAXValueAttribute)) == canonical(reference), "REFERENCE_INPUT_READBACK_MISMATCH")
    stage("commit-reference")
    if AXUIElementPerformAction(field, kAXConfirmAction as CFString) != .success { try pressReturn(pid: app.processIdentifier) }
    stage("verify-generated-labels")
    let expected = canonical(reference), deadline = Date().addingTimeInterval(chapter ? 15 : 5)
    var stable = 0, count = 0
    while Date() < deadline {
        let found = labels(in: root); count = found.count
        let match = chapter ? found.contains { canonical($0.1).hasPrefix(expected + ":") } : found.contains { canonical($0.1) == expected || canonical($0.1).hasPrefix(expected + " ") }
        stable = match && count > 0 ? stable + 1 : 0
        if stable >= 2 {
            stage("prepared-review")
            if chapter { stage("scroll-to-verse"); let visible = scrollToVerse(root: root, reference: reference, verse: focusVerse, chapterVerses: chapterVerses)
                return ["ok": true, "state": "chapter-prepared-no-output", "reference": reference, "translation": translation, "translationVerified": false, "focusVerse": focusVerse, "focusVisible": visible, "referenceLabels": count, "clippingWarning": false, "saveCopyRequested": false, "formattingVerified": false, "outputRequests": 0, "outputObserved": false, "elapsedMs": elapsedMs(), "timingsMs": timings] }
            return ["ok": true, "state": "prepared-needs-operator-review", "reference": reference, "translation": translation, "translationVerified": false, "referenceLabels": count, "clippingWarning": false, "saveCopyRequested": false, "formattingVerified": false, "outputRequests": 0, "outputObserved": false, "elapsedMs": elapsedMs(), "timingsMs": timings]
        }
        Thread.sleep(forTimeInterval: 0.15)
    }
    throw Failure(code: "PREPARATION_COMPLETION_NOT_VERIFIED")
}

let input = readLine(strippingNewline: true) ?? ""
do {
    try require(input.count <= 8192, "INVALID_REQUEST_SIZE")
    guard let data = input.data(using: .utf8), let request = try JSONSerialization.jsonObject(with: data) as? [String: Any] else { throw Failure(code: "INVALID_REQUEST") }
    emit(try run(request), to: FileHandle.standardOutput); exit(0)
} catch let failure as Failure { emit(["ok": false, "code": failure.code, "outputRequests": 0], to: FileHandle.standardOutput); exit(2) }
catch { emit(["ok": false, "code": "NATIVE_PREPARATION_UNCERTAIN", "outputRequests": 0], to: FileHandle.standardOutput); exit(3) }
