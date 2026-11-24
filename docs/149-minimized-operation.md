# 149 - Keeps working while minimized (NR-026)

Date: 2026-11-24. The user asked that VerseCue keep working while minimized. The ProPresenter computer usually shows ProPresenter full-screen, with VerseCue minimized or behind it.

## What keeps it running

- **The window:** created with `backgroundThrottling:false`, so its timers and screen updates aren't slowed when it is minimized, hidden or covered.
- **New, a covered window:** `disable-backgrounding-occluded-windows` stops Chromium treating a window covered by another one (a full-screen ProPresenter) as hidden.
- **New, processing priority:** `disable-renderer-backgrounding` keeps VerseCue's processing priority from being lowered in the background.
- **While listening:** a power-save blocker prevents app suspension, which on macOS includes App Nap.
- **Unaffected by the window:** speech recognition, the Bible helper and the ProPresenter connection run in the main process and child processes.

## Verified

- `scripts/test-minimized-operation.cjs`: the window's timers keep their full rate (40 ticks in 2 s), and the page stays visible to itself, when minimized and when hidden.
- `scripts/test-background-quotes.cjs`: while minimized, audio keeps flowing, speech is recognised and a quoted verse is found.
- The Auto and preparation scenarios also run with the window minimized.
- Not verified here: a real Mac with App Nap active. Check it on the Mac mini.
