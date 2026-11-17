# VerseCue development application and release status

2026-11-17 UTC. **Development application implemented under the user's later explicit build authorization. P0 PENDING; full specified MVP and live-service release NOT COMPLETE.** This document supersedes earlier statements that application implementation is unauthorized. It does not change any of the 62 functional or 24 non-functional requirements or turn unperformed tests into passes.

## Authorization and architecture decision

The user instructed: “Continue building non stop untill you complete the application, you are approved.” This later direct instruction authorizes application implementation despite the earlier documentation-only restriction. Existing authorization covers private GitHub source publication and supervised personal Windows ProPresenter tests. Church production-host access, purchases, cloud speech, signing-account enrollment and service output remain outside that scope.

Electron 45.3.3, plain local HTML/CSS/JavaScript, Node core modules and local whisper.cpp are selected for this **development implementation**. Node is installed; Rust is absent. This permits building and testing a desktop application here without silently installing a Rust toolchain or committing to an unproven UI-automation connector. Prior Tauri recommendations remain historical contingent recommendations, not the implemented framework. There is no browser-server deployment, cloud speech or separate audience presentation engine. Source-level modules remain independent of the desktop shell.

The official Electron security/context-isolation/IPC and manual-distribution documentation were reviewed; sources are in RESEARCH_SOURCES.md. Runtime renderer uses context isolation, process sandboxing, no Node integration, restrictive CSP, no HTTP access, no external navigation/windows/webviews, explicit trusted-main-frame IPC and main-process private-address-only ProPresenter requests. Secrets/cloud providers are absent rather than stored in plaintext. This is an implemented security baseline, not an independent penetration-test pass.

## What is implemented

Current continuation: source0.2.5 supersedes the historical baseline below. See [native/reference validation](24-native-bridge-verification-and-validation.md), [GPU investigation](25-gpu-speech-diagnostic.md) and [bounded capture](26-bounded-audio-capture.md). All124 tests and source desktop smoke passed. The0.2.4 checkpoint ZIP verified115files,315,757,010bytes, SHA256 `ee66c4f50f64d396fb69c5ded84219f4ff3e34a56ffe8a5f7e6b5028c5ab39fc`; packaged desktop and private fixture speech passed (9,492ms under uncontrolled load). That artifact predates the0.2.5 capture change. Native runtime preparation is now partially verified, exact KJV verse bounds are bundled without verse text, and capture now buffers during inference with bounded explicit drops. Full acceptance remains pending; original baseline details below are historical where these supplements supersede them.

| Area | Actual development behavior | Limits |
|---|---|---|
| Full/compact desktop | Booth-sized candidate, mode/target/connection/audio labels, setup, focused native button keyboard activation, shared compact state, always-on-top compact, emergency stop | VoiceOver/NVDA and Mac behavior pending; no global hotkeys |
| Manual reference review | Named books, spoken numbers/ordinals, aliases, explicit chapter/verse/ranges, common translation names, corrections, multiple ordered candidates, context resolver | Exact per-translation verse counts are not bundled; standalone parser result is not canonical/text verification |
| Candidate safety | Confirm startup, dry-run startup, Suggest-only/Paused, stop latch/rearm, 15-second TTL, max-five queue, dismiss/revisions, duplicate cooldown, max-20 memory history/review again, edit-before-send | Auto deliberately unavailable; no calibrated confidence claim; comprehensive real speech/intent dataset pending |
| Dispatch | Single in-flight command, stop/revision/expiry recheck after asynchronous preflight, no automatic write retry, uncertain receipt pauses/disarms | A command already accepted cannot be retracted; external controller race still exists |
| ProPresenter | Read-only version test, literal private IPv4 configuration, optional supervised exact prepared-cue mapping, version/presentation-fingerprint check before trigger, receipt/readback distinguished from output observed | No arbitrary Bible lookup; one mapped cue is not full passage/range navigation; map does not establish IFC physical fidelity. No OS automation, macro creation, import, library changes or broad Clear |
| Connection monitoring | After explicit connection test only, version reads every two seconds with a two-second request timeout; failure/version change pauses/disarms; recovery needs intentional rearm | Simulated tests do not prove NFR outage timing or true instance identity. No network scan/discovery |
| Audio | Explicit selected device/channel, local permission request, AudioWorklet mono 16 kHz windows, live level/clipping/no-signal status, stop/hotplug handling | Actual MOTU/Mac permissions and sustained driver behavior untested; simple downsampling/VAD are developmental |
| Speech | Offline bounded CLI worker, four threads/no GPU, English/beam one, max 12-second window, 20-second timeout, no backlog while busy, cancellation, temporary WAV removed in finally, no transcript files | Cold model load per window; drops incoming audio during inference and visibly warns. Not true continuous streaming/acceptance quality. Crash/power loss can leave temporary audio in OS temp; see privacy limits |
| Setup/settings | Local schema-validated settings, atomic replace, one backup, corrupt-file safe recovery, nonsecret import/export strips local worker/device paths, import cannot arm output, settings return to dry run | One active configuration; named multiple profiles not implemented; no credentials/provider keys are supported |
| Diagnostics/privacy | Up to 100 in-memory event codes/times; explicit preview/save of content-free diagnostics; no telemetry/upload, no default transcript history on disk | Logs are memory-only rather than persistent seven-day rotating files. No recording-retention opt-in feature shipped |
| Packaging | Local Windows portable folder/ZIP with integrity manifest, runtime notices, optional verified speech/model bundle | Unsigned development ZIP, not signed installer. Mac packaging script must run and be verified on Mac; Mac signing/notarization remain pending |

## Running the application

For the local Windows package, extract **the entire ZIP** and run `VerseCue.exe` inside its folder. Do not copy only the executable. The package is intentionally an unsigned development build and must not be used to drive a live service. Do not bypass operating-system security warnings to run it; use the source developer workflow if organizational policy requires trusted signing.

Source workflow on the current Windows machine:

```text
npm.cmd ci --cache .cache/npm
node node_modules/electron/install.js
npm.cmd start
npm.cmd test
npm.cmd run check
npm.cmd run test:desktop
```

On macOS use `npm` instead of `npm.cmd`, install the native matching Electron runtime, and separately build/select a trusted native whisper.cpp CLI/model. The Windows speech archive cannot run on Mac. No Mac runtime or OS test was performed here.

1. Open Setup. Save the desired ProPresenter private IP/port and default installed translation. Saving returns to dry run and invalidates prepared mappings. A read-only connection test can run without changing output.
2. Request audio permission/refresh inputs yourself. Choose the physical pastor feed and channel (MOTU M4 as appropriate), save, and confirm authorization before Start listening. No capture occurs at application startup.
3. The optional Windows bundled speech engine/model are detected locally; no download or cloud inference occurs at runtime. Advanced setup permits choosing a trusted native CLI/model. Do not select an untrusted executable.
4. Type `John 3:16` or speak an explicit reference. Review the card and click **Simulate passage** in dry run. Simulations make zero output requests and do not establish real remote passage context.
5. Supervised output testing only: in ProPresenter's own Bible UI prepare/save the exact passage with the installed translation/theme/Looks. Verify its actual content, note presentation UUID and zero-based cue, and map the exact reference/translation in Setup. A map expires for practical purposes when the presentation fingerprint/version changes or settings reset.
6. Acknowledge the authorized disconnected test target and explicitly arm test output. **Show prepared test cue** sends only the mapped cue, with no arbitrary lookup or silent translation substitution. If readback is uncertain, inspect ProPresenter and retest/rearm; no automatic retry.
7. Emergency stop/Escape latches Paused and blocks new dispatch. It never clears existing audience layers. Intentional rearm returns to Confirm. End with Reset session to remove transient suggestions/history and return to dry run.

## Verification actually performed

| Evidence | Result | Scope |
|---|---|---|
| Node regression suite | 108/108 passed in the latest recorded run | 66 synthetic corpus reference expectations plus parser/session/connector/settings/audio-boundary/private-API/native-adapter safety checks. Native adapter tests use fakes, not native HIL. No accent/precision/recall claim |
| Source desktop smoke | Passed | Startup, manual card, simulation, receipt wording, stop/rearm, setup, sandbox/isolation/no Node, compact cross-window stop, zero renderer HTTP requests |
| Worklet smoke | Passed, **SYNTHETIC** | Silent internal oscillator to zero-gain destination, worklet PCM transport only; no microphone capture or audible playback |
| Zoom check | Passed | Full-window no horizontal overflow at 200% CSS zoom; screen-reader/complete accessibility UAT pending |
| Local speech integration | Passed | Authorized 12-second pilot window → production worker → nonempty transcript → review session, 3,552 ms measured request, zero sends, temporary WAV removed. One sample, not real live audible-end latency or accuracy score |
| Packaged Windows smoke | Passed for final 0.2.0 package | Controls/worklet/zoom, API enable/disable and unauthenticated rejection, bundled worker/model detected, zero page errors/renderer HTTP requests. Native preparation not invoked |
| Online npm advisory audit | Zero advisories after removing packaging framework | 16 total dependency inventory entries including root; exact pinned dependencies/integrity in lockfile. Build originally reported 11 packaging-chain advisories; unnecessary framework removed, not ignored or auto-force-downgraded |
| JavaScript syntax | Passed | Application/core/UI/scripts/tests |
| Personal/live ProPresenter output this implementation turn | Not executed | Prior docs/18–19 partial evidence remains; new connector mutation tests used controlled fakes only |

Private screenshots, test profiles and raw test outputs stay under ignored `test-results/`. Only sanitized measurements/status may be committed. No real sermon audio/transcript or Bible database enters GitHub or the application package.

## Version 0.2.0 private integration update

User requested a private MCP/API for this use case. An authenticated, disabled-by-default loopback API and compiled experimental Windows Bible-preparation helper are now implemented; [exact API/native scope, usage and evidence](23-private-api-and-experimental-bible-bridge.md). This supersedes the earlier table's statement that no OS automation module exists: there is now an opt-in **preparation-only** module, not a verified arbitrary Bible output route. The direct authorized UI test prepared Luke 15:11–13 without changing output; accessibility lag/clipping persisted. The new native helper compiled but its runtime HIL test is pending after the computer-use app-launch approval timed out. No production-host access/output or P0 pass is inferred. The API cannot rearm, configure, clear or enable Auto; optional prepared-cue send still uses the single existing gate. API preparation pauses VerseCue and disarms output first.

## Packaging and privacy details

`npm.cmd run dist:win` builds a new versioned folder/ZIP using the official installed Electron runtime and optionally the existing approved speech assets. It refuses an existing output folder, preventing accidental recursive overwrites. Increment the version for a new package. It checks the official speech ZIP/model SHA256 values, extracts a fresh verified archive, copies only CLI/DLLs/model/notices, and removes the staging directory after an explicit containment check. No recordings/private transcripts or arbitrary poc folders are copied. Runtime timestamps in the newly built distribution are normalized to a ZIP-compatible date; content hashes are recorded separately.

Speech processing writes a transient PCM window into a randomized user OS-temp directory so the selected CLI can read it. Normal completion, error, timeout and cancellation attempt deletion in `finally`; the actual integration test verified successful removal. A hard OS/process crash can prevent that cleanup. This development implementation therefore does **not** claim crash-proof non-persistence; before service release, replace the file transport with verified memory/stdin/native streaming or add a restricted per-user temp store and reviewed crash cleanup. No default audio playback, recording archive or transcript file is created.

## Remaining release blockers and exact continuation

1. **FR-044/P0 arbitrary lookup:** demonstrate a supportable arbitrary book/chapter/verse/translation route that uses ProPresenter's genuine Bible interface/content. Finite prepared mappings do not satisfy this. The installed/public API investigation did not document a Bible lookup endpoint; controlled UI automation remains an unproven last-resort alternative with focus, stale identity and clipping findings. No hidden workaround is enabled.
2. **HIL fidelity/concurrency/recovery:** execute the existing docs/10 matrix on authorized representative Windows and Mac test machines, including required two passages plus unprepared range, real selected translation/text/theme, room/stream Looks, concurrent media, operator/Companion interference, recovery and output observation. Do not mark this complete from fake transport tests or the user's statement that computer output routes to screens.
3. **Speech/capture performance and quality:** independently label real audible reference ends and citations, add proper streaming/VAD/stabilization and efficient supported acceleration/model choice, measure full end-to-output segments under shared media load. Current simple worker drops audio while busy and cannot establish recall or latency requirements.
4. **Full safety/versification:** verified per-translation bounds, remote context provenance/invalidation, service-intent policy and calibrated holdout evidence; guarded Auto remains disabled until all hard predicates and unattended-display acceptance pass.
5. **Release engineering:** native Mac runtime/audio/automation if selected, Windows/Mac signed install/uninstall and clean-machine tests, crash temp cleanup, 90-minute and 3-hour soak, 10-hour unsafe-display test, screen-reader/volunteer UAT and remaining v1 requirements. A portable ZIP is a development artifact, not a substitute for these deliverables.

Implementation coverage is recorded per requirement in `implementation-coverage.json`. “Partial” means code exists for part of a requirement; “pending” means no acceptance claim. All original requirements, tests and staged documentation remain intact. No new approval is needed to continue independent local work already authorized; the missing representative environments and unresolved integration capability cannot be supplied by an approval alone.

## Final development artifact verification

Windows x64 version **0.2.0**, local `dist/VerseCue-0.2.0-win32-x64.zip`, **315,747,071 bytes**, SHA256 `0b47a939ee0a64327073e3879c3d82f020d29c3c03ef1c66e4d21db49a25bf7e`.112files verified against the package manifest; current core/desktop/UI/legal source matches the package. [Content-free verification evidence](evidence/development-build-verification.json) contains actual runtime versions, packaged smoke and fixture-worker results. Final bundled fixture request measured7,784ms while other development/build load was uncontrolled; no live latency/accuracy acceptance. Earlier3,552ms file-worker and5,794ms older-package results are historical measurements, not guaranteed speed. No raw fixture audio/transcript was packaged or published. Final online advisory check returned0findings. Unsigned development only; native helper runtime, physical output and full release remain unverified.
