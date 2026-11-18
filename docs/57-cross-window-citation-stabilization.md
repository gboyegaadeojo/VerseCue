# References spoken across recognition windows

2026-11-18 UTC. PR22 / RF-13. This is a deterministic recognition improvement, not a real-recording accuracy or service acceptance result.

## Operator behavior

An incomplete citation displays **Waiting for the rest of the Bible reference** instead of proposing an actionable incomplete passage. For example:

| Recognized fragments | Result |
|---|---|
| Please turn to John chapter three / verse sixteen | John 3:16, Confirm review |
| First Corinthians / chapter thirteen / verses four through seven in the Amplified version | 1 Corinthians 13:4-7, AMP, Confirm review |
| Revelations one verse / one | Revelation 1:1, Confirm review |
| Jeremiah two vs / five | Jeremiah 2:5, Confirm review |
| John chapter / three verse sixteen | John 3:16, Confirm review |
| Jude verse / five | Jude 1:5, Confirm review |
| John three sixteen through / eighteen | John 3:16-18, Confirm review |
| John three sixteen in the / Amplified classic | John 3:16, AMPC, Confirm review |
| John chapter three / God is love verse sixteen | No assembly |
| John chapter three / sixteen | No assembly: the verse marker was not supplied |

The assembled card shows the source fragments and a review warning. No assembled reference Auto-sends, including one introduced by read/show. Existing opt-in saved-passage preparation can prepare its review in Confirm; creating a missing passage needs explicit native consent, either for manual Prepare or the later [per-session detected-passage option](58-detected-missing-passage-preparation.md). Appearance, translation and authorized target checks remain required before output. Partial STT results never create candidates.

## Continuity and lifetime

`ui/audio-buffer.js` assigns a fresh random capture-session identity on each input start and consecutive window numbers. Window UUIDs remain the recognition deduplication identity. `core/citation-stabilizer.cjs` joins only anchored citation grammar, never arbitrary sermon sentences or guessed paraphrases. It retains at most three fragments of at most 200 characters each in memory.

Fragments must belong to the same authorized capture owner, reference scope, mode, capture session and default translation; their window numbers must be consecutive. Capture timing must be known, loss-free and fresh. Estimated capture boundaries cannot overlap by more than 100ms and the gap cannot exceed three seconds. Timing remains a conservative capture proxy, not an independently measured audible-reference boundary.

Candidate lifetime uses the oldest fragment's capture origin. Completing a reference does not restart its fifteen-second audio lifetime. An incomplete reference expires and clears its fragment memory even if no new result arrives. Ordinary unrelated text, unsupported continuation, correction/reference replacement, audio loss/clipping, capture stop/restart, mode/configuration changes, native recognition cancellation, owner loss and recovery cannot reuse old fragment memory. Duplicated windows are withheld without repeating a command. A new complete standalone reference continues through the ordinary parser.

Holding an incomplete citation clears prior passage context and suggestions and cancels pending preparation/Auto. This prevents a subsequent verse fragment from silently using an older displayed chapter. Expiration asks the operator to repeat the full reference; it does not change output or restart a microphone.

## Verification and remaining work

336 module tests and syntax checks pass at this source checkpoint. Unit tests cover two/three fragments, edition/range/chapter markers, one-chapter books, duplicate windows, capture restart/order, gap/age/owner/reference changes, missing/lost timing, finality, invalid/negated/historical/unrelated tails and timer expiry. Buffer tests verify stable session identity, consecutive numbers and fresh identity after restart.

`node scripts/test-citation-stabilization.cjs [isolated-package-executable]` uses synthetic recognition, a synthetic capture lease and a synthetic loopback target. It verifies incomplete withholding, complete review and deliberate desktop confirmation, oldest audio age, duplicate suppression, manual/audio-loss cancellation, partial withholding, assembled Auto rejection and Stop. It acquires no OS microphone and accesses no real ProPresenter. Source audio-age, guarded Auto, minimized preparation and private-API review regressions pass separately. Matching package/platform results must be recorded against their exact revision.

This does not repair words cut or misrecognized by STT, merge unrestricted clauses, establish accent/recognition precision, or guarantee every possible multi-window phrasing. Long or slow windows can legitimately exceed the existing lifetime and require repetition. Real held-out sermon labels, full speech stabilization/command acknowledgment acceptance, actual selected input/minimized endurance, latency and physical output remain pending. Keep the complete [workflow checklist](51-reference-driven-bible-workflow.md) and original acceptance gates open.
