# Automated accessibility check

2026-11-26. The user approved "the automated accessibility check". It covers part of the live-service accessibility item in [docs/107](107-remaining-work-and-acceptance.md): FR-026/027/030/031/061 and NFR-015/016.

`node scripts/test-accessibility.cjs [VerseCue.exe] [--report file.json]` opens VerseCue with no microphone and no ProPresenter. It checks 16 screens at both text sizes, 32 checks in all:

- the four workspace pages;
- the seven Settings tabs;
- the Speech and Output tabs with their advanced options open;
- Check accuracy;
- Enable Auto;
- Compact view.

It also runs on the Mac development CI.

## What it checks

| Check | Rule |
| --- | --- |
| WCAG 2.2 A and AA | Every rule tagged `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22a` and `wcag22aa` in axe-core 4.14.1. This covers contrast, names and labels, roles, structure and the 24 px minimum target size. The scan waits for animations to finish first |
| Keyboard reach | Real **Tab** presses from the top of the screen. Every enabled, visible control must be reached. Controls inside a closed fold-out are skipped, and the fold-out itself must be reachable |
| Focus ring | Each control reached by Tab must show a visible focus indicator (an outline or ring) |
| Booth targets | At **Large (booth distance)** text, every button, list and field must be at least 44 px tall. A checkbox counts its whole clickable label. Standard text is deliberately smaller for desk use and is held to the WCAG 24 px minimum |

## First run and fix

The first run found:

- **No visible focus ring** on the transcript area and the two "Advanced" fold-outs (Speech and Output). The Halo focus ring was defined only for buttons, inputs and lists. It now also covers fold-outs, text areas and focusable regions (`ui/halo.css`).
- **A colour-contrast failure** in the Settings dialog on the very first open (#c3c3c3 text on the blue tab button). It was measured during the dialog's fade-in animation. Once the check waits for animations, it does not occur, and the settled colours pass.

With the fix, all 32 checks pass.

## Not covered

The check cannot judge:

- booth-distance reading in the real room;
- screen-reader speech with NVDA or VoiceOver;
- volunteer tasks.

Those stay in docs/107 as hands-on checks. axe-core is a development-only dependency (MPL-2.0, recorded in `legal/`) and is not shipped in the app.
