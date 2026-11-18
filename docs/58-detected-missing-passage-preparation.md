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

341 module tests and syntax checks pass. Scheduler tests cover separate focus/copy consent, Confirm/readiness requirements, target revocation, an owning window, saved-only defaults and ordinary-speech versus changed-reference cancellation. Existing navigation, citation assembly, minimized preparation and guarded Auto source regressions pass. The source workspace check confirms settings at 200% and the existing responsive widths without horizontal overflow.

`node scripts/test-detected-native-preparation.cjs [isolated-package-executable]` uses synthetic native/speech/target adapters and a capture lease. Through the real Output setting it proves: disabled until explicit consent; missing detected passage reaches review without a Prepare click; ordinary speech does not cancel it; input/background protection survives minimization; exactly one copy is created; zero output triggers; Stop revokes consent; owner reload revokes consent with no capture. This is not an actual Windows native-helper, Mac native route, microphone, speech-quality, physical output or latency acceptance test. Matching package results must name the tested revision.

The earlier real personal Windows helper tests remain valid only within their [documented scope](56-preparation-with-authorized-input.md), including an 11,387ms successful attempt, a prior timeout and clipping. Mac/LAN native capability, repeated real-helper reliability, actual shared-device load, Companion/media coexistence, physical room/stream fidelity, speech accuracy/latency and field testing remain required by the [complete checklist](51-reference-driven-bible-workflow.md). This draft is not a new service release.
