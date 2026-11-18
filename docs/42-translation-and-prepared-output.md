# Translation and saved-passage output workflow

2026-11-18. Version0.5.4. User asked for a full actual-output application with less technical supervision, then asked how to request Amplified. This focused change builds a usable saved-cue selection/output workflow, preserving all output gates. Actual ProPresenter access/testing remains deferred at the user's instruction.

## Translations

Spoken full names are matched longest-first, keeping AMP and AMPC distinct. Examples: John5:10 in the Amplified version -> AMP; Amplified Bible, Classic Edition -> AMPC; New International Version -> NIV; New King James Version -> NKJV; King James Version -> KJV; The Message -> MSG. Existing abbreviated codes remain supported. The configured translation input offers IFC's reported editions without claiming they are installed or downloading text. Other operator-entered codes remain possible.

Cue mapping now has a separate exact installed translation selector. An AMP passage can be explicitly mapped while the default stays KJV; the mapping key remains reference plus translation. Changing translation or cue selection clears the verification checkboxes. Unknown numbering systems retain the preparation-review issue and are withheld from Auto; no KJV versification is silently applied. Exact translated text/theme/Looks still requires the operator's verification in ProPresenter.

## Saved-passage browser

In Settings / Output, Load saved libraries -> choose library -> choose presentation -> choose cue. Presentation/cue names, exact saved label and bounded saved text preview replace mandatory manual UUID entry. Fields are populated for review, not automatically verified, armed or sent. Technical fields remain available for existing integrations/workflows. Saved cue labels must equal the canonical passage label accepted by the existing mapping gate. This is saved-presentation inspection, not arbitrary Bible lookup or automatic Bible-content import.

A new PreparedCatalog uses the already configured/tested connector, literal private/loopback target restrictions and existing target generation. GET /v1/libraries supplies names. GET /v1/library/{uuid} supplies its initial streaming all snapshot: a bounded JSON framer reads the first complete object and cancels the subscription. It never waits indefinitely for a chunked feed to end. UUIDs, response size/count and2.5second deadline are bounded; stale target responses fail. Presentation inspection rejects wrong identities, timelines and non-presentation destinations. Cue previews stay in memory and are not diagnostic exports or a bundled Bible database. No write/trigger occurs during browsing.

Frontend request epochs discard responses after category selection/settings reload. Switching library/presentation clears old cue identities and verification. Actual output continues through the original map fingerprint/version check, explicit test-target arming, fresh candidate, Confirm/guarded-Auto policy, Stop and no-retry protections. The private local API gains no catalog, arming or configuration route.

## Verification

212regressions cover the eight full translation names plus catalog readiness, zero writes/arming/mapping during reads, streaming JSON framing/cancellation, invalid IDs/incremental-only rejection, stale-target rejection and timeout cleanup. The own-Electron end-to-end test `scripts/test-prepared-output-workflow.cjs` uses a SYNTHETIC HTTP target: named library/presentation/cue selection fills identifiers, displays a saved preview, maps John5:10 in AMP, arms deliberately, recognizes the explicit Amplified request, sends exactly one trigger only after Show, matches readback and latches Stop. Pre-send trigger count is zero. No microphone, actual ProPresenter or physical output is involved.

Existing workspace/scaling, idle/focus, desktop, background, Auto and recovery checks remain required for the final package. Source module tests are not a claim of service release, actual ProPresenter compatibility, exact installed translation rights or Mac/MOTU/media acceptance. Reliable arbitrary-passage preparation/output remains pending; the application is not falsely labelled complete based on finite saved cues.
