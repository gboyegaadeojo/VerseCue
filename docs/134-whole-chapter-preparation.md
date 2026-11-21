# Whole chapter at the spoken verse

2026-11-21, NR-014. User request: when the pastor says Proverbs 3:5, ProPresenter showed only that verse. If the pastor went on to verse 6 or back to verse 4, the volunteer had to search for Proverbs 3 again. The user also asked for a higher verse limit in case a minister reads a whole chapter.

## What changed

- **Prepare for volunteer opens the whole chapter.** For "Proverbs 3:5", VerseCue types "Proverbs 3" into ProPresenter's Bible view. ProPresenter generates all 35 verses ("Proverbs 3:1-35"), and VerseCue brings verse 5 into view. The volunteer clicks verse 5 to take it live, then uses next or previous. VerseCue sends nothing and saves no copy.
- **Chapter-only references work:** "Romans chapter 8" opens Romans 8 at verse 1. Long ranges ("Proverbs 3:5-30") open the chapter at the first verse.
- **Bringing the verse into view:** ProPresenter 21's Bible slide grid has no accessibility scroll control. When the verse is not already on screen, the bridge turns the mouse wheel over the grid. Before each turn it checks that the grid belongs to ProPresenter and that ProPresenter has focus. It turns in estimated batches of about two verses per turn, then puts the pointer back. A wheel turn only scrolls; nothing is clicked, selected or taken live. VerseCue reports whether the verse was confirmed in view and otherwise says "scroll to it".
- **Setting:** Settings > Output > "In Prepare for volunteer, open the whole chapter at the spoken verse" is on by default. Unticked, Prepare for volunteer goes back to preparing the exact passage as a saved copy.
- **Verse limit:** the configurable maximum rises from 50 to 176 (Psalm 119), so a whole chapter can be read as one range in Confirm. Auto keeps its own 10-verse limit. Saved passage copies are still read up to 100 slides.
- **Time limit:** a chapter preparation may take up to 25 s (one passage keeps 12 s), because ProPresenter generates up to 176 slides and reading their labels takes about a second per check.

Confirm and Auto are unchanged. They still prepare and send only the exact reviewed passage.

## Verification (personal ProPresenter 21.4.2, Audience and Stage off before, during and after, live slide unchanged)

| Spoken (synthetic recognized text) | Result |
| --- | --- |
| Proverbs chapter three verse five | Proverbs 3 opened, verse 5 in view, about 8 s |
| Psalm 119 verse 105 | Psalm 119 opened and scrolled to verse 105, about 24 s |
| Psalm 119 verse 11 (straight after 105) | Scrolled back up, verse 11 in view |
| Romans chapter eight | Romans 8 opened at verse 1 |

| Check | Result |
| --- | --- |
| `tests/chapter-context.test.cjs`: request shape, verse bounds, no saved copy, mismatched replies rejected, routing only in Prepare for volunteer, setting off, limit 176 | Pass |
| `npm test`, `npm run check`, scenario sweep | See PR |

Not yet tested with a real voice in a service, on the Mac (the native bridge is Windows-only), or with translations whose verse numbering differs from KJV.
