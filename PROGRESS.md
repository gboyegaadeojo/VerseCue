# VerseCue progress

Updated: 2026-11-18 (UTC). Authority: `VerseCue_Master_Development_Prompt_v2_Codex.md`, read in full before work; later authorized change requests recorded in NEW_REQUESTS.md.

## Current stage
WORKING - 0.5.8 native saved-Bible preparation validation. Authorized personal Windows ProPresenter 21.4.2 test succeeded: Nahum 1:7 prepared and saved as a new selectable presentation, output unchanged, Paused/dry-run/disarmed, no verification boxes selected. ProPresenter reports clipped text; fidelity acceptance remains pending. 225 automated tests pass. Overnight 0.5.5 three-hour isolated soak completed 361 cycles with zero output; it does not certify later versions. No church production, paid/cloud services or OS privacy/security changes authorized.

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
Finish 0.5.8 saved-copy cancellation and UI regressions, document the real personal-host proof and restrictions, publish a focused PR and merge after checks. Then investigate clipped text in isolated test assets, package matching Windows/Mac builds, and continue individual acceptance verification. Never mark physical room/stream, real mic/Companion, accuracy/latency or macOS integration tests passed without evidence.

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
