# 143 - Faster preparation and version switching (NR-020)

Status: implemented on feat/speed-v2; live timing pending.

## What changed

| Change | Where | Expected saving |
|---|---|---|
| A whole chapter (Prepare for volunteer) skips the clipped-text image scan. Exact passages for Confirm and Auto keep it, because those can be sent and the scan protects the audience. | `native/windows/BibleBridge.cs` | about 2 s per chapter |
| The helper checks whether ProPresenter has finished generating slides every 60 ms instead of 150 ms. | `BibleBridge.cs` verification loop | up to about 0.1 s per check |
| The first whole chapter also reads the installed versions (optional `listVersions` field on `prepare-chapter`). VerseCue remembers them for 10 minutes per connection, so a later version request doesn't open the menu first. | `BibleBridge.cs` `ListEditions`, `core/bible-preparation.cjs`, `core/preparation-controller.cjs` | about 2-3 s on the first version request |

## Safety

- The version read is the same as the `list-translations` operation: it opens the edition menu, reads the names, closes it with Escape and confirms the selection didn't change. It never selects an edition and never sends output.
- A malformed version list in the reply is ignored, and the separate read still happens when it's needed.
- The chapter reply's other checks (reference, translation, focus verse, `outputRequests:0`) are unchanged.
- Not done here: early preparation from unfinished (provisional) speech, which changes when VerseCue acts and needs the user's decision, and a persistent helper process.

## Verification

- Unit tests: `tests/chapter-context.test.cjs` covers the combined read, the absence of the field on later chapters, and a malformed list being ignored.
- Live: the baseline on a fresh ProPresenter 21.4.2 (2026-11-22) was Psalm 23 KJV in 4.4 s, NIV refused in 2.9 s and ASV switch in 7.1 s. The first live attempt on 2026-11-22 was blocked for both this branch and main: Windows didn't give ProPresenter keyboard focus while another app (Chrome) was in use, and the helper stopped safely at `target-window-bound`. Nothing was sent, both screens stayed off and the live slide didn't change. Retest when the computer is idle.
