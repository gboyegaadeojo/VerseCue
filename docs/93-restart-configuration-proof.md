# Strict restart configuration comparison

This test-only helper compares two supplied read-only configuration snapshots. It performs no network request, desktop action, process restart, output command or restore. Production fingerprints and safety checks are unchanged.

Each snapshot contains the complete active Look, playlist and a complete presentation document for each referenced presentation. Every presentation is projected through the same bounded selected-arrangement resolver as the connector. Missing, ambiguous or mismatched presentation/arrangement evidence rejects the comparison. Unreferenced documents reject as well.

Only two tightly scoped runtime identities are normalized: the active Look's top-level UUID, and the selected arrangement UUID for the fully validated single unnamed master sentinel. The playlist arrangement reference must match its captured presentation's selected arrangement before normalization. Explicit arrangement identities remain strict. Full presentation content, raw group/slide sequence and metadata, selected cue sequence, target identities, playlist item order and all remaining Look configuration remain in the canonical SHA-256 proof. Object key order alone does not change the proof; array order does.

The return value reports configuration equality for the supplied snapshots. It never proves physical output, successful reconnection, service safety or automatic restoration. It cannot retroactively validate a test lacking complete before/after presentation evidence. Existing failed restart attempts remain failed; no new actual-host evidence is included in this change.

## Synthetic verification

Tests cover accepted unnamed-master ID regeneration, unchanged input snapshots, retained content/theme/cue order/Look/target/group identity/playlist items, absent or duplicated documents, unresolved arrangement references, malformed master metadata and changed explicit arrangement identities. Module and syntax validation are recorded in the PR. This helper is not wired into production or a live restart harness; actual-host adoption requires a separately reviewed snapshot procedure and observed test.
