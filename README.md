# VerseCue — IFC desktop companion

Prepared 2026-11-17 for Immanuel Fellowship Church, Winnipeg. **Development application now implemented under explicit user approval. P0 feasibility and full service-release acceptance remain PENDING.** All original requirements are retained. Church production-host access, spending and cloud-provider selection remain unauthorized. Arbitrary ProPresenter Bible lookup, Auto and Clear remain unavailable; finite prepared test cues do not satisfy P0.

## Try the development application

The Windows development package is built locally under `dist/` with a verified offline speech engine/model, notices and SHA256 manifest. Extract the whole ZIP and run `VerseCue.exe` inside it. It starts in **Confirm + dry run**, does not capture audio until explicitly started, and creates no audience graphics. This unsigned package is for supervised development, not a live service.

For source development on Windows:

```text
npm.cmd ci --cache .cache/npm
node node_modules/electron/install.js
npm.cmd start
npm.cmd test
npm.cmd run check
npm.cmd run test:desktop
```

Read [running/setup, evidence and release limitations](docs/22-development-build-and-release-status.md) and [all 86 requirement implementation statuses](docs/implementation-coverage.json). Mac source/packaging is provided but native Mac speech/capture/install testing and signing are pending. No cloud service or paid API is required.

Version 0.2.4 extends the requested [private API and experimental Windows preparation bridge](docs/23-private-api-and-experimental-bible-bridge.md) with candidate preparation and numeric KJV reference validation. The API is off at startup and uses a rotating memory-only token on loopback. [Native verification results and limits](docs/24-native-bridge-verification-and-validation.md) record three successful preparation receipts, existing clipping warnings and one separate unintended manual personal-test clear. The helper remains experimental, prepares references only and never clicks a passage live. Build it with `node scripts/build-windows-bridge.cjs` before packaging if needed. P0 and service release remain pending.

[GPU diagnostic results](docs/25-gpu-speech-diagnostic.md) explain the CPU fallback and subsequent CUDA inference stall. Acceleration is not enabled or bundled.

Source 0.2.5 adds [bounded capture during recognition](docs/26-bounded-audio-capture.md), with visible overflow/stale-audio counts and stop/restart ownership tests. The verified 0.2.4 ZIP is a prior development checkpoint; newer source is verified and packaged separately.

Source0.2.6 adds [optional resident CPU recognition and target-change race protection](docs/27-resident-speech-and-target-races.md). Default CLI behavior remains available; resident mode is explicitly selected in Setup and has not met the live-service latency target.

Source0.2.7 adds [local service profile snapshots](docs/29-local-service-profiles.md). The [smaller-model diagnostic](docs/28-model-size-diagnostic.md) measured faster processing with different interpretations; tiny.en remains diagnostic-only and base.en stays the default.

[Previous/Next verse controls](docs/30-manual-verse-navigation.md) propose KJV references for review and handle chapter/range boundaries without changing output. Run `node scripts/audit-documentation.cjs` for the structural document/traceability/corpus/link audit.

Source0.2.8 adds [exclusive audio session ownership](docs/31-exclusive-audio-session-ownership.md) across full/compact windows, including cancellation when the owner closes and protection against late input initialization after revocation.

[Installed Windows speech diagnostic](docs/32-installed-windows-speech-diagnostic.md) records another tested local option; it did not justify a backend change. The [development stability protocol](docs/33-development-stability-protocol.md) records the completed three-hour0.2.8 fixture/dry-run test (360cycles, scoped pass).

Source0.2.9 adds [renderer recovery and canonical target validation](docs/34-renderer-recovery-and-address-validation.md), including generation-safe health monitoring. Its current test evidence is distinct from the separate0.2.8 stability run.

Version0.3.0 implements [NR-001/NR-002](NEW_REQUESTS.md): [minimized listening and opt-in quoted-Scripture identification](docs/35-background-and-quoted-scripture.md). Start the authorized audio input, then minimize VerseCue while ProPresenter remains foreground. To identify wording without a citation, import a local passage index whose use rights you acknowledge and enable quote matching for the session. The supplied “For God so loved the world that he gave…” example identifies John3:16. Quote results require desktop confirmation through the existing verified ProPresenter cue gate. No Bible text corpus is bundled, and broad semantic paraphrases/unattended quote display remain unavailable.

## Start here
1. Read the [leadership summary](docs/00-executive-summary.md) and [requirements summary](REQUIREMENTS_SUMMARY.md).
2. Read the [P0 feasibility report and authorization-gated test procedure](docs/10-integration-feasibility-and-poc.md). Public presentation triggers do not establish arbitrary Bible lookup. Partial personal-host evidence is in docs/18–19; full P0 has not passed.
3. Review [open risks/decisions](docs/07-risks-and-open-questions.md), [decision brief](docs/16-decision-brief.md) and [audit](docs/17-package-audit.md). Requirements and later implementation approval are recorded; missing feasibility evidence remains missing.
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

## Historical baseline readiness (superseded by the development-build report)
Known user-reported environment: ProPresenter 21, Mac mini M4, MOTU M4, English, same-PC first plus LAN companion design, Companion and existing themes/Looks/macros. Installed names: KJV, Amplified, Amplified classic, NIV, NKJV, The Message. Exact build/macOS/default edition/routing/assets remain unverified. IFC requires free operation; local STT is recommended, not benchmarked. Accepted delay targets remain unmeasured. No model/backend/framework/toolchain is finally accepted.

Real accuracy/accent evidence requires consented IFC sermon excerpts and representative holdout/rehearsal material; none supplied. Current synthetic corpus tests parser design only. Full acceptance outcomes remain PENDING; limited personal Windows connector/schema observations are recorded in docs/18. Markdown diagrams are design artifacts, not a running UI.

At Stage 4 STOP, IFC reviews this package and pending P0 blockers. Production implementation requires both feasibility and requirements approval; production host access/live tests, purchases, cloud choice and publishing each need explicit authorization. If no supportable arbitrary Bible route works, stop for product decision and preserve manual ProPresenter operation.

## Historical requirements-review checkpoint — 2026-11-17
IFC approved the provisional requirements baseline by replying **I approve**. Stage 4 requirements approval is recorded. **P0 remains PENDING**, so implementation is not ready; the next step is a separately authorized isolated feasibility test session. All existing host/output, purchase/cloud and GitHub/publication restrictions remain in force. See PROGRESS.md for the exact next action.

## Historical personal-test and publication checkpoint
2026-11-17: user authorized personal-host passage tests and GitHub publication. [Personal test results](docs/18-personal-propresenter-test-results.md): Windows ProPresenter 21.4.2, installed schema inspected, saved KJV John 3:16/Romans 8:28 cues triggered with preview/readback evidence. P0 still PENDING: arbitrary lookup, church Looks/physical outputs, Mac/LAN, guarded policy and real-audio performance unproved. Labelled diagnostic scripts now exist under [poc](poc/README.md); no production application code/build scaffold. Private repository: https://github.com/gboyegaadeojo/VerseCue . Historical no-publication/no-host statements are superseded only within this new authorization.


## Historical dynamic-route test checkpoint
[Unprepared Bible UI investigation](docs/19-dynamic-bible-ui-investigation.md) tested Philippians 4:6–7 preparation/preview, native next verse, translation selection and actual action palette. Results are partial: uncertain UI completion, stale semantic/readback identity and clipped-text warnings prevent P0 acceptance. [Sunday-service source intake](docs/test-data/sermon-source-intake.md) records requested start 1:18:10; actual link/file and permitted-use scope remain pending. No real-audio results or production application code.

## Historical real sermon pilot checkpoint
[Local sermon-audio pilot](docs/20-sermon-audio-pilot.md) used the supplied IFC service at1:18:10–1:23:10. CPU-only base.en processed300s in67.256s; real ordinal ambiguity observed, no accuracy/live-latency pass. [Four real recording clip metadata records](docs/test-data/real-recording-pilot-manifest.json) have expected labels pending independent listening; recordings/transcripts/models remain private and Git-ignored. Original synthetic corpus unchanged. New diagnostic sources are under poc/, no production application code.

## Historical incremental speech timing checkpoint
[Streaming-style replay findings](docs/21-streaming-style-replay-results.md) and [content-free measurements](docs/evidence/replay-stt-metrics.json): eight windows, current fastest tested model-resident CPU configurationmedian4.099s/max5.273s before stabilization/display. These are exploratory per-window timings, not live acceptance. P0 remains PENDING and no production application code. Local test servers stopped; private audio/transcripts stay excluded from GitHub.


Sleep/wake recovery development: [behavior and scoped evidence](docs/36-sleep-wake-recovery.md). System power transitions pause and revoke the session; a fresh connection check and intentional resume are required. Minimized operation is unchanged.


Guarded Auto development: [mode, eligibility and scope](docs/37-guarded-auto-mode.md). The option is enabled through an explicit acknowledgment dialog. Simulation sends zero output requests; actual test output requires complete saved cues explicitly verified for Auto. Quotes still require desktop confirmation. Source integration uses synthetic speech and a fake target; production service acceptance is pending.
