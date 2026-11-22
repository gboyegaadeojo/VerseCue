# What remains before VerseCue is ready for service

Updated: 2026-11-22. Read [the handoff](../HANDOFF.md) for exact branches, evidence and the next command. This is a plain-English work list; the complete [original-requirement audit](99-original-requirement-evidence-audit.md), functional requirements, non-functional requirements and acceptance plan remain authoritative. Completed software checks do not establish real service readiness.

## Where things stand

VerseCue now **starts in Auto** by the product owner's decision ([NR-010](../NEW_REQUESTS.md)). Complete, explicit references go to ProPresenter automatically, and the operator holds or stops rather than confirming each one. The workspace uses the chosen Auto-first "Route" design. Auto still starts in dry run, sends only verified complete cues to an armed test target, and leaves anything ambiguous, quoted, corrected, slow, lossy or unprepared for review.

Components merged through PR82 include provisional speech ([docs/114](114-provisional-speech-provider.md)), loopback input guidance ([docs/115](115-loopback-input-guidance.md)), start in Auto with a Hold window ([docs/116](116-start-in-auto-and-hold.md)), the ten-hour Auto rehearsal harness ([docs/117](117-auto-rehearsal-harness.md)), per-window audio loss ([docs/118](118-per-window-audio-loss.md)), the Route workspace ([docs/119](119-route-operator-workspace.md)) and the H hold shortcut with screen-reader announcements ([docs/120](120-hold-shortcut-and-auto-announcements.md)). These are software checks on synthetic data, not service acceptance. Aggregate PR22 stays draft. P0 remains pending.

## Software to build or strengthen

| Work | What the operator should gain | Requirements / next evidence |
| --- | --- | --- |
| Real microphone setup verification | Confirm input/channel information, the ten-second meter test and loopback guidance with the actual pastor feed | FR-001/002/003/005/007/008. Built: input information, safe input test, loopback/virtual input guidance. Physical MOTU channels, drivers, permissions, hotplug and platform loopback remain unverified. |
| Speech recognition feedback and speed | Read provisional speech, and get Auto sends fast enough to be useful | FR-009/010/012/017/019/020/024/025. Built: rolling preview, provisional snapshots, the kept-loaded engine as the default, graphics-card speech (Vulkan, Metal, optional CUDA) with processor fallback, early chapter preparation from unfinished speech in Prepare for volunteer, and a kept-running Bible helper (2026-11-22, [docs/143](143-faster-preparation.md)). Measured end-to-end latency on the service computers and labelled accuracy evidence remain. Configurable confusion aliases still need labelled evidence. |
| Real macOS ProPresenter preparation | Use the installed Bible workflow on Mac with the same safeguards | FR-044 and RF03/platform matrix. Not implemented; needs an authorized Mac accessibility profile and the installed app. Mac CI is not enough. |
| Live-service accessibility | Read states from the booth, use deliberate keys, operate with a screen reader | FR-026/027/030/031/061, NFR-015/016. Built: 18 px text, 44 px targets, Route high-contrast design, H to hold, Escape to stop, spoken Auto announcements. Actual booth-distance, contrast, NVDA/VoiceOver and volunteer tasks remain. |
| Privacy and recovery assurance | Recover safely without leaving audio or transcript residue | FR-057/059/062, NFR-010/019. Built: backup/restore, reset protections, CLI scratch recovery. Checked 2026-11-22 ([docs/144](144-privacy-retention-check.md)): the warm-up now uses the app scratch folder, the diagnostics log holds codes and timings only, and no crash dumps are written. Page file, hibernation and OS crash reporting are operating-system limits (full-disk encryption advised). A church-host review remains; optional recording stays off. |
| Trusted installation and updates | Install, identify and roll back a release safely | FR-060, NFR-014/018. Signing/notarization, a signed manual update with a service lock, rollback/uninstall and independent license/dependency review remain. No paid certificate or service without authorization. |

## Test with real ProPresenter and the service setup

These are tests of preservation, not requests to build a theme editor, Looks editor or playlist system. ProPresenter keeps all of those.

- Verify exact passage text, numbering, ranges and edition switches for IFC's KJV, Amplified, Amplified Classic, NIV, NKJV and The Message. Never guess numbering or silently substitute an edition.
- Verify existing Bible themes, room/stream Looks and routing are preserved, text is not clipped, and Sunday playlist/media/manual/Companion operation remains usable, including during Auto, Hold, Emergency stop, failures, reconnection and uncertain output.
- Measure actual audible-reference-end to confirmed output latency in Auto, including the hold window and native preparation. The p50 ≤ 2 s and p95 ≤ 4 s targets remain measurement gates.
- Verify real MOTU M4 input/channel selection, unplug/replug, permissions and format conversion. The selected microphone must not silently change.
- Run same-host and LAN tests on every claimed Windows/macOS/architecture profile, including minimized operation, sleep/wake and manual takeover under shared CPU/GPU load.

Personal Windows testing is authorized under the safeguards in HANDOFF.md. Church production output is not. The user will run the hands-on tests once the software work is complete.

## Measure service readiness

- **Auto trust gate.** Build labelled, held-out real sermon recordings and run the [ten-hour Auto rehearsal](117-auto-rehearsal-harness.md): at least 36,000 seconds of reviewed held-out audio with zero wrong automatic outputs (NFR-003). Labels must come from independent listening, never captions or model output.
- **Recognition accuracy.** Score reference precision/recall on the same kind of held-out set with the [offline evaluator](112-labeled-recognition-evaluation.md) (NFR-002). Synthetic transcripts only prove software behavior.
- Complete the 90-minute and 3-hour stability runs and CPU/RAM measurements on representative hosts.
- Verify the 30-second manual failback and the failure/reconnect requirements with the defined methods.
- Conduct at least three volunteer usability sessions, keyboard/screen-reader checks and physical room/stream review.
- Obtain the technical/operational acceptance and release decision. P0 remains PENDING until route, fidelity, translation, platform and timing evidence and IFC approval are complete.

## Optional or deferred capabilities

Global hotkeys (FR-032) and discovery (FR-042) stay off unless deliberately supported and enabled. Bible-only Clear (FR-040) remains unavailable until a safe scoped route is verified; never replace it with Clear All. Cloud credentials/provider work (FR-053) is conditional future work. Persistent recording is optional and off. Near-verbatim quote matching is review-only and never auto-sends.

Preserve each item's original priority and release assignment. Do not turn optional work into a release blocker or erase an unmet Must because it is hard. Record new evidence as dated follow-ups rather than rewriting historical results.
