# Renderer recovery and canonical target validation

2026-11-17, development0.2.9. Safety/reliability continuation; full P0/service acceptance remains pending.

## Owner loss, reload and recovery

An audio-owner window that closes, reloads its main frame or emits a renderer-process-gone event now cancels capture and recognition/native preparation, disarms output, revokes the private API and pauses the session. Pending candidates/context are invalidated. The surviving/reloaded interface requires intentional Confirm resume and explicit audio start; it does not automatically reacquire the microphone or restore output arming. A nonowner window event does not interrupt an active owner. Renderer generation is now exposed in the snapshot so cards from an invalidated generation are visibly disabled as well as blocked by the core.

The isolated source recovery test passed actual main-frame reload and actual compact-owner close, including paused/dry-run/no-history/capture-revoked/API-revoked checks. It also emitted a simulated renderer-process-gone event and verified the handler. No process was actually crashed and no Windows crash dialog was intentionally generated. The simulation is not a claim of full real-crash recovery or OS/microphone-driver recovery. No microphone, private recording or ProPresenter request is needed for this event/ownership test.

## Canonical IPv4 validation

Target validation now rejects leading-zero octets before configuring or contacting a host. Numeric validation alone treated010as decimal10, while WHATWG URL parsing can interpret it as octal8; that disagreement could redirect an apparently allowed private host to a public address. Only canonical dotted-decimal private/loopback IPv4 is accepted. DNS names, credentials, URL paths, redirects, public addresses and out-of-range octets remain rejected. No network probe is used to test rejected forms.

The new regression covers010.0.0.1,012.0.0.1,172.016.1.1 and leading-zero loopback/private variants, plus an accepted canonical10.0.0.1 hostname check. All140unit/regression cases passed after this validation change. The health-monitor caller also ignores results/failures from a superseded target generation, matching the connector's existing stale-response protection; an old request cannot change the replacement target's monitoring decision.

## Verification scope and sources

`node scripts/test-renderer-recovery.cjs [packaged-executable]` creates an isolated test profile. Results explicitly distinguish simulated renderer loss, actual reload and actual owner close. Packaged0.2.9 recovery/regression and final hash checks are recorded separately after completion. Source renderer recovery passed; package acceptance is not inferred.

Implementation uses the pinned Electron45.3.3 installed type/API definitions for WebContents renderer-process-gone and did-start-navigation (main-frame details); source register SRC-66. These are companion-app events, not ProPresenter UI automation. The canonical-IPv4 regression tests the actual installed Node WHATWG URL implementation and the deterministic allowlist. Partial requirement links include input loss/stop/recovery, target configuration, concurrency, privacy and network-safety FR/NFRs; all original acceptance criteria remain in force.

Follow-up source validation: the full140case suite, source desktop smoke and dedicated fake-target health-race test passed. The latter holds an old loopback target's health response while configuring a second fake target, then releases either200or503. Both preserve the second target's connected identity, Confirm mode and newly acquired capture lease; no installed ProPresenter or microphone is accessed. Reproduce with `node scripts/test-health-target-race.cjs [packaged-executable]`. No real target-interference/physical-output acceptance is inferred.
