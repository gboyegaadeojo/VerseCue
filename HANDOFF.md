# VerseCue development handoff

Updated: 2026-11-20 18:10 UTC. Use [CLAUDE.md](CLAUDE.md) for the most recent short checkpoint. This file is intended for Claude Code, Codex or a human developer opening the same repository.

## Start without losing context

1. Read the entire [master specification](VerseCue_Master_Development_Prompt_v2_Codex.md), then [agent instructions](AGENTS.md), [progress](PROGRESS.md), [new requests](NEW_REQUESTS.md) and [remaining work](docs/107-remaining-work-and-acceptance.md).
2. Inspect `git status --short`, `git branch --show-current`, `git log -1` and `git worktree list`. Do not assume the checkpoint is newer than the repository.
3. Read [original requirement evidence](docs/99-original-requirement-evidence-audit.md) and [aggregate acceptance state](docs/90-pr22-acceptance-state.md). Keep every original FR/NFR and RF acceptance item; do not replace them with this handoff.
4. Continue the next independent coding task. Another agent does not inherit the previous chat, credentials, running tools or runtime permission grants automatically.

## Verified repository state

Public repository: https://github.com/gboyegaadeojo/VerseCue. Aggregate [PR22](https://github.com/gboyegaadeojo/VerseCue/pull/22) is draft and must remain unmerged while acceptance remains incomplete.

| Location | State at checkpoint |
| --- | --- |
| Root | `feat/reference-driven-bible-workflow`, `3e849c5a7fbaea5433539df8e329aae77c0d3b98`; 517 module tests passed after integration |
| Main | `2cc9ec42a90b3a868622e9273918a1f680b1609a`; PRs through62 merged; 514 module tests |
| PR62 worktree | `test-results/pr-split/passage-range-policy-core`; branch `feat/passage-range-policy-core`; head `58d0c5a764b5af9bdb5b70634169296345c17eed` |
| Next worktree | `test-results/pr-split/audio-input-information`; branch `feat/audio-input-information`; clean, based on main through61; research only |

Source version is0.6.0. Published downloadable0.5.5 remains an older supervised-test release. Review packages are not a new release or an installed replacement. Preserve the pre-existing untracked `design-reference/`.

## Completed component: PR62

[PR62](https://github.com/gboyegaadeojo/VerseCue/pull/62) implements configurable passage limits1–50, default10, across parser, speech fragments, saved coverage, native preparation and manual Confirm. Extended passages cannot enter Auto; unknown cross-chapter numbering blocks before native I/O. Policy changes invalidate prior reviews. See [feature record](docs/106-configurable-passage-range-policy.md).

Exact head58d0c5a7 passed514 module tests, syntax/inventory,28 Windows source scenarios and28 packaged scenarios. Fresh151-file Windows review-package/native receipts passed. [macOS run44787486654](https://github.com/gboyegaadeojo/VerseCue/actions/runs/44787486654) was checked completed/success at18:09:50 UTC for the exact full head above. No local build/test process remains pending at this checkpoint.

Reports are ignored files in the PR62 worktree: `test-results/settings-source-workflows.json`, `settings-packaged-workflows.json`, `review-package.json`, `passage-range-ui.json`, `packaged-passage-range-ui.json`. Inspect before relying on them. Earlier head8a960f4 reports are historical, not current-head evidence.

PR62 merged at2cc9ec4 after exact-head checks and is integrated into root. Root now passes517 module tests (three integration-only soak-summary tests). Next: finish the handoff documentation PR, then the prepared audio-input feature.

## Next feature: explain and validate the selected microphone

No implementation exists yet. Inspect `ui/audio.js`, the Audio settings UI and `tests/pastor-audio.test.cjs`. Plan: report available browser track channel count/sample rate/sample size and capabilities, explicitly as reported values; never claim physical MOTU verification. Reject known out-of-range selected channels or a returned device different from the exact requested device before creating the audio processing chain. Stop returned tracks on rejection; no default-device fallback. Unknown/unsupported metadata must remain unknown rather than fabricated.

Use optional callbacks/static helpers on existing PastorAudio if suitable. Preserve capture ownership/cancellation, meter, age/loss protection and Stop. Clear transient input information on reset/device selection; do not persist or export raw device IDs. Add concise Windows/macOS permission guidance, without changing OS settings. Inspect the existing input test before deciding what to extend. Add meaningful cancellation, mismatch, channel-boundary and missing-metadata tests, plus the relevant UI check. Rebase/merge updated main into this prepared branch first.

## Commands and verification habits

Use Windows PowerShell and `npm.cmd`. Standard checks: `npm.cmd test`, `npm.cmd run check`, `node scripts/audit-documentation.cjs`. The documentation audit writes `docs/evidence/documentation-consistency-audit.json`; review and commit intended changes. Inventory validation is part of check/build, not an independent security or license audit.

Isolated worktrees use root dependencies via `$env:NODE_PATH='C:\Users\gadeo\Documents\Vibe Coding\VerseCue\node_modules'`. `node scripts/build-review-package.cjs` creates an ignored exact-source review package and receipt. Existing local Whisper binaries/model can be reused in private worktree staging without downloading or publishing them. Inspect scripts and existing reports for exact paths before running.

Current synthetic source/package batch helpers live under `test-results/pr-split/settings-backup-recovery-ui/test-results/` as `run-source-workflows.cjs` and `run-packaged-workflows.cjs`; they derive scenarios from the checked-out workflow. Run source then packaged GUI suites sequentially to avoid focus/artifact races. Main through61 has27 scenarios; PR62 has28. macOS CI success covers build/software fixtures, not actual macOS ProPresenter UI automation.

## Authorization and unresolved external dependencies

The user approved provisional architecture/requirements implementation, routine commands/builds, public GitHub, small PRs and merging completed components. Personal Windows ProPresenter tests are authorized with Audience=false and Stage=false independently observed before/during output. Church production output is not authorized. No paid services, purchases, OS security/privacy/ACL changes, blind unknown-result retries, ProPresenter Clear/deletion or automatic restoration.

Specific unanswered matters: authorization to publish new sanitized personal-host telemetry; access to an authorized real Mac/native accessibility test profile; permission to create separately named test styles `VerseCue Test Verse` and `VerseCue Test Reference` with Text Down to investigate clipping. Continue unaffected software work; do not repeatedly ask the same questions or interpret silence as approval.

Keep actual-host telemetry/audio/screenshots private in ignored locations. Do not commit an entire test-results directory: it contains worktrees and private evidence. A prior automatic review rejected publication of new host telemetry without specific authorization.

P0 remains PENDING: exact supported route, fidelity, translation, platform and timing evidence plus IFC approval are incomplete. Personal Windows21.4.2 preparation/edition/minimized tests and limited supervised output exist, with known timing/clipping limitations; they do not prove physical church output, all six editions or Mac parity. The full [remaining-work list](docs/107-remaining-work-and-acceptance.md) separates implementation from real acceptance.

## Keeping this useful

Refresh CLAUDE.md about every10 minutes while actively building and at merges/build checkpoints. Update this file when branch/evidence/next-action changes materially. Keep PROGRESS.md current. Record what actually finished, exact verification head and one concrete next action. Never report the entire application accepted because a component merged.
