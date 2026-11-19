// THROWAWAY DIAGNOSTIC — NOT PRODUCTION CODE
// Read-only inventory of one already-open, explicitly authorized ProPresenter.
// No focus, AX actions, attribute writes, text values or permission prompts.
import AppKit
import ApplicationServices
import Foundation

func finish(_ report: [String: Any], _ code: Int32) -> Never {
    if let data = try? JSONSerialization.data(withJSONObject: report, options: [.sortedKeys]),
       let text = String(data: data, encoding: .utf8) { print(text) }
    exit(code)
}
var report: [String: Any] = [
    "diagnostic": "macos-bible-accessibility-read-only", "schemaVersion": 1,
    "productionRouteVerified": false, "outputRequests": 0,
    "permissionPromptRequested": false, "applicationActions": 0,
    "textValuesRead": false, "physicalOutputVerified": false
]
guard CommandLine.arguments == [CommandLine.arguments[0], "--authorized-personal-host"] else {
    report["state"] = "EXPLICIT_PERSONAL_HOST_FLAG_REQUIRED"; finish(report, 64)
}
let matches = NSWorkspace.shared.runningApplications.filter {
    $0.localizedName == "ProPresenter" && $0.bundleURL?.lastPathComponent == "ProPresenter.app"
}
report["matchingApplicationCount"] = matches.count
guard matches.count == 1 else {
    report["state"] = "ONE_OPEN_PROPRESENTER_REQUIRED"; finish(report, 2)
}
// This query has no prompt option. Do not attempt to grant or change trust.
guard AXIsProcessTrusted() else {
    report["state"] = "ACCESSIBILITY_NOT_ALREADY_AUTHORIZED"; finish(report, 2)
}
let target = AXUIElementCreateApplication(matches[0].processIdentifier)
guard AXUIElementSetMessagingTimeout(target, 0.15) == .success else {
    report["state"] = "ACCESSIBILITY_TIMEOUT_NOT_ESTABLISHED"; finish(report, 2)
}
let deadline = ProcessInfo.processInfo.systemUptime + 3
let names: Set<String> = ["Bible", "Bibles", "Reference", "Translation", "Options", "Save As", "Save As…", "Save As Presentation"]
let identifiers: Set<String> = ["bibleViewerHeader", "ReferenceTextBox", "loadedBibleSelectorSelf", "SaveCopyDocumentButton"]
var pending: [(AXUIElement, Int)] = [(target, 0)]
var seen: Set<CFHashCode> = []
var visited = 0, truncated = false, editableFields = 0, errors = 0
var roles: [String: Int] = [:]
var controls: [[String: Any]] = []
func stringAttribute(_ node: AXUIElement, _ name: String) -> String? {
    var value: CFTypeRef?
    guard AXUIElementCopyAttributeValue(node, name as CFString, &value) == .success,
          let text = value as? String, text.utf8.count <= 128 else { return nil }
    return text
}
while !pending.isEmpty && visited < 250 && ProcessInfo.processInfo.systemUptime < deadline {
    let (node, depth) = pending.removeLast()
    // Hash collisions conservatively skip nodes; no completeness claim follows.
    guard seen.insert(CFHash(node)).inserted else { continue }
    visited += 1
    let role = stringAttribute(node, kAXRoleAttribute) ?? "UNKNOWN"
    let safeRole = role.hasPrefix("AX") && role.utf8.count <= 48 ? role : "UNKNOWN"
    roles[safeRole, default: 0] += 1
    let title = stringAttribute(node, kAXTitleAttribute)
    let identifier = stringAttribute(node, kAXIdentifierAttribute)
    var hints: [String] = []
    if let title = title, names.contains(title) { hints.append(title) }
    if let identifier = identifier, identifiers.contains(identifier) { hints.append(identifier) }
    if !hints.isEmpty && controls.count < 24 {
        controls.append(["role": safeRole, "depth": depth, "allowlistedHints": hints])
    }
    if role == kAXTextFieldRole {
        var settable: DarwinBoolean = false
        if AXUIElementIsAttributeSettable(node, kAXValueAttribute as CFString, &settable) == .success && settable.boolValue { editableFields += 1 }
    }
    var count: CFIndex = 0
    guard AXUIElementGetAttributeValueCount(node, kAXChildrenAttribute as CFString, &count) == .success else { errors += 1; continue }
    if count == 0 { continue }
    if depth >= 12 { truncated = true; continue }
    if count > 32 { truncated = true }
    var children: CFArray?
    guard AXUIElementCopyAttributeValues(node, kAXChildrenAttribute as CFString, 0, min(count, 32), &children) == .success,
          let items = children as? [AXUIElement] else { errors += 1; continue }
    for child in items.reversed() { pending.append((child, depth + 1)) }
}
if !pending.isEmpty { truncated = true }
report["state"] = "READ_ONLY_INVENTORY_ONLY"
report["visitedNodes"] = visited
report["truncated"] = truncated
report["readErrors"] = errors
report["roles"] = roles
report["editableFieldCount"] = editableFields
report["candidateControls"] = controls
report["nativePreparationVerified"] = false
report["referenceSelectionVerified"] = false
report["editionSelectionVerified"] = false
report["saveCopyVerified"] = false
finish(report, 0)
