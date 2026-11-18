# VerseCue design room

Open [index.html](index.html) in a desktop browser, then choose Studio, Focus or Command. No server, installation, microphone or ProPresenter connection is required. Keep this directory beside `ui/fonts` so the existing offline IBM Plex Sans assets load.

- [Studio](studio.html): four-panel transcript/detection/review/inspector desk, violet accents. Recommended balance of awareness and deliberate action.
- [Focus](focus.html): generous passage canvas, softer green-charcoal palette, fewer competing controls. Best volunteer onboarding direction.
- [Command](command.html): cue-table-first layout, warm restrained highlights, compact operator information. Best for experienced booth operators.

Try selecting a detection or queue row, Prepare passage, Simulate presentation, Previous/Next verse, a different translation, navigation, Settings, density, Stop/Resume and Reset demo. Find a reference accepts sample manual input. Only the first four sample passages populate the Command session table. Settings demonstrates general preferences; the other settings categories are an information-architecture outline, not functional integrations. All data is synthetic; no output request, audio capture or external request is made by the prototype.

These are interaction concepts, not three production implementations. Preparing a passage, reading current output and contextual navigation remain subject to the real application's backend capabilities and acceptance requirements. No sample connection/receipt/ready state should be copied into production as a fact. Actual Bible text is deliberately not fabricated as a verified preview. Auto policy is not broadened, clear/black screen controls are not added and ProPresenter remains the sole presentation system.

## Design rationale and research

Research accessed 2026-11-18:

- [Pewbeam product page](https://pewbeam.com/pewbeam) and the user's supplied screenshot: inspiration for simultaneous transcript, detected references, focused review and a clearly distinct current state. VerseCue does not adopt its lyrics, slide creation, direct rendering or broader product scope. No proprietary assets/code or vendor accuracy claims are reused.
- [Linear: A calmer interface for a product in motion](https://linear.app/now/behind-the-latest-design-refresh): inspiration for quiet navigation, predictable action placement and visual hierarchy rather than giving every control equal emphasis.
- [Blackmagic Design: DaVinci Resolve Edit](https://www.blackmagicdesign.com/products/davinciresolve/edit): inspiration for task-specific panel organization and persistent context in a professional workspace, not feature or output parity.

These directions extend the selected Figma-inspired desktop structure: persistent left navigation, center workspace, contextual right inspector, subdued borders, consistent spacing and dedicated settings. Distinct layouts are compared, not merely three accent colors. Offline licensed IBM Plex Sans is reused from the current app; there are no downloaded visual assets or remote fonts.

## Verification

Local isolated Chrome checks exercise each concept's selection, preparation, simulated presentation, next verse, settings/density, queue/history navigation and stop/reset. Layout checks cover 1280, 900 and 640 pixel widths without horizontal overflow. Screenshots were visually inspected and typography enlarged afterward. These checks do not establish production accessibility, booth-distance usability, real integration or implementation acceptance. Application UI/backend files remain unchanged.

Next step: user chooses a direction or specific combination. Only then implement the chosen look in the real application, preserving functional IDs/contracts, safety controls and backend behavior, followed by existing application/build verification.
