# Real passage confirmation on the personal disabled-screen host

2026-11-19 UTC. PR22. This is a deliberately scoped real connector test, not live-service or physical-output acceptance.

## Preconditions and procedure

The user previously authorized test passages on the personal Windows ProPresenter installation. The test required exact ProPresenter21.4.2/win, loopback1025, both audience and stage screen status false, the current Scripture Look and the existing mock Sunday Service playlist. It refused to run without those conditions and retained a unique attempt record. It used the existing one-cue Nahum1:7/KJV test copy, including its previously adjusted test-copy appearance; it did not regenerate a Bible passage or modify the original Bible theme.

The isolated VerseCue window connected, entered the reference, prepared the exact saved passage through the normal coordinator, loaded its real saved-slide thumbnail and left both confirmation boxes unchecked. Computer Use inspected the complete saved text, KJV selection, thumbnail and current disabled-screen test configuration. It acknowledged the appearance and authorized personal target, then clicked **Confirm and show passage** once. No library, presentation UUID or cue selection was required in the operator UI.

## Observed result

At revision184887c, the normal passage confirmation produced one accepted receipt with matching ProPresenter presentation/cue/text readback. The software preview in ProPresenter showed the Nahum test cue. Both audience and stage screens remained disabled, the current Look and Sunday Service contents were unchanged, and no microphone or native preparation was used. The test latched Stop afterward without issuing Clear or retrying output. ProPresenter was left displaying the accepted test cue in its software preview; the harness did not restore unrelated material automatically.

[Sanitized result](evidence/personal-passage-confirmation-2026-11-19.json). The private attempt record remains excluded from Git. `scripts/hil-confirm-saved-passage.cjs` requires explicit personal-host/disabled-screen flags and Computer Use performs the final action; never use it against a live service or automatically repeat a recorded attempt.

This verifies the real saved-passage coordinator/confirmation/readback path rather than only dry-run behavior. It does not prove arbitrary new-passage output, live speech recognition, physical room/livestream routing, original church-theme fidelity, media/Companion coexistence, Auto accuracy/latency, Mac native integration or field reliability. Native preparation still has the documented latency/clipping limitations. All remaining original and [RF01–22](51-reference-driven-bible-workflow.md) acceptance gates stay open; PR22 remains draft and unmerged.
