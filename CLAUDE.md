# VerseCue ? resume here

Checkpoint: 2026-11-20 22:18 UTC. Implementation is active. P0 and full service acceptance remain pending.

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

## Current PR66 verification ? 19:27 UTC

Exact9d2735bde8cc3e1570722b14029093d5f80befd9 passes534 module/check, all31 Windows source scenarios,152-file exact-source/native receipts and Mac44800662569. Source35260 and build68094 are terminal. Packaged31 suite is now live in94382; poll that same handle. No merge until it passes. Root6fcc69e remains through65. Next independent software review: reconcile Studio typography/control targets with original18px base/44px click targets while preserving the approved design; no such implementation exists yet. No actual input/output or new release.

## Latest authoritative checkpoint ? 22:01 UTC

After an interruption, PR66 all31 packaged scenarios were observed terminal success, exact Mac44800662569 rechecked success and exact9d2735bd merged atd9faf6a. Root is integrating66; resolve progress/audit conflicts preserving histories, run module/check/audit then commit/push. All old handles are terminal. Next feat/booth-readability worktree contains only ui/booth.css and its stylesheet link; code not tested yet. Update branch through66 before GUI tests. Preserve unrelated design-reference/. User asked remaining steps and was told software readability/speech work plus real ProPresenter/platform/service/release acceptance remain. No actual input/output or new release.

## Readability work in progress ? 22:09 UTC

Root6fb29a5 includes merged PR66 and passes537 modules/syntax/inventory. All old jobs are terminal. feat/booth-readability worktree is updated through66 and has uncommitted booth.css + stylesheet link, layout-only placement of passage before manual/session controls, inspector priority, and deliberate manual-review heading focus. Dedicated measured-size/fit/no-send test passed; screenshots were inspected and the first layout was corrected because the main action was too low. Existing Studio source routing/layout test passed. A sequential workspace/smoothness/module/check batch remains live in37384; poll it. No PR/build/Mac yet for readability. Keep all real hardware/platform/service gates open.

## Latest readability checkpoint ? 22:18 UTC

Rootfb25e94 integrates66 with537 module/check pass. Uncommitted booth-readability is based on main d9faf6a. Dedicated measured readability/manual-focus/compact test, Studio routing and smoothness tests passed; unchanged workspace test initially failed because the sticky footer covered Stop at200%/640px, then passed after normal-flow footer fix. Module534/check pass. A last dedicated UI run15084 is live to add explicit checkbox-label rectangle assertions/report fields; poll it. Previous37384/18398/13505 jobs are terminal. Docs111 is authored locally. Next finish this test, open small PR67, then full32 source/package/Mac verification. No real input/output or full accessibility claim.
