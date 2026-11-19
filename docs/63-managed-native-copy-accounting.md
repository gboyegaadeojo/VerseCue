# Bound future managed copies across app restarts

2026-11-19 UTC. PR22 / RF-04 and RF-09. This adds forward accounting, not automatic deletion or completed field acceptance.

## Scope and limits

The existing100-native-attempts-per-app-run limit remains. A separate local ledger now reserves one of500 managed-copy slots before native access and preserves those reservations across restarts, settings/profile changes and session resets within the same VerseCue user-data directory. The500 slots span the recorded local target ports; changing a port does not reset the total.

A successful fully checked save records the new UUID, presentation fingerprint and clipping flag. An uncertain or interrupted save retains its reserved slot, including after a process crash. Persisting a reservation must succeed before native access; persisting completion must succeed before readiness is returned. Unavailable/corrupt/unwritable accounting blocks new native preparation with guidance, while exact saved-passage lookup and manual ProPresenter operation remain available. Corrupt accounting is retained rather than silently reset.

This is not a physical disk quota or a security barrier against a person editing/deleting local app data. Existing presentations created before this feature, unrelated ProPresenter content, vendor backups/trash and copies outside this user-data directory are not counted or deleted. Earlier untracked clipping observations are not automatically imported. Full storage/retention and field acceptance therefore remain open in the [complete checklist](51-reference-driven-bible-workflow.md).

## Data and warning retention

`native-copy-ledger.json` in the app's local user-data directory contains schema version, reservation IDs, SHA-256 target-address keys, reserved/verified state, and verified copy UUID/fingerprint/clipping flags. It contains no reference names, Bible text, sermon transcript/audio/image, raw target address, token or credentials. It is not included in settings/profile exports or redacted diagnostics. Up to500 entries and256KB are accepted; malformed/foreign fields fail closed.

Writes use an exclusively created owned staging file, flush it, then replace the ledger. Failed owned staging files are cleaned up without removing the prior ledger or ProPresenter content. A previously persisted reservation remains if completion fails. This is conservative accounting, not a claim of transactional storage across hardware/power failure or multiple arbitrary external writers.

A positive clipping warning for an exactly matching recorded target/UUID/fingerprint now survives app restart and blocks normal confirmation. Changed/unknown fingerprints still require fresh appearance review; an absent warning never means the layout is clean. Existing [fresh-copy recovery](61-known-clipping-on-saved-reuse.md) remains deliberate and creates no output.

## Operator storage check

Settings / Output shows managed copies, unverified reservations and remaining slots. **Check copies removed in ProPresenter** reads a bounded complete current catalog: at most10 libraries and1000 presentations per library within8s, with target/session/window and shared-operation guards. It releases only accounting entries for verified UUIDs missing from that complete catalog on the checked target. Copies that still exist, other targets and unverified reservations remain counted.

The check never deletes, edits, renames, moves, saves, triggers or clears ProPresenter content. It cannot infer what happened to an unidentified uncertain copy, and offers no automatic reset/bypass of those reservations. Local accounting reconciliation is not proof that vendor trash/backups no longer occupy disk space. Partial/unavailable catalog reads or changed ownership do not release slots.

## Verification

381 module tests and syntax checks pass. Added tests cover durable reservation before native access, successful completion/warning retention after reload, exhausted quota after restart, corrupt content preservation, storage failure, concurrent reservation rejection, target/receipt binding and reconciliation retaining uncertain/other-target identities. The first draft's UUID-shape error was found by these tests and corrected before integration.

`node scripts/test-managed-copy-ledger.cjs [isolated-package-executable]` seeds500 synthetic accounting entries in a unique test-user-data directory. It verifies quota blocks native access, the actual Output storage control releases498 missing verified identities while retaining one existing copy and one unverified reservation, a newly consented preparation creates one synthetic copy, and a real app close/relaunch preserves the original clipping block and accounting. It sends zero output and uses no actual microphone or ProPresenter. An initial test wait raced the backend; the corrected test polls for completed backend review before asserting copy counts.

Existing source synthetic recovery and uncertain-save scenarios also pass. Workspace-fit, normal-passage and matching build checks are recorded separately with exact revisions; none of this completes Mac native control, physical styling/output, latency or church service acceptance.

[Sanitized source desktop report](evidence/managed-copy-ledger-source.json) records the seeded quota/reconciliation/restart result.
