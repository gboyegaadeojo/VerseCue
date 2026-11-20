# What remains before VerseCue is ready for service

Updated: 2026-11-20. Read [the handoff](../HANDOFF.md) for exact branches, evidence and the next command. This is a plain-English work list; the complete [original-requirement audit](99-original-requirement-evidence-audit.md), functional requirements, non-functional requirements and acceptance plan remain authoritative. Completed software checks do not establish real service readiness.

## Finish the current component

Components through PR66 are merged: adjustable passage limits, coding-agent handoff, selected-input format/validation, interrupted speech scratch recovery and a ten-second meter-only input test. Main passes534 module tests; integration passes537. Booth readability is the active independent component. Aggregate PR22 stays draft, and service acceptance/new release remain pending.

## Software to build or strengthen

| Work | What the operator should gain | Requirements / next evidence |
| --- | --- | --- |
| Clearer microphone setup | See what the selected input actually reports; understand an unavailable channel or permission error instead of silently listening to another input | FR-001/002/003/005/007/008. PR64 reported format/channel validation and PR66 bounded meter-only test are merged. Actual hardware mapping, permission/hotplug and loopback prerequisite verification remain. |
| Better speech recognition feedback | Read a rolling preview with provisional speech clearly different from a confirmed citation; diagnose missed or corrected references | FR-009/010/012/017/019/020/024/025. Current final-chunk recognition and deterministic parsing do not establish true streaming partials or real accent accuracy. Add tested confusion handling from labeled evidence. |
| Real macOS ProPresenter preparation | Use the actual installed Bible workflow on Mac with the same safeguards | FR-044 and RF03/platform matrix. Native route remains unimplemented/unverified; requires an authorized Mac accessibility profile. Mac CI is insufficient. |
| Live-service accessibility | Read important states from the booth, use deliberate keyboard actions, and operate with a screen reader | FR-026/027/030/031/061, NFR-015. Assess dense controls against required booth text/target sizes; test focus, emergency stop, NVDA/VoiceOver and volunteer tasks. Preserve the approved professional workspace direction. |
| Remaining privacy and recovery assurance | Recover safely without leaving unintended audio/transcript residue | FR-057/059/062, NFR-010/019. Backup/restore UI and reset protections are built. Audit crash WAV/swap residue and documented retention; optional persistent recording remains off/unimplemented. |
| Trusted installation and updates | Install, identify and roll back a release safely on each claimed platform | FR-060, NFR-014/018. Signing/notarization, manual signed update/service lock, rollback/uninstall and independent license/dependency review remain. Checksums, inventory validation and ad-hoc signing do not substitute for trusted signing. No paid certificate/service without authorization. |

## Test with real ProPresenter and the service setup

These are tests of preservation, not requests to build a second theme editor, Looks editor or Sunday playlist system. ProPresenter continues to own all of those.

- Verify exact passage text, numbering, ranges and edition switches for IFC's KJV, Amplified, Amplified Classic, NIV, NKJV and The Message. Personal-host KJV/ASV evidence does not prove these six editions. Never guess numbering or silently substitute an edition.
- Verify existing Bible themes, room/stream Looks and routing are preserved, text is not clipped, and Sunday playlist/media/manual/Companion operation remains usable. Include unrelated operator changes, failures, reconnection and uncertain-output recovery. Retain all RF01–22 cases and the original FR/NFR mappings.
- Measure actual audible-reference-end to confirmed output latency, including native preparation. Proposed p50≤2s/p95≤4s targets remain measurement gates; existing slow/clipped preparation is not a pass.
- Verify real MOTU M4 input/channel selection, unplug/replug, permissions and format conversion. The selected microphone must not silently change.
- Run real same-host and LAN tests on every claimed Windows/macOS/architecture profile. Verify minimized/background operation, sleep/wake and manual takeover under realistic shared CPU/GPU load.

Personal Windows testing is authorized under the safeguards in HANDOFF.md. Church production access/output is not. Physical tests and missing Mac access must remain pending until they can actually be observed.

## Measure service readiness

- Build a labeled, held-out real sermon set before claiming reference precision/recall, accent performance or false-positive rates. The supplied Sunday video starting at1:18:10 is a source, not a completed accuracy benchmark; a short unlabeled pilot is not ground truth. Synthetic transcripts and loopback fixtures only prove their stated software behavior.
- Complete the original90-minute and3-hour stability,10-hour wrong-output rehearsal and CPU/RAM measurements on representative hosts. A historical90-minute minimized synthetic fixture applies only to its recorded code baseline and scope.
- Verify the original precision/recall thresholds, zero unapproved wrong displays, p50/p95 delay,30-second manual failback and failure/reconnect requirements using the defined methods.
- Conduct at least three volunteer usability sessions, keyboard/screen-reader checks and physical room/stream review. Record errors, assistance, exact versions, expected/actual outcomes and reviewer approval.
- Obtain the defined technical/operational acceptance and release decision. P0 remains PENDING until route/fidelity/translation/platform/timing evidence and IFC approval are complete; provisional development approval does not waive these tests.

## Optional or deferred capabilities

Global hotkeys (FR-032) and discovery (FR-042) stay off unless deliberately supported and enabled. Bible-only Clear (FR-040) remains unavailable until a safe scoped route is verified; never replace it with Clear All. Cloud credentials/provider work (FR-053) is conditional future work, with secure vault storage if introduced; free local use remains the preference. Persistent recording is optional/off. Near-verbatim quote matching is review-only and opt-in; broad semantic paraphrase matching and automatic quote display are not established capabilities.

Preserve each item's original priority and release assignment. Do not turn optional work into a release blocker or erase an unmet Must because it is hard. Use the complete86-row original audit to assess completion, and record subsequent evidence as dated follow-ups rather than rewriting historical results.
