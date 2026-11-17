# VerseCue — IFC discovery and requirements package

Prepared 2026-11-17 for Immanuel Fellowship Church, Winnipeg. **Documentation only. P0 feasibility PENDING. All integration-dependent requirements, architecture and release plans are PROVISIONAL.** IFC approved the provisional requirements and subsequently authorized personal-host ProPresenter tests and GitHub publication. Partial test results are in docs/18; production application code, church production-host access, spending and cloud-provider selection remain unauthorized.

## Start here
1. Read the [leadership summary](docs/00-executive-summary.md) and [requirements summary](REQUIREMENTS_SUMMARY.md).
2. Read the [P0 feasibility report and authorization-gated test procedure](docs/10-integration-feasibility-and-poc.md). Public presentation triggers do not establish arbitrary Bible lookup. No hardware/output test passed.
3. Review [open risks/decisions](docs/07-risks-and-open-questions.md), [decision brief](docs/16-decision-brief.md) and [audit](docs/17-package-audit.md) before approving requirements. Acceptance of documentation does not waive P0 or authorize implementation.
4. Use [PROGRESS.md](PROGRESS.md) for current stage, pending blockers and exact next action. Resume by reading it and the relevant sections of the [authoritative master specification](VerseCue_Master_Development_Prompt_v2_Codex.md).

VerseCue is intended as a small Windows/macOS companion that identifies explicit spoken references and defaults to volunteer confirmation. ProPresenter remains the only Bible/presentation/output authority, preserving IFC's existing themes, room/stream Looks and manual/Companion workflow. No standalone output workaround is in scope.

## Ordered document package
| Order | Document | Review purpose |
|---|---|---|
| 00 | [Executive summary](docs/00-executive-summary.md) | Nontechnical business case, costs/risks/scope and names |
| 01 | [Business requirements](docs/01-business-requirements.md) | Stakeholders, six objectives/BRs, journeys, KPIs and gates |
| 02 | [Functional requirements](docs/02-functional-requirements.md) | 62 numbered detailed FRs with acceptance/owners/releases |
| 03 | [Non-functional requirements](docs/03-non-functional-requirements.md) | 24 measured NFRs, profiles and thresholds |
| 04 | [Technical requirements and architecture](docs/04-technical-requirements-and-architecture.md) | Provisional stack, C4/state diagrams, contracts/queues/deployment |
| 05 | [UX requirements](docs/05-ux-requirements.md) | Four ASCII layouts, modes, focus, Sunday flow and recovery |
| 06 | [Test and acceptance plan](docs/06-test-and-acceptance-plan.md) | Unit/contract/system/soak/HIL/UAT, dataset and go/no-go |
| 07 | [Risks and open questions](docs/07-risks-and-open-questions.md) | Ranked risks, decision owners and due points |
| 08 | [Roadmap](docs/08-roadmap.md) | P0 → MVP → v1 → optional v2, preliminary effort/costs |
| 09 | [Investigation findings](docs/09-investigation-findings.md) | Primary-source STT/framework/parser/content comparisons |
| 10 | [Integration feasibility and POC](docs/10-integration-feasibility-and-poc.md) | Route matrix, pending tests, exact evidence limitations, gate |
| 11 | [Privacy, security and licensing](docs/11-data-privacy-security-and-licensing.md) | Inventory/retention, 16 hazards, controls and rights ledger |
| 12 | [Traceability matrix](docs/12-traceability-matrix.md) | Objective/BR → each FR/NFR → tests/release |
| 13 | [Operations and runbook](docs/13-operations-and-runbook.md) | Preflight, five-minute guide, manual failback and incidents |
| 14 | [Decision records](docs/14-decision-records.md) | Options, recommendations/accepted constraints and consequences |
| 15 | [Implementation handoff](docs/15-implementation-handoff.md) | Post-gate repo/modules/tasks/readiness/done, no code |
| 16 | [Decision brief](docs/16-decision-brief.md) | Compact final review and next engineering step |
| 17 | [Package audit](docs/17-package-audit.md) | Completeness/consistency evidence and remaining verification |

## Supporting artifacts
- [PROJECT_ASSUMPTIONS.md](PROJECT_ASSUMPTIONS.md): original defaults and IFC's answered intake, no repeated questions.
- [RESEARCH_SOURCES.md](RESEARCH_SOURCES.md): primary URLs, publishers, access dates, evidence grades and retrieval gaps.
- [REQUIREMENTS_SUMMARY.md](REQUIREMENTS_SUMMARY.md): one-page approach and top five risks.
- [PROGRESS.md](PROGRESS.md): stage/deliverable ledger, decisions, blockers and resume point.
- [Utterance CSV](docs/test-data/versecue-utterances.csv) and [identical JSON](docs/test-data/versecue-utterances.json): 66 distinct proposed cases, all SYNTHETIC-TEXT. Planned accent strata are not recordings or accuracy evidence.
- [Public API schema snapshot](docs/evidence/propresenter-openapi-2026-11-17.txt): vendor data only; provenance/hash in investigation findings. Not an application module or installed-version proof.
- `poc/`: reserved for labelled disposable non-destructive diagnostics. Labelled read-only and explicitly armed test-trigger diagnostics now exist; see poc/README.md and docs/18 for actual runs. Future probes retain the prescribed header, run README, no secrets and read-only/dry-run defaults.

## Readiness and use restrictions
Known user-reported environment: ProPresenter 21, Mac mini M4, MOTU M4, English, same-PC first plus LAN companion design, Companion and existing themes/Looks/macros. Installed names: KJV, Amplified, Amplified classic, NIV, NKJV, The Message. Exact build/macOS/default edition/routing/assets remain unverified. IFC requires free operation; local STT is recommended, not benchmarked. Accepted delay targets remain unmeasured. No model/backend/framework/toolchain is finally accepted.

Real accuracy/accent evidence requires consented IFC sermon excerpts and representative holdout/rehearsal material; none supplied. Current synthetic corpus tests parser design only. Full acceptance outcomes remain PENDING; limited personal Windows connector/schema observations are recorded in docs/18. Markdown diagrams are design artifacts, not a running UI.

At Stage 4 STOP, IFC reviews this package and pending P0 blockers. Production implementation requires both feasibility and requirements approval; production host access/live tests, purchases, cloud choice and publishing each need explicit authorization. If no supportable arbitrary Bible route works, stop for product decision and preserve manual ProPresenter operation.

## Review status update — 2026-11-17
IFC approved the provisional requirements baseline by replying **I approve**. Stage 4 requirements approval is recorded. **P0 remains PENDING**, so implementation is not ready; the next step is a separately authorized isolated feasibility test session. All existing host/output, purchase/cloud and GitHub/publication restrictions remain in force. See PROGRESS.md for the exact next action.

## Current personal test and publication status
2026-11-17: user authorized personal-host passage tests and GitHub publication. [Personal test results](docs/18-personal-propresenter-test-results.md): Windows ProPresenter 21.4.2, installed schema inspected, saved KJV John 3:16/Romans 8:28 cues triggered with preview/readback evidence. P0 still PENDING: arbitrary lookup, church Looks/physical outputs, Mac/LAN, guarded policy and real-audio performance unproved. Labelled diagnostic scripts now exist under [poc](poc/README.md); no production application code/build scaffold. Private repository: https://github.com/gboyegaadeojo/VerseCue . Historical no-publication/no-host statements are superseded only within this new authorization.


## Dynamic-route test update
[Unprepared Bible UI investigation](docs/19-dynamic-bible-ui-investigation.md) tested Philippians 4:6–7 preparation/preview, native next verse, translation selection and actual action palette. Results are partial: uncertain UI completion, stale semantic/readback identity and clipped-text warnings prevent P0 acceptance. [Sunday-service source intake](docs/test-data/sermon-source-intake.md) records requested start 1:18:10; actual link/file and permitted-use scope remain pending. No real-audio results or production application code.
