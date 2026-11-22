# 145 - Accuracy check and better book-name hearing (NR-022)

Date: 2026-11-22. Requirements: FR-009/010/012 (recognition), NFR-002 (precision/recall evidence). This adds tools and safer parsing. It is not the held-out sermon evaluation that the Auto trust gate needs.

## 1. In-app accuracy check

Settings > Speech > **Check accuracy**:

- The operator reads 55 short phrases with the saved input: 50 references weighted toward hard book names, plus 5 sentences without a reference, one after every tenth phrase.
- Each phrase is recognised twice, without and with book-name hints, and scored as correct, wrong or missed. A reference heard in a sentence without one counts as invented.
- The summary gives both scores, the time per phrase and advice on the hints.
- **Saving is optional.** "Save results" writes `results.json` to a folder the operator chooses. If the operator ticks "Also save my recordings", it writes WAV files and `labels.json` instead, in the format `scripts/evaluate-speech-hints.cjs` reads.

Safety:

- The check has its own capture purpose (`accuracy-check`), as the input test does. Its audio never reaches normal recognition, the session, candidates, Auto, preparation or output.
- It needs explicit consent for the input and refuses to start in Auto. In the app, Start switches Auto off (to Confirm), and the dialog says so.
- Recordings stay in the window's memory until the dialog closes, unless saved.
- Scenario test: `scripts/test-accuracy-check.cjs`.
- End-to-end (2026-11-22): Chromium's fake microphone played synthetic speech into the check with the real engine. The dialog progressed phrase by phrase and produced a summary, and the session queue and history stayed empty.

## 2. Book-name hints: measured, then made optional

Test set:

- 62 clips: Windows' built-in voices (David, Zira) at three speeds read the 50 references and the 12 sentences without one. Silence and noise were added (`scripts/make-tts-check-audio.ps1`).
- Engine: whisper.cpp b5454 base.en on the development processor (`scripts/evaluate-speech-hints.cjs`).
- Synthetic speech shows software behaviour only.

| Run | Reader | Correct | Wrong | Invented (of 14) | Time per clip |
|---|---|---|---|---|---|
| No hint | before | 47/50 | 0 | 0 | 2.3 s |
| All 66 book names as a hint | before | 46/50 | 0 | 0 | 7.3 s |
| Sermon-style hint | before | 45/50 | 0 | 0 | 3.4 s |
| No hint | tolerant (below) | 47/50 | 0 | 0 | 2.3 s |
| All 66 book names as a hint | tolerant | **50/50** (2 approximate) | 0 | 0 | 7.3 s |
| Sermon-style hint | tolerant | 49/50 (4 approximate) | 0 | 0 | 3.4 s |

**Findings:**

- With hints, the engine mostly heard the right book but spelled it slightly differently ("Habakuk", "Hagiai"), or added a comma ("Jude, verse 24").
- The hints made each phrase about three times slower on this processor.

**Decision:**

- The tolerant reader is always on.
- The 66-book hint (`core/speech-hints.cjs`) is an optional setting, "Book-name hints", off by default. The accuracy check measures both ways on the operator's own voice and computer and advises.
- A graphics card is expected to shrink the extra time, but that is not measured yet.

## 3. Tolerant book names (always on)

- **Commas:** a comma between the book and "verse" is accepted ("3 John, verse 2", "Jude, verse 24"). Commas before a chapter or number were already accepted.
- **Approximate names:** a word close to one book name (one letter off for names of five or six letters, two for longer names) is read as that book, but only when chapter or verse wording follows.
  - Ties, common words (number, judge, things and others) and names of four letters or fewer are never matched.
  - Example: "June verse 24" is not read as Jude.
- **Review only:** such a reference carries the issue "Book name heard approximately · review". Auto never sends a candidate with an issue, so these always go to a person: Confirm shows them, and Prepare for volunteer prepares them. Auto's rules are unchanged.
- Tests: `tests/approximate-books.test.cjs`. These cover the accepted misspellings, the comma forms, exact names unchanged, and rejected near-words such as "page number 3 verse 2", "the judge 5 verse 3" and "Feel Him in chapter 1 verse 6".
