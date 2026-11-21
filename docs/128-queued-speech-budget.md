# Queued speech while recognizing

2026-11-21. User report: "Audio input: 6.2s audio dropped this session" while speaking references, which then showed nothing or only "Needs review". Traces to FR-006 and NFR-008 (bounded buffering, indicate loss) and NR-010.

## Cause

On the development computer, local recognition takes about 2 seconds per window regardless of its length. While one window is being recognized, VerseCue kept at most 2 seconds of new speech and dropped anything older than 2 seconds. During continuous preaching, that limit was reached on almost every window, so speech was dropped, references were split across fragments, and lossy or assembled windows went to review instead of sending.

A second defect hid behind the 2-second limit: speech that started queuing while the worker was busy kept its queued-since time after the worker became free, so a window still forming normally could be discarded as stale.

## Rule now

- While a window is being recognized, up to **5 seconds** of new speech is kept (was 2), and a queued window must start recognition within **5 seconds** (was 2).
- Once the worker is free, the window that was forming continues normally; it is no longer timed as queued.
- Everything else is unchanged: per-window loss evidence, context reset on loss, Auto pausing only after three losses in a minute, the 15-second stale limit, and Auto's freshness limit (a reference that waited too long goes to review instead of sending).

The original FR-006 2-second queued-audio budget is replaced by this recorded decision, because on representative CPU recognition the 2-second budget lost speech continuously.

## Verification

| Check | Result |
| --- | --- |
| `tests/audio-buffer.test.cjs` updated for the 5-second budget and stale limits | Pass |
| `npm.cmd test` | 587/587 |
| Audio age, provisional speech, citation stabilization, listening preparation, guarded Auto and audio-loss scenarios | Pass |

Recognition speed on the church computer still decides how often speech is queued; a faster recognizer remains the larger improvement.