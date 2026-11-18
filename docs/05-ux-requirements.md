# Volunteer experience and UI specification

2026-11-17. **Integration-dependent UI and output behavior is PROVISIONAL; P0 PENDING.** Screens below are ASCII design specifications, not a running application. FR-026–040/051/061 and NFR-015–017 govern acceptance. Layout examples use the actual installed translation label only after verification; `Selected Bible` is an explicit unknown, not a new Bible edition.

## Information architecture
Primary Live workspace: permanent target/mode/audio/connection strip, latest candidate, evidence and action region, emergency stop. Secondary panels: ordered suggestion queue and in-memory recent history (v1); manual reference/edit/navigation/translation controls (v1); compact window (v1). Setup/settings: input and channel, target/version/allowlist, translation/theme/Look expectations, test/dry-run, privacy, local model, safe defaults. Diagnostics: audio troubleshooting, connection troubleshooting and redacted export. Never display implementation logs/secrets on the primary volunteer flow; explain what the volunteer can do next.

## UX state/action matrix
| State | Operator sees | Permitted actions | Prohibited behavior |
|---|---|---|---|
| Setup incomplete | Not ready + named missing step; TEST banner | Configure/test without output | No armed Auto or implicit live test |
| Confirm/listening/healthy | Confirm, selected target/translation, mic meter | Review valid candidate, Show/Reject | No send solely from speech |
| Auto armed/healthy | AUTO armed in text/icon, target, stop control | Stop, pause, switch Confirm; policy may send fresh validated candidate | No ambiguous, relative-without-context, multi-reference or unverified-translation send |
| Suggest-only | Listening — suggestions only; Show disabled | Inspect/dismiss/edit; choose Confirm explicitly | No manual/Auto output commands |
| Paused | Not listening — paused; stale cards disabled | Preflight and resume Confirm | No audio capture or queued replay |
| Emergency stopped | STOPPED — all sends blocked; clear re-arm action | Continue manual ProPresenter; deliberate re-arm into Confirm after checks | No automatic clear, hidden sends or Auto resume |
| Degraded/offline/input lost | Separate connection/audio cause; candidate may be retained as expired visual context | Troubleshoot, manual ProPresenter; manual VerseCue search only if link valid and mode allows | No stale send; no false success |
| Receipt/readback only | Sent — output unconfirmed, with target/time | Inspect actual ProPresenter, reconcile | Do not label Live confirmed without observed output |

App restart begins Confirm only after setup/readiness; if capture permission/device fails it is Paused/not ready. Auto arming is session-only. In MVP unknown concurrency/translation/fidelity means Auto unavailable even if recognizer is confident. The optional Auto control cannot imply readiness before feasibility validation.

## Full window wireframe
```text
+--------------------------------------------------------------------+
| VerseCue                    TEST TARGET / DRY RUN        Settings    |
| Target: Booth Mac / PP 21   Connection: Connected (verified time)     |
| Input: MOTU M4 ch 1  [meter] Good signal   Listening   Mode: CONFIRM  |
+--------------------------------------------------------------------+
| Latest candidate                         Detected 2 s ago / 13 s left|
|                                                                    |
|                    JOHN 3:16                                       |
|                    Translation: Selected Bible                     |
| Source: "Please turn to John chapter three verse sixteen"           |
| Validated for review / No verse text available through verified path|
|                                                                    |
| [                 SHOW                 ]  [Reject]  [Edit - v1]     |
| Focus Show to use Space/Enter. Check reference and translation.      |
| Last action: No output request sent                                 |
+--------------------------------------------------------------------+
| Suggestions in time order (max 5)  | Recent (v1, memory only)         |
| Romans 8:28 — Needs review        | John 3:16 — receipt only          |
| [Review] [Dismiss]                | [Review for resend]              |
+--------------------------------------------------------------------+
| Manual reference (v1): [                       ] [Validate]          |
| [Suggest-only] [Pause listening]         [ EMERGENCY STOP ]          |
+--------------------------------------------------------------------+
```
Reference and translation are always prominent. Full verse preview is optional only if a licensed supported route supplies exact text; do not reconstruct from STT, download a replacement Bible, or leave misleading blank “loaded” text. Test banner remains visible in every window/modal. No user-facing Rust/API/error dump is needed to decide whether to Show.

## Compact window wireframe (v1)
```text
+--------------------------------------+
| VerseCue  TEST  [Open full] [Pin: on] |
| CONFIRM  Connected  Listening/M4 ch1  |
| JOHN 3:16 — Selected Bible           |
| Validated for review   13 s left     |
| [            SHOW             ]      |
| [Reject] [Pause] [STOP]               |
| Last send: output unconfirmed        |
+--------------------------------------+
```
Compact shares the core state, never a second command queue. Pinning is opt-in and must not conceal ProPresenter or steal focus when references arrive. Provide keyboard and screen-reader route to full detail/source phrase. No direct audience graphics or overlay output; this is an operator window only.

## First-run setup wireframe
```text
+----------------------------------------------------------------+
| Setup — step 1 of 5                         No outputs will send|
| 1 Input  > 2 Speech test > 3 ProPresenter > 4 Bible/Looks > 5 Ready|
| Input [MOTU M4 v]  Channel [Pastor channel - choose v]            |
| [Request microphone access] [Test input]  [level meter]           |
| Choose the clean pastor feed; ask audio lead if unsure.          |
| Local model: Not installed / verified model required             |
| Cloud off. Audio/transcript recording off.                       |
| [Back]                              [Next after valid test]     |
+----------------------------------------------------------------+
```
Steps: (1) select input/channel and permission, meter/no-output test; (2) verified local model and speaker test, labelled diagnostic not accent certification; (3) host/port/allowlist and read-only identity/version test; (4) selected installed translation and IFC theme/room/stream expectations with explicit unresolved checks; (5) summarize readiness, default Confirm and dry-run/test target. Any live-output rehearsal is a separate expressly authorized operator action outside automatic onboarding. No automatic network discovery, paid API key, mixer reroute or macro trigger during setup.

## Connection/audio troubleshooting wireframe
```text
+----------------------------------------------------------------+
| Not ready: ProPresenter offline                 Sends blocked   |
| Last verified: 09:12 UTC   Selected: Booth Mac / configured port  |
| 1 Check ProPresenter is open on intended computer                |
| 2 Compare Network settings host/port with approved configuration |
| 3 Ask production lead about trusted network/firewall             |
| [Read-only retry] [Copy redacted details] [Manual failback guide] |
+----------------------------------------------------------------+
| Audio: Device connected, no useful signal                       |
| Selected MOTU M4 ch 1 [meter]  No signal for 5 s                 |
| Check pastor channel/cable/gain with audio lead                  |
| [Input test] [Choose channel] [Pause]               [STOP]       |
+----------------------------------------------------------------+
```
Troubleshooting distinguishes device permission denied, device missing, no signal, clipped/poor signal, dropped frames, STT unavailable, wrong target/version, translation absent, unsupported route, stale/uncertain command and ownership conflict. Show concise cause/action; diagnostic details expandable and sanitized. Retry tests health only and never repeats a potentially sent command. Failback guide opens without stealing output focus.

## Sunday journey and edge cases
1. Volunteer launches; reviews actual ProPresenter target/build, audio source/channel/meter, selected installed translation and visible Confirm. Unverified prerequisites leave not-ready rather than optimistic green status. Existing media/Companion remains untouched.
2. Pastor says “Please turn to John chapter three verse sixteen.” Partial transcript appears in a visually labelled draft style, cannot Show. Stable complete reference becomes John 3:16 after validation and intent review.
3. Card shows exact translation label, source phrase, age/expiry and review state. Any AMP/AMPC ambiguity blocks until resolved. No large confidence percentage; explain “Needs review: book uncertain” or “Translation unavailable.”
4. Volunteer focuses Show and presses Space/Enter or clicks once. Core rechecks current candidate/revisions. **PROVISIONAL:** approved connector requests existing ProPresenter Bible styling/output; UI distinguishes request sent/receipt/readback from observed room+stream confirmation. The test must demonstrate both Looks and uninterrupted media before claiming success.
5. Pastor says “now verse seventeen.” In v1, only verified current John 3:16 context permits John 3:17 suggestion; MVP lacking context feature shows review/asks full reference. Do not silently fill context from an expired unshown card.
6. Pastor says “sorry, John chapter four verse sixteen.” Cancel old candidate/unsent command immediately; John 4:16 appears only after stable validation. If prior command already dispatched, show accurate status and offer deliberate correction; no promise of retroactive cancellation.
7. ProPresenter becomes unavailable: connection badge says Offline, Auto unarms, send controls block, queue expires and context clears. Volunteer can continue ordinary ProPresenter operation. Reconnect does not send or resume Auto; deliberate preflight/resume required.

## Focus, keyboard and accidental-action controls
Focus order: target/mode/status summary → candidate review → Show → Reject → secondary controls → Pause → Stop → settings. Stop remains easy to reach and never hidden under queue scrolling. Arriving candidates/status updates do not move focus or activate buttons. If focused card changes, require review/reselection before Show shortcut; match candidate ID/revision at keydown and dispatch. Ignore key auto-repeat and double activation across windows.

| Input | Proposed local action | Guard |
|---|---|---|
| Tab/Shift+Tab | Navigate controls | Visible focus ring; no trap |
| Space/Enter | Activate focused Show/button | Send only when Show explicitly focused; no send in text field, dialog, other app or expired card |
| Escape | Emergency stop while VerseCue active | No OS-global binding by default; announce stop; re-arm separate |
| Button shortcuts | Visible native access labels where platform supports | Verify Companion/ProPresenter conflicts before optional global binding |

Manual reference Enter validates/searches, never sends. Edit modal Enter validates, Cancel dismisses edit without restoring an expired candidate. Emergency stop stays available during dialogs. Operating-system shortcut conventions reviewed separately on Mac/Windows; do not capture keys when another app has focus. Optional global hotkeys disabled until explicit opt-in/conflict/permission checks, and failure leaves them inactive.

## Visual and accessibility rules
Default dark/light palettes must both meet NFR contrast; no color-only states. Mode names and connection/audio text accompany icon/color; Auto has explicit armed label, Paused says not listening. Reference ≥32 logical px, base ≥18, targets ≥44×44; scalable text at 200%, booth-distance test with actual volunteer. Focus outline ≥2 px high contrast; disabled controls explain why via accessible description and nearby text, not hover alone. Reduced motion honored; no flashing meter/alarm animation. VoiceOver/NVDA names include reference, translation, freshness and action. Announce status politely; urgent stop/offline assertive once, avoiding repeated announcements. Live transcript updates are not continuously read over all speech. Keyboard, screen-reader, reduced vision and color-vision tests are acceptance, not decoration.

## Error and recovery copy
| Event | Message/action | State consequence |
|---|---|---|
| Candidate expires | “Expired — ask for or enter the reference again” | Show disabled; no resurrect-on-focus |
| Wrong translation/unavailable | “Requested translation is not available. Choose an installed edition.” | No substitution/Auto |
| Lost response | “Request may have been sent. Check ProPresenter before resending.” | Uncertain; Auto off |
| Companion/operator state changed | “Presentation changed elsewhere. Review before showing Scripture.” | Ownership/context invalidated |
| Audio overrun | “Recognition fell behind. Pause and check input/model load.” | Drop stale work; block sends |
| Readback only | “ProPresenter accepted request; audience output not verified.” | Honest receipt label |
| Stop | “Stopped — no further sends. Existing ProPresenter output remains under your control.” | Latched until intentional re-arm |

Audit: all four required layouts, Sunday flow, focus/shortcuts/states/errors/accessibility and expiry semantics covered. UI state names align ADR-006 and architecture; no accidental expired send or claimed unobserved live success.

## Implemented Figma Control direction (2026-11-18)

IFC selected the Figma-inspired VerseCue Control reference as definitive; Apple/Meta alternatives are superseded. The implemented full/compact layout, categorized settings, shortcuts, truthful preview/readiness states and verification are specified in [the workspace implementation guide](38-figma-control-workspace.md). This supplement updates the earlier ASCII information architecture without replacing any safety, accessibility or output-verification requirement. P0 and field acceptance remain pending.
