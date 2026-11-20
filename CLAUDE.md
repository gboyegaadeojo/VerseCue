# VerseCue - resume here

Checked: 2026-11-20 22:29 UTC. Implementation is active. P0 and full service acceptance remain pending.

Read [AGENTS.md](AGENTS.md), the entire [master specification](VerseCue_Master_Development_Prompt_v2_Codex.md), [HANDOFF.md](HANDOFF.md), [PROGRESS.md](PROGRESS.md), [NEW_REQUESTS.md](NEW_REQUESTS.md), [remaining work](docs/107-remaining-work-and-acceptance.md) and the complete original audit. Inspect actual repository/process/CI state before relying on this checkpoint.

## Current work

- Main includes merged components through PR66 at d9faf6a. Aggregate PR22 stays open/draft. Root feat/reference-driven-bible-workflow was52cc803 before this documentation update. Its application source passes537 modules/syntax/inventory. Source0.6.0 is unreleased; published0.5.5 remains an older supervised-test download.
- Draft PR67: feat/booth-readability, exact5bfb90513b9b61ae113b79204049008276313e84, worktree test-results/pr-split/booth-readability. Implements18px base/control text,44px targets and passage-first review while preserving Studio's palette/font/backend. Deliberate manual review focuses the heading without sending; speech does not steal input focus.
-534 branch modules/check, measured geometry/checkbox-label/compact/manual-no-send and existing Studio/workspace/smoothness checks pass. An initial footer-over-Stop defect at640px/200% was reproduced and corrected; the unchanged workspace test passed afterward.
- Full32 source suite is live in34951 and progressing without failure so far. The153-file Windows review/native receipt passed and exact Mac44828146007 completed successfully. Build81089 and observers15902/52199 are terminal. Poll only source34951; no packaged suite is running yet.
- Next: finish source/build/Mac, then run all32 packaged scenarios after source completion. Merge only when current-head checks pass; integrate root and update progress/audit/PR22/checkpoints. Do not merge aggregate PR22 or claim release/physical/platform/field acceptance.
- All PR64/65/66 jobs are terminal. Preserve unrelated design-reference/, ignored private evidence and all test-results worktrees. No actual microphone or ProPresenter output was used in these components.

## Maintenance

Refresh this file about every10 minutes during active work and after merges/build checkpoints/before interruption. Replace stale current-state directions; preserve history in PROGRESS.md. Update HANDOFF.md when state changes materially. No updates occur when no agent runs. Follow existing authorization/privacy boundaries. Runtime handles and credentials do not automatically transfer to another coding tool.
