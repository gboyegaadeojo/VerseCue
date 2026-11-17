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
