# Preaching citation forms and recognition diagnostics

2026-11-18. User reported common spoken/typed Bible forms being reduced to chapter-only suggestions, including Jeremiah2vs5, Revelation variants and John1-1. This improvement preserves existing output/mode gates and does not access ProPresenter.

## Accepted citation families

| Form | Example | Result |
|---|---|---|
| Adjacent numbers | Revelations1 1 (with normal book spacing) | Revelation1:1 |
| Verse markers | Jeremiah2vs5; Rev.1v.1; John ch.3vv.16 | Canonical book/chapter/verse |
| Chapter wording | Jeremiah chapter number2 verse number5 | Jeremiah2:5 |
| Joining words | Revelation1and verse1 | Revelation1:1 |
| Starting point | Revelation1starting from verse1; beginning at verse1; from verse1 | Revelation1:1; no unstated end verse inferred |
| Explicit ranges | John3verses16to verse18; starting from verse16through verse18 | John3:16-18 subject to existing range limit |
| Abbreviations | Gen., Rev., Jer., Phil., Ps., First Cor,2Tim and other exact common aliases | Canonical book names; numbered-book constraints retained |
| Transcribed punctuation | John1-1; Genesis1.1 | Explicit chapter/verse candidate with punctuation-review issue; withheld from Auto |
| Invalid transcript | Philippians4.92 | Philippians4:92, invalid in verified KJV numbering; never guessed as4:9/4:19 |
| Missing verse | Genesis1 | Clear request to enter the full book, chapter and verse; sending remains blocked |

Book names are never broadly fuzzy-corrected. The specifically reported Revelaations spelling is an exact alias; ordinary Revelations maps to canonical Revelation. A transcript John1-1 cannot establish that the preacher said Genesis1:1. This requires speech/device evidence rather than silently changing books. Typed/transcribed syntax correctness is distinct from microphone/STT accuracy.

The parser normalizes supported exact abbreviations, chapter/verse markers and joining phrases before the existing bounded canonical parse. Numeric KJV validation, translated-numbering boundaries, range caps, stale/context/correction handling, prohibited instructions and Auto eligibility checks remain in place. Ambiguous punctuation produces a review issue even when the resulting reference is valid. The original66-row CSV/JSON corpus is untouched;29additional SYNTHETIC-TEXT regressions bring the suite to199tests.

## Quoted wording

The exact reported text, "For God so loved the world that it gave His only because and Son", already matches John3:16 through its sufficiently distinctive leading span and conservative single substitution when a suitable rights-cleared local index is loaded and enabled. A new regression proves this through Session, including no detection before opt-in and Confirm-only quote evidence. No widening to broad semantic inference or automatic quote output is needed or claimed.

The main inspector now shows whether quoted wording is enabled and links directly to Settings / Quotes. A missing/mismatched/disabled index is explicit. No Bible corpus is bundled or scraped; the existing local import/rights/session-only controls remain mandatory. This diagnostic improvement prevents users from assuming citation detection means quoted-wording matching is automatically active.

## Verification and remaining evidence

199unit/integration text regressions and syntax checks passed. Source desktop/workspace/guarded-Auto checks cover ordinary references, invalid actions, mode consent, layouts and preserved output cancellation. These are not real pastor/accent accuracy tests. No microphone or ProPresenter access occurred. Recognition model tuning needs representative recording evidence; current changes fix demonstrated parsing failures without claiming that the recognizer heard the correct book.

User also requests continued full-application development and smoother operation. Those remain active follow-up work, including reduced idle rendering, clearer progress, usable saved-passage connection/mapping and verified arbitrary-passage preparation/output. Development must not falsely relabel an unverified route as complete or remove dry-run/confirmation safety. ProPresenter testing is deferred at the user's request until the build work is ready.
