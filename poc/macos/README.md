# Read-only Mac Bible feasibility inventory

THROWAWAY DIAGNOSTIC — NOT PRODUCTION CODE. This does not add a Mac native route to VerseCue or pass RF-03/RF-22.

Use only on an authorized personal Mac with ProPresenter already open. The probe never launches/focuses ProPresenter, selects a reference/edition, saves a copy, executes an accessibility action or triggers output. It does not request an accessibility prompt or change permissions. If the process is not already authorized, it returns `ACCESSIBILITY_NOT_ALREADY_AUTHORIZED`; do not bypass macOS privacy protections. If one matching app is not open, it stops before any accessibility trust query.

Compile locally with existing Apple command-line tools from the workspace root:

```sh
mkdir -p test-results/mac-probe
swiftc -framework AppKit -framework ApplicationServices poc/macos/InspectBibleAccessibility.swift -o test-results/mac-probe/inspect-bible
test-results/mac-probe/inspect-bible --authorized-personal-host
```

Do not install development tools or grant permissions automatically. The standard public Mac workflow compiles and packages this source without executing it; it has no ProPresenter instance and cannot prove control discovery or runtime behavior. The diagnostic is not included in an application release.

## Precompiled diagnostic artifact

The **Compile read-only Mac Bible diagnostic** workflow produces a short-lived **VerseCue-Mac-ReadOnly-Probe** artifact. Download the artifact from a successful run, extract its ZIP, then extract the contained architecture-named tar.gz into a dedicated folder. The tar preserves the executable permission; no compiler installation is needed. Use only a build whose architecture matches the Mac. Artifacts expire after one day; the workflow can be run again. This is a diagnostic download, not a VerseCue application release.

The archive includes this README, the executable, SOURCE_REVISION and SHA256SUMS. In that extracted folder, verify the files and run only on an explicitly authorized personal host:

```sh
shasum -a 256 --check SHA256SUMS
./inspect-bible --authorized-personal-host
```

The adjacent archive .sha256 file verifies download integrity; neither checksum is a publisher signature or proof of safety. No Developer ID signature or notarization is claimed. If macOS blocks execution or accessibility is not already authorized, stop; do not disable Gatekeeper, remove quarantine, install tools or change privacy permissions automatically. A returned error or partial inventory is evidence of an unresolved feasibility condition, not an output authorization.

Only counts, static AX role names and a small allowlist of Bible-related control hints are emitted. No window titles, arbitrary labels/identifiers, field values, Bible text, addresses, user paths, screenshots or audio are included. Titles and identifiers are inspected transiently for exact static hints; their arbitrary contents are discarded. The bounded inventory visits at most250 nodes, depth12 and32 children per node, with a3second traversal budget and150ms per-object accessibility messaging timeout. Provider errors, truncation and hash-collision skips make an empty/partial inventory inconclusive. This is not a hard process-kill deadline or a claim about every accessibility provider.

A successful inventory means only that some existing controls could be read. Actual reference entry, edition selection, complete generated-text/formatting checks, native Save As behavior, focus/manual takeover, latency and disabled-screen output require separate observed authorized tests before implementing or enabling a production Mac adapter. Windows control identifiers are merely allowlisted hints, not an assumed Mac profile.

Apple sources checked2026-11-19:

- [AXIsProcessTrusted](https://developer.apple.com/documentation/applicationservices/1460720-axisprocesstrusted): read existing trust without requesting a prompt.
- [AXIsProcessTrustedWithOptions](https://developer.apple.com/documentation/applicationservices/1459186-axisprocesstrustedwithoptions): distinguishes optional asynchronous prompting; this probe does not use it.
- [AXUIElementSetMessagingTimeout](https://developer.apple.com/documentation/applicationservices/1459345-axuielementsetmessagingtimeout): object-specific messaging timeout, not an OS permission change.
- [AXUIElementCopyAttributeValues](https://developer.apple.com/documentation/applicationservices/1462060-axuielementcopyattributevalues): bounded child-array reads.
- [AXUIElementIsAttributeSettable](https://developer.apple.com/documentation/applicationservices/1459972-axuielementisattributesettable): capability query without setting a value.

Runtime behavior on the actual church Mac, Apple privacy authorization and ProPresenter accessibility support remain **PENDING**. Do not count compilation as integration feasibility.
