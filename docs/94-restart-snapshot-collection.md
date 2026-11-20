# Bounded read-only restart snapshots

The test-only collector in scripts/restart-snapshot-collector.cjs gathers complete evidence for the strict comparison introduced in PR49. It is not imported into the application and does not restart ProPresenter, change focus or trigger output. It accepts a configured connector and an explicit playlist UUID; it writes no file and logs no payload.

## Collection contract

The connector must remain disarmed at the same base URL and generation. Each of two sequential sweeps checks audience and stage status are false, reads the complete version response, verifies the focused playlist UUID, reads the complete active Look and playlist, and fetches each uniquely referenced presentation once. Each document must have the requested identity. The strict oracle validates selected arrangement resolution and playlist references. Focus and both disabled-output statuses are checked again at the end of each sweep.

The two full sweeps must match exactly, including version and runtime IDs. Runtime master IDs are normalized only by the separate before/after restart comparison, never to excuse a changing collection. A matching pair remains a sampled configuration snapshot, not an atomic server transaction or proof against a transient change between reads. Output-disabled observations are boundary checks, not continuous screen observation.

Every read uses the connector's deadline, capped at two seconds and at the remaining overall deadline. The overall deadline defaults to fifteen seconds and cannot exceed thirty seconds. A backwards/invalid clock, changed target, arming, timeout or malformed data stops without retry. Limits are 1,000 playlist items, 50 unique presentation references, two million bytes per response and eight MiB for the combined configuration. Missing/incomplete evidence rejects; the collector does not silently omit a passage to fit a limit. UUID validation prevents caller-supplied route fragments. Only the fixed status/version/focused-playlist/Look routes and validated playlist/presentation resource routes are read; API GET actions such as trigger/clear/focus are never used.

The result contains the complete snapshot and version plus read count, elapsed collection time and explicit no-output/physical-verification scope. Actual-host callers must retain these records only under ignored private storage unless separately authorized to publish. It cannot certify earlier attempts that lack presentation snapshots.

## Tests and adoption

Eight synthetic regression groups cover stable collection, duplicate reference reuse, approved routes/deadlines, active or unavailable screen states, content/Look/version/focus changes, target replacement/arming/clock/deadline failures, missing or mismatched identity, unresolved arrangements, size/reference limits and runtime-ID instability within collection. The initial test expected 22 reads for a one-document fixture; inspection showed the correct fixed sequence is 20, and the assertion was corrected without changing the collector.

A caller should first verify read-only compatibility on the authorized personal host, keep full snapshots private, and inspect failures without blind retries. A separately observed restart test must additionally prove app link-loss pause/recovery, inactive microphone, zero output commands and no automatic rearm/restore. Neither this collector nor a matching configuration comparison passes physical room/stream, theme, audio, Mac, LAN or field acceptance. No new actual restart is performed by this PR.
