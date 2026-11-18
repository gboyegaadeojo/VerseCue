# PR22 review builds and saved-copy selection

2026-11-18. These are unpublished development checkpoints, not a completed service release. Current version numbers remain 0.6.0 while the draft is unfinished; the exact revision identifies each checkpoint. Existing installed software and root distribution folders are not overwritten.

## Build checkpoint 272e1ae

`scripts/build-review-package.cjs` stages source, already verified local speech assets and the compiled helper under an isolated ignored test directory. It packages without overwriting an existing build, verifies every manifest hash and compares packaged application files to current source. The Windows checkpoint verified 141 files. Its packaged executable passed startup/sandbox/worklet timing, normal passage review/ordered continuation, next-verse preparation, original audio age, guarded Auto, bundled CLI and resident recognition, and minimized quote confirmation. Recognition fixtures were already authorized private files; there was no actual microphone or real ProPresenter output in these package checks.

Mac standard public workflow [44378160963](https://github.com/gboyegaadeojo/VerseCue/actions/runs/44378160963) passed 300 module tests, syntax, synthetic passage/next-verse/audio desktop checks, native CPU speech build, development packaging/local ad-hoc signing and packaged workspace checks. The downloaded ZIP checksum was independently verified on Windows. This does not verify Developer ID signing/notarization, actual Mac microphone performance or native Mac ProPresenter Bible preparation. The Windows-only helper is not represented as a Mac route.

The [sanitized build report](evidence/pr22-build-checkpoint-272e1ae.json) records exact revision, checks and checksum. Later saved-copy/keyboard changes described below are **not** included in that older packaged checkpoint; they need their own matching verification before release.

## Saved-copy choice and keyboard safeguards

Distinct exact saved copies now produce explicit review choices using their ProPresenter text and part count. Choosing a copy re-resolves its UUID and fingerprint before creating a fresh review. A changed/deleted copy cannot silently select another presentation. The same unchanged UUID listed twice is one identity; inconsistent reads of that UUID fail closed. No copy is deleted or first-match guess introduced.

Actual mapped-cue controls remain under Manual preparation tools; normal passage confirmation uses its own guarded action. Internally managed passage mappings cannot be reused through the legacy desktop/private-API send path without their passage-part proof. Ctrl+Enter (Command+Enter on Mac) only confirms a fully acknowledged passage or deliberately continues its next part; editing fields, held keys and incomplete acknowledgments do not send output. Normal button focus with Enter/Space remains available.

Native copy attempts are capped at 100 per app run, counting uncertain attempts conservatively. Invalid inputs do not consume the budget. Exhaustion offers saved-passage reuse or manual preparation and never deletes or silently retries a copy. Restarting the application creates a new run budget; this is not a global disk-retention or automatic cleanup policy. Existing copies remain in ProPresenter and require deliberate human management.

306 module tests and source duplicate-choice, acknowledged/unchecked keyboard confirmation, normal passage and advanced mapping/background regressions pass. This slice does not complete the original field, physical fidelity, speech assembly/accuracy, latency, platform or RF01-22 acceptance. See [the complete workflow checklist](51-reference-driven-bible-workflow.md), [personal-host preparation scope](52-native-edition-and-playlist-checks.md) and [audio safety](53-audio-age-and-continuity.md).
