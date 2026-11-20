# VerseCue - resume here

Checked: 2026-11-20 23:50 UTC. Implementation is active; P0 and full service acceptance remain pending.

Read [AGENTS.md](AGENTS.md), the entire [master specification](VerseCue_Master_Development_Prompt_v2_Codex.md), [HANDOFF.md](HANDOFF.md), [PROGRESS.md](PROGRESS.md), [NEW_REQUESTS.md](NEW_REQUESTS.md), [remaining work](docs/107-remaining-work-and-acceptance.md) and the complete original audit. Inspect actual Git/process/CI state before relying on this checkpoint.

## Current state

- Main includes app components through PR67 and the PR68 stable handoff pointers at2d93e73bb886e6243335dacfb5ba39bf073f4140. Root feat/reference-driven-bible-workflow was412cdc21981f816e882fbe2e15634f198a960c43 before this checkpoint. Its application source passes537 modules/check; later changes are docs only. PR22 stays draft. Source0.6.0 is unreleased; published0.5.5 is an older supervised-test build.
- PR67 exact5bfb9051 passed534 modules/check, measured typography/targets/labels/compact/no-send, existing Studio/workspace/smoothness,32 source/32 packaged Windows scenarios,153-file exact-source/native receipts and Mac44828146007. PR68 was docs-only/audited. All old feature jobs are terminal.
- Computer Use failed: list_apps timed out twice; after documented reset, initialization/retry returned JS execution timeout/kernel reset. No app/window selection or UI input was sent. Stop ProPresenter UI automation until the helper is recovered. Personal prerequisite records remain private. No native prep, output, security/privacy changes or screen-state assumptions.
- feat/labeled-recognition-evaluation in test-results/pr-split/labeled-recognition-evaluation has uncommitted scripts/tests/docs112/synthetic example/diagnostic workflow.10 focused groups (including UTF-8 BOM CLI) and544 modules/syntax/inventory pass. Synthetic example writes a private report with zero real scored clips. No real data scored or PR/CI yet. Repository PUBLIC was confirmed; workflow has a private-repository skip guard and standard Windows/Mac ARM/Intel runners.
- That worktree's merge of current main was blocked only by its generated docs/evidence/documentation-consistency-audit.json. Archive that report into ignored test-results, restore only that generated file to HEAD, then merge origin/main. Preserve all uncommitted evaluator files. Re-run audit, finish docs/progress and publish a small PR; inspect all three diagnostic CI jobs before merge.
- A separate bug remains unstarted: five replay/soak scripts retain12-second slices while current runtime accepts at most160000 samples/10 seconds. Repair fixture bounds/ownership/timing before new replay or soak claims. No new soak is running.
- Preserve unrelated design-reference/, all test-results worktrees and private evidence. No microphone or actual ProPresenter output was used for these components.

## Next actions

Finish evaluator current-main integration/PR/CI and repair bounded replay diagnostics. Actual Windows preparation/latency and native Mac/LAN/edition/physical/field/privacy/distribution work remain open. Resume personal HIL only with working tooling and fresh independently observed disabled screens. Do not merge PR22 or label the full application accepted.

## Maintenance

Refresh this file about every10 minutes during active work and at merges/build checkpoints/before interruption. Replace stale current directions; keep history in PROGRESS.md. Update HANDOFF.md materially. No updates occur when no agent runs. Credentials, permissions and runtime handles do not automatically transfer to another coding tool.
