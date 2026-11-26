# PR22 review builds and saved-copy selection

2026-11-18. These are unpublished development checkpoints, not a completed service release. Current version numbers remain 0.6.0 while the draft is unfinished; the exact revision identifies each checkpoint. Existing installed software and root distribution folders are not overwritten.

## Build checkpoint 272e1ae

`scripts/build-review-package.cjs` stages source, already verified local speech assets and the compiled helper under an isolated ignored test directory. It packages without overwriting an existing build, verifies every manifest hash and compares packaged application files to current source. The Windows checkpoint verified 141 files. Its packaged executable passed startup/sandbox/worklet timing, normal passage review/ordered continuation, next-verse preparation, original audio age, guarded Auto, bundled CLI and resident recognition, and minimized quote confirmation. Recognition fixtures were already authorized private files; there was no actual microphone or real ProPresenter output in these package checks.

Mac standard public workflow [44378160963](https://github.com/gboyegaadeojo/VerseCue/actions/runs/44378160963) passed 300 module tests, syntax, synthetic passage/next-verse/audio desktop checks, native CPU speech build, development packaging/local ad-hoc signing and packaged workspace checks. The downloaded ZIP checksum was independently verified on Windows. This does not verify Developer ID signing/notarization, actual Mac microphone performance or native Mac ProPresenter Bible preparation. The Windows-only helper is not represented as a Mac route.

The [sanitized build report](evidence/pr22-build-checkpoint-272e1ae.json) records exact revision, checks and checksum. Later saved-copy/keyboard changes described below are **not** included in that older packaged checkpoint; they need their own matching verification before release.

## Subsequent verification

The [matching aeb34c3 checkpoint report](evidence/pr22-build-checkpoint-aeb34c3.json) records the later background ownership safeguard: 317 module tests, Windows manifest verification and packaged startup/reference/next-verse/minimized-preparation/old-target-race/Auto/audio-age checks pass. Mac workflow [44391612214](https://github.com/gboyegaadeojo/VerseCue/actions/runs/44391612214) passed at the same revision, including the updated synthetic desktop checks, CPU speech build, development packaging and packaged workspace. These checks do not certify actual Mac ProPresenter integration or physical output. This is a historical exact-revision checkpoint; later checkpoints below and PROGRESS.md identify subsequent work.

Mac workflow [44388816375](https://github.com/gboyegaadeojo/VerseCue/actions/runs/44388816375) passed at revision `ca1cc3b6191a74bc89efd037dadaa54d5ca5c021`: 312 module tests, syntax, synthetic reference/next-verse/audio-age/copy-choice/minimized-preparation checks, CPU speech build, development packaging and packaged workspace. The preceding run failed because one test still used Control+Enter on Mac; the corrected test uses Command+Enter. Windows minimized-preparation testing also now waits for the initial window Show event before minimizing. These test corrections do not constitute real Mac ProPresenter or microphone acceptance.

Subsequent metadata matching accepts anchored saved labels using Psalms, Song of Solomon, Revelations and typographic range dashes, while retaining the original cue label/text for review. Prose, chapter-only labels and ambiguous chapter/verse punctuation remain rejected. The requested reference and edition still require exact supported validation. All 314 module tests and syntax checks pass locally; the metadata change subsequently passed matching Mac workflow 44390697615 at revision 2de6534 and Windows packaged startup/reference/copy-choice/minimized-preparation checks.

## Saved-copy choice and keyboard safeguards

Distinct exact saved copies now produce explicit review choices using their ProPresenter text and part count. Choosing a copy re-resolves its UUID and fingerprint before creating a fresh review. A changed/deleted copy cannot silently select another presentation. The same unchanged UUID listed twice is one identity; inconsistent reads of that UUID fail closed. No copy is deleted or first-match guess introduced.

Actual mapped-cue controls remain under Manual preparation tools; normal passage confirmation uses its own guarded action. Internally managed passage mappings cannot be reused through the legacy desktop/private-API send path without their passage-part proof. Ctrl+Enter (Command+Enter on Mac) only confirms a fully acknowledged passage or deliberately continues its next part; editing fields, held keys and incomplete acknowledgments do not send output. Normal button focus with Enter/Space remains available.

Native copy attempts are capped at 100 per app run, counting uncertain attempts conservatively. Invalid inputs do not consume the budget. Exhaustion offers saved-passage reuse or manual preparation and never deletes or silently retries a copy. Restarting the application creates a new run budget; this is not a global disk-retention or automatic cleanup policy. Existing copies remain in ProPresenter and require deliberate human management.

306 module tests and source duplicate-choice, acknowledged/unchecked keyboard confirmation, normal passage and advanced mapping/background regressions pass. This slice does not complete the original field, physical fidelity, speech assembly/accuracy, latency, platform or RF01-22 acceptance. See [the complete workflow checklist](51-reference-driven-bible-workflow.md), [personal-host preparation scope](52-native-edition-and-playlist-checks.md) and [audio safety](53-audio-age-and-continuity.md).

## Recovery build checkpoint e27272d

[Matching build evidence](evidence/pr22-build-checkpoint-e27272d.json) records365 module tests, the143-file isolated Windows manifest, native-helper/source identity and packaged recovery/uncertainty/no-input/normal-passage checks. Public standard Mac workflow [44433224123](https://github.com/gboyegaadeojo/VerseCue/actions/runs/44433224123) passed at the same revision, including both new recovery scenarios, CPU speech packaging and the packaged workspace. The Mac artifact has not been independently downloaded/checksummed for this checkpoint. These checks do not verify actual Mac native Bible control or physical service output, and this branch is still unpublished. Subsequent saved-lookup continuity changes are outside this exact-revision build.

## Lookup-continuity checkpoint eba514c

[Matching evidence](evidence/pr22-build-checkpoint-eba514c.json) records366 passing module tests,143 Windows manifest files and packaged minimized saved-lookup/speech, next-verse and full desktop smoke checks. Public standard Mac [44434020906](https://github.com/gboyegaadeojo/VerseCue/actions/runs/44434020906) passed at that exact revision with the new delayed-lookup scenario, existing source checks, CPU speech packaging and packaged workspace. Independent Mac artifact checksum and actual Mac native/physical output remain unverified. Later window-consent isolation changes require their own matching checks.

## Window-consent checkpoint ac3d572

[Matching evidence](evidence/pr22-build-checkpoint-ac3d572.json) records367 module tests,143 Windows manifest files, native helper/source identity and packaged two-window consent/recovery, uncertainty, minimized saved-lookup and normal-passage checks. Public standard Mac [44434893807](https://github.com/gboyegaadeojo/VerseCue/actions/runs/44434893807) passed the same revision including source scenarios and packaged workspace. No independent Mac artifact checksum, actual Mac native route or physical service acceptance is inferred. Later plain-language native-error guidance is outside this build.

## Native-error guidance checkpoint7474567

[Matching evidence](evidence/pr22-build-checkpoint-7474567.json) records368 module tests,144 manifest files and Windows packaged uncertainty/full desktop smoke checks. Public standard Mac [44435453041](https://github.com/gboyegaadeojo/VerseCue/actions/runs/44435453041) passed the matching source scenarios, CPU speech package and packaged workspace. No new Mac native/physical acceptance or independently checked artifact checksum. Later output-content coexistence checks are not included in this build.

## Output-content checkpoint d0962b0

[Matching evidence](evidence/pr22-build-checkpoint-d0962b0.json) records371 module tests,144 Windows manifest files and packaged output-edit/uncertainty/recovery checks. Public standard Mac [44436283334](https://github.com/gboyegaadeojo/VerseCue/actions/runs/44436283334) passed the matching synthetic output-edit scenario and other source/package checks. The helper in this checkpoint is the earlier04773d7 hash; later Save As timing instrumentation is excluded. Independent Mac artifact checksum and real Mac/physical acceptance remain pending.

## Timing-helper checkpoint d72ad25

[Matching evidence](evidence/pr22-build-checkpoint-d72ad25.json) records371 tests,144 Windows manifest files and packaged output-edit/recovery/full desktop checks. Its helper hash720b19ce and C# source hash3a41cb06 match the finer-timing personal test. Public standard Mac [44437187705](https://github.com/gboyegaadeojo/VerseCue/actions/runs/44437187705) passed after queueing, including source tests, CPU speech package and packaged workspace. No Mac native or physical acceptance; independent artifact checksum pending. Later [managed-copy accounting](63-managed-native-copy-accounting.md) extends the earlier per-run budget with forward cross-restart slots; it is not included in this checkpoint.

## Accounting/restart checkpoint e8bed42

[Exact checkpoint evidence](evidence/pr22-build-checkpoint-e8bed42.json) records381 locally passing tests,145 Windows manifest files and packaged accounting/reconciliation/app restart, retained clipping, inspection, recovery, output-edit and full desktop smoke checks. Mac44439491592 failed eight clean-checkout fixture cases;44439100439 had the same parent-directory assumption. Both failures are retained. The fixture-only correction passes29 cases from a fresh working directory and requires a new Mac run; no production-source change or actual Mac native/physical acceptance is implied.

The corrected public Mac run [44439857729](https://github.com/gboyegaadeojo/VerseCue/actions/runs/44439857729) passed381 tests, all source desktop scenarios including ledger/restart, CPU speech packaging and packaged workspace at a4bcdf4. Git comparison confirms its production application/native source trees match the e8bed42 Windows package; only tests/docs differ. Both earlier failures remain in the checkpoint evidence. No actual Mac native or physical acceptance is inferred.

## Origin-guidance checkpoint7ff7923

[Matching Windows evidence](evidence/pr22-build-checkpoint-7ff7923.json) records387 source tests,145 manifest files and packaged origin/restart/accounting, normal passage and native recovery checks. Public Mac44516755386 and a fresh minimized soak remain in progress at this checkpoint; no success is inferred. Earlier failed soak and unknown intermittent storage failure remain documented.

The matching public Mac44516755386 subsequently passed at7ff7923:387 tests, source scenarios, CPU speech package and packaged workspace. Actual native Mac ProPresenter and physical acceptance remain unverified. The independent7ff minimized soak remains in progress; later Auto-policy source changes are excluded from that artifact.

## Auto-policy checkpoint1525a66

[Matching Windows evidence](evidence/pr22-build-checkpoint-1525a66.json) records394 source tests,146 manifest files and packaged default/bare Auto policy, minimized/cancellation/dialog200% and normal-passage checks. Mac44518630026 was queued at this checkpoint; do not claim success. These changes are outside the independently running7ff soak and do not complete arbitrary native Auto.

Mac44518630026 ended before executing any steps: GitHub reported that no hosted macOS arm64 runner acquired the job after multiple attempts and annotated capacity constraints. This is an infrastructure failure, not a passing build or an application-test result. The standard public runner configuration is unchanged; a later committed source checkpoint will receive a fresh normal workflow run. No paid/larger runner was selected.
