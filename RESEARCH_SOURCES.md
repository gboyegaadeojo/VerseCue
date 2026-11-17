# VerseCue research source register

Initialized 2026-11-17 UTC. This register distinguishes document evidence from installed behavior. Access dates are recorded only after retrieval; the intake source list alone is not evidence of access. Never infer Bible lookup from a general presentation trigger, or successful audience output from HTTP success.

## Evidence grades
- V-DOC: retrieved primary vendor documentation; supports only its stated documented scope.
- V-TEST: reproducible observed test with exact build/platform, request/response, timestamps and artifacts; none at intake.
- HYPOTHESIS: proposed behavior or target needing measurement.
- REQUIRES VERIFICATION: unavailable/unretrieved/uncertain claim, including installation-specific behavior.
- PENDING: required procedure not yet executed. NOT DOCUMENTED means absent from the inspected documentation scope, not proof of unsupported behavior.

## Initial sources queued for Stage 1
| ID | Publisher | Title / identification supplied in specification | URL | Access date | Evidence status |
|---|---|---|---|---|---|
| SRC-01 | Renewed Vision | ProPresenter API | https://openapi.propresenter.com/ | 2026-11-17 | Landing page reached, no readable text; see SRC-08 |
| SRC-02 | Renewed Vision | TCP/IP Connections with ProPresenter API | https://support.renewedvision.com/hc/en-us/articles/31606866768147-TCP-IP-Connections-with-ProPresenter-API | 2026-11-17 | V-DOC |
| SRC-03 | Renewed Vision | Using Bibles in ProPresenter | https://support.renewedvision.com/hc/en-us/articles/360041347594-Using-Bibles-in-ProPresenter | 2026-11-17 | V-DOC |
| SRC-04 | Renewed Vision | Themes in ProPresenter | https://support.renewedvision.com/hc/en-us/articles/11910559859603-Themes-in-ProPresenter | 2026-11-17 | V-DOC |
| SRC-05 | Renewed Vision | Installing Bibles in ProPresenter | https://support.renewedvision.com/hc/en-us/articles/360041814913-Installing-Bibles-in-ProPresenter | 2026-11-17 | V-DOC |
| SRC-06 | SmartVerses | Product homepage | https://www.smartverses.app/ | 2026-11-17 | V-DOC marketing; inspiration only |
| SRC-07 | SmartVerses | Features | https://www.smartverses.app/features | 2026-11-17 | V-DOC marketing; inspiration only |

## Research procedure and provenance
For each source, retrieve the exact URL, record observed title, publication/update date if exposed (otherwise unknown), access date, scope/version, supported claims and limitations. Record redirects or access failures. Inspect official API methods, schemas and transport guidance before proposing requests. Match documented version to the installed application only after an explicitly authorized test. Save reproducible procedures and gaps in docs/10 and investigation findings in docs/09. Record prices with currency/date/formula and compatibility/licensing with primary vendor terms in Stage 2; no pricing, license or stack claim is made here.

If browsing or installation testing is unavailable: mark REQUIRES VERIFICATION/PENDING, provide the exact manual procedure and required artifacts, and continue permitted work. Do not contact a production host or scan IFC's LAN as part of public research.

## Intake audit
All seven supplied seed URLs are registered, without presenting them as already verified. Evidence grading, date handling, missing-test behavior and pricing/compatibility provenance rules are explicit. This register will be updated as sources are retrieved.

## Stage 1 additional sources and retrieval outcomes
All sources below were accessed on 2026-11-17 UTC. No publication/update date was exposed in inspected primary text; unknown dates are not inferred from crawl dates or copyright notices. Titles in the initial table were confirmed, except SRC-06 observed title was "AI-Powered Church Presentation Software | Free Download" and SRC-07 was "All SmartVerses Features | SmartVerses".

| ID | Publisher / title | URL | Access date | Evidence / scope |
|---|---|---|---|---|
| SRC-08 | Renewed Vision — ProPresenter API schema | https://openapi.propresenter.com/swagger.json | 2026-11-17 | V-DOC snapshot; not installed API evidence. Stored at docs/evidence/propresenter-openapi-2026-11-17.txt. |
| SRC-09 | Renewed Vision — Using Macros in ProPresenter | https://support.renewedvision.com/hc/en-us/articles/4402663090323-Using-Macros-in-ProPresenter | 2026-11-17 | V-DOC macro actions/workflow. |
| SRC-10 | Renewed Vision — Connecting to ProPresenter Control | https://support.renewedvision.com/hc/en-us/articles/6024791423763-Connecting-to-ProPresenter-Control | 2026-11-17 | V-DOC network setup; examples are not IFC configuration. |
| SRC-11 | Renewed Vision — Importing PowerPoint files Natively within ProPresenter | https://support.renewedvision.com/hc/en-us/articles/45377042213011-Importing-PowerPoint-files-Natively-within-ProPresenter | 2026-11-17 | V-DOC version 21 import; not proof of Bible lookup/rights. |
| SRC-12 | Renewed Vision — historical API resource attempted | https://renewedvision.com/api_spec/swagger.json | Attempted 2026-11-17 | Tool could not retrieve; REQUIRES VERIFICATION, not used as evidence. |

## Claim index and limits
- SRC-02: optional TCP framing/subset/response semantics; no measured socket behavior or installed security evidence.
- SRC-03: Bible UI translation/search/theme/save/navigation workflow; no remote arbitrary-reference proof.
- SRC-04: Bible-theme assignment and per-screen Look theme application; no IFC fidelity test.
- SRC-05: installation and per-computer licensing guidance; no external redistribution grant assumed.
- SRC-06/07: public interaction inspiration only; no verified accuracy, speed or integration internals.
- SRC-08: inspected public method/schema snapshot. No Bible/Scripture/translation matches; NOT DOCUMENTED in that snapshot does not mean unsupported in installed version 21. No security declarations found does not establish installed authentication behavior.
- IFC intake reply: user-reported installation/assets, free-use constraint, English scope and accepted latency targets; not vendor/test evidence.

No V-TEST evidence exists. No performance figures, prices, speech-provider choice or runtime support promises were accepted from search snippets. Search results outside primary vendor sources were discovery leads only and were not used to substantiate technical conclusions. At the Stage 1 checkpoint, Stage 2 investigations awaited the gate reply; IFC subsequently authorized provisional continuation and Stage 2 sources follow below.

## Stage 1 audit
Seed URLs retrieved or retrieval limitations recorded; primary claims carry source IDs, URLs, date and evidence scope. Installed facts and test outcomes remain pending. Snapshot hash and method are in docs/09. This register supersedes the intake-only access state above.

## Stage 2 primary sources — accessed 2026-11-17 UTC
V-DOC means documented only; no binaries, accounts, benchmark or platform test was run. Publication/update dates unknown unless stated. Recommendations and estimates derived from these sources are investigator judgments, not vendor guarantees. Links below are claim provenance; current terms must be rechecked before adoption.

| ID | Publisher / observed title | URL | Evidence and supported scope |
|---|---|---|---|
| SRC-13 | ggml-org — whisper.cpp | https://github.com/ggml-org/whisper.cpp | V-DOC; MIT repository, model memory, acceleration and naive microphone streaming example. |
| SRC-14 | SYSTRAN — faster-whisper | https://github.com/SYSTRAN/faster-whisper | V-DOC; CTranslate2/Python, CPU/CUDA and external streaming integrations, MIT repository. |
| SRC-15 | Deepgram — Pricing | https://deepgram.com/pricing | V-DOC; promotional STT rates, credits are not recurring free service. |
| SRC-16 | Deepgram — Interim results | https://developers.deepgram.com/docs/interim-results | V-DOC; preliminary/final streaming results. |
| SRC-17 | Microsoft — Azure Speech pricing | https://azure.microsoft.com/en-us/pricing/details/speech/ | V-DOC; F0 5 audio hours/month; paid region/currency rate not resolved. Seed URL redirected here. |
| SRC-18 | Microsoft — How to recognize speech | https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-recognize-speech | V-DOC; realtime recognition guide readable despite authorization banner. |
| SRC-19 | Google — Speech-to-Text pricing | https://cloud.google.com/speech-to-text/pricing | V-DOC; V2 standard first tier USD 0.016/minute. |
| SRC-20 | Google — Transcribe audio from streaming input | https://docs.cloud.google.com/speech-to-text/docs/streaming-recognize | V-DOC; streaming gRPC; initial V2 URL redirected. |
| SRC-21 | AssemblyAI — Pricing authoritative reference | https://www.assemblyai.com/pricing.md | V-DOC; updated 2026-11-10; realtime models, hourly rates and billing. Also inspected https://www.assemblyai.com/pricing . |
| SRC-22 | Apple — supportsOnDeviceRecognition | https://developer.apple.com/documentation/Speech/SFSpeechRecognizer/supportsOnDeviceRecognition | V-DOC search excerpt only; on-device availability conditional; full page REQUIRES VERIFICATION. |
| SRC-23 | Microsoft — Speech recognition | https://learn.microsoft.com/en-us/windows/uwp/ui-input/speech-recognition | V-DOC; OS runtime, grammar and permission requirements. |
| SRC-24 | Tauri — What is Tauri? | https://v2.tauri.app/start/ | V-DOC; system webview/Rust desktop approach. |
| SRC-25 | Tauri — Distribute | https://v2.tauri.app/distribute/ | V-DOC; packaging/signing guides; no actual installer built. |
| SRC-26 | Tauri — Embedding External Binaries | https://v2.tauri.app/develop/sidecar/ | V-DOC; per-target sidecar packaging. |
| SRC-27 | Electron — Process Model | https://www.electronjs.org/docs/latest/tutorial/process-model | V-DOC; Chromium multiprocess desktop architecture. |
| SRC-28 | Avalonia — Supported platforms | https://docs.avaloniaui.net/docs/supported-platforms | V-DOC; support tiers vary by release. |
| SRC-29 | Microsoft — Supported platforms for .NET MAUI apps | https://learn.microsoft.com/en-us/dotnet/maui/supported-platforms?view=net-maui-10.0 | V-DOC; Mac Catalyst and WinUI targets, not tested compatibility. |
| SRC-30 | Apple — Become a member | https://developer.apple.com/programs/enroll/ | V-DOC search excerpt; USD 99/year and qualifying fee waiver, eligibility unverified. |
| SRC-31 | Apple — Signing Mac Software with Developer ID | https://developer.apple.com/developer-id/ | V-DOC; Developer ID, hardened runtime and notarization workflow. |
| SRC-32 | Microsoft — Windows 10 release information | https://learn.microsoft.com/en-us/windows/release-health/release-information | V-DOC search excerpt; ordinary support ended 2025-10-14; edition/ESU exceptions need review. |
| SRC-33 | Microsoft — Loopback Recording | https://learn.microsoft.com/en-gb/windows/win32/coreaudio/loopback-recording | V-DOC search excerpt; shared-mode WASAPI render loopback. |
| SRC-34 | Lockman — Permission to Quote: NASB, Amplified, NBLA, LBLA | https://www.lockman.org/permission-to-quote-copyright-trademark-information/ | V-DOC; AMP/AMPC notices and limits; no blanket redistribution grant inferred. |
| SRC-35 | Biblica — Permissions | https://www.biblica.com/permissions/ | V-DOC; conditions on text use; app licensing must be separately checked. |
| SRC-36 | NavPress — Permissions | https://www.navpress.com/permissions | V-DOC; The Message use/attribution and online/audio permission procedure. |
| SRC-37 | Thomas Nelson — attempted permissions page | https://www.thomasnelsonbibles.com/about-us/permissions/ | Retrieval failed; REQUIRES VERIFICATION; no NKJV license claim accepted. |
| SRC-38 | Apple — requiresOnDeviceRecognition | https://developer.apple.com/documentation/speech/sfspeechrecognitionrequest/requiresondevicerecognition | JS-only response; full content not retrieved. Markdown guess failed; use SRC-22 with explicit limit. |

BibleGateway AMP/AMPC pages were inspected as discovery leads for Lockman; use SRC-34 as primary permissions evidence. No Bible text downloaded. No cloud privacy/retention agreement has been approved; all cloud retention, training use, region and deletion claims remain REQUIRES VERIFICATION. For each cloud vendor: obtain current service terms, DPA, model-training opt-out and region/retention documents for the exact plan, save dated references and have IFC review before any upload. No signup or provider selection is authorized by this research.


## Installed primary evidence — 2026-11-17
SRC-39: Personal Windows ProPresenter 21.4.2 (352584193), API v1. About/Network/Bible UI and loopback `/version`, `/v1/doc/index.html`, `/v1/doc/swagger.json`, library/presentation/status reads and allowlisted test-cue triggers observed. Local source is installation-specific, no private LAN URL published. Schema file docs/evidence/propresenter-installed-21.4.2-openapi.txt is data-only documentation (205 paths); stored separately from public snapshot. V-TEST only within scope and limits in docs/18-personal-propresenter-test-results.md. No Bible lookup/Auto/physical audience output or real speech result claimed. No raw private configuration/Bible text included.

## Source updates — 2026-11-17 dynamic-route research
- SRC-40, Renewed Vision, Keyboard Shortcuts in ProPresenter: https://support.renewedvision.com/hc/en-us/articles/360042123293-Keyboard-Shortcuts-in-ProPresenter . Accessed 2026-11-17, V-DOC. Public guide's Action Palette shortcut differs from personal installed 21.4.2 menu (Alt+A observed); installed behavior governs this test. No universal shortcut assumption.
- SRC-41, Renewed Vision, Setting Up The ProPresenter Stream Deck Plugin: https://support.renewedvision.com/hc/en-us/articles/5284750340371-Setting-Up-The-ProPresenter-Stream-Deck-Plugin . Accessed 2026-11-17, V-DOC search content. Lists navigation/macros/Look-related workflows but no inspected arbitrary Bible-reference method/schema; not evidence of unsupported behavior.
- SRC-42, Personal Windows ProPresenter 21.4.2 semantic tree/screenshots and existing loopback diagnostic reads, accessed 2026-11-17, V-TEST scope docs/19. Unprepared passage prep/preview partial; explicit clipped-text warning, uncertain UI mutation/readback/translation completion. No raw screenshot/verse text persisted or published. Real sermon source still absent; timestamp alone is not audio evidence.

## Sermon pilot source/results — 2026-11-17
- SRC-43: IFC user-provided YouTube source https://www.youtube.com/watch?v=VbZV38kZjBg , title Sunday Service || November 15th, 2026, channel Immanuel Fellowship Church, upload2026-11-16, duration7961s, public; metadata accessed via existing yt-dlp2026.10.26 after web fetch failed. Explicit user start4690s overrides link2821s. Local300s sample acquired, automatic captions only as unverified annotation aid. Real-recording batch pilot measured but accuracy/live latency unscored, see docs/20. No raw transcript/media published.
- SRC-44: ggml-org whisper.cpp https://github.com/ggml-org/whisper.cpp/releases/tag/v1.9.5 and linked official build https://github.com/ggml-org/whisper.cpp/releases/tag/b5454 , accessed2026-11-17, V-DOC/V-TEST diagnostic artifact. Official CPU x64 ZIP SHA256 matched published release asset digest before execution. Latest source release had no direct binary assets; linked b5454 build used. No production dependency choice implied.
- SRC-45: Converted Whisper model maintainer https://huggingface.co/ggerganov/whisper.cpp , accessed2026-11-17, MIT-labelled model card and published base.en SHA1 matched. SHA256 recorded in docs/20. Local model/CPU inference used only for the explicitly supplied diagnostic; no cloud inference/provider account or paid service selected.

## Streaming diagnostic sources — accessed2026-11-17
- SRC-46, ggml-org pinned server example README: https://raw.githubusercontent.com/ggml-org/whisper.cpp/v1.9.5/examples/server/README.md . V-DOC: local WAV multipart /inference, host/port, nonadmin/sandbox guidance. README help contains -nc which actual diagnostic binary rejects; installed behavior recorded, not silently assumed compatible.
- SRC-47, ggml-org pinned server source: https://raw.githubusercontent.com/ggml-org/whisper.cpp/v1.9.5/examples/server/server.cpp . V-DOC: no_context defaults true and applied to inference parameters. Used to resolve -nc discrepancy; no user transcript/model prompt sent in research request.
- SRC-48, b5454 installed whisper-stream/server help plus local measured replay and private summaries, observed2026-11-17. V-TEST within docs/21 scope: fixed samples, fourCPU/noGPU, simulated arrival/cold startup and separate model-resident requests; no live microphone/output/gold accuracy acceptance. Public sanitized metrics docs/evidence/replay-stt-metrics.json; raw transcripts/models/audio remain ignored.

## Development implementation sources — accessed 2026-11-17
- SRC-49: Electron, Security, https://www.electronjs.org/docs/latest/tutorial/security ; Context Isolation, https://www.electronjs.org/docs/latest/tutorial/context-isolation ; IPC, https://www.electronjs.org/docs/latest/tutorial/ipc . V-DOC; local trusted renderer, sandbox/isolation and narrow IPC baseline. Runtime tests are scoped in docs/22, not vendor guarantees.
- SRC-50: Electron, Application Packaging, https://www.electronjs.org/docs/latest/tutorial/application-distribution . V-DOC; documented manual resources/app layout and rebranding. Used after removing unnecessary packaging framework/advisories; unsigned development artifact only.
- SRC-51: Microsoft Playwright, Electron API, https://playwright.dev/docs/api/class-electron . V-DOC; experimental Electron launch/window/evaluate testing. Development smoke tests touch only this application's interface; native ProPresenter helper runtime not verified.
- SRC-52: ggml-org whisper.cpp license, https://raw.githubusercontent.com/ggml-org/whisper.cpp/v1.9.5/LICENSE ; OpenAI Whisper license, https://raw.githubusercontent.com/openai/whisper/main/LICENSE . V-DOC; upstream notices preserved under legal/ and optional verified offline package. No paid Bible text bundled.
- SRC-53: Public npm registry package metadata and online audit, accessed locally 2026-11-17. Electron45.3.3 and Playwright1.65.1 pinned in package-lock.json. Initial packaging framework produced11 advisory-chain findings; removed it. Reduced dependency set audit returned0 findings. Scope: advisory snapshot, not independent vulnerability/rights attestation.
- SRC-54: ggml-org pinned audio reader, https://raw.githubusercontent.com/ggml-org/whisper.cpp/v1.9.5/examples/common-whisper.cpp . V-DOC: stdin branch exists; actual installed b5454 WAV-stdin attempt timed out at20s under uncontrolled concurrent packaging load after reporting bytes read. No stdin production capability/performance pass inferred; tested transient-file transport retained.
- SRC-55: Model Context Protocol, Tools, https://modelcontextprotocol.io/specification/2025-11-25/server/tools . V-DOC: tools interface and human-denial/confirmation recommendations. User requested MCP or API; this build implements private HTTP API, not a claimed MCP server.
- SRC-56: Microsoft .NET UI Automation documentation discovery URLs https://learn.microsoft.com/en-us/dotnet/framework/ui-automation/use-the-valuepattern-and-textpattern-classes and https://learn.microsoft.com/en-us/dotnet/api/system.windows.automation.automationelement.setfocus . REQUIRES VERIFICATION: web reader could not retrieve these pages. Existing local .NET compiler/UIAutomation assemblies compiled the preparation-only helper; compilation is not runtime evidence. Direct authorized computer-use preparation Luke15:11-13 observed separately; see docs/23.

## Native verification, metadata and acceleration — accessed 2026-11-17
- SRC-57: Microsoft UI Automation threading, https://learn.microsoft.com/en-us/windows/win32/winauto/uiauto-threading ; caching, https://learn.microsoft.com/en-us/dotnet/framework/ui-automation/caching-in-ui-automation-clients . V-DOC: MTA client thread and cached properties inform helper implementation. Three successful preparation receipts are local V-TEST only; see docs/24 and evidence/native-preparation-results.json. Not proof of theme/physical output fidelity.
- SRC-58: Microsoft SendInput, https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-sendinput ; KEYBDINPUT, https://learn.microsoft.com/en-us/windows/win32/api/winuser/ns-winuser-keybdinput . V-DOC: Unicode injection and input structure. Implementation is constrained to validated Bible preparation, not an arbitrary keyboard API.
- SRC-59: openbibleinfo Bible-Passage-Reference-Parser, https://github.com/openbibleinfo/Bible-Passage-Reference-Parser . V-DOC and pinned npm 4.0.0 build-only dependency. MIT license copied verbatim; generated KJV numeric metadata checked for 66 books/1,189 chapters/31,102 verses. No Bible text or runtime parser rules bundled. Other translations are not assigned KJV bounds.
- SRC-60: Authorized personal Windows native preparation and independently observed ProPresenter UI, 2026-11-17. V-TEST scoped to docs/24. Three 0.2.3 successful review receipts, prior timeouts, clipped text and one unintended manual disconnected-test clear retained. No physical output or concurrent-media acceptance.
- SRC-61: ggml-org whisper.cpp official b5454 release https://github.com/ggml-org/whisper.cpp/releases/tag/b5454 and NVIDIA support https://github.com/ggml-org/whisper.cpp#nvidia-gpu-support . V-DOC/V-TEST: CUDA11.8 archive matched published SHA256 e81c86c542be6e3d7b7245392d4e1c52ab6e5c61dbe38721754bc0ab59d4d027. Initial diagnostic reported CPU only despite GPU request. Private diagnostic, not bundled accelerator or performance pass.
- SRC-62: NVIDIA compatibility https://docs.nvidia.com/deploy/cuda-compatibility/latest/minor-version-compatibility.html and public CUDA11.8 component manifest https://developer.download.nvidia.com/compute/cuda/redist/redistrib_11.8.0.json . V-DOC: runtime/driver compatibility and official cuBLAS11.11.3.6 Windows asset digest 67b0934a6359e4ee26fff823c356021589d392c4fd49ca12624f570edc08e2b9. Workspace-only diagnostic asset, no driver installation; redistribution licensing review still required before packaging these libraries.
- SRC-63: ggml-org pinned server implementation https://raw.githubusercontent.com/ggml-org/whisper.cpp/v1.9.5/examples/server/server.cpp , accessed2026-11-17, V-DOC/V-TEST within docs/27 scope. Reviewed memory WAV read without conversion, prefixed health/inference/load routes, loopback bind and no_context default. Actual installed b5454 help supports --request-path and two production-class resident fixture requests succeeded. No raw audio/transcript or worker route exported. Process-bound local capability is not a secure boundary against same-user process inspection. Source review is not a full dependency/security audit.
- SRC-64: Maintainer tiny.en metadata https://huggingface.co/api/models/ggerganov/whisper.cpp?blobs=true and asset https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.en.bin , accessed2026-11-17. V-DOC/V-TEST:77,704,715bytes, SHA256921e4cf8686fdd993dcd081a5da5b6c365bfde1162e72b08d75ac75289920b1f matched before execution. Diagnostic-only eight-request comparison in docs/28; no accuracy/target latency or default replacement claim. License provenance SRC-45.
- SRC-65: Microsoft System.Speech SetInputToWaveFile https://learn.microsoft.com/en-us/dotnet/api/system.speech.recognition.speechrecognitionengine.setinputtowavefile?view=netframework-4.8.1 and DictationGrammar https://learn.microsoft.com/en-us/dotnet/api/system.speech.recognition.dictationgrammar?view=netframework-4.8.1 , accessed2026-11-17, V-DOC. Installed en-US Microsoft Speech Recognizer8.0 and four successful ordinary-process WAV-only runs are V-TEST scoped in docs/32. Restricted-process engine construction failed; no Windows settings changed. Four texts yielded no current-parser reference proposals; no independent accuracy or compatibility promise.
