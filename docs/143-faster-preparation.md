# 143 - Faster preparation and version switching (NR-020)

Status: implemented on feat/speed-v2. Live timing on ProPresenter is pending.

The user asked for every speed improvement on the list (2026-11-22), including early preparation from unfinished speech.

## What changed

| Change | Where | Expected saving |
|---|---|---|
| **Kept-running Bible helper.** The Windows helper starts once (`--serve`) and handles one request per line for the whole service. It is ended after 10 idle minutes, after any failure or cancel in flight, and when VerseCue quits. Every check still starts again from ProPresenter's current window; nothing found earlier is reused. | `native/windows/BibleBridge.cs` `Main`/`Handle`, `core/bible-preparation.cjs` `exchange` | about 1 s per passage (process and accessibility start-up) |
| **Focus fallback.** Windows may refuse focus to a helper that has been running a while. That refusal (`COULD_NOT_FOCUS_PROPRESENTER`) happens before anything is typed, so the same request is tried once by a newly started helper. No other failure is retried. | `exchangeWithFallback` | keeps the kept-running helper reliable |
| **No clipped-text scan for a whole chapter.** Exact passages for Confirm and Auto keep the scan. | `BibleBridge.cs` | about 2 s per chapter |
| **Faster progress checks:** every 60 ms instead of 150 ms. | `BibleBridge.cs` | up to about 0.1 s |
| **Installed versions read with the first chapter** (optional `listVersions`), remembered for 10 minutes per connection. | `BibleBridge.cs` `ListEditions`, `preparation-controller.cjs` | about 2-3 s on the first version request |
| **Early chapter from unfinished speech** (Prepare for volunteer only). Unfinished speech that already names one complete reference (book, chapter and verse, in the current version) opens that chapter. When the sentence finishes, the same chapter, verse and version is reused; anything else is prepared again from the finished words. On by default; Settings > Output can turn it off. | `passage-coordinator.cjs` `prepareEarly`, `desktop/main.cjs` `startEarlyPreparation` | the time until the preacher pauses (often several seconds) |
| **Speech keeps its loaded model when a passage is prepared.** Preparing used to stop the kept-loaded engine, so the next phrase waited for the model to reload. Now only the phrase in flight is dropped. | `core/stt.cjs` `interrupt`, `core/resident-speech.cjs` `abort` | a model reload (about 1-3 s) after each passage |
| **Unfinished speech on the kept-loaded engine.** Provisional recognition now also runs on the kept-loaded engine, but only once a finished phrase has taken under 1 s on this computer. Snapshots come every 1 s instead of 2 s. | `stt.cjs` `provisionalReady`, `ui/audio-buffer.js` | makes early preparation possible by default |

Fixed along the way: a comment in `resident-speech.cjs` had swallowed the language and temperature settings sent with each phrase. The engine still used English from its start-up flags, but the settings are now sent as intended.

## Safety

- Early preparation is preparation only. It requires Prepare for volunteer, Confirm mode in dry run, outputs off (not armed), the session's native-preparation consent and the current Bible version. It never becomes a candidate and never reaches Auto, Confirm or output.
- An early chapter keeps session state and the sentence still being heard. It does not run the session reset that a normal preparation does, so the finished words are not discarded.
- Finished words that name a different chapter cancel the early chapter. Emergency stop, audio loss and other cancels stop it like any preparation.
- The version read only opens the edition menu, reads it and closes it with Escape, then confirms the selection didn't change. A malformed list is ignored.
- Not changed: Auto rules, the exact-passage clipped-text scan, output paths.

## Finding: a slide was triggered inside ProPresenter while it was slowed (2026-11-22)

**What happened:**
- A live timing run on this branch was made while ProPresenter was in its slowed state after earlier helper connections: 17% CPU, 15 s to find the Bible view.
- Every request timed out.
- Afterwards, ProPresenter's current slide was Psalms 23:6. Before the run, it was a different slide.

**Impact:**
- Audience and Stage were checked off before, during and after the run, so nothing reached a screen.
- VerseCue sent no output requests.

**Cause:**
- The helper's own input must have reached the slide list. The most likely path is the edition-menu click: `ClickVerifiedControl` hit-tests a control and then clicks its centre.
- When ProPresenter answers this slowly, the screen can change between the check and the click. A click meant for a menu item can then land on a slide, or a key press can reach the slide list.
- This click code is already on main (version switching, PR114). It isn't introduced by the speed changes.

**Fix (in this PR):**
- **Responsiveness check before any input:** a read-only lookup of the Bible view must answer within 2.5 s. Otherwise the helper stops with `PROPRESENTER_RESPONDING_SLOWLY` ("Restart ProPresenter, then try again") without focusing, typing or clicking.
  - On the same slowed ProPresenter, the read-only `inspect` operation took 15.3 s for that lookup, so the check would have stopped the run before any input.
- **Click freshness:** a click is refused if the check before it took over 400 ms, or if the control moved since it was found (`CONTROL_MOVED_BEFORE_CLICK`).
- No further live tests until ProPresenter has been restarted. The README already advises a restart before each service.

## Verification

- Unit tests:
  - `tests/persistent-helper.test.cjs`: one helper for many requests, cancel, idle end, the focus fallback, an exit mid-request.
  - `tests/early-preparation.test.cjs`: reuse, a different verse, every precondition, cancel, the controller keeping session state, speech keeping its model.
  - `tests/chapter-context.test.cjs`: the combined version read.
  - `tests/provisional-speech.test.cjs`: updated for the 1 s steps and the kept-loaded engine.
- The Windows scenario sweep passed 48/48. Private recordings and the speech engine were copied into the worktree as usual.
- The real helper was checked in `--serve` mode with invalid requests only: each line got its own reply, and it exited cleanly when input ended.
- Live:
  - The baseline on a fresh ProPresenter 21.4.2 (2026-11-22) was Psalm 23 KJV in 4.4 s, NIV refused in 2.9 s and the ASV switch in 7.1 s.
  - The first live attempt on 2026-11-22 was blocked for both this branch and main. Windows didn't give ProPresenter focus while another app (Chrome) was in use, and the helper stopped safely at `target-window-bound`. Nothing was sent, both screens stayed off and the live slide didn't change.
  - Retest when the computer is idle.
