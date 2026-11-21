# Automatically prepare missing detected passages for review

2026-11-18 UTC. PR22 / RF-01, RF-02 and RF-20. This closes the extra Prepare-click gap on the restricted Windows native route; it does not enable arbitrary Auto output or pass the original service acceptance gates.

## Session setup and operation

In **Settings / Output**, an operator in Confirm can explicitly choose **Also prepare missing passages: allow ProPresenter focus changes and new Bible copies this session**. The setting is off at startup, exists only in memory, and is unavailable unless the current native route reports ready. It also enables detected-reference preparation. The main workspace's preparation choice can still be used independently for saved passages only.

After consent, one valid detected reference follows the same coordinator used by manual Prepare:

1. Reuse an exact saved passage where possible. Duplicates need an explicit choice; no first-copy guess or deletion.
2. If missing, recheck the target and perform the bounded native Bible preparation/save transaction, preserving the service playlist and checking output identity before/after.
3. Re-resolve the created passage and show its actual saved text for review. Existing Confirm capture can remain active; no microphone is acquired or reacquired.
4. Send no output. Appearance/translation/clipping and authorized test-target checks remain required before deliberate desktop confirmation. Split passages still use ordered Continue.

Native preparation moves ProPresenter's focus/view and creates an internal copy. This is disclosed at consent; it is not a seamless vendor API or a new presentation engine. The existing twelve-second worker deadline, cancellation, exact-edition checks, one-unambiguous-library restriction and 100-copy-attempts-per-run limit remain in force. No timeout extension, output retry, theme/Look edit, permission change or automatic cleanup is introduced.

## Ownership and cancellation

Consent belongs to the desktop window that granted it and to the exact target generation/address. Reloading or closing that window revokes it even without microphone capture or an existing review. Stop, mode/target/configuration changes and recovery revoke the choice. Enabling Auto clears it; this preparation automation runs only in Confirm. A private API review cannot grant native focus/copy consent.

New references cancel running work and coalesce to the latest destination. Multiple references, prohibited/incomplete/invalid input and unsafe session states do not start preparation. Ordinary sermon speech with an unchanged reference epoch does not cancel a running preparation. Hold/correction/ambiguity that invalidates the reference epoch does cancel it. Loss/cut/timing safeguards and the coordinator's owner/target checks still apply. An uncertain/canceled native action may leave preparation or a copy in ProPresenter; inspect it rather than blindly retrying.

## Evidence and remaining acceptance

342 module tests and syntax checks pass. Scheduler tests cover separate focus/copy consent, Confirm/readiness requirements, target revocation, an owning window, saved-only defaults and ordinary-speech versus changed-reference cancellation. Existing navigation, citation assembly, minimized preparation and guarded Auto source regressions pass. The source workspace check confirms settings at 200% and the existing responsive widths without horizontal overflow.

`node scripts/test-detected-native-preparation.cjs [isolated-package-executable]` uses synthetic native/speech/target adapters and a capture lease. Through the real Output setting it proves: disabled until explicit consent; missing detected passage reaches review without a Prepare click; ordinary speech does not cancel it; input/background protection survives minimization; exactly one copy is created; zero output triggers; Stop revokes consent; owner reload revokes consent with no capture. This is not an actual Windows native-helper, Mac native route, microphone, speech-quality, physical output or latency acceptance test. Matching package results must name the tested revision.

The earlier real personal Windows helper tests remain valid only within their [documented scope](56-preparation-with-authorized-input.md), including an 11,387ms successful attempt, a prior timeout and clipping. Mac/LAN native capability, repeated real-helper reliability, actual shared-device load, Companion/media coexistence, physical room/stream fidelity, speech accuracy/latency and field testing remain required by the [complete checklist](51-reference-driven-bible-workflow.md). This draft is not a new service release.

## Manual operation without an input lease

The normal Confirm coordinator cancels the recognition worker without resetting its own detected-preparation scheduler, including when no audio input is active. It remains Confirm with dry run/disarmed output and never acquires a microphone. Legacy/Auto preparation still pauses. The no-input variant of the synthetic desktop test passes; its actual audio-preservation assertions are recorded as not applicable. This corrects a self-cancellation found after the first checkpoint.

Successful native receipts now retain only allowlisted stage-start offsets bounded to twelve seconds. Repeated stage names record the last start, not total stage durations. The data contains no Bible text, transcript, path, address or token, and cannot certify appearance/output. The preparation-only personal HIL script waits for Computer Use to activate Review reference, refuses existing copies/repeated recorded attempts, verifies playlist/output unchanged and retains failures. It is not an audio-latency test.

## Personal-host automatic preparation result

At revision43e8d39, Computer Use activated the ordinary Review reference action for a new Hosea1:5/KJV. Session-consented preparation created one exact saved copy and reached review with the isolated window minimized, no microphone/capture lease and no Prepare click. Worker time was9,907ms. API output and Sunday Service contents stayed unchanged; clipping remained and unchecked confirmation stayed blocked. No output trigger was sent. [Sanitized evidence](evidence/detected-native-personal-2026-11-18.json).

The stage offsets show native accessibility/control overhead, but one warm personal-host case is not repeated reliability or an audible-end latency benchmark. A subsequent optimization restricts selector/save discovery to the observed Bible viewer and caches selected-edition text within each fresh read. All focus, process, hit-test, exact-edition/reference, deadline and readback guards remain. That change requires its own actual-helper verification before a reliability/performance claim.

The scoped Bible/name-cache helper at095f097 passed a separate fresh Hosea1:6 test: one new two-cue copy, minimized/no capture, unchanged API output and Sunday Service contents, clipping/unchecked confirmation blocked. Worker10,979ms; stage offsets place most remaining cost near Save As. Different passages and uncontrolled load make this unsuitable for a speedup/p50/p95 claim.

A subsequent popup-only search at9e2e72d failed the fresh Hosea1:7 case with SAVE_COPY_MENU_NOT_VERIFIED. Read-only inspection confirmed zero new copies and unchanged output/playlist. Its assumption was removed and the previously verified search recompiled; the failure remains in the evidence. Computer Use closed the remaining Save As menu without choosing a save/output action. No blind retry or timeout increase followed.

After restoring that search, the scoped helper separately passed KJV-to-ASV preparation (8916ms) and ASV-to-KJV restoration (8474ms), without saving copies, microphone input or output. [Edition evidence](evidence/scoped-native-editions-2026-11-18.json) includes the exact helper hash and revision. KJV was visually confirmed afterward. These timings still do not meet the proposed full system target and do not verify other editions or physical output.

## Window-specific consent enforcement

Native permission is now checked against the actual originating desktop window at dispatch, not just stored for reload/close revocation. Another trusted full/compact window can still use saved lookup but cannot borrow permission for focus changes or new Bible copies. Its Output checkbox remains unchecked and explains the other-window ownership. Explicitly enabling it there transfers the session grant; it is not silently shared. The granting window can continue its own preparation.367 module tests and real two-window synthetic desktop recovery/uncertainty/no-input scenarios pass; no actual ProPresenter or microphone is used. The first harness attempt used the wrong IPC for opening Compact, timed out, and was corrected to the existing compact API before these passing results. No application or OS permissions were changed to resolve that test failure.

## Finer Save As timing investigation

Three additional content-free stage starts separate the verified Save As pointer action, command discovery and final reference/edition verification: save-copy-menu-opened, find-save-copy-command and verify-save-copy-command. The menu search, invocation, focus/hit-test guards and12s deadline are unchanged. The Windows helper recompiles and the stage allowlist boundary test passes. Timing values remain last-start offsets, not durations or output/fidelity proof. A single fresh personal H1:8 diagnostic is prepared; no result is claimed before it runs. The HIL script uses the actual UTC day for new reports and checks all prior acceptance-day folders to prevent a previously recorded reference from being retried after midnight.

The single fresh H1:8/KJV test at6a5aa3a passed preparation/review:10219ms worker, one complete saved cue/copy, minimized/no capture, unchanged API output and Sunday contents, clipping retained and unchecked Confirm blocked. [Sanitized evidence](evidence/detected-native-timing-personal-2026-11-19.json). Stage starts were open-save7141ms, menu-opened7242ms, find-command7242ms, verify-command8872ms and save8921ms. Thus this one search interval spans about1630ms and the pointer-opening interval about101ms; these are scoped observations, not p50/p95 or a proven optimization. Earlier repeated stage offsets cannot be interpreted as complete per-stage durations. Validation/control discovery and generation checks also remain substantial. No search/deadline change or latency pass follows. The asynchronously closing test window rejected a later UI activation attempt; one actual save and zero output were verified. Original Bible workspace was visually restored to H1:1/KJV without saving or output, after a delayed accessibility value change; no theme/Look edit.
