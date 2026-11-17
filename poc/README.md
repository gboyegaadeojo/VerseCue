# Disposable feasibility diagnostics

**THROWAWAY DIAGNOSTIC — NOT PRODUCTION CODE.** Not an application scaffold or connector implementation. Authorized personal ProPresenter test instance only; P0 remains pending. Do not aim at IFC production or scan a LAN.

## Read-only inspection
Prerequisite: Windows PowerShell with .NET HttpClient and ProPresenter already running, Network already enabled. No installation, secret or network-setting change required. Port must be read from the authorized app's Settings; personal test port observed 1025 on 2026-11-17. Loopback hosts only, redirects disabled, 3-second timeout, no retry. Some API GETs mutate state, so only explicit read paths are accepted.

Node.js alternative (used successfully on the test host without changing PowerShell execution policy):
```powershell
node ./poc/inspect-propresenter.mjs /version 1025
node ./poc/inspect-propresenter.mjs /v1/libraries 1025
node ./poc/inspect-propresenter.mjs /v1/status/slide 1025
```

PowerShell variant, only if scripts are already permitted by the host's policy (the personal test host rejected this variant; no policy changed):
```powershell
& ./poc/Inspect-ProPresenter.ps1 -Port 1025
& ./poc/Inspect-ProPresenter.ps1 -Port 1025 -Path /v1/libraries
& ./poc/Inspect-ProPresenter.ps1 -Port 1025 -Path /v1/status/slide
```

Script never triggers, focuses, clears, edits assets, or changes settings. Version output excludes personal host name; slide status excludes verse text/notes. Other read paths can include private configuration/asset names: review output, do not redirect raw results into Git or share without redaction. No persistent audio/transcript/secret/Bible text. Timing is HTTP-only, never end-to-end recognition/output latency. Failure stops without fallback.

Any future trigger driver requires its own explicit write opt-in, inspected presentation/cue identity and run instructions, plus documented user authorization. Inspect all slide/macro actions before triggering. No blind retry after uncertain completion. Current script has no write mode.

## Authorized saved-passage trigger driver
`trigger-test-passage.mjs` is a separate disposable driver for the two Bible-UI-created KJV test presentations inspected on this personal ProPresenter 21.4.2 Windows installation. Hardcoded UUIDs are fixture identifiers, not secrets. It does not accept arbitrary hosts/UUIDs/macros, does not clear anything, and never retries. It reads identity and saved cue before a single trigger; expected verse text stays transient and is not printed/saved. Hash/length/match flags are readback evidence, not physical audience proof. No timeline/media was running in initial baseline; this does not test non-interruption of running media.

Default no-network dry-run:
```powershell
node ./poc/trigger-test-passage.mjs john 0
node ./poc/trigger-test-passage.mjs romans 0
```
Only within the user-authorized personal non-live test session:
```powershell
node ./poc/trigger-test-passage.mjs john 0 --send-authorized-personal-test
node ./poc/trigger-test-passage.mjs john 1 --send-authorized-personal-test
node ./poc/trigger-test-passage.mjs romans 0 --send-authorized-personal-test
node ./poc/trigger-test-passage.mjs romans 1 --send-authorized-personal-test
```
Both verses are split across two cues by the existing template. Observe actual preview/output separately after each cue. The flag is intentional dispatch for a connector diagnostic, not a production Confirm/Auto policy implementation. In a different installation this driver's fixture checks must fail; inspect/review new fixtures rather than disabling checks. Unknown/lost response: stop, inspect actual state, do not blindly repeat. Saved-passage triggering does not prove arbitrary new Bible lookup or P0 pass.

Installed documentation inspection:
```powershell
node ./poc/inspect-propresenter.mjs /v1/doc/index.html 1025
node ./poc/inspect-propresenter.mjs /v1/doc/swagger.json 1025 --save-schema
```
The optional save flag stores the documentation schema only under docs/evidence. Resource reads accept only exact UUID library/presentation paths, never trigger/focus/clear suffixes. Other read output may include private asset names; do not publish raw dumps.

## Real sermon speech diagnostics (offline, no output control)
All three scripts below are **THROWAWAY DIAGNOSTIC — NOT PRODUCTION CODE** and accept only this pilot's fixed private paths. No ProPresenter connection/send, live microphone capture or cloud upload. Prerequisite: user-provided service source, authorized local evaluation, 300-second PCM mono/16-kHz sample from 01:18:10, verified official tool/model in ignored poc/private/. Actual source/tool/hash/measurement details: docs/20-sermon-audio-pilot.md. Raw audio/transcripts/logs remain ignored; cleanup review due 2026-11-24, no automatic scheduler.

- `inspect-sermon-captions.mjs`: extract 4,690–4,990-second automatic-caption events to private JSON, report lexical reference hints. After full-service staging-caption cleanup, reads the existing private window instead. Automatic captions are not ground truth. Reacquisition is not automatic.
- `run-local-stt-diagnostic.mjs`: verify official release archive SHA256/model SHA1, run fixed five-minute sample with local whisper-cli/base.en, 4 CPU threads, no GPU, timeout 240 seconds; save only private transcript/log/metrics and print content-free run metrics. Offline batch throughput is not streaming/reference-to-output latency. It does not download/install tools/models or select an application backend.
- `spot-check-sermon-references.mjs`: inspect a few observed ordinal/chapter/range forms in private STT output, write private review flags; not a general Bible parser, no gold labels or accuracy score and never Auto eligible.

Run after the private prerequisites have been prepared:
```powershell
node ./poc/inspect-sermon-captions.mjs
node ./poc/run-local-stt-diagnostic.mjs
node ./poc/spot-check-sermon-references.mjs
```
Official diagnostic sources: https://github.com/ggml-org/whisper.cpp/releases/tag/b5454 and https://huggingface.co/ggerganov/whisper.cpp . Do not use arbitrary executable/model replacements or commit these large assets. The source supplied by user is https://www.youtube.com/watch?v=VbZV38kZjBg ; explicit start 1:18:10 overrides its link timestamp 47:01. Do not bypass video access controls or use browser cookies/credentials to fetch it. Existing speech sample/hash prevents silent source substitution; no synthetic audio counted as real evidence.

Four private WAV excerpts and a content-free public manifest were derived; see docs/test-data/real-recording-pilot-manifest.json. Expected labels remain null pending independent listening. Do not change the 66 existing synthetic corpus rows to REAL-RECORDING.

## Bounded arrival replay and persistent-model comparison
`replay-stt-windows.mjs` is **THROWAWAY DIAGNOSTIC — NOT PRODUCTION CODE**. Uses only existing private clips1/2/4, verified pinned base.en/official archive, four CPU threads/noGPU. Simulates2-second audio arrival with <=12-second windows, minimum6-second initial window, drops older scheduled windows when processing falls behind, appends2–3seconds explicitly synthetic silence at clip end. Each cold CLI invocation is bounded20seconds; no microphone, network service, ProPresenter or actual output. Raw windows/transcripts/summary are ignored under recordings/replay-private/. Machine-derived audible-end proxies are unverified; lag fields are not live audible-end latency. A repeated no-hint is not a stable candidate; only a qualifying proposal may count as repeated (the initial run recorded raw equal no-hints; reporting must not count these as valid stability).

`compare-warm-stt.mjs` keeps the same official model loaded in an owned disposable whisper-server, bound **127.0.0.1:58173 only**. Refuses occupied port; empty private public directory, no FFmpeg conversion or model-load request, no administrator elevation. Only the same eight private WAV windows are posted to documented /inference. Model/archive hashes verified, requests bounded20seconds, full process bounded180seconds, server killed/exit verified in finally. No remote audio upload or ProPresenter call. Per-request texts stay private; public summaries contain timing and narrow diagnostic hints only. Pinned server source defaults no_context=true; actual binary does not accept -nc, so do not add it based on older README help. Backend defaults differ from CLI, so cold/warm comparison is exploratory rather than a pure controlled startup-cost experiment.

```powershell
node ./poc/replay-stt-windows.mjs
node ./poc/compare-warm-stt.mjs
node ./poc/compare-warm-stt.mjs --beam1
```
Run sequentially; the second requires the fixed eight-window baseline from this pilot. The optional fixed --beam1 switches requested beam/best-of1 instead of5 and writes separate private results. This is a development-sample speed/quality investigation, not a backend/architecture choice, live streaming interface, probability calibration or acceptance test. No data/code from these probes belongs in a production module.
