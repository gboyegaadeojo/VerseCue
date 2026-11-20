# Validated settings history and reviewed restore backend

FR-057 requires reviewed recovery from a known-good nonsecret configuration; NFR-019 requires the last two valid backups. Source inspection and three failing regressions found one raw-copy backup, corrupt-primary poisoning of that backup, and propagation of unknown secret/arming fields. This component corrects persistence and supplies the restore backend. The operator-facing review/restore controls are the next separate component; this PR alone does not complete the workflow or either requirement's full acceptance.

## History and validation

Successful settings changes retain up to two distinct valid prior configurations in settings.json.backup and settings.json.backup2. The first save has no prior state; repeated unchanged saves do not evict useful history. A corrupt primary is excluded from history rather than replacing a good backup. Existing legacy .backup JSON remains readable.

Every archived configuration is parsed and validated through the same known-field schema as current settings. Unknown fields, including API tokens and mode/arming flags, are not copied into newly written backups. Files are read within a16KiB bound; writes cannot produce a configuration beyond that same bound. JSON/validation failures have fixed safe error text. Missing or invalid sources are excluded; unreadable sources fail a save rather than silently discarding potentially valid history. Backup listing reports valid snapshots and fixed missing/invalid/unreadable/duplicate reasons without raw payload errors.

Writes use unique temporary files, restrictive creation mode and per-file rename. Within-process overlapping settings writes reject. Each file replacement is atomic; the three history/primary files are not a single filesystem transaction. Backup rotation precedes primary replacement so the last valid primary remains available during an injected precommit failure. Do not claim every power-loss/filesystem failure has been field-tested. Temporary files are cleaned after success/failure. No ProPresenter files, output or configuration are touched.

## Restore contract

Backup listing returns only slots1/2, sanitized known settings and a SHA-256 receipt of the exact reviewed bytes. Restore requires that slot and matching receipt; changed bytes require a new review even if known settings normalize to the same values. Invalid/public-target configurations and arbitrary slot/path input reject. The replaced current valid configuration enters history, allowing a later deliberate reversal. The receipt is a freshness check, not a trusted signature or authorization token.

Startup never automatically loads a backup: missing/corrupt current settings still use safe defaults and the existing recovery indication. The desktop caller must run deliberate restore through the existing configuration transition, which disarms, revokes, invalidates and preserves Stop before I/O. No renderer/IPC restore path is added by this backend component, and no restored file can carry Auto, mappings or API credentials. The following UI PR must display the local target/audio/translation/worker/model values for review and require explicit restoration before applying them.

## Verification

Twelve regressions cover two-state history, corrupt-primary preservation, secret/arming-field stripping, unchanged-save retention, exact reviewed restore and undo history, stale-byte rejection, invalid/oversized/missing recovery data, safe startup defaults, failed primary commit, concurrent saves, slot/public-target rejection, inaccessible backup handling and the read/write size invariant. The first three regressions failed before correction.471 module tests and syntax checks passed during implementation; exact-head full checks and source/package/Mac workflows follow before merge. The existing held/failed settings-write desktop scenario passes with the new backend, preserving API revocation, Stop, profile pause and Confirm/dry-run success.

No actual ProPresenter, microphone, cloud service or personal-host evidence is used or published. Original86-row audit, platform, physical output, audio, styling, signing and field acceptance remain open.
