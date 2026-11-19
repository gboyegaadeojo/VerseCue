# Keep known clipping warnings when reusing a passage

2026-11-19 UTC. PR22 / RF-08, RF-09 and RF-19.

## Problem and corrected behavior

Native preparation could report clipping and block its review, but a later lookup of the same unchanged saved copy had only the ordinary presentation metadata. That lookup could lose the known warning. Normal confirmation now rejects a known clipped plan in the backend as well as disabling its button. Checking both appearance/target acknowledgments or calling trusted IPC cannot bypass that rejection.

After a fully verified native save transaction, the workflow records positive clipping evidence by target address, saved UUID and presentation fingerprint. Normal saved lookup attaches it to the same unchanged copy, including after same-target settings reconfiguration. The record contains no Bible text, transcript, audio or image and remains only in memory for the app run, bounded to100 entries alongside the100 native-attempt budget. It is not a general clipping detector or persistent presentation history.

Different targets or changed fingerprints are not claimed to share that warning. They still require ordinary review and retain `formattingVerified=false`. Unknown/not-verified never means formatting is clean. A restart requires the usual fresh operator review; this memory does not certify old copies safe.

## Recovery

Fix the Bible formatting in ProPresenter before creating a fresh copy. Current fallback: re-enter the reference, expand **Manual preparation tools**, acknowledge native focus/copy changes in Advanced if needed, and use the existing prepare/save action. Review the correct fresh copy if several exact copies exist. No old copy is deleted or silently replaced. Native readiness, the copy budget, Stop/owner/target guards and clipping checks still apply.

Editing formatting alone may not change the ordinary API metadata fingerprint. Consequently an unchanged fingerprint with known warning stays blocked; an image or generic acknowledgment does not automatically clear it. This is conservative recovery, not automatic formatting repair. A simpler direct fresh-copy workflow and independent fidelity/physical-screen acceptance remain part of the full [implementation checklist](51-reference-driven-bible-workflow.md).

## Verification

355 module tests and syntax checks pass. Tests cover repeated exact reuse, same-target generation changes, target separation, changed metadata remaining unverified, identity validation, saved-copy warning handoff and backend confirmation rejection with both acknowledgments. `scripts/test-detected-native-preparation.cjs --clipped` exercises the real desktop/scheduler/resolver chain using a synthetic helper, target and capture lease: one flagged copy, repeated preparation retaining its warning, backend rejection, no second save and zero output triggers. It acquires no actual microphone or ProPresenter. The earlier real native clipping observations remain in [the personal-host evidence](evidence/detected-native-personal-2026-11-18.json); this change does not pass the unresolved appearance or service gates.
