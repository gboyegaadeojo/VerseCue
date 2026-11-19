# Read-only Mac Bible feasibility inventory

THROWAWAY DIAGNOSTIC — NOT PRODUCTION CODE. This does not add a Mac native route to VerseCue or pass RF-03/RF-22.

Use only on an authorized personal Mac with ProPresenter already open. The probe never launches/focuses ProPresenter, selects a reference/edition, saves a copy, executes an accessibility action or triggers output. It does not request an accessibility prompt or change permissions. If the process is not already authorized, it returns `ACCESSIBILITY_NOT_ALREADY_AUTHORIZED`; do not bypass macOS privacy protections. If one matching app is not open, it stops before any accessibility trust query.

Compile locally with existing Apple command-line tools from the workspace root:

```sh
mkdir -p test-results/mac-probe
swiftc -framework AppKit -framework ApplicationServices poc/macos/InspectBibleAccessibility.swift -o test-results/mac-probe/inspect-bible
test-results/mac-probe/inspect-bible --authorized-personal-host
```

Do not install development tools or grant permissions automatically. The standard public Mac workflow compiles this source only; it has no ProPresenter instance and cannot prove control discovery or runtime behavior. The diagnostic is not included in an application release.

Only counts, static AX role names and a small allowlist of Bible-related control hints are emitted. No window titles, arbitrary labels/identifiers, field values, Bible text, addresses, user paths, screenshots or audio are included. Titles and identifiers are inspected transiently for exact static hints; their arbitrary contents are discarded. The bounded inventory visits at most250 nodes, depth12 and32 children per node, with a3second traversal budget and150ms per-object accessibility messaging timeout. Provider errors, truncation and hash-collision skips make an empty/partial inventory inconclusive. This is not a hard process-kill deadline or a claim about every accessibility provider.

A successful inventory means only that some existing controls could be read. Actual reference entry, edition selection, complete generated-text/formatting checks, native Save As behavior, focus/manual takeover, latency and disabled-screen output require separate observed authorized tests before implementing or enabling a production Mac adapter. Windows control identifiers are merely allowlisted hints, not an assumed Mac profile.

Apple sources checked2026-11-19:

- [AXIsProcessTrusted](https://developer.apple.com/documentation/applicationservices/1460720-axisprocesstrusted): read existing trust without requesting a prompt.
- [AXIsProcessTrustedWithOptions](https://developer.apple.com/documentation/applicationservices/1459186-axisprocesstrustedwithoptions): distinguishes optional asynchronous prompting; this probe does not use it.
- [AXUIElementSetMessagingTimeout](https://developer.apple.com/documentation/applicationservices/1459345-axuielementsetmessagingtimeout): object-specific messaging timeout, not an OS permission change.
- [AXUIElementCopyAttributeValues](https://developer.apple.com/documentation/applicationservices/1462060-axuielementcopyattributevalues): bounded child-array reads.
- [AXUIElementIsAttributeSettable](https://developer.apple.com/documentation/applicationservices/1459972-axuielementisattributesettable): capability query without setting a value.

Runtime behavior on the actual church Mac, Apple privacy authorization and ProPresenter accessibility support remain **PENDING**. Do not count compilation as integration feasibility.
