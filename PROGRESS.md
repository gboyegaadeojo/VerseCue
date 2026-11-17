# VerseCue progress

Updated: 2026-11-17 (UTC). Authority: `VerseCue_Master_Development_Prompt_v2_Codex.md`, read in full before work.

## Current stage
P0 dynamic UI investigation completed for current personal test session; gate PENDING. Requirements approved and GitHub publication completed. IFC explicitly replied "continue provisionally" on 2026-11-17. P0 gate: PENDING. Requirements approval: granted by user reply "I approve" on 2026-11-17 for the provisional documentation baseline. No production application code or build-system selection. GitHub and personal test-host access/triggering were subsequently authorized and performed as recorded below; church live-host access remains unauthorized.

## Deliverable register
Status vocabulary: not started / drafted / audited. Audited means checked for the current stage, not approval or proof of feasibility.

| Document / artifact | Status | Scheduled stage |
|---|---|---|
| PROGRESS.md | audited | continuous |
| PROJECT_ASSUMPTIONS.md | audited | 0 |
| RESEARCH_SOURCES.md | audited | 0, maintained thereafter |
| docs/00-executive-summary.md | audited | 3A |
| docs/01-business-requirements.md | audited | 3A |
| docs/02-functional-requirements.md | audited | 3A |
| docs/03-non-functional-requirements.md | audited | 3B |
| docs/04-technical-requirements-and-architecture.md | audited | 3B |
| docs/05-ux-requirements.md | audited | 3B |
| docs/06-test-and-acceptance-plan.md | audited | 3C |
| docs/07-risks-and-open-questions.md | audited | 3C |
| docs/08-roadmap.md | audited | 3C |
| docs/09-investigation-findings.md | audited | Stages 1–2 research; empirical verification pending |
| docs/10-integration-feasibility-and-poc.md | audited | 1; tests PENDING |
| docs/11-data-privacy-security-and-licensing.md | audited | 3D |
| docs/12-traceability-matrix.md | audited | 3D |
| docs/13-operations-and-runbook.md | audited | 3D |
| docs/14-decision-records.md | audited | Approved provisional baseline; final technical selections pending P0 |
| docs/15-implementation-handoff.md | audited | 3D |
| docs/test-data/versecue-utterances.csv | audited | 3C |
| docs/test-data/versecue-utterances.json | audited | 3C |
| poc/ (diagnostics only) | audited | Labelled read-only/explicit test-trigger clients; personal runs recorded |
| README.md | audited | 3D |
| REQUIREMENTS_SUMMARY.md | audited | 4 |
| docs/16-decision-brief.md | audited | 4 |
| docs/17-package-audit.md | audited | 4; historical audit, later scoped test update |
| docs/18-personal-propresenter-test-results.md | audited | Authorized personal Windows partial evidence |
| docs/19-dynamic-bible-ui-investigation.md | audited | Unprepared range/UI/translation/palette partial evidence |
| docs/test-data/sermon-source-intake.md | audited | Start 1:18:10 recorded; actual source pending |

## Decisions made
- User specification is authoritative; documentation first, full staged deliverables retained.
- ProPresenter remains the sole presentation system. No standalone output workaround.
- Confirm is the initial default; Auto requires intentional enablement and proven safeguards.
- No production ProPresenter access or output changes without explicit authorization. Public vendor research may proceed.
- No committed architecture until P0 investigation; implementation requires feasibility and requirements gates.
- No GitHub initialization/publication until explicit authorization.
- IFC authorized provisional documentation continuation on 2026-11-17; this does not satisfy P0 or implementation gates.
- Research recommendations only: Tauri 2 candidate, local whisper.cpp evaluation, deterministic parser, optional future local faster-whisper. No final architecture/backend/model/build system/cloud choice accepted.

## Open questions
Q-01 through Q-09 asked together and answered in part on 2026-11-17. See PROJECT_ASSUMPTIONS.md response register. Known: ProPresenter 21, Mac mini M4, same-PC first plus LAN future, MOTU M4, six installed translations, existing themes/Looks/macros, Companion, English, free use, latency targets accepted. Remaining: exact build/macOS/RAM, default translation/IDs, routing/theme/macro details and measured behavior. Do not repeat answered questions.

DATA-01: requested 3–5 consented real sermon excerpts on 2026-11-17; not supplied. No real accent/accuracy evidence exists.

## P0-blocking unknowns
- Exact installed ProPresenter build, supported Bible-reference route and installed API behavior.
- Translation availability/rights and IFC theme/room/stream Look fidelity.
- Authorized hardware-in-loop test environment and test evidence, including concurrent media/operator safety.
- Windows/macOS viability and representative measured turnaround.

## Exact next action
Publish current dynamic UI findings, then STOP with P0 PENDING and exact input request: actual Sunday-service link/file, starting at already supplied 1:18:10, plus permitted pastor-consented evaluation use. Do not ask user to cut clips or repeat timestamp; no source visible/local media found. Continue authorized integration diagnostics independently when useful, but no production application code until actual P0 pass. Existing personal-host trigger/GitHub/requirements approvals persist; do not request them again. Next technical blockers: reliable supported dynamic lookup or last-resort UI completion/ownership/readback, clipping-free authorized template, church room/stream/Mac/LAN/concurrency and real-audio timing. Do not fix/change the user's theme silently or call preview success physical-output acceptance. Private repo already published; preserve all empirical/provisional distinctions.
## Checkpoints and audit
- Stage 0: read complete authoritative prompt before work; wrote and audited intake files one at a time, asked nine material questions with defaults and requested 3–5 pastor-consented real sermon excerpts. Incorporated IFC answers without repeating questions.
- Stage 1: re-read progress and master Sections 2/4/15. Retrieved primary vendor sources and public schema, stored data-only evidence snapshot. Wrote/audited docs/10 before docs/09; updated source register. Full pending test matrix, weighted provisional scores and authorization-gated reproduction steps retained. No probe executed or production host contacted.
- Public schema download initially blocked by sandbox networking; retried with approved escalation to public vendor only. This was not live-host authorization.
- Stage 1 P0 blocker: no demonstrated supportable arbitrary-reference route; no exact text/theme/Look, platform or latency test evidence. Gate PENDING, not FAILED/PASSED. All future files remain scheduled, not omitted; no placeholders created for later stages.
- Created docs/test-data and poc directories for scheduled work; no corpus/probe claims. No Git/GitHub initialization, publishing, purchase, cloud provider selection, build scaffold or application code.

- Stage 2 checkpoint: full mandated STT/desktop/parser/Bible-content comparisons written with source register and dated cost formulas. Local whisper.cpp and Tauri are recommendations only; integration PROVISIONAL. IFC free-use constraint retained; signing budget/rights/cloud terms unresolved. docs/09 audited for requested comparison axes; docs/14 seeded and audited with status/options/consequences/exit criteria. No tests represented as performed.

- Stage 3A checkpoint: docs/00–02 complete and audited against master scope/business/functional categories. Six BRs and 62 detailed FRs retain acceptance, rationale, ownership, priorities and release dependencies; all integration behavior PROVISIONAL. Later test/traceability links remain scheduled, not represented as executed. Manual lookup/history phasing and safety context resets are explicit.

- Stage 3B checkpoint: 24 measurable NFRs, provisional architecture/contracts/C4/state diagrams and full UX layouts/flow written and audited. TTLs, queues, resource budgets, mode distinctions, truthful receipt wording and correction/stop races reconciled. Runtime/accessibility/Mermaid rendering verification remains scheduled or pending tools; no application tests run.

- Stage 3C checkpoint: test plan plus 66 distinct SYNTHETIC-TEXT corpus rows in CSV/JSON, ranked risk register and roadmap complete/audited. Field-level comparison verified both corpus formats contain 66 rows with zero differences; initial PowerShell comparison incorrectly wrapped JSON array and was corrected without changing corpus data. All real accent/accuracy evidence pending. Roadmap effort/capital/recurring costs remain preliminary and separate.

- Stage 3D checkpoint: privacy/security/licensing, individual 86-row traceability, operations, final provisional ADRs, implementation handoff and ordered README complete/audited. Scope boundaries, mode/retention/command invariants and no-code restrictions reconciled. Added final decision-brief/audit artifact links, to be completed in Stage 4 before delivery. No host/output/package tests performed.

- Stage 4 checkpoint: summary/decision brief/audit complete and reviewed against Section 14. Final mechanical checks: required root files and all docs/00–15 plus supplements present; 86 individually mapped requirements; 66 matching unique synthetic corpus rows; zero broken relative links/fence issues/invalid objective IDs; no code/build files or .git. Corrected roadmap sum and aligned health-poll timeout proposal. Documentation is prepared for approval, not a claim of feasibility/runtime success. Mermaid rendered visual QA REQUIRES VERIFICATION (no renderer installed); exact reviewer procedure recorded. All P0/real-audio/performance/security/accessibility/package/UAT results PENDING. Mandatory Stage 4 STOP observed.

- Approval record 2026-11-17: user replied **I approve** to the Stage 4 request. Provisional requirements baseline accepted; no scope/cost/safety revisions requested. P0 tests remain unperformed/PENDING; final integration/framework/model/toolchain choices remain conditional. Approval does not waive feasibility or authorize live access/output, spending, cloud or GitHub/publication. No code or host actions performed in recording approval.


## New authorization — personal-host tests and GitHub publication
2026-11-17: IFC user authorizes testing on their personal computer with ProPresenter installed, including triggering test passages, and confirms the test outputs are disconnected from congregation/livestream. Interpret "do both" as read-only inspection and passage-trigger tests where possible; this is not proof of both routed outputs/OSs/Auto accuracy. User is present supervising the current test session. No church production host authorization inferred. User also explicitly authorizes GitHub publication, superseding the earlier withholding; default private VerseCue repository in authenticated personal account unless a destination exists. Review files for secrets/private diagnostics/Bible content before publication. P0 still PENDING; no production code until pass. Prior statements about no authorization are historical and superseded only within this scope.

- Personal test checkpoint 2026-11-17: Windows PP 21.4.2 (352584193), loopback port 1025 already enabled, version/library/status docs reads succeeded; installed schema 205 paths with 11 playlist/timeline additions and no Bible/Scripture/translation keyword. Bible UI created John 3:16 and Romans 8:28 KJV test presentations, 2 cues each. Four actual cue trigger requests returned 204; local previews changed, John cue1/Romans cue0/cue1 matching text/index readback. Initial John cue0 immediate readback stale; later state correct. No physical screen/room-stream fidelity, running media, policy Auto/Confirm, failure/reconnect, Mac/LAN or real-audio/performance claim. P0 PENDING; docs/18 has sanitized results. Test assets left in personal PP library, final preview Romans cue1; no broad clear or production code. Node probes used; PowerShell script execution policy blocked, not changed/bypassed.
- GitHub: authenticated account verified, new private gboyegaadeojo/VerseCue created under explicit authorization. Local git initialized; file/secret review found no credential pattern hits, raw private dumps/recordings/Bible databases excluded. First publication being prepared; final remote verification follows.

- Publication verification 2026-11-17: private https://github.com/gboyegaadeojo/VerseCue created, initial documentation/probe commit 81b93ba pushed to main, remote full SHA matches local and gh metadata confirms PRIVATE. Final tracker/audit publication note follows in a second documentation commit. No recordings/Bible database/raw private address dumps/secrets included; installed/public schema snapshots marked byte-preserving through .gitattributes. No application scaffold/dependencies/build system selected. P0 remains PENDING; stop report follows.

## Continuation and sermon-source intake
User instructed continuing investigation/building and named a Sunday-service start time **1:18:10 (4690 seconds)**. No recording/link/file is visible in the message or local workspace media inventory; request source once and continue independent integration work. Do not claim any audio analysis or assume a specific Sunday video. Pastor-consent/use scope must be confirmed before audio processing; no cloud upload or persistent recording implied. Personal-host testing/GitHub authorization persist. Current investigation: last-resort ProPresenter Bible UI route, new unprepared passage, focus/formatting and macro/action coverage. No production app code while P0 pending.

- Dynamic UI checkpoint 2026-11-17: unprepared Philippians 4:6–7 KJV generated four cues; explicit first cue click changed preview and API group/index readback. Next-verse expanded preparation to 4:6–8/seven cues. ASV selected in preparation then KJV restored; no intentional ASV cue trigger. Reference set-value timed out and appeared later; semantic translation state stale versus screenshot; active Default identity reused and unavailable after regeneration while previous output preview persists. Explicit UI warning identifies clipped text due too-small boxes; no theme modified. Actual View Action Palette opened by menu (Alt+A listed); no visible Bible-search action and no action added/triggered. Final personal preparation KJV Philippians4:6–8, preview last intentional4:6 first segment. docs/19 audited; P0 PENDING, no production code. Sunday-service source absent, requested once with timestamp4690s captured; independent work continued.
