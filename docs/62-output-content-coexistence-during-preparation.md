# Verify existing output content during Bible preparation

2026-11-19 UTC. PR22 / RF-05, RF-10 and RF-19. Original service/physical acceptance remains pending.

## Problem and behavior

The native saved-copy transaction already compared the current presentation UUID/cue index before and after preparation and checked the service playlist. A live text edit can retain that UUID/index, so identity alone did not establish unchanged API output content.

The transaction now reads both `/v1/presentation/slide_index` and `/v1/status/slide` before native access and again after exact new-copy verification. It validates identity/text shape and bounds, then compares a transient SHA-256 signature of the identity and exact current text. No Bible or sermon text is persisted by this check. It does not change slides, text, themes, Looks, routing, playlists or media.

Missing or inconsistent readback before native access blocks the attempt without consuming a native attempt or requesting uncertain-save inspection. An explicitly empty current output is permitted. A mismatch or unverifiable readback after native access rejects completion, preserves any created copy, and revokes session native preparation permission until explicit inspection. No save or output command is retried, and no old output is restored or cleared.

## Boundaries

These two API reads are not an atomic vendor snapshot. The comparison detects differences in the observed before/after identity or text; it cannot prove there was no intermediate change that was later undone. It does not independently inspect physical audience/stream output, rendering, unchanged text styling, all media layers, or Companion actions. A successful transaction still requires ordinary appearance/translation review. Actual concurrent-media/Companion and room/stream acceptance remain required by the [full implementation checklist](51-reference-driven-bible-workflow.md).

## Verification

371 module tests and syntax checks pass. Added cases cover changed text with unchanged identity, malformed/missing text before native access, and an explicitly empty output. Existing cancellation, uncertain copy and service-playlist checks remain passing.

`node scripts/test-detected-native-preparation.cjs --output-edit` exercises the actual desktop, coordinator and saved-copy workflow against a synthetic target and helper. One synthetic copy is created, its unchanged output cue reports edited live text, completion is withheld, native consent is revoked, saved lookup remains available, inspection is required before re-enabling, and re-enabling does not retry. It sends zero output triggers and uses no real microphone or ProPresenter. Recovery/listening regressions are verified separately; matching packages must name their tested revision.

The read-only personal-host check `node scripts/hil-output-content-readback.cjs --authorized-personal-host` passed against Windows ProPresenter21.4.2: both response shapes were accepted and two observed signatures matched. It requested no native preparation, microphone or output and persisted neither verse text nor current identity. [Sanitized evidence](evidence/output-content-readback-personal-2026-11-19.json). This verifies response compatibility, not a real mid-preparation edit, physical screens or field coexistence. Source recovery and retained-listening desktop regressions also pass against synthetic targets.
