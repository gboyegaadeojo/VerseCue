# Route operator workspace

2026-11-21. Implements the visual direction the user chose for NR-010: concept C, "Route", from the [three clickable concepts](https://claude.ai/artifact/W11qaVvxvvBWuCMro8fSPs), adapted for Auto-first operation. It supersedes the dark Studio palette from [NR-008](50-premium-studio-workspace.md) while keeping its layout, controls and safety behavior.

## What changed

- **Look.** `ui/route.css` loads last and re-themes the workspace in high-contrast monochrome: white surfaces, a black header bar, black primary actions, an Emergency stop button in red outline and red text, and 16 px rounded cards. It uses the already-bundled IBM Plex Sans, so no font or license changes.
- **Pipeline.** Above the reference, a four-step progress line shows where the latest reference stands: Heard → Matched → Ready → On screen. "Ready" becomes **Sending** (blue) while an automatic send is pending, and **Needs review** or **Held** (dashed amber) when it waits for the operator. The last step reads **Simulated** in dry run, or **ProPresenter confirmed** when readback matched. It never claims a physical screen was observed.
- **Hold first.** While an automatic send is pending, **Hold - sending in N s** is the first, full-width black button in the reference card. Prepare and Show remain available below it for references that need review.
- **Reference.** The reference is set at 44–80 px bold, with the edition as a black badge.
- **Copy.** The heading reads "LIVE SCRIPTURE: Complete, explicit references go to ProPresenter automatically. Hold stops one. Emergency stop stops everything." The card is titled "Latest reference".

All element IDs, keyboard shortcuts, IPC calls and output gates are unchanged. Booth minimums from [PR67](111-booth-readability-and-review-priority.md) still hold: 18 px base text, references at least 32 px, 44 px targets and no overflow at 1280, 900 and 640 px or at 200% zoom.

## Verification

| Check | Result |
| --- | --- |
| `scripts/test-route-workspace.cjs` (source): theme loaded; pipeline todo → review → Sending → Simulated; Hold first and at least 44 px while pending | Pass |
| Booth readability, typography, studio workspace, workspace, smoothness, start-in-Auto and guarded-Auto scenarios | Pass |
| `npm.cmd test`, `npm.cmd run check` | 573/573 pass; check passes |
| Source scenario sweep | All pass except `test-background-quotes` and `test-power-recovery`, which fail identically on unchanged main |
| Screenshots of the empty and pending states at 1440×900 | Reviewed during development; not committed |

## Not established

No volunteer usability session, screen-reader pass, booth-distance viewing or physical-screen check has been done with this look. Those remain required by NFR-015, NFR-016 and NFR-017.
