# Route layout and DM Sans

2026-11-21. User feedback: "the text, font and design is just not the same as the artifact." Implements the Route artboard (concept C of the [design canvas](https://claude.ai/artifact/W11qaVvxvvBWuCMro8fSPs)) more faithfully, on top of [docs/119](119-route-operator-workspace.md).

## What changed

- **Font:** DM Sans, the artboard's typeface, bundled locally (no network font requests) as one variable font under the SIL Open Font License. IBM Plex Sans stays as the fallback.
- **One black top bar** holds the brand, the page tabs, the live status pills (ProPresenter, audio input, speech engine, translation), Compact view and Emergency stop. The separate header and status strip are gone.
- **Two columns,** like the artboard:
  - Left: **Which passage?** (type a reference), **Heard this service** (recent references), pastor audio controls, then session history and reset.
  - Right: the heading, a single mode bar (mode menu and Auto status), and the large reference card with the progress line, Hold and the 80 px reference.
- The duplicate inspector column is hidden; its controls (mode, resume, reset, history) moved into the columns above. The redundant "Find a reference" button and the Connections tab are hidden (the left column and Settings cover them).

`ui/route-layout.js` only moves existing elements and `ui/route-layout.css` styles them; no ID, handler, status or output gate changed. Narrow windows stack the columns.

## Verification

| Check | Result |
| --- | --- |
| `scripts/test-typography.cjs`: reference and buttons use DM Sans, loaded locally, no remote or failed requests | Pass |
| `npm.cmd test`, `npm.cmd run check` (inventory and SBOM include DM Sans) | 589/589; check passes |
| Source scenario sweep, including booth readability at 1280/900/640 px and 200% zoom | See the PR |