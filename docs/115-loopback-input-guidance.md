# Loopback and virtual input guidance

2026-11-21. Traces to FR-008 (document and detect OS-specific loopback prerequisites; prefer the physical M4 input) and supports FR-001 (no silent input substitution).

## What changed

- **Route guidance in Setup > Audio.** When an input is chosen, VerseCue reads the name the browser reports and says what kind of route it appears to be:
  - **System loopback** (for example Stereo Mix, What U Hear): it records everything the computer plays, including ProPresenter media, videos and alerts. On Windows it appears only when the audio driver provides it and it is enabled in Sound settings. macOS has no built-in system loopback input.
  - **Virtual driver** (for example VB-Audio, VoiceMeeter, BlackHole, Loopback Audio, Soundflower): what it carries depends on routing set up in another application, which VerseCue cannot see. On macOS, capturing computer audio needs a separately installed third-party driver.
  - **Other inputs:** VerseCue says it cannot verify which microphone or mixer feed the input carries, and suggests the input test.
- **Not ready until checked.** Listening on a loopback or virtual input is blocked until the operator ticks "I checked that only the pastor feed is routed into this input for this session." The check is tied to the saved input, is not saved, and clears on input change and session reset. It is checked twice: against the saved device's reported name before capture opens, and against the name of the track actually opened, before any recognition.
- **No changes outside VerseCue.** Nothing enables Stereo Mix, installs or recommends buying a driver, changes OS settings or alters mixer routing. The ten-second input test stays available, because it is meter-only.

Device names can be renamed by drivers, so this is guidance, not detection of the actual hardware or routing.

## Verification

| Check | Result |
| --- | --- |
| `tests/input-route.test.cjs`: synthetic Windows/macOS loopback, virtual, ordinary and missing labels | 3/3 pass |
| `npm.cmd test`, `npm.cmd run check` | 562/562 pass; check passes |
| `scripts/test-loopback-input-guidance.cjs` (source): guidance, listen blocked with capture closed, check unblocks, input change and reset clear the check | Pass |
| Existing scenarios: safe input test, input information, reset privacy, provisional speech, workspace | Pass |

## Not established

No real Stereo Mix, virtual driver, MOTU M4, macOS device or permission prompt was exercised. Real device naming on IFC's computers remains part of microphone setup verification.
