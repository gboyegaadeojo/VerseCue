# VerseCue ? resume here

Checkpoint: 2026-11-20 18:58 UTC. Implementation is active. P0 and full service acceptance remain pending.

Read [AGENTS.md](AGENTS.md), the entire [master specification](VerseCue_Master_Development_Prompt_v2_Codex.md), [HANDOFF.md](HANDOFF.md), [PROGRESS.md](PROGRESS.md), [NEW_REQUESTS.md](NEW_REQUESTS.md), [remaining work](docs/107-remaining-work-and-acceptance.md) and the complete original audit. Inspect actual repository/CI before relying on this checkpoint.

## Current work

- Main includes merged PR62?65, latest428a535. Root feat/reference-driven-bible-workflow is integrating65; resolve progress/evidence conflicts preserving both histories, run module/check/audit, commit and push. No aggregate PR22 merge or new release.
- PR64 exact6751a6e7 passed521 modules/syntax/inventory,29 Windows source/29 packaged scenarios,151-file review/native receipts and Mac44791701176.
- PR65 exactd2f6ac25ff3795e0b41bd3c138e02ba3b617e526 passed531 modules/syntax/inventory,30 source/30 packaged scenarios,152-file current-source/native receipts and Mac44794893453. Original Mac44794215980 failed on normal parent aliases; correction and regression are recorded. All PR64/65 test/build/CI handles are terminal. Do not poll or restart them.
- Next branch feat/safe-input-test, worktree test-results/pr-split/safe-input-test, is clean and based on main through64. No code exists yet. Update its base through65 first. Implement a short explicitly consented meter-only selected-input test in Setup that works without Whisper, with backend capture-purpose ownership, ten-second expiry, no recognition/candidate ingestion/output, Stop/cancellation and clear finished state. See HANDOFF.md next-task notes. Do not implement a test button that can feed live recognition.
- Preserve existing untracked design-reference/ and all test-results worktrees/private assets. No actual microphone, ProPresenter or physical output has been used for these components.

## Maintenance

Refresh this file about every10 minutes during active work and after merges/build checkpoints/before interruption. Update HANDOFF.md/PROGRESS.md when state changes. No updates occur when no agent runs. Follow existing authorization/privacy boundaries. Synthetic tests do not prove physical hardware, Mac ProPresenter, speech accuracy, field readiness or trusted signing.
