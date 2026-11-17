# Native preparation verification and reference validation

Date: 2026-11-17. Development version: 0.2.4. Authority and existing production boundary remain unchanged. **P0 PENDING; not approved for service use.** This report supersedes the earlier statement in docs/23 that native runtime testing had not occurred; earlier failures remain part of the evidence.

## Tested environment and authorization

Tests used the user's explicitly authorized, disconnected personal Windows ProPresenter 21.4.2 installation. The packaged VerseCue preparation control was activated through computer use and the resulting ProPresenter interface was independently inspected. No church production host was accessed. Mac, LAN and physical audience/stream outputs were not tested. The installed KJV was used; other IFC translations were not substituted or downloaded.

## Results

| Build | Request | Observed preparation | Application receipt |
|---|---|---|---|
| 0.2.0 | Genesis 12:1-3 | Correct reference prepared | Timed out |
| 0.2.1 | Isaiah 40:28-31 | Correct reference prepared | Timed out during label verification |
| 0.2.2 | Psalm 46:1-3 | Correct reference prepared | Timed out during label verification |
| 0.2.3 | Romans 12:1-2 | Correct reference prepared; four visible cues | Prepared, needs operator review; clipping warning |
| 0.2.3 | Psalm 23:1 | Correct reference prepared | Prepared, needs operator review; clipping warning |
| 0.2.3 | John 3:16 | Correct reference prepared | Prepared, needs operator review; clipping warning |

Worker timings were not captured from these UI observations. These are functional observations, not a sub-four-second latency pass or a reliability estimate. The combination of MTA threading, constrained Unicode input, cached UI Automation properties, the immediate raw Bible-view parent scope and canonical book aliases resolved the observed receipt failure. The experiments do not isolate one change as the cause.

All generated passages still showed ProPresenter's clipped-text warning. No theme or Look was changed. A preparation receipt verifies neither complete displayed verse text nor theme/routing fidelity. The `/v1/presentation/focused` response still referred to an older saved presentation during transient Bible preparation; it must not be bound to a newly prepared reference. The transient Default identity is not a safe reusable output mapping.

## Unexpected manual action

During separate manual inspection of a floating Bible Options/theme panel, a coordinate click intended for the panel reached the underlying slide-clear control. The disconnected personal test preview became blank; status readback confirmed no current text. This was acknowledged to the user. No automatic restoration trigger was sent. The native helper was not involved. Floating-panel coordinate interaction was discontinued. Consequently this session must not be described as having zero output changes, even though no new cue trigger was issued. The content-free evidence records one unexpected clear separately from zero intended cue triggers.

## Application changes and safety behavior

- The preparation controller verifies loopback target and the inspected Windows build, then rechecks configuration generation after asynchronous validation. It disarms output, cancels recognition, enables dry run and pauses before invoking the helper. Candidate preparation requires an unexpired, complete, authorized reference within range limits and explicit session consent to focus changes.
- Candidate cards now offer preparation without retyping the reference. Preparation does not create a trusted output map, trigger a cue, modify themes/Looks or enable Auto. The operator still reviews the passage in ProPresenter.
- The helper owns one bounded process; cancellation/deadline failures return content-free stage diagnostics. Unknown response fields, mismatched references and claimed output side effects cannot become successful receipts. Native worker duration is available for subsequent instrumented tests.
- Settings save/import, mode change, emergency stop, reset, dry-run transition and application exit cancel preparation. Async target changes cannot redirect an already authorized preparation.
- Numeric KJV bounds are generated from MIT-licensed Bible-Passage-Reference-Parser 4.0.0: 66 books, 1,189 chapters and 31,102 verses. No Bible text is included. Invalid endpoints and ranges over ten verses cannot be sent even in simulation. Other translations retain an unknown-numbering review state rather than silently inheriting KJV bounds. Relative KJV navigation can cross chapter boundaries when context remains verified and unexpired.

## Verification and requirement links

All 119 unit/regression cases passed after these changes, including timeout/cancel, target-change races, invalid/expired candidates, KJV bounds and cross-chapter navigation. Source desktop smoke testing also passed, including invalid John 3:99 action blocking and latest-candidate selection. These support partial FR-010–FR-023, FR-028, FR-039–FR-049 and the safety portions of NFR-003/NFR-004; original acceptance criteria remain authoritative. No requirement is marked fully accepted from this report.

Machine-readable observations: [native preparation results](evidence/native-preparation-results.json). Build smoke evidence is under ignored test-results and is regenerated for the next packaged artifact. The native helper compiled successfully against installed .NET UI Automation assemblies; this is distinct from its runtime observations above.

## Remaining acceptance work

Test instrumented repeated preparation and failure recovery; confirm exact text and theme without clipping; prove a safe supported transition from prepared Bible cues to output; verify translation changes, physical room/stream Looks, media and Companion coexistence; implement and test the Mac route; measure real audible-end-to-output latency and held-out speech accuracy; run stability/soak and signed-package checks. Auto and broad clear remain unavailable. Existing saved, explicitly verified cue mappings remain the bounded test-output route.

Sources/provenance: RESEARCH_SOURCES.md SRC-39 and SRC-57–SRC-60; local evidence is scoped to this installation. No native ProPresenter Bible API is claimed.
