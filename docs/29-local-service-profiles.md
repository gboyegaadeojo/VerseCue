# Local service profile snapshots

2026-11-17, development0.2.7. Partial implementation of the administration/profile requirements; full release acceptance remains pending.

## Operator flow

In Setup, save the intended configuration first. Enter a profile name and choose **Save current setup as profile**. Select a saved profile and **Load selected profile** to restore its stored host/port, translation, audio device/channel, trusted local speech paths and worker mode. Loading stops local recognition/preparation, pauses the session, disarms output, revokes the private API, clears candidate/context and cue mappings, and restores dry run. The operator verifies target/input and intentionally resumes Confirm. Loading a snapshot never authorizes a new feed or proves installed Bible/theme/Look compatibility.

Delete removes only the selected snapshot, preserving current active settings. Saving the same name case-insensitively updates that snapshot. Profile names are1–60printable characters; up to20snapshots are allowed. Names are displayed with textContent and never used as filesystem paths. A profile contains settings, no transcript, audio, API token, output-arm state or Auto policy. Local worker/device paths and host addresses remain local; ordinary settings export continues to omit machine-specific paths/device IDs. Profile export/synchronization is not added.

## Storage and failure behavior

One schema-validated profiles.json in the application's per-user data directory holds all snapshots. Unknown/secret/settings-policy fields are discarded through the existing settings validator; public/DNS ProPresenter targets and unknown worker modes are rejected. Writes use a unique sibling temporary file, one previous-file backup and atomic rename. Concurrent mutations are rejected. Oversized, corrupt or invalid stores are preserved and reported rather than silently overwritten. A corrupt snapshot file does not change the active safe settings. Current profile management has no corrupt-store repair button; restoring/removing that local file remains a runbook operation after preserving its backup.

## Verification

Four unit tests verify round trips, same-name update, secret/policy stripping and name-only listing, corrupted-file preservation, invalid/public targets and count limits, and concurrent-write rejection. All133regression tests passed after implementation. Desktop save/load/delete, mode/disarm/API revocation and packaged behavior are verified separately; no passing claim is made here before those checks finish. No actual microphone or ProPresenter output is needed for the isolated UI test.

Follow-up: source and packaged0.2.7 desktop tests passed actual save/load/delete, paused/dry-run state and private-API revocation assertions. Setup and the full window fit horizontally at200%CSS zoom. The suite reached135passing tests after navigation was added. These UI tests use a synthetic named snapshot and delete it afterward in isolated test profiles; no microphone or ProPresenter request occurs.

Original administration FRs and safety/privacy NFRs remain authoritative. A profile is a local settings snapshot, not an independently verified service deployment or a substitute for pre-service checks.
