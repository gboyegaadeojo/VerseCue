# Private API and experimental host-local Bible bridge

2026-11-17. Development version 0.2.0. **P0 PENDING; no native-helper runtime or live-service release pass claimed.** User requested a private MCP/API for this personal use case and instructed continued building. This adds a local authenticated VerseCue API and an experimental Windows Bible-preparation adapter. It is not a new vendor-supported ProPresenter Bible API.

## What a private API can do

An API/MCP can expose our own reliable commands and safety rules. It does not itself supply a missing ProPresenter operation. The implemented bridge has two layers:

1. **VerseCue private API:** loopback HTTP interface for status, reference-review submissions, emergency stop and separately enabled confirmations of already verified prepared cues. This transport and safety gate have automated tests.
2. **Experimental Windows preparation adapter:** uses Windows UI Automation and narrowly constrained keyboard input to enter a canonical reference in ProPresenter's existing Bible view. It preserves ProPresenter as text/presentation authority and does not click a Bible cue live. This adapter compiled successfully; native runtime completion/focus behavior still requires supervised verification.

MCP can later call the same interface. We have implemented the API option requested, not claimed an MCP server exists. MCP's tool transport would not remove the native preparation/fidelity/concurrency obligations.

## Actual new investigation and test evidence

- Using the authorized computer-use interface on the personal Windows ProPresenter 21.4.2 instance, selected the existing Bible reference field, used Ctrl+A, typed **Luke 15:11-13**, then Enter. The screen showed five new Luke preparation cues. The existing output preview remained the prior Philippians passage. No cue click, Clear, theme/Look edit, Save As, translation change or live-output trigger occurred.
- Subsequent accessibility text still lagged the visible preparation and continued to expose clipping warnings. This supports trying controlled keyboard preparation but does **not** establish deterministic completion or formatting fidelity.
- Native C# helper compiled with the existing Windows .NET compiler and UI Automation libraries; no SDK installation, administrator privilege, permission change or native UI operation was performed by the compile.
- Automated helper-adapter tests use controlled fake child processes: platform/input validation, fail-closed receipts, cancellation guard and no formatting/output-verification overclaim. They are not native HIL tests.
- Private API tests cover authentication, loopback binding, Host/Origin validation, body/schema limits, disabled unsafe routes, reference deduplication, emergency stop, confirmation matching, revoked-token guards, optional preparation dispatch and token rotation. All **108 current Node tests passed**.
- Desktop smoke test exercised API enable/disable and unauthenticated rejection without clipboard access, microphone capture or ProPresenter writes. Final packaged checks are recorded in the development evidence file after rebuilding.
- A computer-use launch of the new native-preparation build required tool-level app approval and **timed out**. No native-helper runtime test followed that gate. This is separate from the user's recorded general project approval; it must not be described as a failed Bible-preparation test or a P0 pass. The app/control is available for supervised review.

## Turning on the private API

The API is **off on every startup**. In the full VerseCue window, use the Private local API panel:

1. Leave optional output/preparation checkboxes off for ordinary review-only use.
2. Click **Enable private API**. The panel shows `http://127.0.0.1:<session-port>`.
3. Click **Copy session token** only when configuring a trusted local client. The token is 32 random bytes encoded as 64 hex characters, lives in process memory, and is never included in settings, diagnostics or status responses. Copying intentionally puts it on the clipboard; clear that clipboard after client setup.
4. Authenticate requests with `Authorization: Bearer <session-token>`. Do not put tokens in URLs or commit them in scripts/configuration.
5. **Disable and revoke token** closes connections and revokes outstanding authorization before waiting for completion. Re-enabling generates a new token. Closing VerseCue also stops the API.

No public/LAN listener, firewall change, cloud provider, account, persistent API key or network discovery is added. A future LAN companion needs a separately reviewed authentication/transport design; do not expose this loopback service through port forwarding or a proxy.

## Endpoints

All routes require the bearer token and exact loopback Host header. Requests with a browser Origin are denied; no CORS access is granted. Bodies use `application/json` with a 16 KiB transport cap, narrower field limits and a 60-request/minute limit; authenticated emergency stop is exempt from that rate limit. No endpoint accepts arbitrary shell commands, executable paths, UI coordinates, API target changes or raw keyboard actions.

| Method/path | Body | Effect and safety boundary |
|---|---|---|
| GET `/v1/status` | none | Safe mode/connection/candidate count/capability summary; no token, audio, raw transcript or target address |
| POST `/v1/references` | `{"text":"John 3:16","requestId":"my-request-1"}` | Adds canonical review suggestions to the shared UI; zero output requests. Optional request ID deduplicates within bounded session revision memory; not server-global exactly-once delivery |
| POST `/v1/passages/review` | `{"candidateId":"<returned-id>"}` | Uses the desktop passage coordinator to resolve an existing exact saved passage for review. Requires Confirm/Suggest-only, current candidate, authenticated session and an available workspace window. Returns review/ambiguity/preparation-needed state and permitted saved text; zero output. No focus/copy consent, selection override, arming or confirmation accepted. Native preparation and passage output remain deliberate desktop actions |
| POST `/v1/stop` | `{}` | Same emergency-stop latch as desktop; cancels pending preparation/recognition and disarms output. Cannot retract an accepted output; cannot rearm remotely |
| POST `/v1/send` | `{"candidateId":"<returned-id>","confirmReference":"John 3:16","confirm":true}` | Disabled by default. Explicit API-output opt-in still uses normal Confirm/TTL/stop/duplicate/target/mapping/readback gate. Dry run remains simulation. No API can arm the target or Auto |
| POST `/v1/prepare-passage` | `{"reference":"Luke 15:11-13","translation":"KJV"}` | Returns 501 unless experimental preparation was separately enabled and the helper is available. When enabled, checks local installed profile, pauses VerseCue/disarms output, then attempts Bible preparation only. Returns operator-review status; never formatting or physical-output success |

Unknown arm/rearm/Auto/clear/configuration routes return 404. Invalid authentication 401; invalid Host/Origin or disabled API output 403; invalid input 400/413/415; stale/blocked operation 409; rate limit 429; unavailable preparation 501. Side-effecting operations have no automatic retry. A disconnected response cannot prove that no preparation happened: inspect ProPresenter before any intentional repeat.

The passage-review route is available only when status advertises `savedPassageReview`. It is separate from the older experimental native preparation route and does not claim arbitrary Bible lookup. It returns the same actual saved text/review flags as the workspace, so treat responses as private transient data and do not persist or redistribute licensed Bible text. It uses the shared operation lock and reference/target guards. Revocation cancels outstanding review; reloading/closing the owning workspace invalidates its review and revokes the API even without microphone capture. There is no HTTP passage-confirm endpoint, and the legacy send route cannot bypass internal passage-part proof. Source tests use a synthetic target and intercept the test app's token-copy sink without reading or writing the OS clipboard.

For a trusted script, set `VERSECUE_API_URL` to the displayed literal loopback URL and `VERSECUE_API_TOKEN` in that client's temporary environment, then use:

```text
node scripts/private-api-client.cjs status
node scripts/private-api-client.cjs reference "John 3:16"
node scripts/private-api-client.cjs prepare "Luke 15:11-13" KJV
node scripts/private-api-client.cjs stop
```

The client validates loopback URL/token shape, does not accept the token as a command-line argument, refuses redirects and has a finite timeout. Environment variables remain accessible to processes with sufficient local privileges; this is a trusted-user-machine development interface, not a multi-user security boundary. No token is provided in this document.

## Experimental native preparation: exact scope

Build helper: `node scripts/build-windows-bridge.cjs`. It uses the existing Windows .NET compiler and references, writes only `native/bin/VerseCue.BibleBridge.exe` (Git-ignored), and does not run it. Packaging copies that helper into `resources/native/` if present. No native Mac helper is implemented; controls report unavailable there.

Before a manual experimental preparation attempt:

1. Use the authorized personal disconnected test host. Open the ProPresenter **Bibles** view yourself and select the expected installed translation. The helper refuses to select/substitute a translation.
2. VerseCue must target local `127.0.0.1`; the installed API must identify Windows **ProPresenter 21.4.2**. Other versions/topologies are deliberately blocked pending a new profile review.
3. In the experimental panel, acknowledge that preparation moves focus. Enter one exact canonical reference and click **Prepare in ProPresenter · no output**. This action pauses listening and disarms output first. For an API client to do the same, separately check experimental API preparation before enabling the API.
4. Inspect the result in ProPresenter. Any clipping warning, translation mismatch, missing cue or uncertain completion requires manual review. VerseCue stays paused/dry-run; no cue is triggered, no mapping is trusted automatically, no theme is changed, and no Auto arming is possible.

The helper checks one running installed ProPresenter process, expected Program Files executable, visible enabled Bible controls, one translation selector, current translation name, target focus before each constrained input, exact field readback and repeated matching preparation labels. It excludes SendKeys metacharacters and arbitrary commands. Completion is bounded to five seconds after Enter; the owner process has an eight-second total timeout and no retry. Stop/revoke kills the owned helper where possible. Already typed preparation cannot be undone automatically.

Residual risks remain: UI Automation calls can hang until process termination; other operators can race focus checks; accessibility labels may be stale; profile IDs/text vary by version/localization; clipping-warning absence is not a clean-formatting guarantee; current readback is not exact verse-text or physical-screen observation. Return values always retain `formattingVerified=false` and `outputObserved=false`. Helper runtime/fault/scaling/Companion tests and Mac parity remain PENDING. Do not promote this to a supported vendor route or unattended service output.

## Launch incident record

The user showed an `electron.exe` breakpoint dialog (0x80000003). The initial test-launch log independently recorded a fatal Windows Electron sandbox/read-access failure; this likely explains that dialog, although the screenshot alone does not identify a process ID. Running the ordinary desktop test outside the restricted command sandbox passed without disabling Electron sandboxing or changing ACL/security settings. Source startup also encountered inherited `ELECTRON_RUN_AS_NODE`; `scripts/start.cjs` now clears that flag for the GUI child. It keeps speech/native helpers hidden but does not hide the interactive product window. No crash-free release/soak claim follows from these fixes.

The existing P0 matrix, original requirements and release blockers remain required. This private integration is concrete development work for the user's use case, with tested transport and an explicitly experimental host-local preparation implementation.
