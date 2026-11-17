# VerseCue — decision brief for IFC

2026-11-17. **Stage 4 approval STOP. P0 PENDING. All integration-dependent recommendations PROVISIONAL.**

| Decision | Current recommendation / evidence boundary |
|---|---|
| Best integration path | No verified arbitrary-reference solution yet. Inspect installed ProPresenter 21 documentation/vendor-supported mechanisms first. Use ProPresenter-created Bible presentations + documented triggers as a limited test baseline, not proof of unscripted passage coverage. Preserve existing Bible text/themes/room-stream Looks. UI automation is last resort only after explicit decision; no standalone output workaround. |
| Desktop framework | PROVISIONAL Tauri 2 candidate, Rust/native core and OS webview UI; not native OS widgets. Electron fallback if measured capture/accessibility/team fit favors it. No build system selected. |
| Speech recognition | Recommend constrained local whisper.cpp evaluation on shared Mac mini M4; compare base.en/small.en with real audio/load. Future local alternative faster-whisper. No model accepted, no cloud provider selected, no paid recurring STT required. |
| Parser | Deterministic canonical grammar/validation and evidence-based ambiguity handling. LLM-only extraction rejected as safety authority; quote/paraphrase future opt-in and always Confirm. |
| Smallest specified MVP | One selected clean input/backend, explicit stable reference card, Confirm default, guarded Auto, Suggest-only/Pause/stop, proven PP connector/capability checks, safe diagnostics/defaults, signed Windows/macOS installs. Rich context/ranges/manual/history/compact are v1; manual PP remains independent always. |

Top five risks: (1) unsupported/unproved arbitrary Bible lookup, (2) wrong/stale/ambiguous output, (3) Companion/operator/macro/media conflict, (4) local recognition load/latency and real accent quality, (5) translation rights/signing costs versus free-use constraint. Detailed controls/tests/owners: docs/07/11/12.

Open decisions/blockers: exact version 21 build/macOS/RAM and approved test targets; supported route and readback/ownership capability; default/edition IDs/rights; M4 pastor channel and asset/action mappings; real consented excerpts/holdout/rehearsal evidence; Windows/Intel test capacity and OS support; signing credentials/waiver/budget. IFC already answered main environment, English, free-use, Companion and timing questions; do not repeat them.

Targets accepted/proposed, not achieved: p50 ≤2 s/p95 ≤4 s end-of-reference to observed output, ≥95% precision/≥90% recall on real holdout, zero unsafe displays in 10-hour rehearsal, 90-minute + 3-hour stability and five-minute volunteer orientation. 66 synthetic text cases provide coverage only; no real accent/accuracy/HIL result exists.

Next engineering step: IFC authorizes an exact isolated test host/window/read/write/output scope and supervising operator; inspect installed API docs, establish John 3:16/Romans 8:28 manual fidelity baseline, then prove an unprepared passage, Looks/translation/media continuity, concurrency/recovery and cross-platform/latency under docs/10. Obtain required consented audio. If no supportable route passes, stop for product decision rather than build around the blocker.

**Requested review decision:** approve or revise the provisional requirements package and its proposed release/cost/safety policies. Approval of documents alone does not satisfy P0 or authorize production code. Implementation remains stopped until both feasibility and requirements gates are satisfied. Production host/output access, purchases, cloud selection and GitHub/publication remain separately unauthorized.

## IFC approval record — 2026-11-17
The user replied **I approve** to the Stage 4 provisional requirements-package review request. The documented requirements/release/cost/safety baseline is approved as provisional, subject to its recorded unresolved decisions and verification gaps. This supersedes the pending requirements-approval request above; do not ask for that same approval again. P0 remains **PENDING**. Final technical selections and implementation readiness remain conditional on actual feasibility evidence. No production-host/output, purchase, cloud-provider or GitHub/publication authorization was granted.

## Current feasibility authorization/evidence update
2026-11-17 after requirements approval: personal-host read/trigger testing and GitHub publication explicitly authorized. See docs/18 for Windows PP 21.4.2 partial saved-passage evidence. P0 remains PENDING; no arbitrary Bible route, physical room/stream fidelity, policy Auto or real-audio performance proved. Earlier no-host/no-publication restrictions are superseded only within the authorized personal test/private-repository scope. No further requirements approval needed for this unchanged baseline.
