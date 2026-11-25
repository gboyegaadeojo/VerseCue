# Narrower reading of ProPresenter's Bible view (Windows)

2026-11-25. Follow-up to the live timing in [docs/152](152-stability-engine-and-live-timing.md), approved by the user ("yes, go ahead"). Windows helper only (`native/windows/BibleBridge.cs`); the Mac helper reads ProPresenter differently and is unchanged.

## Cause (measured on the user's ProPresenter 21.4.2, Audience and Stage off throughout)

The helper was driven directly, with no speech and no output: repeated whole-chapter preparations (`prepare-chapter`, KJV) of 20 different chapters, with Audience and Stage read through ProPresenter's API before and after every request.

- A read-only structure probe showed the Bible viewer's direct children:
  - the header (reference box);
  - a translation pane holding the edition button;
  - a scroll bar;
  - one `Thumbnail` per realised slide (about 12 at a time).

  Each slide holds 15 elements, including live video previews (`VideoInputPreview`).
- The helper found the edition button and read slide labels with searches over everything under the Bible viewer, so every search walked into every slide's previews. Afterwards ProPresenter kept those accessibility objects updated.
- **With 0.6.9's helper and a freshly restarted ProPresenter:**
  - 12 preparations took 7.6, 7.2, 4.3, 3.6, 4.9, 5.1, 6.8, 25.1, 47.8, 16.4, 25.0 and 27.2 s;
  - finding the edition button went from 0.3 s to 9.3 s;
  - ProPresenter's processor use during preparation rose from 1.6 to 3.4 cores, and it then idled at 2.1 cores.
- **A fresh helper process did not help** (29-44 s): the extra work lives inside ProPresenter until it is restarted.

## Change

- **Edition button:** looked for first inside the Bible viewer's own translation panes (direct `ScrollViewer` children). Two selectors there (side-by-side editions) still stop safely. The earlier full search remains only for a layout that does not match.
- **Slide labels:** one request reads each `Thumbnail`'s direct children and keeps its text (the reference label), without going into the previews. It is used for the completion check, for checking whether the spoken verse is in view and while turning the wheel. If a ProPresenter has no `Thumbnail` slides, the earlier full read is used.
- **Edition menu:** the whole main window is searched only if the menu has not been found in the Bible viewer or ProPresenter's pop-up windows after 1.5 s. The comment already described this behaviour, but the code searched the whole window at once.
- No safety check was removed. The helper still checks the reference, edition, generated range, focus and responsiveness, and still never clicks a slide or sends output.

Tried and rejected: setting the slide list's scroll bar position through accessibility. ProPresenter changes the scroll bar's value but does not move the slides, so the wheel is still used.

## Result (same 12 chapters, ProPresenter freshly restarted by the user)

| Preparation | 0.6.9 helper | New helper |
| --- | --- | --- |
| 1-7 | 3.6-7.6 s | 1.4-5.2 s |
| 8-12 | 16-48 s | 1.0-3.7 s |
| Edition button | 0.3-9.3 s | 0.04-0.06 s |
| ProPresenter idle afterwards | 2.1 cores (after 15) | 1.1 cores (after 12), 0.95 cores (after 32) |

All 37 preparations with the new helper prepared the right chapter. The spoken verse was in view in 35 of them; it was not in Matthew 5 or Luke 15, which were near the end and happened while ProPresenter was already slow. All Audience and Stage checks read off.

## What remains

- Past about a dozen preparations ProPresenter still slows during preparation: 7.6-52 s in preparations 13-37. Its processor use reaches 3-4 cores while it builds the new chapter's slides and while the wheel brings more slides into view. Most of that time is the scroll to the spoken verse.
- A further option needs a product decision: preparing from the spoken verse to the end of the chapter instead of the whole chapter. There would be no scrolling and fewer slides, but the volunteer could not go back before the spoken verse.
- Restarting ProPresenter before the service, and again at a quiet moment during a long one, is still advised (README).
- The packaged app with the new helper has not yet been checked end to end with speech on a fresh ProPresenter. The helper's request and reply format is unchanged.
