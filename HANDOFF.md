# VerseCue takeover handoff

Checked 2026-11-21 06:10 UTC. Start here after reading CLAUDE.md. The historical work is in PROGRESS.md. The aggregate implementation is on feat/reference-driven-bible-workflow, open as [draft PR22](https://github.com/gboyegaadeojo/VerseCue/pull/22). Main at 54242b2 includes merged components through PR81. PR75-81 were built by Claude on 2026-11-21; see CLAUDE.md for the current queue and NR-010 (start in Auto, Route workspace). Fetch origin and verify both refs before editing. The local main branch was behind origin/main at handoff.

## Read before changing code

1. Read AGENTS.md and the entire [master specification](VerseCue_Master_Development_Prompt_v2_Codex.md).
2. Read [CLAUDE.md](CLAUDE.md), [PROGRESS.md](PROGRESS.md) and [NEW_REQUESTS.md](NEW_REQUESTS.md).
3. Read [remaining work](docs/107-remaining-work-and-acceptance.md), the complete [86-row original requirement audit](docs/99-original-requirement-evidence-audit.md), the [RF01–22 map](docs/90-pr22-acceptance-state.md) and [acceptance plan](docs/06-test-and-acceptance-plan.md). Preserve all 62 FRs, 24 NFRs, 86 trace rows and the 66-row corpus.

## Last verified work

| Component | Evidence |
| --- | --- |
| PR69 offline labeled recognition evaluator | 71a699f, 544 module tests and Windows/macOS ARM/Intel diagnostics 44841778744. Zero real recordings scored. |
| PR70 bounded replay | 32c3586, 550 module tests and Windows/macOS ARM/Intel diagnostics 44845398423. Five readers share the ten-second PCM fixture contract. |
| PR71 rolling speech preview | 119e8f2, 550 tests, source and packaged Windows scenarios and Mac run 44848255375. Five completed windows in renderer memory. |
| PR72 capture revocation | d827b8b, four targeted Windows source and packaged scenarios and Mac run 44850836751. Earlier run 44850288022 exposed an expired-audio response regression and remains historical. |
| PR73 local soak summaries | ba30ae8, 551 tests and Windows/macOS ARM/Intel diagnostics 44851126201. Summaries default to ignored test-results/soak-summaries. |
| PR75-81 (2026-11-21) | Provisional speech provider, loopback guidance, start in Auto + Hold, ten-hour rehearsal harness, per-window audio loss, Route workspace, stale fixture repair. Aggregate 579 modules and 40/40 source scenarios. Details in docs/114-119 and PROGRESS.md. |
| PR74 provisional preview | 1c6f96a, 551 tests, exact-source Windows source/package scenarios and Mac run 44851728755. Provisional text is separate, clears on stop/reset and cannot enter candidate review. Current local providers still emit completed chunks. |

Aggregate 149313d passed 554 module tests and syntax/dependency inventory. No active build or soak from this handoff. The ignored local checkpoint test-results/pr70-private-resume.txt records scoped exact-source Windows worker replay and one-minute minimized dry run. Historical and synthetic evidence carries only its recorded scope. Source 0.6.0 remains unreleased. Published 0.5.5 is an older supervised-test build.

## Resume in this order

1. Check git status, branch heads, worktrees and current CI. On Windows run npm.cmd test and npm.cmd run check. Use node scripts/audit-documentation.cjs for structural checks, and review its generated JSON before staging. For a new component, branch from fetched origin/main in a separate worktree. Use the existing synthetic Electron scenarios and relevant native workflows for the changed feature.
2. Keep working on software that can be verified independently. The provisional speech UI is ready for a provider that emits partials. Inspect core/stt.cjs, core/resident-speech.cjs, the audio capture queue and desktop/main.cjs before changing providers. Keep inference bounded, preserve capture lease/age checks and keep provisional text out of candidate and output paths. Use label-backed fixtures for recognition behavior. The supplied sermon source and 4690-second offset are already in [source intake](docs/test-data/sermon-source-intake.md). Do not derive ground truth from captions or model output. Trusted installation, service update lock, rollback and privacy/recovery assurance remain open.
3. For Windows native acceptance, the computer-use helper recovered app discovery. Automatic approval review blocked launching ProPresenter because launch could expose outputs before their state was verified. Resume when the personal ProPresenter instance is open and Audience and Stage can each be independently observed disabled before and during testing. Prioritize fresh-reference preparation timing and clipping, then the full translation/theme/Look, coexistence and failure matrix. Keep new host evidence private.
4. For macOS, start from [the read-only accessibility probe](poc/macos/README.md). Native Bible preparation remains gated by an authorized Mac accessibility profile and actual observations of the installed app. Public Mac builds use synthetic targets and cannot establish a native control profile. Continue unaffected work while awaiting access.
5. Finish representative audio, same-host/LAN, six-edition and physical screen verification, held-out sermon precision/recall, measured latency, stability/rehearsal, and operator accessibility. P0 remains pending. Keep aggregate PR22 draft until its full acceptance scope is met.

## Worktree and privacy notes

GitHub received all committed project work; no stash or local-only commits were found at the audit. The root untracked design-reference directory predates this work and stays local. The normal-auto-backend worktree had a line-ending-only PROGRESS.md status, and private-soak-summary had a generated audit timestamp difference. Both were preserved. Do not stage the entire tree or remove existing worktrees. Isolated worktrees can use root node_modules via NODE_PATH. Review packages use node scripts/build-review-package.cjs and existing private worker/model assets. Match the revision and package receipt. A fresh clone lacks ignored recordings, assets, worktrees and reports.

Continue authorized builds, tests, pushes and verified component merges without repeatedly asking. Post progress at start, verification, merge and blockers. Update CLAUDE.md about every ten active minutes and at meaningful checkpoints. Stage explicit paths. ProPresenter owns Bible text, appearance, Looks, playlists and output. Verify exact translation and actual output independently of HTTP success. No church production output, paid purchases, OS privacy/security changes, Clear/deletion, blind retry after uncertain output, automatic cue restoration or publication of new private host telemetry. No delegation without the user's explicit request.
