# VerseCue ? resume here

Checkpoint: 2026-11-20 19:18 UTC. Implementation is active. P0 and full service acceptance remain pending.

Read [AGENTS.md](AGENTS.md), the entire [master specification](VerseCue_Master_Development_Prompt_v2_Codex.md), [HANDOFF.md](HANDOFF.md), [PROGRESS.md](PROGRESS.md), [NEW_REQUESTS.md](NEW_REQUESTS.md), [remaining work](docs/107-remaining-work-and-acceptance.md) and the complete original audit. Inspect actual repository/CI before relying on this checkpoint.

## Current work

- Main includes merged PR62?65, latest428a535. Root feat/reference-driven-bible-workflow is integrating65; resolve progress/evidence conflicts preserving both histories, run module/check/audit, commit and push. No aggregate PR22 merge or new release.
- PR64 exact6751a6e7 passed521 modules/syntax/inventory,29 Windows source/29 packaged scenarios,151-file review/native receipts and Mac44791701176.
- PR65 exactd2f6ac25ff3795e0b41bd3c138e02ba3b617e526 passed531 modules/syntax/inventory,30 source/30 packaged scenarios,152-file current-source/native receipts and Mac44794893453. Original Mac44794215980 failed on normal parent aliases; correction and regression are recorded. All PR64/65 test/build/CI handles are terminal. Do not poll or restart them.
- Next branch feat/safe-input-test, worktree test-results/pr-split/safe-input-test, is clean and based on main through64. No code exists yet. Update its base through65 first. Implement a short explicitly consented meter-only selected-input test in Setup that works without Whisper, with backend capture-purpose ownership, ten-second expiry, no recognition/candidate ingestion/output, Stop/cancellation and clear finished state. See HANDOFF.md next-task notes. Do not implement a test button that can feed live recognition.
- Preserve existing untracked design-reference/ and all test-results worktrees/private assets. No actual microphone, ProPresenter or physical output has been used for these components.

## Maintenance

Refresh this file about every10 minutes during active work and after merges/build checkpoints/before interruption. Update HANDOFF.md/PROGRESS.md when state changes. No updates occur when no agent runs. Follow existing authorization/privacy boundaries. Synthetic tests do not prove physical hardware, Mac ProPresenter, speech accuracy, field readiness or trusted signing.

## Latest authoritative checkpoint ? 19:11 UTC

PR65 is fully merged/integrated. Root12ca1c0 passes534 modules/syntax/inventory; all PR64/65 jobs are terminal. New feat/safe-input-test worktree is based on main428a535 and now has uncommitted runtime/UI/tests: ten-second capture purpose, backend recognition denial, meter-only PastorAudio path, consent/Stop/expiry Setup controls and cancellation epoch protection. Three new focused module groups pass; initial desktop scenario passed. Extended synthetic desktop test (late permission rejection + second-window denial + reset) and full module/check run are currently live in session44050. Poll that exact session; no PR/build/Mac run exists yet for this feature. Next: inspect results, fix any failure, finish docs and full exact-head source/package/Mac verification before merging. Do not claim this feature complete yet.

## Active PR66 checkpoint ? 19:18 UTC

PR66 feat/safe-input-test is now committed at9d2735bde8cc3e1570722b14029093d5f80befd9, not uncommitted.534 branch modules/syntax/inventory and the extended synthetic desktop scenario pass. A152-file exact-source Windows/native review receipt passed; build68094 is terminal. Source31-scenario suite35260 is live, and exact Mac44800662569 is in_progress. No packaged suite yet. Poll those same handles, run packaged31 after source completion, and merge only after exact-head checks pass. PR22 is still open/draft. Root950827d remains534 modules through65; no actual microphone/ProPresenter/output or release changes.
