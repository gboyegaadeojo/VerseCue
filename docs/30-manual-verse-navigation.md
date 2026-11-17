# Manual verse navigation

2026-11-17, development0.2.7. Candidate cards now offer Previous verse and Next verse for KJV, whose numeric bounds are bundled under the recorded MIT license. Each click proposes a fresh reference for review; it does not change ProPresenter output or establish remote passage context. For a range, Next uses the verse after its end and Previous uses the verse before its start. Navigation crosses chapter boundaries within the same book and requires an explicit book choice at a book boundary.

The selected candidate must be unexpired, authorized, complete, valid, within the range cap and from the current generation. Stop/busy state and prohibited/no-show candidates block navigation. Other translations require explicit manual editing until their numbering is independently verified; KJV counts are not silently assigned. Failed navigation preserves an otherwise valid selected card. New proposed references pass through the existing parser, expiry and normal Confirm/output gates. Ordinary speech-relative context retains its stricter independently verified remote-context rule.

Two added unit tests verify chapter/range boundaries, zero output calls/history/context effects and rejection of expired/prohibited/out-of-bounds/unknown-numbering/book-boundary requests. All135regression tests passed after this change. Source/packaged UI navigation testing follows separately. Partial requirement coverage: manual/reference correction, previous/next and safe-context FRs; full HIL/translation/output acceptance remains pending.

This control navigates a reviewed reference, not the currently displayed slide index. A ProPresenter multi-slide verse is not assumed to map one-to-one to verse numbers; exact prepared-cue output mappings remain separately verified.

Follow-up: source and packaged0.2.7 UI tests clicked Next from Romans8:28 to8:29 and Previous back to8:28, with the application in dry run. Both passed, along with profile and200%zoom checks. No output/remote-context evidence is inferred.
