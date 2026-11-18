# Change and review workflow

User preference recorded 2026-11-18: every application improvement or fix uses a focused feature branch and pull request. Do not push application changes directly to main.

Each PR explains the problem and resulting behavior, relevant test results, limitations, and any setup or release implications. Keep unrelated improvements in separate PRs so each change can be reviewed and reverted independently. Preserve the authoritative requirements and update PROGRESS.md and related documentation.

Merge only within explicit user authorization. Prefer a merge commit to preserve the PR boundary and a clear revert target; do not rewrite shared history to undo a change. PR approval is not authorization for church production access, purchases, cloud inference or live output.

The user explicitly approved merging PR #1 on 2026-11-18. This record does not assume blanket approval for future PRs.

2026-11-18: the user directed completion of the three outstanding merges. PRs #2, #3 and #4 were merged into main in dependency order using merge commits. Future application improvements still use focused PRs; this does not authorize church production output.
