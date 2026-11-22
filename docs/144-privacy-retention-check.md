# 144 - Privacy and retention check

Date: 2026-11-22. Requirements: FR-057, FR-059, FR-062, NFR-010, NFR-019. This is a software and personal-computer check. It is not a church-host or independent privacy review.

## What VerseCue keeps on disk

| Where | What | Speech or transcript? |
|---|---|---|
| App data folder: `settings.json` (with two backups), `profiles.json`, `native-copy-ledger.json` | Settings, saved profiles, the record of saved Bible copies | No |
| App data: `speech-scratch/run-*` | One folder per phrase: `input.wav` (the audio window) and, for the per-phrase engine, `out.json` (word probabilities). Deleted after each phrase. Any folder left by a crash is deleted at the next start, before recognition. | Yes, briefly |
| App data: `speech-engines` | Optional NVIDIA engine files the user chose to install | No |
| App data: Chromium folders (caches, Local Storage, Session Storage, blob storage) | Local Storage holds one item, `versecue.tourSeen`. Session Storage and blob storage were empty. GPU and shader caches hold compiled graphics code. | No |
| Files the user saves: settings export, diagnostics export, Mac inspection | Chosen by the user in a save dialog. The settings export blanks the engine, model and audio device. | No (see below) |
| Engine folder: `versecue-check.wav` | One second of silence for the optional NVIDIA check; deleted when the check ends | No |

**Diagnostics export.** The event log keeps only a fixed event code, a state and two timing numbers (`core/session.cjs` `log`). Any other detail passed to it is dropped. It cannot contain transcript, reference text or error text.

**Crash dumps.** VerseCue does not start Electron's crash reporter. No `Crashpad` folder exists in the app data on the test computer, so no crash dumps were written.

## Findings and fixes

1. **The warm-up silence was written to the system temporary folder.**
   - The graphics-card warm-up wrote one second of silence to `%TEMP%\versecue-warmup-*`. If VerseCue closed during the warm-up, that folder stayed behind: one was found from 2026-11-21.
   - It contained only silence, never speech.
   - Fixed: the warm-up now uses the app's speech scratch folder, so it is removed afterwards or at the next start. Test: `tests/speech-acceleration.test.cjs`.
2. **Old `versecue-worker-*` and `versecue-preempt-*` folders in `%TEMP%` were empty.**
   - They came from test runs: the resident worker uses the system temporary folder only when no app scratch folder is set, which happens only in tests.
   - In the app, the resident worker's folder is a scratch run folder.
   - No change: the scratch design deliberately never scans or recursively deletes the system temporary folder.

## Limits that software cannot close

- **Memory paged to disk.** While VerseCue runs, audio is held in memory. Windows (page file, hibernation) and macOS (swap, sleep image) can write memory to disk. Full-disk encryption (BitLocker on Windows, FileVault on Mac) protects this; VerseCue doesn't change these settings.
- **Operating-system crash reporting.** If VerseCue or the speech engine crashes, Windows Error Reporting or macOS crash reporting may collect a report under the computer's own diagnostic settings. VerseCue doesn't change those settings. For a church computer, keep optional diagnostic data off.
- **ProPresenter's own data** (presentations, saved Bible copies) is ProPresenter's.

## Verification

- 627 unit tests, including the new warm-up test.
- The app data and temporary folders on the development computer were inspected on 2026-11-22.
- Scratch cleanup and start-up recovery are covered by `tests/speech-scratch.test.cjs`.
