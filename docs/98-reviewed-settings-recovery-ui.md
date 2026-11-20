# Reviewed setup recovery controls

This component connects the validated history backend from PR53 to the desktop operator workflow required by FR-057. It adds a recovery notice after corrupt-settings startup and a dedicated Recover a saved setup panel under Settings / Profiles. It does not automatically restore a backup, contact ProPresenter or change output.

## Operator flow

1. Open recovery options from the startup notice, or open Settings / Profiles and refresh saved backups.
2. Select a valid previous/earlier setup. Review the exact target/port, translation, saved input, pastor channel and local speech mode/worker/model paths. Values are displayed as literal text, never markup or links.
3. Explicitly acknowledge replacing the current setup, then activate Restore reviewed setup. Selection alone and unchecked confirmation cannot restore.
4. Restoration stops listening and enters the existing serialized configuration transition: disarm, revoke API/approvals, invalidate old suggestions and apply only the receipt-matching validated settings. Changed backup bytes require a new review; invalid/missing/unreadable backups are not offered.
5. The result stays paused/dry-run and preserves Emergency Stop or wake recovery. Test the target, input and speech files, then deliberately resume Confirm. No old queue, Auto grant or API token is restored.

The notice reports that setup needs review. A Boolean recovery flag is exposed in Session status without backup contents or local paths. Successful settings commits clear that flag; generic Session reset does not pretend a corrupt file was repaired. Restore is trusted desktop IPC only; no private HTTP API restore route or capability is added.

## Usability and failure handling

The startup action opens the actual recovery panel and focuses the backup choice. Refresh and selection clear acknowledgment. Pending operations disable competing controls; stale byte receipts reject without applying the selected setup. Old suggestions are invalidated even when restoration fails. Successful restoration refreshes the remaining history and setup form; a separate resume is required. Preview values wrap within the panel and no permission prompt or microphone enumeration is triggered by reading backups.

Visual review found malformed separators from a development file-encoding mismatch and a legend partly covered by the existing sticky dialog header. Text was corrected to UTF-8-safe content and the recovery panel gets a scroll margin below that header. Synthetic screenshots were inspected after correction.

## Verification and limits

The new synthetic desktop scenario covers corrupt startup/defaults/notice, two listed snapshots, explicit acknowledgment, exact preview values and literal markup safety, changed-byte rejection with old-queue invalidation, keyboard restore, private API revocation, Stop preservation, refreshed settings, persisted restored translation and no fake-target requests. It verifies horizontal fit at1280/900/640 widths and200% text scaling. Existing471 module tests and syntax checks pass during development. The new scenario is included in the Mac source workflow; full exact-head source/package/Mac checks remain required before merge.

No actual ProPresenter, microphone, physical outputs or private host evidence are used. Layout checks are not a screen-reader/booth usability certificate. The backend's individual-file atomicity limits and lack of a multi-file filesystem transaction remain as documented in docs/97. This completes the implemented review/restore path once verified, but does not pass NFR019's entire crash/backup/diagnostics matrix, the full original86-row audit, or PR22's platform/physical/audio/style/field/release gates.
