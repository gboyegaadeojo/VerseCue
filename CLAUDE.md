# VerseCue ? resume here

Checkpoint: 2026-11-20 18:46 UTC. Implementation remains active; P0 and full service acceptance remain pending.

Read [AGENTS.md](AGENTS.md), the entire [master specification](VerseCue_Master_Development_Prompt_v2_Codex.md), [HANDOFF.md](HANDOFF.md), [PROGRESS.md](PROGRESS.md), [NEW_REQUESTS.md](NEW_REQUESTS.md), the [remaining-work list](docs/107-remaining-work-and-acceptance.md) and the complete original requirement audit before proceeding. Inspect current Git/CI state rather than relying only on this checkpoint.

## Current work

- Root integration branch feat/reference-driven-bible-workflow was2f594be before this documentation update. Main contains merged PR62/63. Integration517 modules/syntax/inventory pass. PR22 stays draft.
- Draft PR64 feat/audio-input-information, exact6751a6e7b2cfc008975afc2a807070a4d62ba10a:521 module tests, syntax/inventory, all29 Windows source scenarios,151-file exact-source review/native receipt and Mac44791701176 passed. Packaged29-scenario suite remains live in session57626; poll that same session. Do not merge until it passes. Worktree test-results/pr-split/audio-input-information.
- Next fix/speech-scratch-recovery worktree test-results/pr-split/speech-scratch-recovery: scoped crash-WAV cleanup is implemented locally, not committed or opened as a PR. Six focused tests pass including forced child-process crash recovery and linked/out-of-scope refusal. Startup initializes only the app-owned directory after the single-instance lock. CLI needs initialized scratch; normal/failure cleanup avoids global temp scanning. A cancellation-before-spawn check and sanitized cleanup-failure handling were just added and require tests. No real audio was used. Next: finish tests/docs, update base after64, then complete its own source/package/Mac checks.
- Preserve existing untracked design-reference/ and all test-results worktrees/private assets. No actual microphone/ProPresenter/output or new release is involved in these changes.

## Maintenance and boundaries

Refresh this file about every10 minutes during active work and at merges/build checkpoints/before interruption. Update HANDOFF.md and PROGRESS.md for material state changes. No updates occur when no agent runs. Follow HANDOFF.md authorization/privacy boundaries; provisional implementation is authorized, church production output is not. Synthetic checks do not prove real hardware, Mac ProPresenter, physical screens, speech accuracy or field acceptance.

Latest18:38 UTC: PR64 is merged atf18c78a and root8cf01f9 passes524 modules/syntax/inventory. Draft PR65 e233de331787b8e280758c9cceac3e54bc634de1 has530 modules and a152-file Windows receipt, but Mac44794215980 FAILED due to normal parent-path aliases. Original source suite44441 is still live; do not mutate runtime source until it completes. Then canonicalize the parent only, add alias regression, commit and reverify exact changed source. No packaged suite is running for PR65. Earlier PR64 session57626 is terminal success29/29.

## Current authoritative checkpoint ? 18:46 UTC

PR64 is merged atf18c78a; root8e29c15 passes524 modules/syntax/inventory. PR65 corrected head d2f6ac25ff3795e0b41bd3c138e02ba3b617e526 passes531 modules/syntax/inventory, fresh152-file exact-source Windows/native receipts and Mac44794893453. The original Mac44794215980 failed on parent aliases and is retained historically. Current source30-scenario suite is live in session25311; poll that same handle. Review build94115 is terminal success. After source completes, run test-results/run-packaged-workflows.cjs in the speech-scratch-recovery worktree (NODE_PATH=root/node_modules); no packaged suite is running yet. Merge PR65 only after corrected-head packaged30 pass. No actual microphone/ProPresenter/output used.
