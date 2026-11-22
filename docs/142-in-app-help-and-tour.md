# In-app help and first-launch tour

2026-11-22, NR-019. The user reviewed two clickable mock-ups on the design canvas and chose **B, Help mode**, with **A, a guided tour, on first launch**.

## Help mode

- **Turning it on:** a round **?** button in the toolbar, and another in the Settings sheet's header.
- **What it shows:** a numbered marker on each control of the current page or Settings section. Clicking a marker, or an item in the **On this page** panel, highlights the control and explains it in plain words.
- **Coverage:**
  - Workspace: mode, live strip, latest reference, Hold, reference buttons, typing a reference, heard list, pastor audio, connections, Settings, Emergency stop.
  - Settings: every section (Profiles, ProPresenter, Audio, Speech, Output, Quotes, Advanced).
- **Behaviour:**
  - markers are repositioned in place, never rebuilt, so clicks always land;
  - markers move to a control's left corner when the panel would cover them;
  - in Settings, the panel starts below the sheet's header so its close button stays reachable;
  - **Done** turns help off.

## Guided tour

- **When it runs:** on first launch, after a short delay. It's skipped in automated test runs (`VERSECUE_AUTOMATION`), and a remembered flag stops it showing again. **Take the tour** in the help panel replays it.
- **What it shows:** the essentials (mode, latest reference, Hold when a send is pending, heard list, connections, Emergency stop), with Back, Next and Skip. The last step points to **?** for everything else.

Help only explains: it never presses a control, changes a setting or sends anything. Explanations live in one table in `ui/help.js`.

## Verification

| Check | Result |
| --- | --- |
| `scripts/test-help-tour.cjs`: no tour in automation; 9 workspace explanations; every Settings section explained (29 in total); popover text; tour steps and remembered flag; nothing sent; settings unchanged | Pass, twice |
| Booth readability, workspace, Route workspace, typography, Hold shortcut, passage range | Pass |
| `npm test`, `npm run check` | Pass |
