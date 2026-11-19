# Keep known clipping warnings when reusing a passage

2026-11-19 UTC. PR22 / RF-08, RF-09 and RF-19.

## Problem and corrected behavior

Native preparation could report clipping and block its review, but a later lookup of the same unchanged saved copy had only the ordinary presentation metadata. That lookup could lose the known warning. Normal confirmation now rejects a known clipped plan in the backend as well as disabling its button. Checking both appearance/target acknowledgments or calling trusted IPC cannot bypass that rejection.

After a fully verified native save transaction, the workflow records positive clipping evidence by target address, saved UUID and presentation fingerprint. Normal saved lookup attaches it to the same unchanged copy, including after same-target settings reconfiguration. The record contains no Bible text, transcript, audio or image and remains only in memory for the app run, bounded to100 entries alongside the100 native-attempt budget. It is not a general clipping detector or persistent presentation history.

Different targets or changed fingerprints are not claimed to share that warning. They still require ordinary review and retain `formattingVerified=false`. Unknown/not-verified never means formatting is clean. A restart requires the usual fresh operator review; this memory does not certify old copies safe.

## Recovery

Fix the Bible formatting in ProPresenter, then acknowledge the correction and one focus change/new copy in the clipped passage card. **Create fresh copy for review** identifies the actual newly saved UUID and fingerprint, even when the old exact copy remains. It never picks the first duplicate. The old copy is retained, no output is sent, and both appearance and target acknowledgments reset. A fresh clipping warning blocks the new copy too. Unsupported routes retain manual preparation in ProPresenter; the copy budget and Stop/owner/target guards still apply.

Editing formatting alone may not change the ordinary API metadata fingerprint. An unchanged fingerprint with a known warning stays blocked; an image or generic acknowledgment does not clear it. This is deliberate recovery, not automatic formatting repair. Independent fidelity/physical-screen acceptance remains in the full [implementation checklist](51-reference-driven-bible-workflow.md).

## Interrupted preparation and latest-reference handoff

Failure after a native attempt begins revokes session permission to prepare missing passages. Saved-only lookup remains enabled. The operator must inspect ProPresenter and explicitly acknowledge that inspection before re-enabling native preparation. Re-enabling grants permission only; it does not retry the uncertain action. Preflight failures before native access do not request this inspection. No uncertain save is retried or deleted automatically.

A newer detected reference waits at most two seconds for an earlier operation to release ownership. Only the latest request is retained; ordinary preaching does not discard it. Stop, disabling preparation or an ownership deadline drops the pending request without restarting it later. This wait precedes any new action and does not extend the native helper deadline or original audio age/Auto safeguards.

## Verification

365 module tests and syntax checks pass. Tests cover repeated exact reuse, same-target generation changes, target separation, changed metadata remaining unverified, identity validation, saved-copy warning handoff and backend confirmation rejection with both acknowledgments. `scripts/test-detected-native-preparation.cjs --clipped` exercises the real desktop/scheduler/resolver chain using a synthetic helper, target and capture lease: one flagged copy, repeated preparation retaining its warning, backend rejection, no second save and zero output triggers. It acquires no actual microphone or ProPresenter. The earlier real native clipping observations remain in [the personal-host evidence](evidence/detected-native-personal-2026-11-18.json); this change does not pass the unresolved appearance or service gates.

Additional synthetic desktop checks: `--recover` verifies exact fresh-copy selection among duplicates, old-copy retention, reset acknowledgments and zero output; `--uncertain` verifies one failed native attempt, consent revocation, retained saved lookup, refusal without inspection and explicit UI re-enablement without retry. Unit tests cover stale/Stop/unsupported recovery, changed receipts, repeated clipping, owner-wait expiry and ordinary-speech preservation. These are not additional real ProPresenter or microphone acceptance tests.

## Saved lookup during ordinary speech

A separate follow-up fixes the earlier read-only resolver using the all-input epoch: ordinary final preaching could cancel an in-progress saved lookup before it reached review. Lookup now follows the reference epoch as the coordinator already does, with original generation, expiry, target and candidate-presence checks retained. A new reference/hold/correction, partial revision, dismissal, expiry, Stop, mode or edition change still cancels it. A failing regression reproduced both the ordinary-speech interruption and missing intent guard before correction.366 module tests, syntax and the synthetic minimized desktop delayed-lookup/speech test pass; zero native preparation or output is used by that desktop test. The e27272d packages precede this follow-up.

## Native failure guidance

Native adapter failures now explain edition selection, unavailable Bible workspace, focus/input loss, target verification and Save As uncertainty in plain language. Save failures explicitly ask the operator to inspect for an open menu or new copy; they never assert that no side effect occurred. Unknown helper error content is replaced with generic inspection guidance rather than echoed.368 module tests and syntax pass, including a single-attempt boundary regression for known/unknown failures. No native command, timeout, output authority or retry policy changed.
