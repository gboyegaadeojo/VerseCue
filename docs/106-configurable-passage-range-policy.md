# Configurable passage range policy - in development

FR-014 requires configurable finite passage limits with a ten-verse default. This branch first implements the core policy; the operator setting and all production callers still need wiring. It does not claim the complete requirement is met or expand the current application's ten-verse limit.

Parser and saved-passage coverage functions accept an explicit maxVerses bound from1 through50, rejecting noninteger/unbounded values. Defaults remain10. Same-chapter and verified cross-chapter ranges retain exact endpoints and expose their calculated range length; unknown cross-chapter numbering reports unknown length rather than inventing a count. Configured ranges above ten carry an explicit Confirm-only issue and the Auto assessor independently rejects them even when review text is omitted.

Saved title recognition, cue labels and ordered complete verse coverage use the same explicitly supplied bound. Default callers still reject eleven verses. Complete text, cue enablement, ordering, edition identity, fragments and100-cue bound remain required; metadata does not verify Bible text or physical output.

Five regressions failed on the original code and now pass with484 module tests/syntax on the PR59 base. Cases cover tighter/larger bounds, invalid limits, verified23-verse cross-chapter length, unknown edition numbering, complete/incomplete saved coverage and the independent Auto ceiling. No microphone/ProPresenter access occurs.

Remaining implementation before feature completion: add validated maxPassageVerses to settings/service/profile/backup/Output UI; propagate captured policy through lookup, native preparation, saved-copy planning, thumbnail verification and manual connector preflight; retain an absolute ten-verse Auto ceiling and desktop Confirm for extended ranges; block unbounded unknown-numbering preparation before focus/output changes; invalidate old reviews on policy changes. Verify bounded requests, no stale authority, source/package workflows and exact platform builds. Do not merge or describe this as a complete user feature until that wiring and verification are done.
