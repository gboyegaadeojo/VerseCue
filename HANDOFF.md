# VerseCue development handoff

Updated: 2026-11-20 18:16 UTC. Use [CLAUDE.md](CLAUDE.md) for the most recent short checkpoint. This file is intended for Claude Code, Codex or a human developer opening the same repository.

## Start without losing context

1. Read the entire [master specification](VerseCue_Master_Development_Prompt_v2_Codex.md), then [agent instructions](AGENTS.md), [progress](PROGRESS.md), [new requests](NEW_REQUESTS.md) and [remaining work](docs/107-remaining-work-and-acceptance.md).
2. Inspect `git status --short`, `git branch --show-current`, `git log -1` and `git worktree list`. Do not assume the checkpoint is newer than the repository.
3. Read [original requirement evidence](docs/99-original-requirement-evidence-audit.md) and [aggregate acceptance state](docs/90-pr22-acceptance-state.md). Keep every original FR/NFR and RF acceptance item; do not replace them with this handoff.
4. Continue the next independent coding task. Another agent does not inherit the previous chat, credentials, running tools or runtime permission grants automatically.

## Verified repository state

Public repository: https://github.com/gboyegaadeojo/VerseCue. Aggregate [PR22](https://github.com/gboyegaadeojo/VerseCue/pull/22) is draft and must remain unmerged while acceptance remains incomplete.

| Location | State at checkpoint |
| --- | --- |
| Root | `feat/reference-driven-bible-workflow`, `6a750b5 (checkpoint before integrating documentation PR63)`; 517 module tests passed after integration |
| Main | `0e319b3 (main after documentation PR63)`; PRs through62 merged; 514 module tests |
| PR62 worktree | `test-results/pr-split/passage-range-policy-core`; branch `feat/passage-range-policy-core`; head `58d0c5a764b5af9bdb5b70634169296345c17eed` |
| Next worktree | `test-results/pr-split/audio-input-information`; branch `feat/audio-input-information`; clean, based on main through61; research only |

Source version is0.6.0. Published downloadable0.5.5 remains an older supervised-test release. Review packages are not a new release or an installed replacement. Preserve the pre-existing untracked `design-reference/`.

## Completed component: PR62

[PR62](https://github.com/gboyegaadeojo/VerseCue/pull/62) implements configurable passage limits1–50, default10, across parser, speech fragments, saved coverage, native preparation and manual Confirm. Extended passages cannot enter Auto; unknown cross-chapter numbering blocks before native I/O. Policy changes invalidate prior reviews. See [feature record](docs/106-configurable-passage-range-policy.md).

Exact head58d0c5a7 passed514 module tests, syntax/inventory,28 Windows source scenarios and28 packaged scenarios. Fresh151-file Windows review-package/native receipts passed. [macOS run44787486654](https://github.com/gboyegaadeojo/VerseCue/actions/runs/44787486654) was checked completed/success at18:09:50 UTC for the exact full head above. No local build/test process remains pending at this checkpoint.

Reports are ignored files in the PR62 worktree: `test-results/settings-source-workflows.json`, `settings-packaged-workflows.json`, `review-package.json`, `passage-range-ui.json`, `packaged-passage-range-ui.json`. Inspect before relying on them. Earlier head8a960f4 reports are historical, not current-head evidence.

PR62 merged at2cc9ec4 after exact-head checks and is integrated into root. Root now passes517 module tests (three integration-only soak-summary tests). Next: PR63 is merged; continue the prepared audio-input feature.

## Next feature: explain and validate the selected microphone

No implementation exists yet. Inspect `ui/audio.js`, the Audio settings UI and `tests/pastor-audio.test.cjs`. Plan: report available browser track channel count/sample rate/sample size and capabilities, explicitly as reported values; never claim physical MOTU verification. Reject known out-of-range selected channels or a returned device different from the exact requested device before creating the audio processing chain. Stop returned tracks on rejection; no default-device fallback. Unknown/unsupported metadata must remain unknown rather than fabricated.

Use optional callbacks/static helpers on existing PastorAudio if suitable. Preserve capture ownership/cancellation, meter, age/loss protection and Stop. Clear transient input information on reset/device selection; do not persist or export raw device IDs. Add concise Windows/macOS permission guidance, without changing OS settings. Inspect the existing input test before deciding what to extend. Add meaningful cancellation, mismatch, channel-boundary and missing-metadata tests, plus the relevant UI check. Rebase/merge updated main into this prepared branch first.

## Commands and verification habits

Use Windows PowerShell and `npm.cmd`. Standard checks: `npm.cmd test`, `npm.cmd run check`, `node scripts/audit-documentation.cjs`. The documentation audit writes `docs/evidence/documentation-consistency-audit.json`; review and commit intended changes. Inventory validation is part of check/build, not an independent security or license audit.

Isolated worktrees use root dependencies via `$env:NODE_PATH='C:\Users\gadeo\Documents\Vibe Coding\VerseCue\node_modules'`. `node scripts/build-review-package.cjs` creates an ignored exact-source review package and receipt. Existing local Whisper binaries/model can be reused in private worktree staging without downloading or publishing them. Inspect scripts and existing reports for exact paths before running.

Current synthetic source/package batch helpers live under `test-results/pr-split/settings-backup-recovery-ui/test-results/` as `run-source-workflows.cjs` and `run-packaged-workflows.cjs`; they derive scenarios from the checked-out workflow. Run source then packaged GUI suites sequentially to avoid focus/artifact races. Main through61 has27 scenarios; PR62 has28. macOS CI success covers build/software fixtures, not actual macOS ProPresenter UI automation.

## Authorization and unresolved external dependencies

The user approved provisional architecture/requirements implementation, routine commands/builds, public GitHub, small PRs and merging completed components. Personal Windows ProPresenter tests are authorized with Audience=false and Stage=false independently observed before/during output. Church production output is not authorized. No paid services, purchases, OS security/privacy/ACL changes, blind unknown-result retries, ProPresenter Clear/deletion or automatic restoration.

Specific unanswered matters: authorization to publish new sanitized personal-host telemetry; access to an authorized real Mac/native accessibility test profile; permission to create separately named test styles `VerseCue Test Verse` and `VerseCue Test Reference` with Text Down to investigate clipping. Continue unaffected software work; do not repeatedly ask the same questions or interpret silence as approval.

Keep actual-host telemetry/audio/screenshots private in ignored locations. Do not commit an entire test-results directory: it contains worktrees and private evidence. A prior automatic review rejected publication of new host telemetry without specific authorization.

P0 remains PENDING: exact supported route, fidelity, translation, platform and timing evidence plus IFC approval are incomplete. Personal Windows21.4.2 preparation/edition/minimized tests and limited supervised output exist, with known timing/clipping limitations; they do not prove physical church output, all six editions or Mac parity. The full [remaining-work list](docs/107-remaining-work-and-acceptance.md) separates implementation from real acceptance.

## Keeping this useful

Refresh CLAUDE.md about every10 minutes while actively building and at merges/build checkpoints. Update this file when branch/evidence/next-action changes materially. Keep PROGRESS.md current. Record what actually finished, exact verification head and one concrete next action. Never report the entire application accepted because a component merged.

## Active PR64 verification ? 2026-11-20 18:21 UTC

PR64 feat/audio-input-information at6751a6e implements reported input format/ranges, pre-processing channel/device validation and permission guidance.521 module tests, syntax/inventory and focused synthetic source UI passed. Full29-scenario source suite is running in local session45721; exact-source Windows review build is running in session2283; hosted Mac44791701176 was dispatched (inspect actual state before treating it as live). No actual microphone or ProPresenter is used. Next: poll these same handles, then run the packaged suite after the build; merge only after current-head checks pass. Root integration is2f594be; source version0.6.0 remains unreleased. Prepared audio branch now includes main through63.

## Latest checkpoint ? 2026-11-20 18:32 UTC

PR64 exact6751a6e7 passes521 modules/syntax/inventory,29 Windows source scenarios,151-file review/native receipt and Mac44791701176. Packaged suite remains live in session57626. A separate local fix/speech-scratch-recovery branch now implements app-owned crash-WAV recovery and has six focused synthetic tests passing; latest cancellation/cleanup handling is not yet verified or committed. See CLAUDE.md for exact next actions. Root is2f594be before this checkpoint commit.

## Corrected PR65 verification ? 2026-11-20 18:46 UTC

PR65 d2f6ac25ff3795e0b41bd3c138e02ba3b617e526 passes531 modules/syntax/inventory,152-file exact-source Windows/native receipts and Mac44794893453. Original Mac44794215980 failed on normal parent aliases; correction canonicalizes only the configured parent and preserves linked-root/child refusal, with a regression. Source suite25311 is live; build94115 terminal success. Next is corrected-head packaged30 after source completion. No actual input/output used.

## Current checkpoint ? 2026-11-20 18:58 UTC

PR64 merged f18c78a and PR65 merged428a535. Corrected PR65 d2f6ac25 passes531 modules,30 source/30 packaged Windows scenarios,152-file exact-source/native receipts and Mac44794893453. All verification processes are terminal. Root integration verification follows. Prepared feat/safe-input-test is still clean on64; update through65 before coding.

Next task: implement a10-second explicitly consented meter-only selected-input test in Setup, without needing Whisper. Add capture lease purpose (recognition vs input-test), backend timeout/ownership, reject audio recognition requests on a test lease, cancel on stop/reset/window loss/configuration, remain dry-run/Suggest and never restore Auto/output. Require saving pending device/channel edits before test. Expose meter/Stop/clear completion state; reset transient consent. Test with fake tracks and fake timers, including two windows, stale timeout after a new lease, no audio IPC/inference/ingestion/output, denied permission and cancellation while permission is pending. Actual microphone/format/permission hardware acceptance stays pending. This is a plan, not existing code.

## Safe input test implementation ? 2026-11-20 19:11 UTC

Root12ca1c0 includes65 and passes534 modules/syntax/inventory. Prepared feat/safe-input-test is updated through65 and now contains uncommitted implementation: capture-purpose lease with ten-second backend expiry, recognition denial for test leases, meter-only capture without speech buffering, saved-input/consent Setup controls, Stop/expiry/reset handling and old-permission epoch protection. Initial synthetic desktop test and three focused module additions pass. Extended UI/module/check session44050 is live. No PR/build/Mac verification yet. No actual microphone or ProPresenter used.

## PR66 verification ? 2026-11-20 19:18 UTC

Safe input test is now draft PR66 at9d2735bde8cc3e1570722b14029093d5f80befd9.534 module/check and extended synthetic UI pass.152-file Windows review/native receipts pass. Source31 suite35260 is live; Mac44800662569 is in_progress; build68094 terminal success. Run packaged31 after source completion. All previous PR64/65 handles are terminal. Root950827d is current before this checkpoint commit.

## PR66 packaged verification ? 2026-11-20 19:27 UTC

Exact9d2735bd passes534 modules/check,31 source Windows scenarios,152-file exact-source/native receipts and Mac44800662569. Packaged31 suite94382 is live; source35260/build68094 terminal. Finish packaged suite before merge. Independent next software gap: Studio readability/control targets versus original18px base/44px requirement, preserving the approved layout/theme and testing actual measured sizes plus fit. No readability code yet.

## PR66 completion after interruption ? 22:01 UTC

PR66 exact9d2735bd passed all31 source/31 packaged Windows scenarios,534 modules/check,152-file exact-source/native receipts and exact Mac44800662569 (rechecked). Merged atd9faf6a. Root integration in progress; all prior job handles terminal. Readability worktree has only uncommitted booth.css and stylesheet link; merge current main while preserving this local work, then measure/render it before claiming improvement. No actual platform/service acceptance or release.

## Readability implementation ? 2026-11-20 22:09 UTC

Root6fb29a5 integrates66 and passes537 modules/check. Uncommitted feat/booth-readability is based on main d9faf6a. Booth stylesheet establishes18px body/controls and44px targets, preserves Studio palette/font, and layout puts current passage before manual/setup content. Deliberate manual submit scrolls/focuses the reference heading without output; speech does not steal focus. Dedicated measured sizes/fit/no-send test and existing Studio routing test pass; visual screenshots inspected. Initial text-only enlargement put primary action too low and was corrected before acceptance. Sequential workspace/smoothness/module/check session37384 remains live. Next inspect result, finish regression/compact checks and docs, then own PR and exact-source build/Mac verification.
