# Text size setting

2026-11-21. User request: "the fonts on VerseCue are too big." Relates to NFR-015 (booth readability) and FR-061.

**Settings > Profiles > Display > Text size** offers:

- **Standard (default):** 15 px body and control text, for a desktop or laptop at normal distance.
- **Large (booth distance):** 18 px, the original NFR-015 booth size from [PR67](111-booth-readability-and-review-priority.md).

Both sizes keep every button, field and menu at least 44 px tall, keep the large reference and the Hold button, and keep the Route colors. The choice is saved with the setup and applies to both the full and compact windows. Changing the menu previews the size at once; saving keeps it.

This changes the default from the 18 px booth size to 15 px by the product owner's request. Booth readability is still available by choosing Large, and the booth readability scenario now runs in Large, as well as checking that Standard is 15 px with 44 px targets.

## Verification

| Check | Result |
| --- | --- |
| `tests/text-size.test.cjs`: Standard default, Large accepted, other values rejected | Pass |
| `scripts/test-booth-readability.cjs`: Standard is 15 px with 44 px targets; all original booth checks pass in Large at 1280/900/640 px and 200% zoom | Pass |
| `npm.cmd test`, `npm.cmd run check`, source scenario sweep | 586/586; check passes; 42/42 scenarios |

Actual readability at the church booth with Large, and comfort with Standard, still need people to look at real screens.
