# VERSECUE — MASTER PROJECT DISCOVERY AND REQUIREMENTS PROMPT

> Copy this entire prompt into your AI development agent (OpenAI Codex in Visual Studio Code recommended, started in an empty project folder so it can write files). The agent must follow the **EXECUTION PROTOCOL** below, which splits the work into stages so that the full depth of this prompt can be delivered without anything being shortened. **Deliver documentation first. Do not generate production application code until the integration feasibility gate is passed and requirements are approved.**

## EXECUTION PROTOCOL (READ FIRST — THIS GOVERNS HOW YOU WORK)

This prompt is deliberately large. **Full requirements depth is mandatory. No section, document, requirement category or test set may be shortened, merged, or replaced by a summary.** To make that achievable, you work in **stages**, and every deliverable is written to disk as a file, never only displayed in chat.

**Rules**

1. **Workspace and progress file.** Write all deliverables into the project workspace. Create and maintain `PROGRESS.md` at the repository root containing: current stage, list of documents with status (not started / drafted / audited), decisions made, open questions, P0-blocking unknowns, and the exact next action. At the start of every stage, and after any context reset or interruption, re-read `PROGRESS.md` and the sections of this prompt relevant to the stage before continuing.
2. **One document per step.** Write one document completely, check it against this prompt, mark it in `PROGRESS.md`, then move on. If a document is too long for one write, write it in sequential parts of the same file; never trim to fit.
3. **Output-budget discipline.** If you sense you are running out of output room, stop at a clean section boundary, record the exact resume point in `PROGRESS.md`, say so, and wait. Never compress content to finish faster.
4. **Stage gates.** Stages are defined in Section 15. Stop at the points marked **STOP** and wait for my reply. Between those points, continue without asking permission, unless a genuine blocker appears.
5. **Throwaway diagnostic probes are the only code allowed in this phase.** Small scripts under `/poc/` are permitted solely to test feasibility: calling the ProPresenter API, measuring audio levels, measuring STT latency, and spot-checking the parser on a few clips. Each probe must start with a header comment `THROWAWAY DIAGNOSTIC — NOT PRODUCTION CODE`, ship with a `README` giving run instructions, contain no secrets, and be read-only or non-destructive by default. Do not scaffold the real application, choose a build system for it, or write any production module. Never send anything to a live ProPresenter output on the production host without my explicit authorization; prefer a test library/presentation and a non-live window.
6. **Real audio inputs come from me.** For accuracy and accent evidence, ask me for 3 to 5 short recorded sermon excerpts containing Scripture references (with the pastor's consent). Synthetic text-to-speech samples may be used for smoke testing only, must be labelled **SYNTHETIC**, and must never be counted as accent or accuracy evidence.
7. **Capability limits are stated, not hidden.** If you cannot browse, cannot reach live ProPresenter, or cannot run a test, label the item **REQUIRES VERIFICATION** or **PENDING**, write the exact procedure for me to run, and continue with everything else you can do.

---

## YOUR ROLE AND OPERATING DIRECTIVE

Act as a combined senior product manager, church-production workflow specialist, Windows/macOS desktop architect, ProPresenter integration engineer, speech-recognition engineer, security architect, QA lead, and technical writer.

You are preparing a real project for Immanuel Fellowship Church (IFC), Winnipeg, Manitoba, Canada. Research current sources and treat the actual installed ProPresenter version and tested API behavior as authoritative. Distinguish **verified fact**, **testable hypothesis**, and **unverified assumption**. Never fabricate API endpoints, capabilities, integration demonstrations, pricing, licenses, performance numbers, or measurements.

Your immediate deliverable is an exceptionally thorough but implementable requirements package, design, feasibility study, and development execution plan. **Do not write application code in this phase.** The only code permitted is pseudocode and the clearly labelled throwaway diagnostic probes in `/poc/` defined in the EXECUTION PROTOCOL. Do not silently substitute a new presentation engine for ProPresenter.

## 1 — PRODUCT VISION

Working name: **VerseCue** (provide 5 alternative names and recommend one; name is provisional).

IFC already uses ProPresenter to show song lyrics and Bible passages to both the physical congregation and the online/livestream audience. Today volunteers manually search for references while a pastor preaches, causing uncomfortable delays. Create a **small native-feeling, installable desktop companion application for Windows and macOS** that listens to an authorized live audio feed carrying the pastor's voice, identifies spoken Scripture references, prepares the correct passage, and either:

1. **Confirm mode (default/safest):** presents a large, clear candidate verse card with a one-click or keyboard shortcut to send it live in ProPresenter; or
2. **Auto mode (optional):** sends a validated, high-confidence reference to ProPresenter without a click, subject to safety constraints.

Also provide **Paused / Suggest-only** and an immediately accessible **emergency stop** that blocks all automatic sends.

**Non-negotiable product boundary:** ProPresenter must remain the single source of truth for presentation, Bible text wherever possible, Scripture formatting/themes, screen routing, audience looks, and actual output. VerseCue is an input/intelligence/remote-control companion, **not** a presentation application, second screen output, lyrics manager, sermon editor, or cloud SaaS. Do not output video, slides, NDI, lower thirds, or browser overlays directly to the congregation.

The app may run on the same machine as ProPresenter or on another production computer connected over the same trusted local network. It must work during worship services without interrupting existing lyrics, playback, ProPresenter operator actions, livestream switching, or the volunteer's workflow.

## 2 — SOURCE MATERIAL AND INVESTIGATION RULES

Use these initial sources, verify URLs/content and dates before citing:
- Official ProPresenter API: https://openapi.propresenter.com/
- Official ProPresenter network/API help: https://support.renewedvision.com/hc/en-us/articles/31606866768147-TCP-IP-Connections-with-ProPresenter-API
- Official Bible workflow: https://support.renewedvision.com/hc/en-us/articles/360041347594-Using-Bibles-in-ProPresenter
- Official Themes: https://support.renewedvision.com/hc/en-us/articles/11910559859603-Themes-in-ProPresenter
- Official Bible installation/licensing: https://support.renewedvision.com/hc/en-us/articles/360041814913-Installing-Bibles-in-ProPresenter
- Product inspiration, not a design specification: https://www.smartverses.app/ and https://www.smartverses.app/features

Research the latest publicly documented ProPresenter 7 APIs and the API exposed by the locally installed application. The presence of a general presentation-trigger API **does not prove** the existence of a Bible-reference lookup/selection API. Specifically test whether arbitrary book/chapter/verse/translation can be loaded, presented, and styled through documented APIs.

SmartVerses is the product inspiration for voice detection and operator approval, but unlike SmartVerses, VerseCue must not offer a competing full presentation suite. Review the public feature set to identify worthwhile interaction patterns; do not copy proprietary software or claim knowledge of its internal implementation.

For each external claim (API, version, speech platform, privacy, license, cost), cite vendor source, URL, access date, and evidence status. Use dated pricing assumptions with formulas rather than invented figures. If live research/browser access is not available, explicitly label items **REQUIRES VERIFICATION**, provide the exact research procedure, and avoid definitive conclusions.

## 3 — DECISIONS AND ASSUMPTIONS

Initially assume unless IFC answers otherwise:
- One pastor/microphone audio feed, preferably a dedicated clean aux/matrix feed from the audio mixer into a supported interface/loopback.
- One authorized ProPresenter instance per service, running on the same host or reachable over LAN.
- English language initially; scripture references may have Nigerian, Canadian, or other accents.
- Default Bible translation should be the translation installed and selected by IFC in ProPresenter, not an externally retyped or downloaded version.
- Confirm mode is the initial production default; Auto mode requires explicit enablement and additional safeguards.
- A volunteer must be able to continue manually using ProPresenter at all times.
- Audio is never persistently recorded by default; transient processing is permissible; cloud STT is opt-in.
- A 90-minute sermon/service session is the minimum continuous-use test.
- Cross-platform installability is essential; shared codebase preferred, but assess where OS-specific code is unavoidable.

Ask up to 10 *high-value* questions together, only if needed to distinguish architecture or acceptance criteria. Suggested questions: exact ProPresenter build and OS; in-person/livestream Bible looks; audio desk/interface and clean mic routing; default/alternate translations; whether ProPresenter may be on a separate computer; offline vs cloud privacy and cost preference; maximum permissible delay; desired automation safety; church computer CPU/RAM/GPU; frequency of simultaneous languages/speakers. **Do not stall if unanswered**: proceed using recorded assumptions and open questions.

## 4 — MANDATORY PROPRESENTER INTEGRATION FEASIBILITY GATE (P0)

**Do this before recommending a committed solution architecture.** Produce a detailed feasibility report answering:

A. Does the current official HTTP/REST API directly support searching/selecting a Bible passage by normalized Scripture reference, installed translation, and current Bible theme? If yes, cite the exact method/path/request/response, version, and a real working reproduction. If no endpoint is documented, state **NOT VERIFIED / NOT DOCUMENTED**, not 'unsupported' unless verified.

B. If no direct API is available, research and experimentally compare these alternatives:
1. Supported API-controlled presentation created by ProPresenter's own Bible interface or a pre-built, updating Scripture presentation, using IFC's existing Bible theme.
2. Supported ProPresenter macros/actions/trigger workflows combined with a documented API.
3. Controlled desktop UI automation **only as an explicit last-resort fallback** on both Windows and macOS; assess application focus, display scaling, permission prompts, localization, latency, and brittleness. Never assume OS-level automation is 'native API integration'.
4. Any supported import/presentation-creation pathway, subject to translation rights and preservation of IFC's Bible formatting.
5. Other documented, supportable mechanisms, if discovered.

C. For each alternative, test: arbitrary reference, range, verse following, previous verse, translation switch, theme fidelity, separate room/livestream Looks, same-PC vs LAN, ability to identify completion/acknowledgment, failure recovery, interference with a volunteer's active UI, Mac/Windows parity, performance, software updates, maintenance burden, and church licensing.

D. Examine API enablement, network settings, port configuration, authentication/security, version endpoint/health probe, discovery, response error behavior, reconnect, and supported transport (HTTP vs optional TCP). Treat documented example endpoints as version-dependent and verify against installation.

E. Produce a scored decision matrix (functional fit 30%, reliability 25%, safety 20%, cross-platform support 10%, maintenance 10%, operational cost 5%). Explicitly identify which paths preserve the *real* ProPresenter Bible text and IFC Bible themes.

F. Define a short **hardware-in-the-loop proof-of-concept acceptance test**: on IFC's ProPresenter instance, send John 3:16 and Romans 8:28 from a test client; confirm reference, exact text, selected translation, correct Bible template, audience and stream Looks, and no interruption of running media; test both confirm and auto paths, failure and reconnect. A proposed path is **not P0-feasible** until these tests pass. If no supportable route works, flag the architecture blocker and present honest alternatives; **do not begin building a standalone presentation workaround**.

## 5 — SYSTEM FLOW AND BOUNDARIES

Model the primary flow:
**Audio source -> audio capture and input health -> streaming/local STT -> transcript stabilizer -> reference candidate detector -> canonical Bible reference parser -> validation and contextual disambiguation -> confidence/safety policy -> volunteer suggestion or auto-send -> ProPresenter connector -> acknowledgment/readback where available -> existing ProPresenter Bible slides and routed outputs.**

Define timestamped states, asynchronous boundaries, queue behavior, timeout/backpressure strategy, and recovery when speech changes mid-utterance or network/ProPresenter goes offline. Do not show a passage based solely on an unstable partial transcript. Keep the operator in control of whether/when the actual presentation changes.

Define data contracts such as:
- Audio input metadata: device ID, sample format, level, source health, timestamps.
- Transcription event: text, partial/final status, start/end times, STT confidence if available, provider, recognition language.
- Scripture candidate: raw phrase, normalized book/chapter/start verse/end verse, translation request, relation to prior passage, evidence, parse confidence, ambiguity flags.
- Display command: idempotency key, source candidate, manual/auto origin, expected verse/translation, queued/sent/acknowledged/failed states.
- Error/event record: safe sanitized fields, category, severity, no secret/audio content by default.

Explain what 'confidence' actually means (calibrated probability versus heuristic score), how it is measured, and why a threshold is not a guarantee of correctness.

## 6 — FUNCTIONAL REQUIREMENTS (EXPAND EACH INTO NUMBERED FRs)

Write **FR-001 onward** in a traceability table with ID, capability, detailed requirement, rationale, MoSCoW priority, dependency, measurable Given/When/Then acceptance criteria, and planned release. Include at minimum:

### Audio
- User-selectable physical/virtual audio interface, device hot-plugging, permission requests, sample-rate/channel conversion, mono pastor-mic routing, live meter, clipping/no-signal detection, low-latency buffering, mic/input test, mute and pause.
- Do not assume system audio loopback is equally available on Windows/macOS; document OS-specific requirements.
- Clear indicators for listening/not listening, dropped audio, no signal, and insufficient signal quality.

### Recognition and parsing
- Continuous streaming transcription with readable rolling preview; partial versus confirmed recognition visually distinguished.
- Bible book synonym dictionary (e.g., 1/I/First John, Psalm/Psalms, Song of Songs/Song of Solomon, Revelation/Revelations), spoken ordinals, chapter/verse aliases, ranges, cross-chapter references, ambiguous numeric references, accents, self-corrections, and STT confusions.
- Correctly understand 'John three sixteen', 'turn to Romans chapter eight verse twenty-eight', 'first Corinthians thirteen four through seven', 'verse seventeen', 'the next verse', 'go back to verse three'.
- Maintain passage context only when safe. Reset context on explicit book changes, service reset, manual passage changes, or timeout.
- Reject non-commands/ambiguous phrases ('John said this', 'chapter three is important') and scripture *discussion* when no sufficient reference is spoken.
- Candidate confirmation after a stable utterance, optional correction, translation override, default passage range limits, chapter/verse validation, duplicates and cooldown, per-candidate TTL.
- Future only: verse quote/paraphrase matching without explicit reference, separately opt-in and never auto-triggered without strong validation.

### Live-operation UI
- Connection badge (connected/degraded/offline), audio-health indicator, listening/pause state, mode selection, large latest candidate, reference plus translation, source phrase, confidence/ambiguity indicator, huge Show button, Reject/Dismiss, Edit, manual reference field, and clear display control.
- Auto / Confirm / Suggest-only(Paused) with mode visible at all times, default Confirm, emergency stop, separate 'resume auto' intentional action.
- Keyboard shortcuts only while the app is appropriately focused unless the user explicitly enables system-wide hotkeys; avoid colliding with ProPresenter, Bitfocus Companion or existing volunteer workflows.
- Queue ordered by detection time, expire outdated suggestions, prevent stale auto-sends after new references, skip/retry safely, recent N items and resend.
- Manual reference search must function when STT is unavailable, provided the ProPresenter integration remains operational.
- Next/previous verse, reference/range adjustment, immediate one-click correction, translation selection where supported.
- Main UI and optional always-on-top compact window. No direct audience graphics.

### ProPresenter remote control
- Configured host/IP/port, test connection, version check, selected instance, optional trusted network discovery, allowlist, setup diagnosis, failure messages, retry, connection state, and no silent fallback to unsupported mechanisms.
- Respects theme and Looks, stage/current live state, Bible availability, installed translation, output routing. Protect concurrent operation with the volunteer: detect/avoid overriding unrelated lyrics or slides when reasonable.
- Command send receipt, feedback/readback where API permits, duplicate-safe retry (never blindly send an uncertain command twice).
- Dry-run mode that generates detections and simulated ProPresenter commands **without touching actual outputs**. Test target mode must be unmistakable.
- Do not assume that 'clear' should clear all ProPresenter layers: determine the safest authorized Bible/slide clear behavior and its effects before implementing.

### Administration
- First-run onboarding (audio input, ProPresenter connection, translation/theme expectations, test connection, speaker test, chosen mode), settings profiles, recovery settings, OS credential-vault-backed API keys, local diagnostics, exportable redacted logs, optional service profile, reset-to-safe configuration.
- Basic independent provider/connector interfaces, import/export of **nonsecret** settings, explicit opt-in for diagnostic upload if ever added.

## 7 — NON-FUNCTIONAL REQUIREMENTS (MEASURE THEM)

Write **NFR-001 onward**, with method, target, threshold, and test evidence. Include:

- Latency measured from **end of audible spoken reference** to ProPresenter output confirmed by screen capture, broken into audio capture, STT, parse, decision and connector/display segments. Start with a proposed Auto target p50 <= 2.0 s and p95 <= 4.0 s under a defined reference hardware/network profile; treat these as **hypotheses requiring measured prototype evidence**, not vendor guarantees. Confirm-mode delay should exclude volunteer reaction from the system-only metric.
- Detection quality: separately measure exact book/chapter/verse/translation accuracy, precision, recall, false positives per sermon hour, and safe auto-trigger precision. Initial acceptance candidates: >= 95% reference precision on representative held-out recordings, >= 90% recall for explicit references, zero unapproved wrong-verse displays in a 10-hour rehearsal set; tune by actual trials and consider whether sample sizes support conclusions.
- Safety: false positives and stale commands must fail closed into Confirm/Paused; ambiguous or low-confidence references never auto-show; if exact translation availability or Bible lookup cannot be verified, defer rather than guessing.
- Minimum 90-minute stability; test 3-hour soak, memory/CPU budget measured separately on typical shared ProPresenter PC and dedicated companion PC; avoid CPU/GPU settings that could compromise livestream.
- Offline behavior, reconnection, STT-provider timeouts, packet loss, interface unplug/replug, power sleep/wake, ProPresenter close/restart, duplicate detection and corrupt settings.
- Privacy: no persistent audio storage by default, no transcript persistence by default unless explicitly enabled, retention windows, cloud data disclosure and consent, no tokens in logs, TLS for remote STT, local API network risk and segmentation, signed updates.
- Windows 10/11 and supported macOS versions, x64/Apple Silicon; distinguish OS support promises from actual test matrix; clarify current vendor/runtime support before committing. Packaging, Windows signing, macOS signing/notarization, permissions, updates with rollback, uninstall cleanliness.
- Accessibility: visible and operable at booth distance, keyboard navigation, screen readers, adequate contrast, non-color-only statuses, large click targets, <= 5-minute volunteer orientation after setup.
- Maintainability and availability: modular interfaces, structured local diagnostics, crash recovery, local configuration backups, reproducible builds, automated tests, dependency scanning and incident runbooks.
- Legal: copyright/licensing for each Bible translation, do not redistribute paid verse text without permission; third-party speech model terms, fonts, binaries and service terms.
- Security: least privilege; avoid unauthenticated public-facing listener; secure secret storage; no hardcoded API credentials; optional cloud provider keys must not leak into builds.

## 8 — SPEECH RECOGNITION, PARSING, AND DESKTOP TECH CHOICES

Build **evidence-based comparison tables** before choosing a stack:

**STT:** local whisper.cpp and faster-whisper, Deepgram, Microsoft Azure AI Speech, Google Cloud Speech-to-Text, AssemblyAI and operating system speech APIs. Evaluate real-time/partial latency, actual availability of streaming, English accent performance on test recordings, dependency footprint, Windows/macOS packaging, offline, hardware acceleration, memory, privacy, service dependency, availability, and per-90-minute sermon cost with current date-stamped pricing. Recommend one MVP primary and one future optional fallback, and explain how the interface abstracts either.

**Parser:** rule/grammar-based matching, LLM-only extraction, hybrid approach. Prefer deterministic canonical normalization and validation for MVP unless a benchmark proves otherwise. LLMs may be suggested for ambiguous candidates in a later phase, but must not hallucinate Bible references or bypass auto-display safety checks.

**Desktop:** Tauri, Electron, .NET MAUI/Avalonia or suitable cross-platform desktop options, including Rust/native modules, microphone APIs, child ML process packaging, codesigning, permission prompts, installer/update channels, app size, developer maintenance, UI accessibility, and mixed Apple/Intel CPU concerns. Recommend a primary architecture **contingent on P0 feasibility**. Do not call Tauri/Electron a native OS widget framework if using webview-based UI; distinguish installable desktop app from native UI toolkit.

**Bible content:** Prefer passage content from licensed Bibles already installed in ProPresenter. Never bundle copyrighted translations by default. If fallback workflow requires external Bible text, research authoritative legal permissions and reject any design lacking required rights.

## 9 — DESIGN AND VOLUNTEER EXPERIENCE

Provide state diagrams, information architecture, error recovery, and ASCII wireframes for **Full window**, **Compact window**, **First-run Setup**, and **Connection/Audio troubleshooting**. Illustrate a real Sunday flow:
1. Volunteer launches VerseCue and sees ProPresenter/audio readiness.
2. Pastor says 'Please turn to John chapter three verse sixteen.'
3. Candidate appears correctly with selected translation.
4. Volunteer presses Space/Enter or clicks SHOW; existing ProPresenter Bible appearance changes on both in-room and stream outputs.
5. Pastor says 'now verse seventeen'; app resolves context and offers next reference.
6. Pastor makes a correction, e.g. 'sorry, John chapter four verse sixteen'; stale candidate is invalidated.
7. If ProPresenter is unavailable, the operator sees a clear error, Auto stops, and ordinary ProPresenter remains usable.

Create readable UI specs for focus, status, warning, keyboard shortcuts, color/contrast, and no accidental send after an expired candidate. Avoid large ambiguous confidence percentages without actionable meaning; show 'Needs review' when uncertain.

## 10 — SECURITY, RELIABILITY AND FAILURE CASES

Threat-model pragmatic operational hazards: wrong on-air verse; a spoken quotation misclassified as instruction; multiple passages in one sentence; translated citation but translation unavailable; hidden STT latency; audio loss or feedback; repeated trigger loop; operator is showing lyrics, while AI wants to switch to Bible; insecure LAN control; cloud STT disclosure; secrets leakage; concurrent remote controllers/Companion; automatic restart into Auto mode; update during a live service.

For every hazard, define preventive controls, detection, safe recovery, operator indication, owner, test, and residual risk. The app must never silently claim an output succeeded based only on a successful HTTP request if actual audience output is not observable.

## 11 — COMPLETE REQUIRED DOCUMENT PACKAGE

Create `/docs` containing **all files below**. Create a top-level `README.md` with ordered links and a 'start here' guide. No placeholder pages: every document should contain substantive content, traceable IDs, real tables, and explicit TBDs for unverified external facts.

- `docs/00-executive-summary.md` — one-page nontechnical board-level summary, business case, cost/risk, success criteria, scope.
- `docs/01-business-requirements.md` — goals, problem, stakeholders, personas, volunteer journeys, KPIs and baselines, scope/non-goals, constraints, operating cost, approval criteria.
- `docs/02-functional-requirements.md` — ID-indexed FRs with MoSCoW, Given/When/Then, dependencies, release.
- `docs/03-non-functional-requirements.md` — ID-indexed NFRs with quantified measurement plans.
- `docs/04-technical-requirements-and-architecture.md` — stack decision records, C4 context/container/component diagrams in Mermaid, interfaces/data models, state machines, event flows, concurrency, local deployment/same-PC and LAN variants, OS packaging, install and update strategy.
- `docs/05-ux-requirements.md` — detailed operator UX, screen layouts, focus/hotkeys, accessibility, states and errors.
- `docs/06-test-and-acceptance-plan.md` — unit/integration/system/soak/UI tests, audio dataset strategy, performance instrumentation, traceability, field UAT and go/no-go.
- `docs/07-risks-and-open-questions.md` — ranked risk register, assumptions, unanswered decisions, decision owners and due points.
- `docs/08-roadmap.md` — technical feasibility spike -> smallest MVP -> v1 -> v2, scope, dependencies, estimated effort ranges with assumptions, success gates.
- `docs/09-investigation-findings.md` — documented external research with evidence, comparison tables, citations and verification gaps.
- `docs/10-integration-feasibility-and-poc.md` — route-by-route API assessment, exact tested versions, reproduction steps and pass/fail evidence; gate decision.
- `docs/11-data-privacy-security-and-licensing.md` — data inventory/flows, secrets, rights, retention, threat scenarios, security controls.
- `docs/12-traceability-matrix.md` — objective -> BR -> FR/NFR -> tests -> release mapping; no orphan requirements.
- `docs/13-operations-and-runbook.md` — pre-service checklist, 5-minute volunteer guide, failback to manual Bible operation, incident troubleshooting, backup/restore, post-service diagnostic process.
- `docs/14-decision-records.md` — architecture decisions with options, criteria, consequences and status.
- `docs/15-implementation-handoff.md` — repository structure recommendation, build stages, P0 spikes, module interfaces, development task breakdown, definition of ready/done, dependency and delivery plan, **without production code**.

Also produce root-level:
- `PROJECT_ASSUMPTIONS.md`
- `REQUIREMENTS_SUMMARY.md` (one-page approach plus top five risks)
- `RESEARCH_SOURCES.md` (URLs, publisher, titles, accessed dates, evidence grading)
- `PROGRESS.md` (live progress tracker defined in the EXECUTION PROTOCOL)

Also create `docs/test-data/` (Section 12) and `/poc/` (throwaway diagnostic probes only; see EXECUTION PROTOCOL rule 5).

## 12 — MINIMUM BIBLE UTTERANCE TEST CORPUS

Include a structured machine-readable CSV or JSON test-case proposal inside the testing document or `/docs/test-data/` with at least **60 distinct utterances**, covering positive/negative/ambiguous cases and Nigerian/Canadian/international accent samples. At minimum:
- 'John three sixteen' -> John 3:16
- 'John chapter three verse sixteen' -> John 3:16
- 'Romans eight twenty-eight' -> Romans 8:28
- 'First Corinthians chapter thirteen verses four through seven' -> 1 Corinthians 13:4-7
- 'Second Timothy one seven' -> 2 Timothy 1:7
- 'Psalms twenty-three verse one' -> Psalm 23:1
- 'Song of Solomon two one' -> Song of Songs 2:1 (name normalized appropriately)
- 'Revelations chapter three verse twenty' -> Revelation 3:20
- 'let us read verse seventeen' after John 3:16 -> John 3:17
- 'go back to verse three' after John 3:17 -> John 3:3
- 'the next verse' after John 3:16 -> John 3:17
- 'John says a lot about love' -> no trigger
- 'chapter three talks about being born again' without context -> no trigger
- 'I meant John four sixteen, not John three sixteen' -> only corrected candidate, no stale auto-send
- 'Matthew five sixteen, and then Romans eight twenty-eight' -> multiple candidates, ordered, never both indiscriminately auto-displayed
- 'show Psalm twenty-three in ESV' with ESV uninstalled -> block/ask for translation selection, never silently substitute
- lyric/background speech mentioning a verse -> do not take control without meeting audio source and confidence safeguards

Add expected reference, contextual setup, parser result, auto eligibility, candidate expiry behavior, and failure mode. Avoid classifying all references mentioned during preaching as **commands to display** without a service policy.

Store the corpus as `docs/test-data/versecue-utterances.csv` and `docs/test-data/versecue-utterances.json` (same content, both formats), and reference it from the test plan. Mark each row's **source** as `SYNTHETIC-TEXT`, `SYNTHETIC-TTS`, or `REAL-RECORDING`. Accent and accuracy claims may only rest on `REAL-RECORDING` rows supplied by IFC; until such recordings exist, record those claims as **REQUIRES VERIFICATION**.

## 13 — MVP SCOPE AND RELEASE GATES

**P0: research and proof of concept.** Prove a supportable ProPresenter Bible output path, exact template/Look fidelity, translation policy, Windows/macOS viability, and usable sub-4-second reference turnaround in a representative test setup. If P0 fails, STOP and request product decision. Do not conceal the blocker.

**MVP:** one selected input device, one STT backend, basic explicit reference parser, stable candidate, Confirm/default + guarded Auto, Pause/kill switch, ProPresenter link and tests, safe defaults, minimum diagnostic messages, Windows/macOS installation. Drop all extras that jeopardize this thin vertical slice. Manual lookup and full history may be added as fast-follow capabilities if schedule requires.

**v1:** better context and correction support, range handling, history, edit/manual fallback, previous/next, translation overrides, multiple service profiles, richer diagnostics, keyboard UX, auto-update and strengthened resiliency.

**v2:** optional offline/cloud alternative provider, expanded speech languages, optional quoted/paraphrased Bible identification (always confirm), advanced instrumentation and centralized support only if explicitly approved. No expansion into a presentation app.

For each milestone include exit criteria, test evidence, dependencies, risks, staffing/skills, implementation sequence, and approximate cost ranges separated into capital/dev effort vs recurring service expense. Clearly state that estimates are preliminary.

## 14 — REVIEW AND QUALITY BAR

Before handing over the package:
1. Verify all files are present, ordered and linked in the README.
2. Verify every numbered FR/NFR has acceptance criteria, owner/phase, and corresponding tests; no contradictory UX states.
3. Check that no claim of a native ProPresenter Bible API is unsupported by official docs and/or live POC evidence.
4. Ensure no fallback changes the appearance of Bible verses, requires unlicensed text, or replaces ProPresenter output without explicitly flagging it as violating scope.
5. Reconcile latency targets with measured hardware, not marketing claims.
6. Keep executive/business documentation readable to nontechnical IFC leadership; place technical depth in technical files.
7. Include a source/assumption trace for all pricing and compatibility facts.
8. Distinguish recommendations from accepted decisions, and identify questions that block MVP.
9. End with a compact decision brief: best integration path (verified/provisional), preferred desktop framework, preferred STT, parser approach, smallest MVP, top five risks, open decisions, and proposed next engineering step.

## 15 — OUTPUT AND EXECUTION ORDER

This section maps the work onto stages. Complete each stage fully before starting the next, and obey the EXECUTION PROTOCOL at the top of this prompt.

**Stage 0 — Intake.** Restate product scope and non-goals briefly. Identify up to 10 material questions with explicit defaults; never ask the same question again after it is answered. Create `PROGRESS.md`, `PROJECT_ASSUMPTIONS.md` and `RESEARCH_SOURCES.md`. Do not stall: if I have not answered, proceed on the recorded defaults and log them as open questions. Ask me for the real recorded sermon excerpts (EXECUTION PROTOCOL rule 6) at this point.

**Stage 1 — ProPresenter integration feasibility (P0).** Research ProPresenter integration first, including the official API and the actual tested installation where reachable. Record feasibility and blockers in `docs/10-integration-feasibility-and-poc.md` and start `docs/09-investigation-findings.md`. Use only permitted `/poc/` probes. If the environment cannot test live ProPresenter hardware, write a reproducible POC procedure and mark the gate **PENDING**, not **PASSED**. Never imply unperformed tests are complete.
**STOP** and report the gate status (PASSED / FAILED / PENDING) in no more than 15 lines: what was verified, what was not, blockers, and the decision needed from me. If I reply "continue provisionally", proceed, and label every integration-dependent statement in later documents **PROVISIONAL**. If the gate FAILED, present honest alternatives and do not begin any standalone presentation workaround.

**Stage 2 — Remaining research and decisions.** Research STT options, desktop frameworks, parser approach and Bible-translation licensing (Section 8). Complete `docs/09-investigation-findings.md` and seed `docs/14-decision-records.md`. Continue to Stage 3 without stopping unless a blocker appears.

**Stage 3 — Documentation tree.** Create the complete documentation tree and content (Section 11), written directly to the workspace in these batches, with a one-paragraph checkpoint in `PROGRESS.md` after each batch:
- **3A:** `docs/00`, `docs/01`, `docs/02`
- **3B:** `docs/03`, `docs/04`, `docs/05`
- **3C:** `docs/06` plus the test corpus in `docs/test-data/`, then `docs/07`, `docs/08`
- **3D:** `docs/11`, `docs/12`, `docs/13`, `docs/14` (finalize), `docs/15`, then the top-level `README.md`

Do not replace requirements with summaries. Keep Markdown valid and Mermaid diagrams renderable.

**Stage 4 — Audit, decision brief and approval.** Run the consistency/traceability audit and the quality bar in Section 14, finish `REQUIREMENTS_SUMMARY.md`, produce the one-page decision brief, and list any **P0-blocking unknowns**.
**STOP** and request my approval before implementation begins. Do not initialize GitHub, select a cloud provider, purchase Bible translations, access the production ProPresenter host, or modify a live service without explicit authorization.

---

**Success looks like this:** A pastor says 'Romans 8:28'; within moments, a volunteer sees a correct, unambiguous reference and clicks once—or a deliberately enabled safe Auto mode does it—and the Scripture appears through IFC's **existing ProPresenter Bible styling** on the proper in-person and livestream screens. ProPresenter remains the only presentation system, and the service can continue normally if VerseCue fails.
