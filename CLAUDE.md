# VerseCue - resume here

Checked: 2026-11-21 00:15 UTC. Implementation is active; P0 and full service acceptance remain pending.

Read [AGENTS.md](AGENTS.md), the entire [master specification](VerseCue_Master_Development_Prompt_v2_Codex.md), [HANDOFF.md](HANDOFF.md), [PROGRESS.md](PROGRESS.md), [NEW_REQUESTS.md](NEW_REQUESTS.md), [remaining work](docs/107-remaining-work-and-acceptance.md) and the complete original audit. Inspect actual Git/process/CI state before relying on this checkpoint.

## Current state

- Main includes app components through PR67 and the PR68 stable handoff pointers at2d93e73bb886e6243335dacfb5ba39bf073f4140. Root feat/reference-driven-bible-workflow wasdc627c614e91215d3bbb27f0b30e822f533df030 before this checkpoint. Its application source passes537 modules/check; later changes are docs only. PR22 stays draft. Source0.6.0 is unreleased; published0.5.5 is an older supervised-test build.
- PR67 exact5bfb9051 passed534 modules/check, measured typography/targets/labels/compact/no-send, existing Studio/workspace/smoothness,32 source/32 packaged Windows scenarios,153-file exact-source/native receipts and Mac44828146007. PR68 was docs-only/audited. All old feature jobs are terminal.
- Computer Use failed: list_apps timed out twice; after documented reset, initialization/retry returned JS execution timeout/kernel reset. No app/window selection or UI input was sent. Stop ProPresenter UI automation until the helper is recovered. Personal prerequisite records remain private. No native prep, output, security/privacy changes or screen-state assumptions.
- PR69 offline evaluator is merged atd7bc48a7d1648346623d84a7ae760a215ce52ec1. Exact71a699f passed544 local and each public Windows/Mac ARM/Intel544 modules/check/audit/synthetic CLI in44841778744; all jobs/logs inspected. No real evidence scored, no runtime/package change. Main is fetched; integrate it into root and the replay worktree, preserving active handoff and all progress histories.
- Active uncommitted work: feat/bounded-speech-replay at test-results/pr-split/bounded-speech-replay. New shared PCM decoder and6 synthetic groups pass. Three script readers replaced by apply_patch; background reader/report changed by a Node edit. The same Node command stopped before writing soak-desktop because its expected marker was absent: inspect that file (root/main may differ), fix only its actual reader, and do not rerun already-applied background edits blindly. No real replay/soak has run.
- Next finish five readers/provenance and isolated profiles, module/check/audit, private CLI/resident/source/package smoke where assets exist, public diagnostic CI and small PR. Never fabricate capture timestamps: file replay timing is unknown, not audible end. No long soak is active.
- Preserve unrelated design-reference/, all test-results worktrees and private evidence. No microphone or actual ProPresenter output was used for these components.

## Next actions

Finish evaluator current-main integration/PR/CI and repair bounded replay diagnostics. Actual Windows preparation/latency and native Mac/LAN/edition/physical/field/privacy/distribution work remain open. Resume personal HIL only with working tooling and fresh independently observed disabled screens. Do not merge PR22 or label the full application accepted.

## Maintenance

Refresh this file about every10 minutes during active work and at merges/build checkpoints/before interruption. Replace stale current directions; keep history in PROGRESS.md. Update HANDOFF.md materially. No updates occur when no agent runs. Credentials, permissions and runtime handles do not automatically transfer to another coding tool.
