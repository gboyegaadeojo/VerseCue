# Open from the spoken verse (setting)

2026-11-25. [NR-029](../NEW_REQUESTS.md). This follows [docs/153](153-narrow-propresenter-reading.md). There, ProPresenter on Windows still slowed after about a dozen whole-chapter preparations, and most of the time went on scrolling to the spoken verse. The user chose to "make it a setting, keep whole chapter as default".

## What the operator sees

**Settings > Output > When the chapter opens, start from** has two choices:

- **The whole chapter, at the spoken verse (default).** This is unchanged: for Proverbs 3:5, all of Proverbs 3 opens, scrolled to verse 5.
- **The spoken verse to the end of the chapter (faster).** Proverbs 3:5 opens Proverbs 3:5-35. The spoken verse is the first slide, so nothing needs scrolling and ProPresenter builds fewer slides. The volunteer cannot go back before verse 5 without typing the reference.

The passage panel then reads "Proverbs 3:5-35 is open in ProPresenter's Bible, starting at verse 5". The panel label is "Proverbs 3:5 · to the end of the chapter". Early preparation (NR-020) uses the same choice.

## How it works

- `volunteerRange` setting: `chapter` (default) or `from-verse`; anything else is refused. `desktop/main.cjs` copies it to the session.
- The passage coordinator passes `fromVerse` to early and final chapter preparation. The Windows helper request gains `fromVerse: true`; it is omitted for the whole chapter, so whole-chapter requests are unchanged.
- **Windows helper:**
  - types `Book C:V-N`, or `Book C:V` when V is the last verse;
  - checks that the reference field shows exactly that;
  - checks that the generated labels belong to the chapter;
  - reports `fromVerse` back.
- VerseCue refuses a reply whose `fromVerse` does not match the request. All other checks are unchanged (edition, focus, responsiveness, no output).
- **Mac:** automatic preparation is not enabled on the Mac yet (it is still being verified). When it is, the Mac helper must support `fromVerse` too.

## Verification

| Check | Result |
| --- | --- |
| `tests/chapter-context.test.cjs` | `fromVerse` sent only when chosen; a reply that ignores it is refused; settings default `chapter`, and only the two values are accepted |
| `tests/early-preparation.test.cjs` | The setting reaches early and final preparation; the default stays the whole chapter |
| `npm test` | 649/649 |
| Live, the user's ProPresenter 21.4.2, Audience and Stage off throughout (helper driven directly, 8 chapters) | ProPresenter accepted every `Book C:V-N`, VerseCue verified it, the spoken verse was in view every time and no scrolling was needed. On the same ProPresenter session, already slowed by 37 earlier whole-chapter preparations, each took 2.4-16 s; whole chapters had taken 11-52 s in that state. Most of the remaining time is ProPresenter building the slides |

## Packaged app with speech, freshly restarted ProPresenter

2026-11-25. Main d50f6bb (PR138 + PR139) packaged for Windows. Large-v3-turbo ran on the GPU (RTX 2060). ProPresenter 21.4.2 was restarted by the user, and Audience and Stage reported off at all 1,934 checks. The same 12 recorded phrases were used in each run. ProPresenter's live slide was unchanged, and VerseCue sent nothing. Times are from the end of the phrase.

| Run | Result | Time to prepared |
| --- | --- | --- |
| 1. Whole chapter (default), fresh ProPresenter | 12/12 right chapter, spoken verse in view | 2.6-9.4 s for the first 5, then 8.5-23.6 s |
| 2. From the spoken verse, same ProPresenter session (12 preparations in) | 10/12 prepared, all with the range and verse in view | 8.8-37 s; speech itself took 3-15 s in this run, against 1-5 s in run 1 |

The two misses in run 2 were both stopped safely:

- **First phrase:** speech took 15 s, so the phrase was older than the 5 s limit and was dropped (`SPEECH_EVIDENCE_EXPIRED`).
- **2 Corinthians 5:17:** the responsiveness check stopped it ("ProPresenter is responding too slowly...").

After the 24 preparations, ProPresenter used about 1.6 processor cores while idle.

**Conclusions:**

- Fresh ProPresenter is quick with either setting.
- ProPresenter's own slowdown still builds over a session. It also slows speech, because the two share the computer.
- Restarting ProPresenter before the service remains the advice.
