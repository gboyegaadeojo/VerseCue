# Booth readability and review priority

2026-11-20. FR-026/027/030/031/061 and NFR-015 follow-up. Preserves the approved Studio design, IBM Plex Sans, existing controls/IDs, backend integration and output safety. This is software layout evidence, not physical-booth or screen-reader acceptance.

## Changes

An application stylesheet restores the original18px base and at least18px text on buttons, inputs, selects, summaries and labels. Action targets are at least44px high/wide; consent labels retain a44px minimum hit area around their smaller native checkbox. Main reference text remains at least32px. Status/body text and inspector values are more readable; secondary captions retain visual hierarchy. Colors and font assets are unchanged.

The first visual review showed that enlarging text alone pushed the primary passage action too low. The current passage now comes before manual entry and session preparation options; an already-prepared passage still precedes the candidate. A deliberate manual review brings the reference heading into view and focuses that heading, never a send button. Speech updates do not steal input focus. Quote-configuration guidance follows selected-reference details. Listening buttons use the width of their rail, and longer processing guidance remains available on Audio & recognition.

At narrow200% zoom, the legacy workspace test reproduced a sticky footer covering Emergency Stop. The flex layout already reserves footer space, so the footer now stays in normal flow. The unchanged workspace test subsequently clicked Stop successfully; no forced click or weakened assertion was used.

## Verification scope

The dedicated synthetic desktop scenario measures computed base/control/reference font sizes, actual target rectangles and checkbox-label areas. It covers1280/900/640 widths, all seven settings panels,200% settings fit, compact-window sizes, deliberate manual-review focus and Enter/Space without output, and an in-view primary action at1280x900. Screenshots are inspected separately; the initially poor layout was corrected before review.

Existing source Studio routing/unique-ID/responsive checks, workspace/settings/keyboard/Stop checks and idle-text/focus-preservation checks passed after the layout changes.534 branch module tests and syntax/inventory checks passed. Full current-head Windows source/package and hosted Mac verification remain before merge; exact results are recorded in PROGRESS.md and the PR.

Actual booth-distance readability, volunteer task time, NVDA/VoiceOver behavior, complete contrast assessment and physical/service acceptance remain pending. A measured pixel target is not proof of accessible operation by a volunteer. Narrow windows and zoomed views may require vertical scrolling; the application must retain reachable controls and an unobscured safety action.
