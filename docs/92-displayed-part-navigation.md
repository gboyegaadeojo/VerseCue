# Relative navigation from the displayed passage part

A multi-verse request can span several ProPresenter cues. Previously, matching readback for its first cue retained the whole requested range as navigation context. For example, after cue Hosea 1:1 of a requested Hosea 1:1-3, ?next verse? proposed Hosea 1:4. Two synthetic regressions reproduced the incorrect proposal before the correction.

The coordinator now attaches the exact current cue reference only after matching readback and matching presentation UUID, cue index and fingerprint. Relative navigation uses that displayed reference. The original request remains available for an explicit ?same passage? repeat. Context age, remote identity and ownership are preserved; creating a proposal sends no output and does not renew verification. Internal displayed-cue metadata is removed from new candidate references.

If a multi-verse cue label overlaps a later fragment, its exact displayed verse cannot be inferred. Next/previous/same-verse requests then require a full reference. Explicit verse jumps within a known chapter remain available; ambiguous cross-chapter jumps require a full reference. Once the final broad fragment has matching readback, navigation may proceed after its known range end. Single-verse fragments retain normal next-verse behavior.

## Verification and limits

436 module tests and JavaScript syntax checks pass. Coverage includes initial/second range cues, completed broad fragments, nonoverlapping range cues, explicit whole-passage repeats, expired context, edition numbering restrictions and candidate metadata removal. Desktop and packaged verification are in progress; this document does not claim physical output, speech recognition accuracy, actual-host acceptance or completion of PR22. Existing Auto, stale-command, operator-ownership, Stop and uncertain-output restrictions remain applicable.

The strengthened synthetic arranged-workspace scenario and existing next-verse scenario pass from source. An initial added test repeated the same passage within the intentional duplicate-send cooldown and timed out; the fixture now resets its session between independent cases. Product cooldown checks and assertions remain intact. The earlier restricted-shell stall and this failed attempt are not counted as passes.
