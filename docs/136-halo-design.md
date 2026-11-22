# Halo design

2026-11-21. The user chose design 5, "Halo", on the [redesign canvas](https://claude.ai/artifact/9sYtuXBtafLyrrDxZZUV5J). It combines the structure of design 1 (Vesper) with the stage of design 3 (Aurora), finished in an Apple style with neutral graphite colours. The user's direction:
- smaller fonts
- a premium UI and UX
- smaller, better-looking buttons with hover animation
- colours that don't look like "AI slop"
- a tag showing how clearly each reference was heard
- no on-screen chapter verse grid, because VerseCue triggers ProPresenter and the volunteer never clicks through VerseCue

## What changed

`ui/halo.css` (loaded last) and `ui/halo-layout.js` (run after the Route layout) restyle and rearrange the existing controls. No ID, handler, status, safety check or output gate changed.

- **Toolbar:**
  - brand and quiet page tabs
  - an Apple-style **segmented mode switch**, which drives the existing `#mode` menu, so Auto still opens its consent dialog
  - Settings as a gear (`#setup` keeps its label for screen readers)
  - Compact view and Emergency stop
- **Left column:** "Which passage?", "Heard this service" as a timeline, pastor audio, then session history.
- **Centre:**
  - a **Live** transcript strip
  - the mode/Auto status line
  - the reference stage, with a white listening orb inside a **heard-clarity ring** and a badge beside the translation: "Heard clearly", "Likely" or "Check this", with a percentage
  - the action buttons as small pills
- **Right column:** ProPresenter, Pastor mic, Speech and Translation as grouped status rows with coloured icon tiles, then the dry-run notice and the "Scripture comes from ProPresenter" note.
- **Look:**
  - graphite surfaces (#161618 and #1E1E21) with hairline borders
  - one accent, blue #0A6CDF; switches in Apple green; orange and red only for Hold, Stop and warnings
  - Inter at 12–13 px, with the reference at 46 px
  - spring animations on hover and press, which respect "reduce motion"
- **Font:** Inter is bundled locally under the SIL Open Font License, from Google Fonts commit 0b58fb3. Its licence is in `legal/INTER-LICENSE.txt`, and it is recorded in the font inventory and the SBOM. No network font requests are made.

The ring and badge appear only when the speech engine reports how confidently it heard the words (`heardConfidence` on a candidate). Until then the ring stays neutral and no badge is shown, so the app never displays a made-up number.

## Sizes and safety controls (NR-016)

- **Standard (default):** compact Halo controls, at least 28 px, 12–13 px text, as the user asked.
- **Large ("booth distance"):** keeps the original booth readability, with 18 px text and 44 px targets. All booth checks still run there.
- **Hold:** stays 44 px in both sizes.
- **Mode menu:** stays visible, compact, in the mode line, so it remains usable from the keyboard. The toolbar switch is the quick way to change mode.
- **Status messages:** float as a pill at the bottom of the window and ignore clicks, so they never cover a control.

## Verification

| Check | Result |
| --- | --- |
| `scripts/test-typography.cjs`: reference and buttons use Inter, loaded locally, no remote or failed requests | Pass |
| `npm test`, `npm run check`, scenario sweep | See PR |
| Visual check at 1440×900: empty, pending Auto, Settings | Reviewed |
