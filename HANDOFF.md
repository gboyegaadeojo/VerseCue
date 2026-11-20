# VerseCue development handoff

Checked: 2026-11-20 22:55 UTC. [CLAUDE.md](CLAUDE.md) is the short current checkpoint; [PROGRESS.md](PROGRESS.md) retains history. This handoff supports Codex, Claude Code and human developers in the same workspace. It does not transfer the previous chat, credentials or runtime permissions automatically.

## Start here

1. Read the entire [master specification](VerseCue_Master_Development_Prompt_v2_Codex.md), then [agent instructions](AGENTS.md), CLAUDE.md, PROGRESS.md, [new requests](NEW_REQUESTS.md) and [remaining work](docs/107-remaining-work-and-acceptance.md).
2. Inspect git status --short, git branch --show-current, git log -1, git worktree list and actual CI/process state. Saved status alone does not prove a process is live. Never restart solely because observation timed out.
3. Consult the complete [original86-row audit](docs/99-original-requirement-evidence-audit.md), [RF01-22 map](docs/90-pr22-acceptance-state.md) and original acceptance plan. This handoff does not replace or waive requirements.
4. Continue independent authorized implementation through small PRs. Merge completed components after relevant checks. Aggregate [PR22](https://github.com/gboyegaadeojo/VerseCue/pull/22) remains draft until its full scope is satisfied.

## Current repository

Public repository: https://github.com/gboyegaadeojo/VerseCue.

| Location | Checked state |
| --- | --- |
| Main | d9faf6a, through PR66;534 modules |
| Root | feat/reference-driven-bible-workflow,52cc803 before this checkpoint;537 modules including three integration-only historical soak-summary tests |
| Active component | Draft [PR67](https://github.com/gboyegaadeojo/VerseCue/pull/67), feat/booth-readability, test-results/pr-split/booth-readability |
| Exact PR67 head | 5bfb90513b9b61ae113b79204049008276313e84 |
| Unrelated local material | Existing untracked design-reference/; preserve it |

Source0.6.0 remains unreleased. Downloadable0.5.5 is an older supervised-test build. Review packages are neither releases nor installed replacements.

## Active operation: verify PR67

Read docs/111-booth-readability-and-review-priority.md in the active worktree. After merge it will also exist in root docs/.

The component restores18px base/control text and44px action targets while preserving Studio colors/font/backend. Current passage precedes manual/session options; deliberate manual review scrolls/focuses the heading without sending. Speech retains input focus. Initial visual review caught a primary action pushed too low and layout was corrected. The unchanged workspace test exposed footer-over-Stop at640px/200%; the normal-flow footer fix passed that same test.

534 module/check, measured typography/rectangles/checkbox-label/compact/manual-no-send tests and existing Studio/workspace/smoothness checks passed. Full current verification:

- Windows source32: session34951 is terminal success; all32 passed.
- Windows review build: session81089 is terminal success;153 packaged files match exact source and native receipt verified.
- [Mac44828146007](https://github.com/gboyegaadeojo/VerseCue/actions/runs/44828146007): completed successfully at the exact head. No new dispatch is needed.
- Packaged32 suite39252 is live. Poll it and merge only when current-head evidence passes. Read-only personal checks95264/7532 are terminal, recorded only privately; no actual native preparation is running. Integrate root after verified merge and update progress/audit/PR22/checkpoints.

These are synthetic software checks, not physical booth, screen-reader, real speech, native Mac ProPresenter or field acceptance.

## Recently completed

| PR | Scope | Evidence before merge |
| --- | --- | --- |
|62|Passage limits1-50; default10 and independent Auto ceiling|514 modules,28 source/28 packaged Windows,151-file receipt, Mac44787486654|
|63|Agent handoff/backlog|Documentation audit; no app code|
|64|Input format/ranges, channel/device validation, permission guidance|521 modules,29 source/29 packaged,151-file receipt, Mac44791701176|
|65|App-owned interrupted CLI WAV recovery|Corrected d2f6ac25:531 modules,30 source/30 packaged,152-file receipt, Mac44794893453. Initial Mac44794215980 failed on parent aliases and is retained historically.|
|66|Ten-second meter-only Setup test with backend purpose/ownership/expiry|9d2735bd:534 modules,31 source/31 packaged,152-file receipt, Mac44800662569|

All these component jobs are terminal. Do not poll old handles or repeat unchanged successful checks without a new concern. Original service gates remain open.

## Commands and evidence

Use PowerShell and npm.cmd on Windows. Standard checks: npm.cmd test; npm.cmd run check; node scripts/audit-documentation.cjs. The audit writes docs/evidence/documentation-consistency-audit.json; review intended changes. Structural consistency and dependency inventory checks are not runtime/release or independent security/license approval.

Isolated worktrees use root node_modules via NODE_PATH. Existing private speech assets are root poc/private/tools/whisper-bin-x64.zip and poc/private/models/ggml-base.en.bin. Do not publish them. node scripts/build-review-package.cjs creates an isolated exact-source Windows package/native receipt under ignored test-results; it does not replace the installed application.

This workspace has copied sequential helpers in the active worktree's test-results/: run-source-workflows.cjs and run-packaged-workflows.cjs. They derive commands from the checked-out .github/workflows/macos-development.yml. Reports are settings-source-workflows.json, settings-packaged-workflows.json, review-package.json and scenario-specific reports. Match revision/source before relying on them. The package report provides its executable.

A fresh clone may lack these ignored helpers, reports and assets. Run the workflow's listed node commands sequentially or recreate orchestration after inspecting it. Never recreate old processes solely from a status note. Run source then packaged GUI suites sequentially to avoid focus/artifact races. CI may run independently. Mac CI proves its software/package scope; it does not run installed ProPresenter.

## Authorization and external dependencies

The user approved provisional architecture/requirements implementation, routine local builds/tests, public GitHub, small PRs and completed component merges. Personal Windows ProPresenter output is authorized only with Audience=false and Stage=false independently observed before/during output. Church production output is not authorized. No paid services/purchases, OS security/privacy/ACL changes, blind unknown-result retries, ProPresenter Clear/deletion or automatic cue restoration.

Specific unanswered matters: authorization to publish new sanitized personal-host telemetry; access to an authorized real Mac/native accessibility test profile; permission for separately named test styles VerseCue Test Verse / VerseCue Test Reference with Text Down for clipping investigation. Continue unaffected work without repeating questions. Silence does not authorize dependent actions.

Keep actual-host telemetry/audio/screenshots/private logs ignored. Automatic review previously rejected new host telemetry publication without specific permission. Never commit or delete the entire test-results directory: it contains private evidence and active worktrees.

P0 remains PENDING: route/fidelity/translation/platform/timing evidence and IFC approval are incomplete. Historical personal Windows21.4.2 preparation/edition/minimized/limited-output evidence has scope and known speed/clipping limitations. It does not prove all six IFC editions, physical room/stream outputs, Mac parity or service readiness. Preserve original thresholds and release priorities.

## After PR67

Use docs/107 and the complete original audit rather than narrowing success to existing tests. Software remains for speech preview/reliability, native Mac integration and privacy/distribution follow-ups. Real acceptance includes exact edition/range/context fidelity; preservation of themes/Looks/playlist/manual/Companion operation; input hardware; latency/long sessions; labeled sermons; physical outputs; volunteer and screen-reader tasks. ProPresenter owns its themes/Looks/playlists: these are preservation checks, not editors to build in VerseCue.

Refresh CLAUDE.md about every10 minutes during active work, after merges/build checkpoints and before interruption. Keep this file and PROGRESS.md current. Record exact evidence, one concrete next action and actual live handles. Never claim the whole application accepted because a component merged.

## Immediate priority after the package check

After verified PR67 merge/integration, inspect the authorized personal ProPresenter configuration using the computer-use skill (already read along with guidance/API/confirmations). Use node_repl + @oai/sky, returned app/window selection, fresh observations and one action per refresh. No input has run yet; wait for package GUI completion to avoid focus races. Keep personal records private. No security/privacy setting changes, production output, Clear, blind retry or restoration. Native testing still requires fresh independent Audience=false/Stage=false observations.

If actual HIL depends on user/external state, continue independent software work. Current sermon pilot/spot-check/replay scripts are throwaway diagnostics and explicitly unscored, with no independent audible-end/accuracy labels. A strict labeled-recognition scorer would support the remaining acceptance work; real labels/consent/held-out coverage must remain genuine rather than inferred from captions or model output. The supplied source/timestamp and clips are already recorded in docs/test-data/sermon-source-intake.md; do not ask for them again.

## Independent evaluation tool draft - 2026-11-20 23:07 UTC

feat/labeled-recognition-evaluation in test-results/pr-split/labeled-recognition-evaluation is based on main through66. Two uncommitted scripts draft offline scoring of supplied canonical citation/edition proposals, separated by source/split; real rows need explicit authorization and review artifacts, duplicate audio/split leakage is rejected, and reporting is private/no-overwrite with nominal Wilson95 bounds and explicit no-service-acceptance flags. Latest syntax check77914 is live. No tests/docs/PR or actual scoring yet. Existing pilot/replay data remain unlabeled. Preserve this work while completing PR67 package and personal configuration inspection.

## Authoritative current checkpoint - 2026-11-20 23:27 UTC

PR67 merged atba4ca31; root7129ee6 passes537 modules/check/audit. All verification handles terminal. Computer Use list_apps timed out twice, then reset initialization/retry returned js execution timeout/kernel reset; no app selection/input was sent. ProPresenter UI work remains pending helper recovery; no security/privacy changes, output, screenshots or native operation occurred. Private read-only records remain ignored.

The evaluator draft now has10 passing focused synthetic groups; code/tests remain uncommitted, no real data scored, no docs/full-module/Mac check/PR yet. A new docs/active-work-handoff-link worktree is being created in session62562 to fix stale main entry points. Separately, five legacy replay/soak scripts retain12-second limits despite the runtime10-second bound; no repair started. Complete bounded replay/ownership/timing alignment before running or claiming a new long soak. See the refreshed CLAUDE.md for exact next actions.
