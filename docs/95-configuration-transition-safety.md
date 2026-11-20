# Configuration changes enter safety before persistence

## Reproduced problem

The desktop settings-save handler cancelled capture/preparation but deferred connector disarming and Session invalidation until after its asynchronous settings write. A synthetic held rename reproduced Confirm mode with dryRun=false and one old queued suggestion while the save was pending. A failed write could skip the later configure call entirely. This was a software regression test against a fake target, not an actual wrong output observation.

## Resulting behavior

Settings save, profile load, settings import and selected worker/model commits now share one serialized configuration transition. Before awaiting persistence, the transition cancels capture/recognition/preparation, disarms the connector, removes reviewed mappings, pauses the Session, clears old queue/context, enters dry run and revokes the private API. A second settings operation cannot overlap the first, including the shared settings temporary file. The private listener is revoked before waiting for its connections to close.

While configuration is pending, read-only status remains available and Emergency Stop/reset remain accessible. New output/rearm/mode/recognition/preparation commands and private API startup are rejected with an actionable wait message. A failed write leaves the Session paused and dry-run, with no old candidate or approval restored. Chosen worker/model paths are committed to the in-memory settings only after persistence succeeds.

A successful ordinary save restores the preceding safe non-Auto mode; preceding Auto becomes Confirm, always disarmed/dry-run. Profile loads retain their existing paused behavior. A Stop or required wake recovery raised during the operation is preserved. Import no longer resets away a concurrent Stop. No automatic output or retry occurs. The operator must deliberately reconnect/review/rearm as appropriate; the prior private API token is no longer valid.

## Verification

Four module regressions cover synchronous safety entry, overlapping operations, failed entry/write and subsequent deliberate changes. The synthetic Electron scenario holds then fails settings persistence and checks the old queue/dry-run state, rejected rearm/overlap/private API startup, immediate API revocation, Stop preservation across failed and successful saves, ordinary Confirm/dry-run restoration, profile-load pause and no Auto restoration. It uses isolated user data, a fake local target and no microphone. The first two harness attempts failed at module loading before injection; the corrected main-module loader reproduced the product failure, and the corrected product passes all assertions.

452 module tests and syntax checks pass. The workflow now includes this desktop scenario. Full source desktop, exact Windows package and exact Mac development verification remain required before merging this application change. No actual-host telemetry or acceptance result is published in this component. Original PR22 platform, physical-output, audio, appearance and field acceptance gates remain open.
