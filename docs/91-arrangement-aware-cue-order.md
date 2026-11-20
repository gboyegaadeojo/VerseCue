# Arrangement-aware passage cue order

## Problem and source contract

Connector inspection previously flattened the raw presentation group array. The installed API schema defines trigger and thumbnail cue indexes in terms of the selected arrangement; an explicit arrangement can reorder or repeat groups. Validating a label at the raw index could therefore authorize another displayed cue, with readback detecting the error only after a trigger. Three new synthetic regression groups failed against the previous implementation before this correction.

Primary source: [installed 21.4.2 API schema snapshot](evidence/propresenter-installed-21.4.2-openapi.txt), GET /v1/presentation/{uuid}, its arrangements/current_arrangement fields, and the trigger/thumbnail index parameter references. This is installed-version documentation, not proof of another platform or physical output. [Public vendor API](https://openapi.propresenter.com/) remains the documentation entry point.

## Projection and guards

Connector inspection now resolves the selected arrangement ID and its ordered group UUID list. Missing/ambiguous arrangements, duplicate group definitions, unknown group references, inconsistent cue counts and oversized input reject before mapping or output. Explicit repeated groups retain their real index positions for inspection; they do not silently become a complete Bible passage. UUID matching is case-insensitive without rewriting the original presentation fingerprint.

The restricted single unnamed master profile has exactly one selected arrangement, blank name, index zero, no explicit groups, zero arrangement cues and a presentation cue total matching the raw group cues. Only that complete sentinel profile uses raw master order. A named empty arrangement remains empty; an unknown or ambiguous unnamed profile is rejected. No missing-metadata legacy fallback guesses a sequence. Other provider/profile behavior remains subject to actual verification.

Normal Bible passage planning additionally requires every saved raw cue exactly once. Selected arrangements cannot hide or repeat verse fragments and claim a complete single cue. Canonical verse order is still checked, and fragments sharing the same reference must retain their original source order. Legacy Auto attestation also requires one raw cue, preventing an arrangement from hiding other fragments. The native saved-copy path preserves this projection metadata when checking coverage.

Fingerprint, Stop/target/owner/version, edition, clipping, live context, preflight and readback guards remain. No arrangement selection is changed, no generic Next/Clear is used, and uncertain output is not retried. Sequential checks cannot make remote operator edits and dispatch atomic.

## Verification and limits

431 module tests and JavaScript syntax pass. Nine new arrangement tests cover selected order, wrong-label rejection before a trigger, unresolved/ambiguous metadata, the master sentinel, repeated groups, bounds, correct arranged-index fake readback and missing/reversed/repeated fragment coverage. The synthetic desktop scenario verifies normal text review, thumbnail index, deliberate Confirm, ordered continuation, wrong-order blocking and Stop with no manual library/presentation/cue selection.

Existing synthetic API providers now supply explicit master metadata through a test-only fixture helper. It never imports the production projection and never invents replacement metadata when an arrangement field is already present. The coordinator fixture builds the same complete document used by its fake server, so review fingerprints include the real synthetic response shape. Earlier failed/hung fixture-incompatible runs are retained locally and are not passes; owned deferred test workers were stopped before applying corrected fixtures.

Matching Windows package, full source desktop and exact hosted Mac checks follow before merge. Actual-host outcomes remain private pending publication permission. Neither the synthetic tests nor the schema establish real custom-arrangement/thumbnail/physical-screen fidelity, Mac native feasibility, sermon accuracy, latency or full-service acceptance. The unchanged PR22 and original acceptance gates remain open.
