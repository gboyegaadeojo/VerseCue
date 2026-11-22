# Switching Bible version for the passage just used

2026-11-22, NR-018.

## What happens

1. **Hearing the request.** The parser recognises a version request without a reference as a *version* command. The request needs a version name plus only request words (can, could, give, me, have, read, it, that, switch, to, please and similar). The recognised names are:
   - NIV, New International (Version)
   - KJV, King James (Version)
   - NKJV, New King James (Version)
   - ESV, English Standard (Version)
   - AMP, Amplified (Bible)
   - AMPC, Amplified Classic
   - MSG, The Message
   - ASV, American Standard Version
   - NLT, New Living (Translation)

   Talk about versions ("the NIV is a good translation…", "I love the King James") is ignored. "1st Timothy 1 verse 2 in NIV" already worked as a full reference.
2. **The passage just used.** The session remembers the last reference it heard, for up to 10 minutes. A version command reopens that passage in the new version as a **version-switch** candidate:
   - never eligible for Auto
   - always carries a review note
   - if there is no recent passage, or the passage is already in that version, VerseCue says so
3. **Installed versions first.** Before opening a passage in a version other than the default, VerseCue reads ProPresenter's installed versions. On Windows, the helper's read-only `list-translations` opens ProPresenter's version menu, reads the names, closes the menu with Escape and confirms the selection is unchanged. The result is remembered for 10 minutes per connection and mapped to codes (`core/bible-versions.cjs`).
   - **Installed:** the passage opens in that version. In Prepare for volunteer that's the whole chapter at the verse; in Confirm it's the normal review.
   - **Not installed:** nothing is prepared, and the status line says, for example: "NIV isn't installed in ProPresenter, so VerseCue is keeping KJV. Installed: ASV, KJV."
   - **Can't be checked** (Mac until its helper is verified, or a ProPresenter on another computer): the passage goes through the saved-passage route, which reports a missing passage as usual.

Nothing is sent live by a version request.

## Verification

| Check | Result |
| --- | --- |
| `tests/version-switch.test.cjs`: spoken forms, ignored talk, passage just used, not-eligible for Auto, notices, name mapping, not-installed refusal, installed and cannot-check paths | Pass |
| Live `list-translations` on the personal ProPresenter 21.4.2, freshly restarted, Audience and Stage off | Read "American Standard Version" and "King James Version"; menu closed; selection unchanged; live slide unchanged |
| Live end-to-end switch (Psalm 23 in KJV, NIV not installed, ASV installed) | Pending. After a few preparations ProPresenter became very slow to answer accessibility queries (about 15 s just to find its Bible controls; 19–26% of all cores continuously, recovering only on restart). Being investigated before this is merged. |
