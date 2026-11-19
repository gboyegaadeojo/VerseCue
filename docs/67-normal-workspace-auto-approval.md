# Approve a reviewed passage for Auto without technical mapping

2026-11-19 UTC. PR22 / RF-01, RF-16 and RF-18. This completes a normal approval path for existing complete verified test cues; arbitrary new native Auto and field acceptance remain unfinished.

## Normal workflow

Prepare the requested reference in the workspace and review its complete text and appearance in ProPresenter. For an eligible single-cue KJV passage, acknowledge the ordinary appearance and disconnected-test-target checks, then select **Allow this complete single-cue KJV passage for Auto test output from this window this session**. **Approve and arm for Auto** rechecks the exact passage and arms its internal test mapping without sending output. Enable Auto separately through its policy/consent dialog, then use the approving window's explicitly authorized input.

No normal Library, Presentation UUID or Cue selection is required. The advanced mapping fallback remains available for its existing scope. Approval is optional and does not alter ordinary Confirm or ordered multi-part continuation. Pressing Ctrl/Command+Enter while the Auto-approval button is focused approves without output; elsewhere the existing reviewed-confirm/continue shortcut remains. Incomplete acknowledgments cannot arm a cue.

## Eligibility and dispatch

Approval requires a current unexpired Confirm review from Confirm, exact target/session/reference identity, an unchanged fingerprint, complete single-cue KJV numbering, no known clipping, a connected loopback test target and a trusted owning window. Quotes, relative-source approvals, split cues, unknown numbering, LAN targets, stale/changed reviews and foreign input owners are refused. The current authorized input, if active, must belong to the approving window; no microphone is acquired or reacquired.

The connector records a memory-only owner-bound internal approval. It stays a passage-internal mapping: ordinary desktop and private-API sends cannot reuse it without passage review. Only the guarded Auto origin with authorized fresh speech from its matching capture owner can use the special approval path. The selected citation policy, original4second audio-age ceiling, final/silence/loss evidence, correction grace, quote/relative exclusion, duplicate suppression, fingerprint/version preflight, bounded readback and no-output-retry rules remain.

The normal approval does not enable Auto by itself, generate new native copies, approve unprepared references, broaden translation support or certify Bible text/formatting/physical output. An unapproved newly spoken passage stays for review. This does not make the existing slow native route eligible for arbitrary Auto.

## Ownership and races

Closing/reloading/losing the approving renderer removes its normal Auto approvals, disarms output and pauses the session, even after its capture lease was released. Settings/target reconfiguration clears mappings as before. Stop blocks further dispatch and resets the citation policy; deliberate rearm/Auto consent is still required. Accepted ProPresenter output is never automatically cleared or restored.

Approvals carry a unique internal operation identity. Cancellation removes only that operation's newly staged approval; it cannot remove a newer mapping or disarm a newer target. New reference intent during or immediately after verification cancels approval without pausing newer input or retaining a grant. The shared operation owner serializes preparation/approval/output. A window with no relevant authority does not cancel another window's work merely by closing.

## Verification

399 module tests and syntax checks pass. Added cases cover zero-output approval, legacy desktop/private-API rejection, owner-only guarded Auto, missing consent/clipping/split/edition/quote/stale/LAN refusal, cancellation both during inspection and after staging, and late-result isolation from a new target.

`scripts/test-normal-auto-approval.cjs` passes against a synthetic target and recognizer: normal reference review with blank advanced mapping fields; unchecked backend rejection; approval by its focused keyboard action with zero output; a later bare citation triggers one matching fake readback; an unapproved reference remains review-only; closing the owner after ending capture removes approval and prevents another window from enabling test Auto from it. No actual ProPresenter, microphone, native focus changes or physical output is used. Existing normal Confirm/continuation and bare-policy desktop regressions also pass. Matching package/platform checks must name their exact revisions.

Saved metadata/fingerprint checks still do not independently prove actual current theme/Looks or physical rendering. Those fidelity, real speech, arbitrary native Auto, latency, Mac native and full-service exits remain required by the [full checklist](51-reference-driven-bible-workflow.md). PR22 stays draft.

## Look and saved-image change checks

Normal Auto approval now samples the current Look and bounded saved PNG twice around a fresh metadata check. It retains only transient SHA-256 receipts, not the image or Look payload. The current Look must carry a valid UUID. Unstable/missing/malformed responses refuse approval withzeroOutput. Before an approved normal Auto cue is dispatched, the connector reads the Look and saved PNG again; changed receipts remove that exact grant and disarm, requiring review again. Existing image size/stream/deadline, target/window/capture/audio-age and Stop guards apply. Checks do not extend the four-second original speech-age ceiling. Ordinary Confirm and legacy advanced mappings keep their existing scope.

The comparison is deliberately conservative: JSON serialization/order or PNG metadata changes may require review even when visible pixels look identical. Cached thumbnails may fail to expose every rendering change. These sequential API observations cannot make dispatch atomic, independently prove physical routing/rendering, or replace actual screen inspection. The personal ProPresenter endpoint was unreachable at this checkpoint, so compatibility and stability of these combined checks on a real host remain PENDING. Earlier verified read-only Look and PNG routes are reused; no undocumented output route is introduced.

404 module tests and syntax checks pass locally. New tests cover Look/thumbnail/metadata changes during approval, malformed Look identity, changes without presentation metadata edits, cancellation during image inspection, revoked/replaced mappings before dispatch and revoked mappings during readback. The normal desktop synthetic approval scenario passes with its explicit fake Look/PNG. Windows49705b4 packaged normal approval/bare-policy/reference checks and Mac44522699945 passed the preceding399-test source; they do not cover this later change. The7ff7923 minimized development soak passed90minutes/181cycles and likewise excludes it.

The desktop script also supports `--changed-look`: the fake Look changes after normal approval while saved metadata remains unchanged, then a minimized synthetic speech detection pauses Auto withzeroTriggers. It does not assert undocumented snapshot fields or claim actual screen output. The standard Mac workflow runs this branch too.

Appearance-change pauses now use fixed, actionable guidance to resume in Confirm, review and approve again. An additional module test rejects raw/private exception text from the operator status;405 module tests pass. Matchingf61a2c8 Windows package and Mac44572496386 passed the preceding404-test appearance-binding revision. The later guidance follow-up requires its own matching package check.
