# Installed ProPresenter catalog compatibility

2026-11-18. User explicitly renewed personal-host real acceptance testing while away. Read-only localhost tests against Windows ProPresenter21.4.2 found two differences from the published schema examples: GET /v1/libraries returns flat uuid/name/index objects rather than id wrappers; GET /v1/library/{uuid} uses update_type rather than updateType. Version0.5.5's browser rejected both. This is a real discovered compatibility defect, not a passing acceptance case.

Version0.5.6 accepts both documented wrappers/camel case and observed flat/snake case. IDs remain strictly validated. Conflicting update spellings, missing IDs, incremental-only messages, stale targets, oversized responses and unresponsive streams remain rejected. Browsing never maps, arms or sends output. Two new regressions reproduce the installed shapes and malformed/conflicting inputs.

Installed verification after correction: one saved library, three presentation names read successfully through PreparedCatalog; connector remained disarmed with zero mappings and no trigger. Names/raw snapshots remain in ignored private evidence; no Bible text or local machine identity is committed. The source tests remain separate from native Mac/platform acceptance.

A separate real Confirm test of the existing John3:16 saved test cue returned uncertain on immediate readback but exact identity/text matched one second later and ProPresenter preview changed. This timing defect is handled in a separate follow-up PR. Existing generated Bible slides report clipped text; output fidelity remains FAILED/PENDING until separately reconciled. Audience/stream output is not independently observed. No clear, macro, media, theme or Look change was made by this catalog fix.
