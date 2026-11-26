# Choose the Auto citation policy explicitly each session

2026-11-19 UTC. PR22 / RF-18. This adds a speech-intent choice inside the existing guarded Auto scope. It does not complete arbitrary native Auto or field acceptance.

## Operator choice

Confirm remains the startup default. Opening the Auto dialog always selects **Explicit show/read instructions only**, with consent unchecked. An operator may instead select **Also allow complete bare citations**, then acknowledge the displayed session policy and simulation/test-output scope. The backend separately requires `acknowledgeBareCitations=true` for that choice. The active policy remains visible beside the service controls.

The choice is memory-only. Stop/resume, switching mode, configuration changes and session reset restore the explicit-instruction policy; it is not imported/exported in settings or profiles. Enabling Auto still revokes detected native-preparation consent. A private API client cannot enable Auto or grant this choice.

## What counts as a bare citation

Only a complete anchored utterance containing one book, chapter and verse, optionally a same-chapter range and explicit KJV suffix, fits the grammar. Existing normalization accepts ordinary spoken numbers, supported book aliases and chapter/verse markers, such as “John three sixteen” or “Jeremiah two verse five.” The entire utterance must fit; discussion around a reference, questions, negation, historical mentions, partials and extra material do not borrow bare permission. Unknown numbering, implicit single-chapter references and punctuation ambiguity retain their existing review gates.

Current show/read instructions remain eligible under either policy. Quotes, assembled-window references, relative commands, manual/private-API input, corrections, ambiguity and invalid/outdated candidates remain ineligible. The existing original-audio-age ceiling, final/silence/loss evidence, authorized capture, correction grace, duplicate cooldown, target ownership and Stop/recovery checks are unchanged.

## Output and preparation boundary

Dry-run Auto simulates only. Actual development Auto still needs an armed, connected loopback test target and an exact complete single-cue mapping explicitly verified for Auto; fingerprint/readback checks and one accepted trigger/no blind retry remain. This policy creates no native copy, does not prepare a missing passage and does not approve a saved passage merely because it has a native-origin label. It cannot make the8–11second native route satisfy the existing4second freshness bound. Normal passage-level arbitrary Auto and its no-technical-mapping workflow remain unfinished under [the full checklist](51-reference-driven-bible-workflow.md).

## Verification and remaining acceptance

394 module tests and syntax pass. Added tests cover separate acknowledgment/default/reset behavior; complete spoken citations; rejection of prose/questions/history/partials; and retained stale-audio, quote, manual, loss, missing-map and correction gates.

`scripts/test-guarded-auto.cjs` and its `--bare-citations` variant exercise the actual desktop dialog, default choice, explicit consent, visible policy, manual-input exclusion, zero-write simulation, one verified fake trigger while minimized, Stop reset/cancellation and simulated suspend cancellation. Both pass with synthetic recognition and a fake loopback target, no real microphone or ProPresenter. Workspace200% fit and citation-stabilization regressions pass separately. Matching platform/package checks must name their revisions.

No live speech false-positive/accuracy, physical output, real Auto on ProPresenter, native preparation latency or service-readiness pass is inferred. Full original62FR/24NFR and RF01–22 acceptance remain required; PR22 stays draft.
