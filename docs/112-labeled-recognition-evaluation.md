# Offline labeled-recognition evaluation

2026-11-20. NFR-002 and the original recognition/acceptance plan follow-up. This tool evaluates supplied normalized citation proposals against supplied labels. It does not capture or transcribe audio, collect predictions from a running app, connect to ProPresenter, observe output or certify acceptance. Existing sermon pilots remain unscored until their required labels/provenance exist.

## Run the synthetic example

```text
node scripts/score-recognition.cjs docs/test-data/recognition-evaluation.synthetic.json SYNTHETIC-example.json
```

The report is created only under ignored `test-results/recognition-evaluation/`. Choose a new plain JSON filename each time; existing reports are never overwritten. Paths/traversal, reserved Windows device names and linked output directories are refused. The CLI prints only completion/count flags, not dataset paths, case content or transcripts. Reports contain case IDs for review but no raw proposal/label text. Hashes are provenance identifiers, not anonymization or proof of consent.

The example deliberately includes correct, wrong-edition, missed, spurious and correct-negative cases. It is entirely synthetic; real held-out metrics remain null. Do not present its numbers as speech accuracy.

## Input contract

The JSON object has schemaVersion1, opaque datasetId/experimentId strings and1-5000 cases. Unknown fields, including accidental transcript fields, are rejected. Each case has a unique opaque id, source (`SYNTHETIC-TEXT`, `SYNTHETIC-TTS` or `REAL-RECORDING`), split (`training`, `tuning` or `held-out`), and expected/predicted arrays of at most20 objects containing reference/translation.

Expected labels use the application's full canonical citation spelling and explicit normalized edition code. Predicted entries are the normalized proposals being evaluated, not raw ASR sentences. Include duplicate proposals; do not deduplicate them to improve a score. Define the observation boundary and which committed/withdrawn proposals are included in the experiment record before evaluation. An invalid/noncanonical predicted citation counts as an unmatched proposal. Unknown/wrong predicted editions cannot match an expected edition.

Audio cases additionally require an opaque recordingId, audioSha256 and durationSeconds greater than0 and at most60. Duplicate audio hashes are rejected. A recordingId cannot span training/tuning/held-out splits. These are consistency checks on supplied provenance; the tool does not inspect media bytes or prove split independence. Synthetic text cannot claim measured audio duration.

Real cases require dataUseAuthorized=true and an explicit labelsReviewed boolean. Reviewed labels require annotationSha256. Unreviewed real cases are excluded and their metrics remain unscored. These fields are caller attestations: retain actual consent, independent listening labels, frozen experiment/model/parser versions and source hashes privately for reviewer inspection. No existing pilot is automatically promoted into reviewed real evidence. The supplied Sunday source/timestamp is already recorded in [source intake](test-data/sermon-source-intake.md); do not ask for it again or infer truth from captions/model output.

## Metrics and limits

Reference-form and reference-plus-edition counts are separate. Matching uses a duplicate-counted multiset within each labeled clip; exact sequence agreement is reported separately so a reversed sequence cannot look ordered. Precision=matched/predicted and recall=matched/expected, with explicit counts. Zero denominators are null, not perfect accuracy. Correct negative clips are counted without inflating reference precision. Synthetic sources and training/tuning results are never pooled into real held-out results.

Proportions include nominal two-sided95% Wilson score intervals using the [NIST formula](https://www.itl.nist.gov/div898/handbook/prc/section2/prc241.htm), accessed2026-11-20. Their binomial independence/representativeness assumptions are not established for correlated sermon clips. They are not model-confidence calibration or a release decision.

Citation-form agreement does not validate verse existence, edition numbering, installed Bible availability, intent/timestamp alignment, display correctness or physical fidelity. The scorer cannot establish continuous-sermon false positives per hour or audible-end-to-output latency; those fields remain null/false. Ground-truth verification by the tool and serviceAcceptancePassed are always false. All original precision/recall,10-hour wrong-output, latency, platform, privacy and field gates remain unchanged and require their actual evidence.

## Verification

Ten focused synthetic groups cover misses/spurious proposals, duplicates, edition/order disagreement, source/split isolation, consent/review exclusions, leaked/duplicate audio, malformed labels/schema, empty/small-sample intervals, private output safeguards and the CLI. All544 module tests and syntax/inventory checks passed locally before documentation/CI wiring. Cross-platform diagnostic CI runs these Node checks and the synthetic example on standard Windows, Apple Silicon Mac and Intel Mac runners; it installs no Electron binary or speech model and runs no desktop/native ProPresenter test. Current exact-head outcomes are recorded in PROGRESS.md/PR before merge.
