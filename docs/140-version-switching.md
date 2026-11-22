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
| Live end-to-end switch on a freshly restarted ProPresenter, Audience and Stage off, live slide unchanged | Pass: Psalm 23 opened in KJV (4.4 s); "Can you give me NIV" refused with "NIV isn't installed in ProPresenter, so VerseCue is keeping KJV. Installed: ASV, KJV." (2.9 s); "Read that in the American Standard Version" reopened Psalm 23 in ASV (7.1 s) |

## Finding: ProPresenter on Windows slows down once the helper connects

These measurements were taken on the personal ProPresenter 21.4.2 on 2026-11-22, with Audience and Stage off throughout.

| Situation | ProPresenter CPU (share of all cores) |
| --- | --- |
| Freshly restarted, at rest | 2.6–3.1% |
| Volunteer generates Psalm 23 by hand in the Bible view, VerseCue not running | 2.7–5% |
| After one read-only helper inspection (header, reference box and version picker only) | about 16% within a minute, persisting |
| After one helper chapter preparation | about 18–21%, persisting until ProPresenter is restarted |

Once any UI Automation client has read ProPresenter's window, ProPresenter keeps doing extra accessibility work for the rest of its session, and accessibility queries become very slow (about 10–15 s to find the Bible controls). Narrowing the helper's searches to the Bible viewer did not change this, so it is process-wide rather than tied to particular searches. It is VerseCue's helper, not ProPresenter's Bible view: generating a chapter by hand does not cause it.

Interim changes:
- the helper's limits are longer (30 s per preparation, 45 s for a whole chapter);
- whole-chapter preparation still succeeds on a slowed ProPresenter (41 s).

Reading or changing the version menu on a slowed ProPresenter still times out. A lighter Windows approach is needed before version switching (and Windows preparation in general) is dependable for a long service. That approach should keep the helper connected only briefly, or avoid UI Automation for the version menu. This is tracked as the next Windows task.

## Decision (2026-11-22)

The user chose to keep screen reading, which keeps the confirmation of what ProPresenter opened. On Windows, restart ProPresenter before each service so it starts fast. The README says so.
