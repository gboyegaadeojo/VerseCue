# Test and acceptance plan

2026-11-17. **Integration tests and expected output behavior are PROVISIONAL; P0 PENDING.** This is an executable-by-future-team test specification, not executed test evidence. No production software, real audio benchmark, installed hardware or output test exists. Test owner QA lead; IFC production lead authorizes any installed/physical test; sponsor accepts release.

## Test layers and release evidence
| Suite | Layer / scope | Fixtures, execution and oracle | Exit evidence / owner |
|---|---|---|---|
| TS-AUDIO | Unit/OS integration | Deterministic mono/stereo/silence/clip frames, M4 permission/hotplug, format/dropped frame counters; compare known signal and captured channel. | FR-001–008, NFR-009 pass per OS; no default-device substitution; audio lead. |
| TS-STT | Worker/provider integration | Real consented held-out recordings plus SYNTHETIC smoke fixtures; delayed/out-of-order partial/final, worker crash/cancel/reset. Compare independently annotated transcript/reference times. | FR-009/010/024, real quality/latency evidence; speech lead. |
| TS-PARSER | Unit/property/corpus | All CSV/JSON rows, aliases, ordinals, ranges, ambiguity, numeric limits; metamorphic alias/format changes preserve canonical tuple, invalid bounds never become eligible. | FR-011–025 and metadata license/version tests; parser lead. |
| TS-POLICY | Unit/integration/races | Virtual monotonic clock and fake connector; expire between click/dispatch, stop/profile/target changes, corrected late STT, multiple references, duplicates and lost ownership. | No unsafe send under any injected predicate failure; QA/security. |
| TS-CONNECTOR | Contract/HIL | Fake server for status/order/errors; exact installed docs for authorized IT-01–13 in docs/10; compare actual outputs against manual baseline. | FR-040–050; receipt/readback/output distinguished; integration lead. |
| TS-UX | UI/accessibility | Full/compact/setup/troubleshooting; keyboard focus, held Enter, multiwindow click, 200% text, VoiceOver/NVDA, booth distance. | FR-026–040/051/061; NFR-015–017; UX + volunteers. |
| TS-PRIVACY | System/security | Canary secrets and unique transcript strings; disk/network/log/export/package inspection; consent settings, vault denied, corrupt imports and retention-clock tests. | FR-053–059/062 and NFR-010–012/020/021; security lead. |
| TS-PACKAGE | Clean-host install/update/uninstall | Pinned OS/CPU matrix, signatures/helper hashes, model install offline, denied mic, tampered package, failed update/rollback, user-data choice. | FR-060; NFR-013/014/018/019; desktop/ops. |
| TS-RESILIENCE | System/soak/fault | 90 min + 3 h, sleep/wake, ProPresenter/worker close, audio/network loss, 1/5% packet loss, 100/500 ms delay, response loss and manual/Companion collisions. | NFR-005–009/022/024; no stale replay/media interruption; QA. |
| TS-FIELD | Supervised UAT/rehearsal | ≥3 volunteers and 10 h representative negatives/references with current Looks, media and Companion in isolated approved setup. | All release thresholds, observed output evidence and IFC sign-off; production lead. |

## Individual requirement acceptance cases
`T-FR-001` through `T-FR-062` are 62 distinct acceptance cases, each using the matching FR row's Given setup, When action and Then oracle verbatim as its mandatory scenario. They are not generic “requirement passes” assertions. Include both positive and negative boundary for each, explicit target/hardware/fixtures and actual evidence. Examples: T-FR-005 must physically unplug the selected interface while another device exists; T-FR-019 must cancel the older reference before dispatch under delayed STT; T-FR-047 must lose a response after server dispatch and prove no blind retry. Use a fake transport to verify exactly what was sent, plus HIL for actual PP behavior. Test IDs map individually in docs/12.

`T-NFR-001` through `T-NFR-024` execute each matching NFR method on its specified profile, with measured target/threshold and environment. A documentary review is not an NFR pass. Collect empirical distributions rather than testing constants from implementation. No tests are implemented during this requirements-only phase.

Additional end-to-end cases:
| ID | Setup / action | Required observation |
|---|---|---|
| E2E-01 | Confirm Sunday John 3:16 then authorized Show | Exact text/translation/IFC styling in both outputs; independent media continuity; honest receipt states. |
| E2E-02 | Verified John context then “now verse seventeen” | v1 offers John 3:17; no context means review/no guess; context reset on manual change. |
| E2E-03 | Correction “sorry John four sixteen” before dispatch | Only corrected fresh candidate may send; if already sent, truthful status and manual correction. |
| E2E-04 | Guarded Auto + lyrics/Companion activity | Ownership loss blocks automatic replacement; no controller loop; deliberate re-arm. |
| E2E-05 | Link loss before/after dispatch and reconnect | Before: zero send; after: uncertain/no retry; reconnect clears queue/context and Auto. |
| E2E-06 | STT unavailable, manual reference entry | v1 fallback works if connector valid; ordinary PP manual use works in every phase. |
| E2E-07 | ESV missing, ambiguous Amplified, changed target | No silent default/edition/host substitution; review required. |
| E2E-08 | Stop pressed with keyboard held and queued work | Gate closes ≤100 ms; no unsent command leaks, no implicit clear, no Auto restart. |
| E2E-09 | Dry-run all modes/actions | No side-effecting requests/automation; no false Live label. |
| E2E-10 | 90-min local offline service and 3-h soak | No cloud dependency, content persistence or media regression; bounded resources. |

## Dataset and corpus strategy
Machine-readable proposals: [CSV](test-data/versecue-utterances.csv) and [JSON](test-data/versecue-utterances.json), identical row content. Minimum 60 distinct utterances with explicit context/expected reference/parser result/Auto eligibility/expiry/failure mode/source. Source must be SYNTHETIC-TEXT, SYNTHETIC-TTS or REAL-RECORDING. Current proposed rows are SYNTHETIC-TEXT; accent_profile is a planned recording stratum, not evidence that text has an accent. Accent and recognition accuracy remain **REQUIRES VERIFICATION**. Corpus rows describe eventual full behavior; planned_release determines whether MVP supports it or safely rejects it. Parser positive classification is not automatic display intent.

IFC supplies 3–5 initial short consented excerpts containing references. Record consent scope, speaker/sermon ID, permitted storage/use/expiry and expected exact reference, audio channel and translation request. These seed a pilot, not a statistically adequate accuracy dataset. Later request expanded authorized held-out material with negatives/background/lyrics, disfluency/corrections, multiple references and Nigerian/Canadian/international English speech as actually represented at IFC. No synthetic accent simulation substitutes for these recordings; do not infer nationality from speech.

Split by sermon and speaker/session (proposed 60% development/20% tuning/20% untouched test), prevent clip/utterance leakage. Two annotators independently label audible reference span/end, canonical tuple, intended display permission, ambiguity, corrections and translation; resolve disagreement before scoring. Unknown truth is ambiguous, not arbitrarily forced positive. Set sample sufficiency with QA before final claims; initial proposal ≥200 explicit held-out references plus 10 h realistic rehearsal negatives. Report actual per-stratum counts and uncertainty; do not inflate sample size by repeated clips or TTS.

Quality: exact-tuple accuracy, book/chapter/verse/range/translation accuracy, precision TP/(TP+FP), recall TP/(TP+FN), false suggestions/hour and actual wrong outputs/hour. Use Wilson intervals for proportions and report event-rate bounds. Zero events in 10 h still permits substantial unseen risk; roughly 3/T Poisson upper-rate heuristic is not a safety guarantee. Measure Auto precision among actual eligible/sent events separately from detector precision. Exclude nothing without recorded reason; stale/wrong-translation outputs count unsafe even if reference parse was correct.

## Performance instrumentation
Annotate audible reference end in synchronized test recording. Capture frame ingestion, STT partial/final/stable, parse, policy, queue, dispatch, receipt/readback and observed correct output times with session/candidate/command correlation IDs. Use monotonic offsets; correlate external camera/screen capture clocks with a documented sync event, record frame rate/clock uncertainty. Observe room and stream independently. If no reliable observed output, latency-to-output is unmeasurable, not equal to HTTP duration. Confirm report excludes human reaction only in system metric and separately reports full elapsed.

Record model/quantization/threads/acceleration/audio format, exact RAM/OS/PP build, topology/loss/RTT and background media load. Warmup and cold startup separately; p50/p95 plus worst/failures and N. Same shared-M4 baseline without VerseCue and with VerseCue must prove no media regression; compare dedicated companion profile separately. Do not add segment p95s to claim measured total p95. Raw recordings stay in separately consented private storage, never committed into the corpus or public repo.

## HIL and UAT procedure
Use docs/10 authorization/backup/non-live procedure; no production access is implied here. Required John 3:16/Romans 8:28 plus unprepared reference, translation switch/missing edition, ranges/navigation, manual/Companion concurrency and failure/reconnect must be observed. Repeat on OS/topology claim matrix; no inference from Mac to Windows. HIL record includes expected vs actual exact text/translation/theme/Looks/media with reviewer approval. P0 fails if no supportable arbitrary path; prepared passages alone do not pass.

UAT tasks: preflight within guide, review/Show correct passage, reject wrong card, stop/resume intentionally, identify output-unconfirmed state, recover no-signal/offline, manual Bible failback without restarting PP, inspect missing translation. At least three volunteers; record time/errors/assistance. Dangerous confusion blocks release even if median task time passes. Test compact/history/manual features only when offered; not counted as MVP evidence if deferred.

## Go/no-go and evidence ledger
P0: exact supported route/fidelity/translation/platform/timing evidence and IFC approval; current status PENDING. MVP: all MVP Must acceptance cases and NFR thresholds pass, zero unsafe rehearsal outputs, licenses/security/signing approved, no critical open operational defect, volunteer manual failback practiced. v1/v2 rerun affected tests plus full safety/concurrency/regression suites. Requirements approval cannot waive unperformed P0 automatically. Any scope/target waiver has owner, rationale, residual risk and explicitly revised release label.

Evidence ledger currently empty of execution results. Each future entry: test ID, requirement IDs, route/version/hash/profile, consent/authorization reference, fixture/source stratum/split, exact action/oracle, observed result, artifacts, timing/statistics, reviewer/date, PASS/FAIL/BLOCKED and defect. Documentation audit reports separately. QA and IFC production lead sign technical/operational acceptance; sponsor authorizes release. No cloud/purchases/GitHub/publication/live service changes implied.

Audit: unit/integration/system/UI/soak/security/package/UAT layers, requirement-specific cases, real dataset limits, performance instrumentation, HIL and go/no-go covered. Corpus validation must verify both formats match and required utterances/fields exist before docs/06 final audit closes.
