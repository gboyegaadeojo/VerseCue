# VerseCue — resume here

Checkpoint: 2026-11-20 18:16 UTC. Implementation is active; this is not a release acceptance claim.

Read [AGENTS.md](AGENTS.md), then [HANDOFF.md](HANDOFF.md) and the [remaining-work list](docs/107-remaining-work-and-acceptance.md). Read the entire [master specification](VerseCue_Master_Development_Prompt_v2_Codex.md) before project work. Preserve its complete requirements and later authorized requests.

## Current stopping point

- Root integration branch: `feat/reference-driven-bible-workflow`, head `6a750b5 (checkpoint before integrating documentation PR63)`. Aggregate PR22 stays draft; main contains merged PRs through63.
- PR62: `feat/passage-range-policy-core`, exact head `58d0c5a764b5af9bdb5b70634169296345c17eed`. Merged at2cc9ec4 and integrated into root. 514 module tests, syntax/inventory, all28 Windows source and all28 packaged scenarios passed. Exact-head macOS run44787486654 now completed successfully. Next: PR63 is merged; implement selected-input information in the prepared audio branch. Do not merge aggregate PR22.
- Next coding branch already exists: `feat/audio-input-information`, clean worktree `test-results/pr-split/audio-input-information`, based on main through61. Only research is done; no feature code yet. Update its base after62 before implementation.
- Root has an existing untracked `design-reference/`; preserve it. Review `git status` before writing. Never delete `test-results/`: it contains active worktrees and private evidence.

## Checkpoint maintenance

During active work, refresh this file approximately every10 minutes and after merges, major verification/build checkpoints, and before yielding or context reset. Update the timestamp, exact branch/head, completed evidence, current operation and next action. Update HANDOFF.md and PROGRESS.md when their state changes. No updates occur while no agent is running.

The detailed handoff identifies authorization boundaries and pending real-hardware acceptance. These are instructions and evidence pointers, not a transfer of credentials or this conversation's runtime permissions. If facts conflict, inspect the actual repository/CI and correct this checkpoint.
