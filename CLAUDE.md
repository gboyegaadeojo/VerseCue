# VerseCue coding-agent entry point

Read the entire [master specification](VerseCue_Master_Development_Prompt_v2_Codex.md) before project work.

Main contains merged components. Ongoing work and the current resume checkpoint are maintained on feat/reference-driven-bible-workflow:

- [Current CLAUDE.md](https://github.com/gboyegaadeojo/VerseCue/blob/feat/reference-driven-bible-workflow/CLAUDE.md)
- [Detailed HANDOFF.md](https://github.com/gboyegaadeojo/VerseCue/blob/feat/reference-driven-bible-workflow/HANDOFF.md)
- [Current PROGRESS.md](https://github.com/gboyegaadeojo/VerseCue/blob/feat/reference-driven-bible-workflow/PROGRESS.md)

In an existing clone, inspect status/worktrees before changing anything. Fetch origin, then read the active checkpoint without switching branches:

    git show origin/feat/reference-driven-bible-workflow:CLAUDE.md
    git show origin/feat/reference-driven-bible-workflow:HANDOFF.md

Do not treat this main-branch entry point as the latest stopping point or overwrite dirty work. Follow [AGENTS.md](AGENTS.md), [NEW_REQUESTS.md](NEW_REQUESTS.md), the complete original audit and the active handoff. Aggregate PR22 remains draft until its complete acceptance is satisfied.

The active checkpoint is refreshed about every ten minutes during active work and at meaningful checkpoints. Another coding tool does not automatically inherit the chat, credentials, tool handles or runtime permissions.
