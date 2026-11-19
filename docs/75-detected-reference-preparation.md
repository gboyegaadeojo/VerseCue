# Detected-reference preparation scheduler

2026-11-19. Extracted from draft PR22 as a backend dependency for normal reference-driven preparation.

## Behavior

Disabled at startup. Saved-passage preparation can be enabled independently. Native missing-passage preparation additionally requires Confirm mode, a connected target, an available verified route, a positive trusted window identity, and explicit focus-change/copy-creation acknowledgments. Consent binds to that window and target generation; another window receives only saved lookup options. The desktop must revoke consent when its owner closes.

One authorized complete destination is scheduled; ambiguous, prohibited and incomplete results do not start work. New references cancel older in-flight work and coalesce waiting work to the latest request. Ordinary preaching preserves the current pending reference. A busy shared owner is given at most two seconds; expiration does not retry automatically. Stop, pause, recovery, disconnect and Auto prevent new preparation. This module never arms or triggers output.

Uncertain native work revokes native consent and requires explicit inspection acknowledgment before re-enabling it. The caller must report uncertainty through revokeNative and supply the existing coordinator, owner checks, native readiness and preparation operation. These are backend contracts, not evidence of desktop lifecycle wiring or native availability.

## Newly corrected race

A reference can change while preparation waits for a shared owner, before the next speech callback. The drain loop now checks the captured referenceEpoch before invoking preparation. The regression failed against the extracted implementation and passes after the guard; no stale preparation callback is invoked.

## Verification and limits

17 scheduler tests and all384 combined module tests pass on Windows; JavaScript syntax checks pass. Tests cover initial disabled state, ambiguity, ownership, consent, coalescing, busy timeout, uncertainty and cancellation. No microphone, ProPresenter connection, native UI, output, physical screen or Mac runtime was exercised. Matching hosted Mac verification is pending. Desktop initialization, controls and startup reconciliation remain separate work under PR22; original requirements and acceptance gates remain in force.
