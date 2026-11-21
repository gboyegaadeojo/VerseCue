# Prepare for volunteer

2026-11-21. NR-012: the user wants VerseCue to take ProPresenter to the passage the preacher asked for, so the volunteer only has to click it live, without approving every passage in VerseCue and without VerseCue putting anything on screen.

## How it works

Choose **Settings > Output > Start each session in > Prepare for volunteer**. Then:

- VerseCue starts (and resets) in **Confirm** mode, in dry run. It never sends output in this mode.
- When you press **Start listening**, VerseCue switches on detected-reference preparation for the session. With the two preparation boxes in Settings > Advanced ticked (they are by default, NR-011), it uses ProPresenter's own Bible tool to open each clear reference it hears, including passages not yet saved. Without the native route it prepares already-saved passages only and says so.
- The volunteer watches ProPresenter as usual and clicks the prepared passage live (or not). VerseCue's own Confirm button remains available but is not needed.
- The status line reads **PREPARE FOR VOLUNTEER - VerseCue opens each reference in ProPresenter. Take it live in ProPresenter; VerseCue sends nothing.**

Unchanged safeguards: only a single, clear, valid reference is prepared (multiple references in one sentence wait for a choice); Emergency stop, lost connection, wake recovery and reset stop preparation; preparation brings ProPresenter to the front while it works, so it should not be used while someone is typing in ProPresenter.

## Verification

| Check | Result |
| --- | --- |
| `tests/prepare-for-volunteer.test.cjs`: valid start mode; starts and resets in Confirm; not after Emergency stop | Pass |
| `scripts/test-prepare-for-volunteer.cjs` (synthetic target): starts in Confirm and dry run; preparation switches on with listening; status line shown; zero output requests | Pass (synthetic target has no native Bible route, so it used saved passages only) |
| Real ProPresenter preparation from speech | Pending: ProPresenter was not running at the time of testing |