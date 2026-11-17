# Investigation findings

2026-11-17 UTC. Stages 1–2 documentary research recorded. IFC released provisional continuation; Stage 2 tables appear below the preserved Stage 1 findings. Hardware and real-audio testing remain pending. Evidence status definitions and full source URLs are in [RESEARCH_SOURCES](../RESEARCH_SOURCES.md). Detailed route testing and gate are in [integration feasibility](10-integration-feasibility-and-poc.md).

## Evidence and version handling
| ID | Finding | Evidence status | Source / limitation |
|---|---|---|---|
| FIND-01 | IFC reports version 21, Mac mini M4, same-PC first, MOTU M4, Companion, English and existing themes/Looks/macros. | USER-REPORTED, not V-TEST | IFC intake reply 2026-11-17; exact build/macOS/hardware load unknown. |
| FIND-02 | IFC reports KJV, Amplified, Amplified classic, NIV, NKJV and The Message installed. | USER-REPORTED | Default, exact edition IDs and usage rights remain unverified. |
| FIND-03 | Direct arbitrary-reference Bible lookup is NOT VERIFIED / NOT DOCUMENTED in the inspected public schema. | V-DOC scope observation; installed behavior PENDING | SRC-08; do not equate public API metadata with installed version 21 or conclude unsupported. |
| FIND-04 | The Bible UI can prepare and save passages using installed translations/themes. | V-DOC, not integration reproduction | SRC-03; limited prepared-presentation route is worth testing but does not prove arbitrary live lookup. |
| FIND-05 | Bible and per-output themes are documented. | V-DOC | SRC-04; IFC's visual parity has not been inspected or demonstrated. |
| FIND-06 | Macros group actions. Existing IFC actions require inspection before any experiment. | V-DOC plus risk inference | SRC-09; no proof of parameterized Bible search. |
| FIND-07 | Installed Bible licensing is machine-specific in vendor installation guidance. | V-DOC | SRC-05; does not authorize extraction, external text generation or redistribution. |
| FIND-08 | Version 21 has documented editable PowerPoint import. | V-DOC | SRC-11; not a Bible reference API or proof of exact formatting/rights. |
| FIND-09 | IFC requires free use and accepts proposed latency targets. | USER CONSTRAINT / TARGET | No required paid speech service or new purchase assumed. Targets remain unmeasured. |

## Public API investigation method
The API landing page rendered no readable text in the research tool. The public `swagger.json` resource was retrieved, then downloaded after approved public-network escalation for local inspection. The resource is a JavaScript variable assignment containing JSON, stored as text and parsed as data without evaluating it. Path summaries and keyword matches were inspected. Snapshot: [propresenter-openapi-2026-11-17.txt](evidence/propresenter-openapi-2026-11-17.txt); SHA256 of UTF-8 file: `77F65E9B335B4714E576C0EDA5C681F5208D379FE2C74703F9686E2DB39E17B9`. The older `https://renewedvision.com/api_spec/swagger.json` could not be retrieved by the web tool; it was not used as authoritative evidence. No local host/LAN/ProPresenter request was made.

The next step is installed-document comparison, rather than assuming an old ProPresenter 7 endpoint set governs version 21. Record added/removed routes, request schemas, exact app build and actual responses. No direct-Bible working reproduction exists. Presentation triggers and navigation must be distinguished from Bible verse generation.

## Preservation and feasibility comparison
| Candidate route | Real ProPresenter Bible text | Existing theme/Looks | Primary unsolved question |
|---|---|---|---|
| Direct documented Bible API if found | Unknown | Unknown | Does installed version 21 expose a supported lookup/select route? |
| Bible-UI-created presentation + API | Conditional preservation | Must compare outputs | How to obtain arbitrary unprepared passage without manual UI work? |
| Macro/action orchestration | Inherits content route | Conditional; inspect actions | Can it resolve references, and avoid Companion/media conflicts? |
| UI automation last resort | Potentially uses installed text | Must compare outputs | Can it run safely without focus/operator interference on both OSs? |
| Supported import | Not established | Not established | Rights, exact formatting and supported automated import behavior? |
| Other vendor-supported route | Unknown | Unknown | Vendor clarification required; no new mechanism demonstrated. |

These are research hypotheses. None passes P0. Weighted investigation priorities and all required experimental dimensions appear in docs/10, including exact media continuity, failure recovery, Windows/macOS and same-PC/LAN procedures. No framework/STT architecture is recommended yet.

## Product inspiration review
The [SmartVerses homepage](https://www.smartverses.app/) describes listening and scripture detection; its [feature catalog](https://www.smartverses.app/features) describes live transcription and surfacing verses for review/display, alongside presentation, lyrics, recording and output tools. (SRC-06/07, V-DOC of vendor marketing, accessed 2026-11-17; performance not tested.) Useful interaction inspiration: visible listening state, readable transcription and review before display. VerseCue must retain its narrower companion scope. Do not copy the presentation suite, output engine, NDI, recording, sermon summaries or paraphrase auto-display behavior. The catalog mentions ProPresenter integration but supplies no inspected method/schema or demonstrated arbitrary Bible lookup; it proves neither internal implementation nor feasibility for VerseCue.

## Open investigation actions
| ID | Action | Owner / due | Evidence required |
|---|---|---|---|
| INV-01 | Compare installed version 21 API documentation with snapshot. | IFC + investigator / before P0 pass | Exact build, schema and safe request/response artifacts. |
| INV-02 | Ask vendor whether supported Bible reference/translation/theme selection or generation exists for version 21 on both OSs. | IFC or investigator if separately authorized / P0 | Written vendor response and reproducible steps; no message sent. |
| INV-03 | Execute approved test-library procedure, including two required passages and an unprepared reference. | IFC test supervisor / P0 | IT-01–13 log, visual baselines, readback vs observed output distinction. |
| INV-04 | Obtain consented excerpts and representative shared-host load profile. | IFC / before performance claims | Real recordings, permissions and expected references; no real evidence yet. |
| INV-05 | Documentary STT comparison completed in Stage 2 below; real benchmarking and plan-specific terms remain pending. | Investigator / before backend acceptance | Current dated pricing formulas and benchmark plan recorded; no provider selected. |
| INV-06 | Documentary framework/parser/content comparison completed below; installed support/rights verification pending. | Investigator / before architecture acceptance | Tables and provisional ADRs recorded; empirical and exact licensing gaps retained. |

## Stage 1 audit
Public research and installation evidence are separated. No API/latency/accent claim rests on marketing or synthetic samples. Source access failures, unanswered installed-version questions and pending experiments remain explicit. This paragraph records the Stage 1 checkpoint; the authorized Stage 2 completion follows below and supersedes its earlier waiting state.

## Stage 2 — research and provisional recommendations
IFC authorized "continue provisionally" on 2026-11-17. **All integration-dependent recommendations in this document are PROVISIONAL. P0 remains PENDING.** No build system selected, provider account opened, app scaffold created or installed hardware tested. The evidence tables compare documented capabilities; implementation effort and fit are engineering judgments. Full URLs/access dates/evidence grades are in RESEARCH_SOURCES.md, SRC-13–38.

### Speech engines: capability and deployment comparison
Every row has **REQUIRES VERIFICATION** for IFC English accents, precision/recall, partial/final latency, 90-minute continuity and shared ProPresenter load. Vendor speed claims and model benchmarks are not Sunday-service measurements. “Streaming” distinguishes rolling-window local inference from a vendor stream API.

| Engine | Streaming/partials and actual latency evidence | Deployment, acceleration and footprint | Offline, availability and privacy | IFC fit / evidence |
|---|---|---|---|---|
| whisper.cpp | Microphone streaming example uses repeated inference, not guaranteed stable final text; application stabilization required. No IFC timing. | C/C++ native binary; Windows/macOS targets and Apple acceleration options documented. Model-dependent memory; base/small candidates to benchmark; native per-CPU packaging needed. | Local model, no service dependency after verified model install; audit build/network behavior. | Preferred MVP investigation: zero metered STT; shared M4 contention unresolved. SRC-13. |
| faster-whisper | Library transcription; realtime integrations are separate projects, not a turnkey guaranteed streaming contract. | Python/CTranslate2/PyAV; CPU and CUDA paths. Package interpreter/dependencies and model; no Apple Metal parity assumed. | Can run local; pin model locally to avoid automatic downloads during service. | Future optional local fallback, especially dedicated Windows CPU/NVIDIA host; more packaging burden. SRC-14. |
| Deepgram | Documented interim/final streaming results; endpointing/finalization adapter needed. No measured IFC latency. | Remote service; thin client, capture and TLS/socket buffers local; server hardware hidden. | Internet/vendor account required; no offline fallback inherent. Retention/training/region terms unverified. | Excluded as required backend by free-use constraint; comparison only, no selection. SRC-15/16. |
| Azure AI Speech | Realtime SDK documented; separate recognizing/recognized lifecycle must be adapted and session limits tested. | SDK/native dependencies per target; remote compute; validate supported runtime version. | Cloud account/region/availability dependency. Embedded/offline offering is not assumed equivalent or free. | Limited F0 quota cannot promise unlimited free services. SRC-17/18. |
| Google Cloud STT | Documented streaming via gRPC; model/region limits and stream rollover need tests. | gRPC/client dependency, remote compute; Windows/macOS SDK packaging review needed. | Internet/billing/account dependency; no local offline inference in chosen cloud path. | Paid usage after any applicable credits; no MVP account. SRC-19/20. |
| AssemblyAI | Realtime model offerings documented; confirm turn/end semantics in exact API version before adaptation. | Network client rather than bundled model; server memory not observable. | Cloud dependency; connection billing and retention conditions require review. | Metered, not a sustainable free-use assumption. SRC-21. |
| Apple Speech APIs | Partial/on-device capability depends on recognizer/device/locale; full current API behavior requires local test. | OS-specific native bridge, permissions, language assets; no shared Windows implementation. | Must check supportsOnDeviceRecognition and enforce on-device mode; never silently fall back to server. | Potential later Mac-only experiment; unsuitable sole cross-platform MVP backend. SRC-22/38, limited retrieval. |
| Windows Speech APIs | OS recognition/grammar APIs documented; continuous partial/final dictation semantics and current desktop-host interoperability unverified. | Windows-native bridge, microphone capability and installed language/runtime dependencies. | Privacy/recognition settings can affect availability; no universal offline guarantee. | Potential later Windows-only experiment; not parity with Apple or local Whisper. SRC-23. |

Memory planning: vendor whisper.cpp table lists approximately 388 MB for base and 852 MB for small, excluding VerseCue/OS/other processes; treat as documentation, never a measured allocation on IFC's machine. No model selected yet: test base.en and small.en under identical segmentation settings, then choose only if reference accuracy and total service load pass. Quantization/acceleration must be benchmarked, not presumed better. Keep threading/resource limits explicit; ML cannot starve ProPresenter. (SRC-13.)

### Dated 90-minute operating-cost comparison
Assumptions: 90 minutes mono audio/connection; USD list observations accessed 2026-11-17, no tax, FX, trial credits, volume discounts, storage, optional features or reconnect duplication. This is a comparison, not authorization to incur cost. CAD total = USD total × actual dated USD/CAD conversion + applicable taxes; no exchange rate invented. Monthly cost for S sessions = S × session cost subject to quota/shared-account changes. Four 90-minute services = 6 hours, before rehearsal.

| Engine | Observed basis / formula | Per 90 minutes | Limitation |
|---|---|---:|---|
| whisper.cpp | Local inference, no metered cloud call | USD 0 metered API | Existing hardware, electricity, maintenance, model/download/signing effort excluded. MIT code is not evidence every model/binary has cleared distribution terms. |
| faster-whisper | Local inference, no metered cloud call | USD 0 metered API | Same exclusions; Python/runtime dependency licenses separate. |
| Deepgram Nova-3 monolingual | Observed promotional USD 0.0048/min × 90 | USD 0.432 | Recheck selected streaming product/rate and promo expiry; free initial credit does not make recurring use free. SRC-15. |
| Azure | F0 5 audio hours/month shared Standard/Custom; beyond quota paid rate R_USD/hour or stop | USD 0 only within available F0 allocation; paid = 1.5 × R | Four weekly sessions exceed 5 h. Regional paid rate not resolved in retrieved table: REQUIRES VERIFICATION using calculator/plan before cost commitment. SRC-17. |
| Google V2 standard first tier | USD 0.016/min × 90 | USD 1.44 | Exact model/region/discount and channel billing must match plan. SRC-19. |
| AssemblyAI STT-3.7 Realtime | USD 0.30/hour × 1.5 | USD 0.45 | Reference updated 2026-11-10; billable connection duration may include silence. SRC-21. |
| OS Speech | No separate API price established in this research | Rate/terms REQUIRES VERIFICATION | Do not equate bundled API with unconditional free/offline/duration support. |

Preferred MVP **research recommendation**: whisper.cpp in a constrained local worker; future optional fallback: faster-whisper behind the same interface. Neither recommendation commits an integration architecture or promises target performance. If local inference cannot meet quality/latency without disturbing ProPresenter, evaluate a dedicated existing LAN computer or seek product decision; do not quietly turn on paid cloud recognition. No cloud provider is selected.

Provider interface must expose session ID, audio format, monotonic start/end timestamps, utterance/revision ID, partial/final/stable status, text, language, optional provider confidence, availability/error and cancel/reset. Local adapters must not label a repeated window “final” merely because it repeated. Validate endpoint/silence boundaries and revision handling. Switching provider clears transient transcript/context and disables Auto; never replay buffered service audio to a different provider implicitly.

### Parser choices
| Option | Strength | Failure/cost/privacy concern | Decision |
|---|---|---|---|
| Deterministic grammar + canonical validation | Auditable book aliases/ordinals/ranges, predictable rejection, local/free operation | STT errors and ambiguous speech need review; verse metadata provenance required | Recommend MVP; configurable dictionary, finite range limits and no invented reference completion. |
| LLM-only extraction | Flexible phrase handling hypothesis | Hallucination, nondeterminism, possible recurring cost/data transfer; no benchmark here | Reject for MVP and as safety authority. |
| Hybrid | Deterministic core plus separately optional ambiguity suggestion | Adds model/runtime and must retain evidence/validation boundary | Future only after benchmark; always confirm uncertain suggestions. |

Confidence is initially a heuristic evidence class: valid canonical reference + stable transcript + unambiguous intent/context + verified translation/target. It is not a calibrated probability. STT confidence is optional and noncomparable across engines. “High” must never override a failed safety predicate. Calibrate only on held-out real recordings with labelled outcomes and reliability bins/intervals; no threshold guarantees a correct verse. Parse discussion separately from permission to display.

### Desktop comparison
All architecture recommendations involving ProPresenter are **PROVISIONAL**. Frameworks are research candidates, not installed dependencies or selected build systems. Compatibility is a vendor statement until exact pinned runtime/OS/CPU builds are tested.

| Option | UI model / desktop fit | Audio and local ML integration | Packaging, permissions and maintenance | Accessibility / size / conclusion |
|---|---|---|---|---|
| Tauri 2 | Rust core with OS webview; installable desktop, not native OS widgets | Native capture bridge and bounded worker; sidecar per target supported | Rust plus web UI skills; sign app/worker, scope IPC; WebView2/WKWebView behavior differs; Intel/ARM binaries must match | Semantic UI with VoiceOver/NVDA tests; small-shell advantage is a hypothesis once ML bundled. Preferred provisional candidate. SRC-24–26. |
| Electron | Chromium multiprocess web UI with main/preload isolation, not native widgets | Mature media APIs plus native helper/worker; do not expose Node to renderer | Bundle Chromium/Node, maintain security updates and native ABI rebuilds; sign each architecture/helper | Larger runtime expected by architecture, exact size/memory unmeasured; strong fallback if team lacks Rust or Tauri accessibility/capture fails. SRC-27. |
| Avalonia | .NET cross-platform rendered UI; not a promise of native OS widget controls | Native capture bindings and separate ML process required | .NET runtime/AOT choices, per-target audio/native libs, update tooling and signing needed | Framework support tiers vary; test screen reader/focus on exact release. Viable C# team option. SRC-28. |
| .NET MAUI | WinUI Windows, Mac Catalyst on macOS | Native platform bindings/ML helper still required | Separate platform capabilities/toolchains and Mac build/sign pipeline; microphone/session behavior requires validation | OS-native platform approach differs across hosts; assess desktop workflow/keyboard parity, not preferred without MAUI expertise. SRC-29. |

Preferred **PROVISIONAL** architecture candidate: Tauri shell with a narrow native core, local audio worker/whisper.cpp process, deterministic parser and separately gated ProPresenter connector. Avoid selecting a web bundler/toolchain now. Native capture is preferable to relying on system loopback: start with MOTU M4 selected physical input. Windows WASAPI render loopback exists (SRC-33), but macOS capture/permission paths and hardware loopback configuration are different and untested. OS-specific capture must not change the mixer's live routing.

Install/update research recommendation: signed Windows x64 installer and signed/notarized macOS Apple Silicon/Intel artifacts, tested independently. Version/OS matrix remains open. Windows 10 ordinary support ended 2025-10-14 (SRC-32); assess actual edition/ESU and framework support before promising Windows 10. No support silently dropped or claimed. Auto-update belongs v1; MVP uses verified offline/manual package installation outside service with rollback. Installer/update channel vendor/service is not selected. Apple documents Developer ID/notarization (SRC-31); membership lists USD 99/year with possible qualifying waiver (SRC-30). Free app operation therefore does not prove zero-cost signed distribution. Request IFC's budget decision before any expenditure; no waiver eligibility presumed.

### Bible-content and rights decisions
Prefer licensed content already installed in ProPresenter; no bundled Bible databases, extraction, scraping or cached copyrighted verse text. Candidate card may show reference/translation/source speech; full verse preview only through a licensed supported path with rights and exact readback evidence. Canonical reference metadata must have an audited source/license independent from verse text.

| IFC translation | Primary rights investigation | Requirement / unresolved point |
|---|---|---|
| KJV | Installed license/edition and Canadian-use rights not inspected | Do not assume every edition/territory is unrestricted. No bundled text. |
| Amplified | Lockman permissions SRC-34 | Verify exact installed edition and current digital/streaming use; limited quotation rules do not authorize a redistributed database. |
| Amplified classic | Lockman SRC-34 distinguishes AMPC notice | Keep AMP/AMPC separate; never silently map “Amplified” to classic. |
| NIV | Biblica permissions SRC-35 | Review exact app/stream use and permission route; no blanket software/data license inferred. |
| NKJV | Attempted Thomas Nelson permissions SRC-37 failed | REQUIRES VERIFICATION: locate publisher's current permissions via official site/support, capture exact use/edition terms before fallback. |
| The Message | NavPress permissions SRC-36 | Online/audio uses have a permission inquiry procedure; IFC must verify its stream rights separately. Preserve publisher-required notices. |

No legal conclusion that IFC lacks or possesses a particular right is made. Existing ProPresenter licensing does not automatically authorize redistribution in VerseCue. Fallback requiring external copyrighted text is rejected until written rights cover exact use; the free-use constraint strengthens the recommendation to avoid a second Bible-content provider. See planned docs/11 for rights ledger and controls.

### Research closure and pending validations
Stage 2 documentary comparison is complete at available evidence depth; unresolved paid rates, OS speech details, current support versions, cloud terms, NKJV/KJV rights and all empirical results are explicitly REQUIRES VERIFICATION. Procedures: pin candidate versions, obtain current vendor license/terms and platform matrices, record links/date/hash; run isolated install/audio benchmarks against real IFC excerpts and exact P0 hardware; retain results before accepting decisions. Nothing here passes P0. Proceed to decision records and full requirement documents under IFC's provisional authorization.



## Personal-host evidence update
2026-11-17: installed Windows ProPresenter 21.4.2 schema and saved-passage trigger diagnostics executed under new user authorization. Detailed evidence/limits: docs/18-personal-propresenter-test-results.md. This updates earlier no-test statements only for the recorded personal-host checks, not speech/Mac/physical-output acceptance. No arbitrary lookup route established; P0 PENDING.

## New empirical UI findings — 2026-11-17
Dynamic Bible UI trial and exact limitations are in docs/19. Unprepared Philippians range preparation and intentional first-cue trigger worked on personal Windows host; no API Bible lookup established. Text-clipping warnings, delayed/uncertain UI-edit completion, stale accessibility state and transient readback identity gaps block unattended-route acceptance. Last-resort UI route remains provisional. Source recording start 01:18:10 recorded in docs/test-data/sermon-source-intake.md, but no link/file supplied; no recognition analysis claimed.
