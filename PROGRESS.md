# VerseCue progress

Updated: 2026-11-18 (UTC). Authority: `VerseCue_Master_Development_Prompt_v2_Codex.md`, read in full before work; later authorized change requests recorded in NEW_REQUESTS.md.

## Current stage
DELIVERED - Selected Studio redesign implemented and merged in PR20 at30a23ce. Windows0.6.0 package built and134manifest/source files verified.227module tests and source/packaged UI, offline speech, minimized quote, fake-output, Auto and recovery checks pass. Existing backend/safety behavior retained; no actual microphone or ProPresenter access in this redesign. Matching Mac standard public runner44330987454 is queued; no Mac0.6.0 success/publication claim. P0/live-service and conversational acceptance gaps remain pending.

## Deliverable register
Status vocabulary: not started / drafted / audited. Audited means checked for the current stage, not approval or proof of feasibility.

| Document / artifact | Status | Scheduled stage |
|---|---|---|
| PROGRESS.md | audited | continuous |
| docs/39-development-downloads.md | audited | distribution / Mac execution pending |
| docs/36-sleep-wake-recovery.md | audited | authorized improvement / PR #2 |
| docs/37-guarded-auto-mode.md | audited | authorized improvement / PR #3 |
| docs/38-figma-control-workspace.md | audited | authorized redesign / packaged checks passed |
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
| docs/test-data/sermon-source-intake.md | audited | Supplied link/metadata/sample acquisition recorded |
| docs/20-sermon-audio-pilot.md | audited | Real300s local CPU batch pilot; no accuracy/live-latency pass |
| docs/test-data/real-recording-pilot-manifest.json | audited | Four private clips, expected labels null pending review |
| docs/evidence/sermon-pilot-metrics.json | audited | Content-free measured run metrics |
| docs/21-streaming-style-replay-results.md | audited | Cold replay/warm beam5/beam1, actual limitations |
| docs/evidence/replay-stt-metrics.json | audited | Eight content-free comparison rows |
| docs/22-development-build-and-release-status.md | audited | Implemented development scope, actual tests, all release blockers |
| docs/implementation-coverage.json | audited | All 62 FR + 24 NFR with honest partial/pending status |
| core/, desktop/, ui/ | drafted | Authorized Electron development application; full acceptance PENDING |
| tests/, scripts/ | audited | 108 regression cases, desktop/audio/packaging/private-API checks |
| legal/ and package-lock.json | audited | Pinned dependency inventory, offline speech/runtime notices |
| docs/23-private-api-and-experimental-bible-bridge.md | audited | User-requested private API, native implementation/evidence boundaries |
| native/windows/BibleBridge.cs | drafted | Compiled Windows preparation-only helper; three review receipts observed; full HIL PENDING |
| docs/24-native-bridge-verification-and-validation.md | audited | Three preparation receipts, earlier timeouts, clipping and unintended manual personal-test clear |
| docs/25-gpu-speech-diagnostic.md | audited | CPU fallback diagnosed; CUDA load verified but inference stalled; not enabled |
| docs/26-bounded-audio-capture.md | audited | 0.2.5 bounded capture during inference; overflow/stale/stop-restart tests |
| docs/27-resident-speech-and-target-races.md | audited | Opt-in resident CPU worker, actual two-request fixture test and old-target response protection |
| docs/28-model-size-diagnostic.md | audited | Eight resident requests; faster tiny.en with differing interpretations; no default change |
| docs/29-local-service-profiles.md | audited | Named local snapshots; safe load/revoke;133tests passed; UI validation underway |
| docs/30-manual-verse-navigation.md | audited | KJV reference proposal controls; range/chapter bounds;135tests/source UI passed |
| docs/31-exclusive-audio-session-ownership.md | audited | Main-process one-owner lease;139tests, source/packaged ownership/closure checks passed |
| docs/32-installed-windows-speech-diagnostic.md | audited | Existing Windows en-US WAV-only comparison; four texts/no parser proposals; default unchanged |
| docs/33-development-stability-protocol.md | audited | COMPLETED scoped180minute0.2.8 fixture/dry-run test;360cycles, no failure/output; full service acceptance pending |
| docs/34-renderer-recovery-and-address-validation.md | audited | Source0.2.9 actual reload/close and simulated renderer loss, canonical IP and fake-target races passed |
| NEW_REQUESTS.md | audited | Authorized NR-001 background/minimized operation and NR-002 quoted wording/PR |
| docs/35-background-and-quoted-scripture.md | audited | Implementation/rights/limits/acceptance and152passing tests; minimized source integration passed |

## Decisions made
- User specification is authoritative; documentation first, full staged deliverables retained.
- ProPresenter remains the sole presentation system. No standalone output workaround.
- Confirm is the initial default; Auto requires intentional enablement and proven safeguards.
- No production ProPresenter access or output changes without explicit authorization. Public vendor research may proceed.
- No committed architecture until P0 investigation; implementation requires feasibility and requirements gates.
- Later user instruction explicitly authorizes implementation despite unresolved P0: Electron development build selected; no P0 pass inferred. Prior gate/no-code statements below are historical. Full production-service release still requires actual feasibility/acceptance evidence; unsupported arbitrary lookup/Auto/Clear remain disabled.
- No GitHub initialization/publication until explicit authorization.
- IFC authorized provisional documentation continuation on 2026-11-17; this does not satisfy P0 or implementation gates.
- Research recommendations only: Tauri 2 candidate, local whisper.cpp evaluation, deterministic parser, optional future local faster-whisper. No final architecture/backend/model/build system/cloud choice accepted.

## Open questions
Q-01 through Q-09 asked together and answered in part on 2026-11-17. See PROJECT_ASSUMPTIONS.md response register. Known: ProPresenter 21, Mac mini M4, same-PC first plus LAN future, MOTU M4, six installed translations, existing themes/Looks/macros, Companion, English, free use, latency targets accepted. Remaining: exact build/macOS/RAM, default translation/IDs, routing/theme/macro details and measured behavior. Do not repeat answered questions.

DATA-01/02: user supplied IFC Sunday-service YouTube source. Requested start1:18:10 honored; 300s real audio and four private excerpts prepared. Local base.en batch pilot completed; no independently verified labels, accuracy/accent generalization or live latency acceptance. User supplied source for testing; no separate pastor-consent artifact held. Do not request the source/timestamp or manual clips again.

## P0-blocking unknowns
- Personal Windows installed build/API known (21.4.2); supportable arbitrary Bible lookup/output and native bridge runtime verification remain pending. Church Mac build remains unknown.
- Translation availability/rights and IFC theme/room/stream Look fidelity.
- Authorized hardware-in-loop test environment and test evidence, including concurrent media/operator safety.
- Windows/macOS viability and representative measured turnaround.

## Exact next action
Verify native Mac0.6.0 run44330987454, download/check matching artifact and publish current platform downloads when verified. Windows app for review: dist/VerseCue-0.6.0-win32-x64/VerseCue.exe. Preserve existing P0/field limitations. The selected UI work is complete on Windows; next functional implementation remains docs48-49 passage tracking/range/intent, not part of this visual change.

## Checkpoints and audit
- 0.2.5 publication: reviewed source/tests/redacted evidence committed and pushed to private gboyegaadeojo/VerseCue main at b69280a. No private audio/transcripts/models/binaries staged.0.2.6 continuation adds generation-scoped connector reads/mappings/dispatch and an explicitly selected resident CPU worker with memory WAV requests, random loopback route, owned process cancellation and90second idle stop. Actual12second fixture requests8,015/6,825ms produced transcripts and worker shutdown was verified; no live latency or accuracy pass.129tests/source desktop smoke passed.0.2.6 packaging underway; final source/package integrity and resident packaged test remain next.
- Development continuation: source0.2.4 has119passing tests, KJV numeric validation and candidate preparation with race guards. Packaged0.2.4 desktop smoke and private12second speech fixture passed (9,492ms, no output); ZIP integrity verification follows archive completion. GPU20/90second inference attempts timed out after verified CUDA backend load; keep CPU implementation. Independent latency/accuracy/service acceptance remains pending. Next implementation task: bounded continuous audio capture while one worker is busy, with explicit overflow/staleness reporting and stop/restart race tests.
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


- Real-service pilot checkpoint2026-11-17: user provided VbZV38kZjBg; metadata Sunday Service November15,2026, channelIFC, uploadNov16,duration7961s, public. Requested4690–4990s (not link2821s), verified300s PCM16/16k/mono sample SHA2567e3ed360d9fc3ff4b8e2f727b3501813b71a25c0e4ecd5f1a5f9d135fee0a912. Remote seek stalled/stopped; temporary small full audio/captions staging removed after local trim/extraction; only requestedwindow/private derivedclips remain. Official whisper.cppb5454 CPU ZIP/modelbase.en hashes verified, fourCPUthreads/noGPU/offline batch completed67,256ms (RTF0.22419), no timeout/output requests. Automatic captions are unverified; local4Samuel/forSamuel versus caption1Samuel, chapteronlyIsaiah6 and range1–8 observations captured without gold labels or accuracy claim. Narrow throwaway probe flagged five selected forms, allAuto=false. Four verified private clips15/18/24/12s, manifestREAL-RECORDING/expected=null. No audio/transcripts/model/cloud STT in GitHub; ignored paths verified. P0 PENDING; no production code. Node syntax checks and idempotent caption-window inspection passed. Private cleanup review2026-11-24.


## Active continuation — bounded audio-arrival replay
User requested next step. Run a finite disposable STT-latency/hypothesis-stability probe on private clips1/2/4, not production code. Pinned whisper-stream help exposes capture-device input; --file is text output, so no microphone/loopback routing or permission changes. Use2-second simulated audio arrival, <=12s overlapping windows, latest-available window rather than stale backlog, repeated local CLI cold model loads (explicit limitation), fourCPU/noGPU, no ProPresenter. Spoken-end proxies come from prior machine segments and are NOT independently verified audible ends; any lag is a diagnostic proxy, not NFR acceptance. Retain private transcript/windows only in ignored folders. Send WORKING updates roughly everyminute; end explicitly STOPPED/WAITING with reason and next action.

## Active replay measurements checkpoint
Cold arrival replay completed8windows on3real clips, p50CLI7642ms/p9514008ms (n8),12scheduled windows skipped; no ProPresenter, labels still unverified. Warm persistent-model beam5 comparison completed8same windows, startup900ms, requestp506193ms/p959527ms; loopback server shutdown verified. Initial startup attempt rejected-nc, corrected against actual help/source defaultno_context=true; no audio processed in rejected run. WORKING on one beam1/bestof1 timing/quality comparison, then report exact limitations. Do not treat any replay/proxy metric as p50/p95 audible-end-to-output acceptance; P0 PENDING.

- Bounded replay completion2026-11-17: three realpilotclips/eight12smax windows,2sarrival schedule; coldCLI p507642/p9514008ms,12scheduledwindows skipped. Warmbeam5 model-resident startup900ms,requestp506193/p959527ms; beam1 startup484ms,p504099/p955273ms. Two servers bind127.0.0.1only and verified stopped; no mic/cloud/PPcontrol. Initial-ncflag rejected before inference, corrected using actual help/pinned source defaultno_context=true. Full rawtext/windowsprivate; publicmetricsstrip them. Original narrowhintmatcher missedPsalm forms; postreviewflags added, NO_SELECTED_COMPLETE_HINT/repeatednohint never valid stability. Futureprobe repetition requires qualifyingproposal. Independentlabels/realoutputlatencyunverified. docs/21 and ADR012 record current config not demonstrated suitable, not all-local-STT failure or final architecture. P0 PENDING; bounded step complete, no background work after handoff.

Native build correction: first public Mac run failed with Electron dist missing after npm ci. Add explicit pinned runtime installation and derive packaged test path from package version. Pipeline remains manual-only on standard public runner; no paid/larger runner or billing changes. Citation PR #6 merged; full application/smoothness work continues.

Smoothness checkpoint0.5.3:199tests, source desktop/workspace/guarded-Auto and idle mutation/focus/expiry checks passed. Removed repeated500ms card rewrites; recognition progress added. Native Mac rerun44225363582 in progress. Next: merge focused smoothness PR, then translation and operator-friendly prepared-output setup. No ProPresenter access.

Output workflow checkpoint0.5.4:212tests passed; full named saved-cue browser/AMP mapping/explicit fake-target trigger/readback/Stop passed. Native Mac0.5.2 run44225363582 succeeded (CPU speech, packaging, ad-hoc signature and packaged workspace); artifact downloaded and checksum verification follows. Citation PR #6, Mac fix #7 and smoothness #8 merged. Next focused output PR, final Windows packaging and current-version Mac rerun/public downloads. User deferred actual ProPresenter tests; arbitrary-passage route remains pending, not a completed product claim.

Typography checkpoint0.5.5: user requested better font; IBM Plex Sans400/500/600/700 bundled locally from pinned official IBM source with OFL notice/hashes. Actual font load/no remote requests, full/compact/200% layout and idle/focus checks passed. Dedicated PR follows. Windows0.5.4 package125files verified and Mac0.5.4 native run44227283432 passed; latest font-inclusive packages will supersede these intermediate artifacts. Full arbitrary-passage and service acceptance remain pending; do not stop other authorized implementation at a PR boundary.

Real-host checkpoint: ProPresenter21.4.2 read-only catalog failed before fix (flat library IDs and update_type differ from public examples). Corrected0.5.6 accepts both strict formats; installed one library/three presentations read, disarmed/no mappings/no output. Real John3:16 Confirm trigger changed local preview; immediate readback uncertain, exact text/index matched1s later. Existing theme clipping warnings remain a fidelity defect. Next separate bounded readback correction; do not treat trigger success as full acceptance.

Readback correction in progress: new delayed/persistent-mismatch/Stop-during-readback tests reproduced failures before code change and now pass. Connector polls only GET identity/text up to1.5s after a single accepted trigger, pinned to generation/armed/session guard; no output retry. Real-HIL rerun and version0.5.7 validation follow. Soak0.5.5 remains a version-scoped baseline, not certification of later fixes.

Retry2026-11-18T12:49UTC: approval-service usage failure cleared.217module tests pass; source Auto/power/target-race checks pass after fixing a test-only DOM-ready race. Overnight0.5.5 soak completed10807475ms/361cycles, no failure/interruption, queues/history/events max1/20/100 and zero outputs. Source fixtureSTT p504585/p955179ms; not live latency/accuracy or certification of later builds. Version-correct summary generated; summarizer hardcoded-version correction will be a separate focused validation change. Readback PR still pending publication; unprepared Hosea SaveAs produced stable genuine presentation75631f63-da79-419c-b862-c9b8338081f9 without changing output. Next bounded save-copy workflow investigation/implementation and clipping reconciliation.

Native saved-copy checkpoint: real personal-host UI test passed Nahum1:7/KJV; genuine new copy selected, active output identity unchanged, Paused/dry-run/disarmed, mapping checkboxes unchecked. Existing clipping warning explicitly blocks formatting acceptance. Atomic reference input and accessibility-hit-tested Save As menu resolved two guarded failures. 227 unit tests, source workspace, guarded Auto, renderer recovery and prepared-output checks pass. Version0.5.8 source; focused PR and packaging next. Private report remains excluded.

0.5.8 acceptance checkpoint: PR15 merged945280f. Windows132-file package/source hashes and ZIP verified, SHA256a8fa688a8963ce852f986e2613c9791c86534e983853f239dea0e4ca19e2dcd6. Packaged CLI/resident/private-fixture/workspace/font/simulated-power checks passed. Minimized capture check lost ownership once then passed twice; retain unresolved intermittency and add redacted diagnostics. Isolated new Nahum copy Verse/Reference Text down fitting removed clipping warning; original Bible theme and Looks unchanged, no additional output. Matching public standard Mac run44314557897 queued. See docs/47 for individually scoped evidence/gaps.

NR-006 planning checkpoint: user clarified next verse, not next slide. Inspected parser/session/Auto/connector and locally confirmed verified Hosea1:1 context resolves next verse to1:2. No actual ProPresenter access/output for this request. docs/48 records context identity revalidation, exact destination preparation, range-end semantics, conservative Confirm-first navigation and12 acceptance scenarios. Planning-only PR follows; current application behavior is unchanged.

NR-007 review checkpoint: inspected full conversational path and optional/lifecycle controls;227 module tests passed. Synthetic probes confirmed range-next uses start+1 and negated/historical next-verse speech still creates ordinary suggestions; relative Auto remains blocked. docs/49 records16 prioritized gaps and5 focused implementation slices, with exact source evidence and end-to-end acceptance scenario. No actual ProPresenter/microphone access or application code change. Next implementation priority: verified remote passage context, range parity and navigation-intent rejection, then complete destination preparation.

NR-008 design review: researched Pewbeam, official Linear design notes and Blackmagic Edit page. Built three standalone clickable concepts under design-review/ (Studio/Focus/Command), visually inspected screenshots, increased text/control readability and exercised local sample workflows. No actual audio/network/ProPresenter or production UI changes. User selection is the next design step before implementing the chosen direction. Preserve original design-reference/ files.

Studio0.6.0 final Windows checkpoint:134manifest/source files verified, ZIP316422287bytes SHA256706af3f0f95e68dd6f357541e803312887a5a728db806a939ec50839e530dc0a.227module tests and source workspace/desktop/font/smoothness/output/Auto checks passed; packaged Studio/desktop/offline speech/minimized quote/output/Auto/renderer recovery checks passed. No actual mic/ProPresenter/physical output; all prior P0/conversational acceptance gaps remain. Focused PR follows, then matching standard public Mac dispatch.

2026-11-19 standalone PR22 extraction: read-only Mac feasibility diagnostic isolated on chore/macos-bible-feasibility-probe directly from main. New manual standard-public-runner workflow compiles Swift only. No production Mac adapter, app focus/actions, permission prompt, text-value extraction or output. Native compiler/runtime validation is PENDING until actual job/host evidence. Full platform feasibility stays in PR22.

2026-11-19 standalone PR22 extraction: fix/revoked-cue-dispatch requires the exact current mapping object before dispatch and before/after readback. Revoked/replaced preflight mappings send no trigger; post-dispatch revocation returns uncertain/disarms without retry. Two real connector/synthetic HTTP regressions extracted from the verified integration branch. All229 main-based module tests and syntax checks pass; no actual ProPresenter/output/microphone access. Full workflow acceptance remains with PR22.


2026-11-19 standalone PR22 extraction: native process-boundary reliability fix is isolated on fix/native-preparation-boundary directly from main.232 module tests and syntax pass; docs/68-native-preparation-boundary.md records exact scope. No native UI/profile/action/deadline change or actual ProPresenter/microphone/output test. Remaining full reference-driven implementation and service/platform acceptance stay tracked by PR22.


Mac diagnostic compilation passed on standard public macOS15 arm64 run44576539821 for unchanged Swift source f8afd75. No ProPresenter/AX runtime invocation or privacy permission changes. PR23 native boundary is now merged into main and included here only to resolve shared PROGRESS history; this diagnostic PR still adds no production native route.

Mapping fix standard Mac44577616214 passed at05d48fc (229tests and development package/workspace). PR23 main update is included here with only PROGRESS conflict resolution; combined local regression result will be recorded before merge.

Combined main plus mapping-fix regression passed234/234 module tests after preserving both progress entries. The production mapping fix is unchanged from05d48fc, whose standard Mac build/workspace passed; included native-boundary source is unchanged from merged PR23. No new actual ProPresenter/output/physical acceptance claim.

2026-11-19 PR22 foundation extraction: exact saved-passage planning/lookup plus required parser/navigation/reference-epoch semantics isolated on feat/exact-saved-passage-lookup. Initial251/252 result identified the ordinary-preaching Session dependency; regression retained and required semantics extracted without Auto approval/UI/native orchestration. After PR23/25 current main integration all269 module tests and syntax pass. docs/70-exact-passage-lookup-and-intent.md records metadata-only guarantees and remaining output/field scope. Matching standard Mac job pending dispatch; no actual ProPresenter/microphone access in these tests.

2026-11-19 small dependent native-copy backend: feat/managed-native-copy-backend is based on the PR26 exact-passage foundation. Readiness/input-retention interfaces, current-output text+identity and playlist transaction checks,100/app attempts, injectable durable500-slot ledger/warnings/reconciliation backend extracted coherently.294 module tests and syntax pass, synthetic only. docs/71-managed-native-copy-backend.md records interfaces and remaining desktop initialization/startup inspection/consent/reconciliation/coordinator wiring; no Windows helper replacement or Mac/native/output/field completion claim. Next: open the small dependent PR and verify matching CI after its foundation is ready, then extract normal coordinator/Confirm wiring.

2026-11-19 coordinator/Confirm backend extraction: feat/passage-coordinator-confirm depends on native-copy backend02164f6. Exact prepare/review/Confirm, ordered parts, shared operation owner, remote context/takeover, bounded native PNG review and explicit clipping rebuild contracts extracted with Session/Connector safeguards. Eight new normal-Auto approval/appearance tests remain intact in full integration branch for their separate component; no approveAuto method/dispatch exception introduced here. Complete341 module tests and syntax pass. Initial script stopped at CRLF boundary before tests copied (294 baseline not counted); complete tests found missing unknown-edition interpretation reason, fixed while retaining test. docs/72 records exact scope and pending desktop/private-API/speech/Auto/native initialization/field wiring. Next: open the small dependent backend PR and verify platform before wiring normal UI. No actual ProPresenter/mic/output test in this extraction.


Updated-head diagnostic compile44577868254 passed atb7f4301; Swift remains unchanged while PR25 main source/progress history is incorporated. Compile-only evidence does not verify any actual Mac ProPresenter accessibility behavior.


PR26 matching standard Mac44579298744 passed at2b68410:269 module tests, syntax, CPU speech packaging and packaged workspace. Current main synchronization adds only already-compiled Mac diagnostic/workflow and combined progress history; application foundation source is unchanged. No normal coordinator/UI/native/output/field acceptance claim.


PR27 foundation dependency merged as PR26 at693449e; retargeted this PR to main and incorporated current main with only shared progress-history conflict. Backend application/test source remains unchanged from294-test02164f6; current main adds the completed Mac diagnostic and verification history. Matching standard Mac will run on the synchronized head.


Coordinator component synchronized to backend0d7f0f4 after PR26/main completion. Only shared PROGRESS history conflicted;341-test coordinator application/test source is unchanged. Backend matching standard Mac44582547322 is running/pending observation; coordinator gets a separate matching check after this merge. No actual ProPresenter/mic/output action.

2026-11-19 speech evidence/assembly component: feat/speech-age-and-citation-evidence based on main05ee70f. Validated original capture/recognition age, bounded adjacent citation assembly and Session source-age expiry extracted without UI/provider wiring. Initial360 tests passed. Three new timing regressions first failed: relative context read renewed TTL, expired-during-check speech revived, backwards clock accepted. Elapsed check time now reduces spoken lifetime; expired speech drops; invalid timing pauses/disarms; manual review stays deliberate.363 full module tests pass and15 affected evidence/live-context tests pass after moving start ahead of relative parsing; syntax passed. docs/73 records conservative proxy/caller Confirm-only contract and deferred producer/desktop/native/Auto/field work. This timing correction is new compared with full integration branch6ea6098 and must be preserved/backported during the next main synchronization, with its three tests. Next: open small PR, verify exact platform build before merge, then continue capture/desktop wiring. No actual mic/ProPresenter/output.

2026-11-19 superseded preflight correction: fix/preserve-newer-passage-intent based on main72ee013. Two new regression groups first failed: pending Confirm/Continue paused/erased newer reference and disarmed a fresh target mapping. Coordinator now retires only its superseded read-only-stage token before output-authorizing Session transitions; preserves newer reference/mode/target and releases owner. Stop/recovery, genuine unchanged-session failure and post-boundary/accepted-trigger uncertainty retain existing pause/disarm/no-retry rules.367 full module tests/syntax pass;39 coordinator cases pass after stronger fixture prepares a valid synthetic new-target mapping. docs/74 records precise boundary and later dispatch conservatism. No new output permission/actual ProPresenter/mic/physical action. Next: open this small PR, run exact matching standard Mac, then backport the NEW helper/stage guards and4 tests to full integration (414 expected), preserving its deferred Auto approval methods. Continue workspace/capture/API/native/Auto integration after this correction.

## Capture timing and continuity extraction - 2026-11-19

Extracted the worklet/audio-buffer/renderer timing producer with capture identity, ordered frames, queue/delivery age and explicit gaps/clipping/input-loss handling. Added actual-processor synthetic checks at44.1/48kHz. All376 combined module tests and JavaScript syntax checks passed on Windows. No OS microphone, ProPresenter or output used. Mac verification and normal desktop recognition consumer wiring remain pending; see docs/76-capture-timing-continuity.md.

## Detected-reference scheduler extraction - 2026-11-19

Added the preparation-only scheduler and17 tests as a small PR22 dependency. Explicit native session/window/target consent, latest-reference scheduling, bounded owner waiting and uncertainty inspection remain fail-closed. A newly failing regression exposed stale reference intent after owner waiting; drain now rejects changed referenceEpoch without another detection callback. All384 module tests passed; syntax checks passed. Details and pending desktop/native/platform/field evidence: docs/75-detected-reference-preparation.md. No actual ProPresenter or microphone access and no output.

## Normal reviewed Auto backend extraction - 2026-11-19

Extracted current-review, owner-bound single-cue KJV Auto approval with Look/PNG rechecks, guarded original-age speech use and separately acknowledged session bare-citation policy. Approval sends nothing; original intent/cancellation/uncertainty and private-API restrictions remain. All401 combined module tests and syntax checks passed on Windows. Hosted Mac verification and desktop controls/lifecycle wiring remain pending; see docs/77-normal-reviewed-auto-backend.md. No actual microphone/ProPresenter/output used and no arbitrary native Auto claim.

## Private API passage-review extraction - 2026-11-19

Added capability-gated saved-passage review through a supplied coordinator hook and checked reference submission with API-session revocation. No remote focus/copy consent or passage confirmation accepted. All389 module tests and syntax pass;17 API tests include in-flight relative-context revocation with no candidate/output. Mac verification and desktop hook wiring remain pending. See docs/78-private-api-passage-review.md.

## Normal reference-driven workspace integration - 2026-11-19

Connected the normal desktop/IPC/settings workflow to the completed coordinator, scheduler, ledger, speech/citation evidence, Auto approval and private-API hooks. No per-passage Library/Presentation/Cue selection is needed in the normal path; advanced mappings remain fallback. Assembled source415 module tests/syntax and20 synthetic desktop scenarios passed, including normal Confirm/parts/keyboard/takeover, native consent/recovery, previews, ledger/restart and guarded Auto. No actual ProPresenter or OS microphone accessed. Matching packages/Mac and original physical/platform/service acceptance remain pending; see docs/79-normal-reference-passage-workspace.md.

## Private API passage-review extraction - 2026-11-19

Added capability-gated saved-passage review through a supplied coordinator hook and checked reference submission with API-session revocation. No remote focus/copy consent or passage confirmation accepted. All389 module tests and syntax pass;17 API tests include in-flight relative-context revocation with no candidate/output. Mac verification and desktop hook wiring remain pending. See docs/78-private-api-passage-review.md.

## Normal reviewed Auto backend extraction - 2026-11-19

Extracted current-review, owner-bound single-cue KJV Auto approval with Look/PNG rechecks, guarded original-age speech use and separately acknowledged session bare-citation policy. Approval sends nothing; original intent/cancellation/uncertainty and private-API restrictions remain. All401 combined module tests and syntax checks passed on Windows. Hosted Mac verification and desktop controls/lifecycle wiring remain pending; see docs/77-normal-reviewed-auto-backend.md. No actual microphone/ProPresenter/output used and no arbitrary native Auto claim.

PR35 verification update: exact105868f7 standard Mac44596961095 passed415 module tests/syntax, all source desktop scenarios, CPU speech packaging and packaged workspace. Its Windows146-file source-matching review build passed all20 packaged synthetic desktop scenarios. No actual ProPresenter or OS microphone/physical-output acceptance claimed.

## PR35 final Mac readiness race - 2026-11-19

Final headf2f3575 Mac44598351212 failed during normal-Auto compact owner handoff: the test readiness predicate dereferenced a missing message element.415 module tests passed, but this run did not reach packaging. Earlier105868f7 Mac success remains scoped to that run. Added null-tolerant readiness predicates without dropping any assertions. Delayed-load Windows experiments did not reproduce the timing; temporary instrumentation was removed. Corrected source and exact105868f7 packaged normal-Auto scenarios passed on Windows, including owner-close revocation/no legacy bypass. Product source is unchanged. New exact Mac verification pending. Failure retained in docs/evidence/normal-workspace-mac-readiness-failure-2026-11-19.json.

## Detected preparation cancellation ownership fix - 2026-11-19

A new regression failed against main: disabling/replacing queued detected work while waiting canceled a separately owned manual review. Track actual preparation invocation separately from running/waiting; cancel only scheduler-owned work. Preserve central Stop/target/session cancellation. All416 module tests/syntax pass; Mac verification pending. No real microphone/ProPresenter/output. Existing105868f7 soak predates this fix. Details: docs/80-detected-preparation-cancellation-ownership.md.

## PR36 dependency before normal-workspace merge - 2026-11-19

Corrected PR35 head5346e08 passed exact Mac44627121424 including415 module tests, source desktop scenarios, CPU speech packaging and packaged workspace. A subsequent independent regression exposed scheduler cancellation of separately owned manual work while merely waiting. Incorporated PR36 head590ab3d as an explicit dependency before merging the workspace. This changes production source; previous105868f7 builds/soak do not validate the fix. Combined tests/package/Mac checks must be repeated for the new source.

## Precompiled read-only Mac feasibility diagnostic - 2026-11-19

Package the existing unchanged Swift accessibility inventory as a short-lived architecture-named tar.gz artifact in the standard public Mac compile workflow. Includes source revision, per-file/archive SHA256 and preserved executable mode; no compiler installation is needed on the personal Mac. Workflow never executes the probe or ProPresenter and never requests permissions. README explains exact authorized invocation, expiration, unsigned/not-notarized status and stopping at existing OS/privacy blocks. Compile/archive/artifact verification pending; no runtime/control/field feasibility claim. No production application code or output behavior changes.

## Bounded native-preparation test harness

Added an opt-in, preparation-only personal-host harness for one fixed short KJV reference in a verified Windows review package. It reserves a private attempt record, rejects an existing passage/record and requires independent disabled-screen checks and Computer Use activation. It never sends output, acquires a microphone or changes formatting/Looks/playlists. JavaScript syntax checked; no hardware/latency/appearance pass claimed. Personal-host result files remain ignored/private and are excluded from this code-only PR.

## Windows native helper source/build parity

Promote the existing integration helper source and make Windows packaging compile the current C# checkout, fail on missing/failed compilation, verify source/helper hashes and bundle a build receipt. Review builds stage source instead of importing an existing helper binary. Compiler invocation and420 module tests pass; syntax/package verification follows. New receipt tests reject stale source, replaced binary and malformed/foreign metadata without raw-value leakage. No actual ProPresenter-host result or hardware/latency/appearance pass is included in this code-only change. Details: docs/82-native-helper-build-parity.md.

## Exact Save As popup lookup candidate

Added a bounded, exact same-process main-window/child-popup/menu/three-command profile. Unmatched topology retains the existing broad search, ambiguity/focus/reference/edition/Invoke guards and12s deadline. Added content-free branch stage names and a distinct opt-in harness case that requires the profile stage; no automatic retry of the baseline case. Windows compiler,420 module tests and syntax passed. Candidate package/CI/native validation pending; no actual personal-host outcome is published. See docs/83-exact-save-popup-candidate.md.

## Popup candidate build verification

Head38c2925 passed420 module tests/syntax, a fresh147-file Windows package with source/helper receipt verification, and standard Mac44635751140. Personal native results are retained privately and excluded from this PR. The harness reporting label now says ownerWindowMinimizeRequested to reflect the measurement instead of implying continuous minimization; product code is unchanged by that label correction. Focused packaged regression checks follow.

## Synthetic takeover-test race correction

Final Mac44637601238 failed while its test tried to click Continue after external takeover. A controlled synthetic reproduction allowing the background guard to pause and hide Continue reproduced the old locator timeout. A backend-only wait did not reproduce it; that distinction is retained. The test now explicitly waits for PASSAGE_OWNERSHIP_LOST, requires Continue hidden, rejects the old continuation token and still asserts exactly4 fake triggers/paused/Stop/no page errors. Windows source and exact candidate package passed the corrected scenario. Product code did not change. New final Mac check pending; failure retained in docs/evidence/popup-ci-takeover-race-2026-11-19.json. No actual personal-host result is published.

## Prepared review expiry UI correction

Expose the existing backend review deadline and disable expired review actions with an explicit prepare-again instruction. Preserve Confirm rejection in the operator message. 420 module tests/syntax and the strengthened synthetic source desktop scenario pass, including zero triggers during renderer-clock expiry. No real host outcome or hardware pass published. Next: exact review package and standard Mac checks before merge.

## Prepared-passage inspector consistency

The inspector now retains the prepared reference and phase after the shorter suggestion TTL, respects Stop/recovery, and distinguishes expired review. Corrected the obsolete no-preview statement.420 module tests/syntax and source synthetic workflow pass; strengthening the expiry inspector assertion and proving the old-package regression are in progress. No actual-host outcomes are published. Next: finish before/after verification, open a small PR, then exact package/Mac checks.

## Native preparation profile investigation

Add allowlisted content-free timing boundaries around existing process/window/control/edition/clipping discovery without adding queries or changing actions/deadlines.420 module tests and syntax pass; compiler result is checked before packaging. This is instrumentation, not a speedup or hardware pass. Next: isolated build and bounded private preparation-only measurement, then select an evidence-based optimization.

Native failure-diagnostic follow-up: retain only known bounded stage metadata on failed helper errors and publish sanitized metadata in local coordinator state; distinguish replaced accessibility controls without exception text or retry.422 tests/syntax pass, Windows helper compiles. New private measurement records are excluded from publication. Next: isolated current-source diagnostic build and one fresh bounded inspected case, then act on the observed failing stage.
