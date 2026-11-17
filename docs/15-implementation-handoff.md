# Implementation handoff — documentation only

2026-11-17. **PROVISIONAL integration-dependent handoff; P0 PENDING. No production code or implementation authorization.** This is a task/interface/dependency plan for an eventual approved team. A requirements-package approval cannot itself turn unperformed P0 tests into a pass. Production build/scaffold begins only after feasibility and requirements gates are both satisfied; host/output/purchase/GitHub authorization remains separate.

## Definition of ready and gate prerequisites
Ready for isolated P0 diagnostics: scoped IFC host/read/write/output authorization, non-live target/window, supervisor, exact builds/assets/rights, backup/restore plan and allowed request list. Probe scripts only under poc/, first comment `THROWAWAY DIAGNOSTIC — NOT PRODUCTION CODE`, run README, no secrets, dry-run/read-only default, explicit separate write arm/host allowlist. No probe exists now.

Ready for production implementation: docs/10 P0 PASSED with supportable arbitrary route, two required plus unprepared passage/fidelity/translation/concurrency/platform/timing evidence; docs/00–15 and corpus/traceability approved at Stage 4; named owners, model/framework decision with empirical data, rights/signing/test-host budget and release scope accepted. No committed route or build system chosen in advance. If P0 fails, stop for product decision, never generate a standalone presentation workaround.

## Recommended repository structure after approval
```text
VerseCue/
  README.md, PROGRESS.md, PROJECT_ASSUMPTIONS.md
  REQUIREMENTS_SUMMARY.md, RESEARCH_SOURCES.md
  docs/                         requirements/evidence/corpus/runbooks
  poc/                          disposable diagnostic probes only
  (after both gates only)
  app-ui/                       full/compact/setup views, typed IPC clients
  core/                         session, parser, policy, queues, settings
  adapters/audio/               native Windows/macOS capture bridges
  adapters/stt/                 versioned provider adapters
  adapters/propresenter/        proven route and readback capabilities
  workers/                      constrained local recognition worker
  contracts/                    versioned schemas/interfaces
  tests/                        fixtures, contract, policy, OS/HIL/UAT harnesses
  packaging/                    per-OS artifacts, signing/update scripts
  legal/                        SBOM, notices, license/rights references
```
The post-gate directories above are recommendations, not created scaffolds. Toolchain, dependency manager, web bundler, installer/update channel and exact versions selected only after accepted architecture; no Git/GitHub initialization or remote publishing now. Do not commit real audio, secrets, Bible databases or private machine configuration.

## Interface handoff and invariants
| Module | Inputs/outputs | Contract and safety boundary | Test responsibility |
|---|---|---|---|
| CaptureAdapter | selected device/channel/format → AudioInput frames/health | Callback cannot block; no device substitution; permission/loss events stop sends | TS-AUDIO; FR-001–008 |
| STTProvider | bounded audio/cancel/reset → versioned transcript revisions/errors | Provider confidence optional; no hidden cloud fallback or session replay | TS-STT; FR-009/010/024/058 |
| Stabilizer/parser | utterance revisions/context/metadata → canonical candidate/evidence | Stable explicit reference only; deterministic validation, correction cancellation and source/intent flags | TS-PARSER; FR-011–025 |
| Session/policy | mode/health/ownership/config/candidate revisions → suggestion or immutable DisplayCommand | Single atomic recheck/send gate; no partial/expired/ambiguous/unknown translation Auto | TS-POLICY; FR-016/019/022/023/028–034 |
| ProPresenterConnector | verified capabilities/allowlisted command → receipt/readback/error | Exact installed documented route, one in-flight, no blind retry, no HTTP-only output claim | TS-CONNECTOR; FR-040–050; docs/10 IT cases |
| UI | shared read state → typed intent actions | No direct API/shell/output; focus guards, test banner, stop remains reachable | TS-UX; FR-026–040/051/061 |
| Settings/diagnostics | validated schema/vault refs → config/events/export | Never import Auto/secret, default content persistence off, bounded redacted logs | TS-PRIVACY; FR-052–059/062 |
| Installer/update | signed versioned package → safe local install/rollback | No PP asset changes, no service-time update, CPU/OS compatibility checked | TS-PACKAGE; FR-060/NFR-013/014 |

Full field names/lifetimes in docs/04. All asynchronous events carry session/revision/correlation IDs and monotonic timing. Context depends on verified current passage, not most recently recognized text. Idempotency is local bookkeeping unless installed API explicitly proves server support. Unknown connector capability disables dependent function. Stop is a local send latch, not a remote clear action.

## Development task breakdown and dependencies
| Task | Concrete output / definition of done | Depends on | Owner / tests / phase |
|---|---|---|---|
| ENG-01 | Authorized installed docs diff, exact build and supported-route/vendor evidence; update route matrix. | IFC scope authorization | integration / docs/10 IT-01/13 / P0 |
| ENG-02 | Non-live genuine Bible baseline, required/unprepared references, two Looks/text/translation/media and failure/concurrency evidence. | ENG-01 + approved test window/rights | integration + operator / IT-01–10 / P0 |
| ENG-03 | Consented local model benchmark, shared-M4 vs companion resource/latency and Windows/macOS viability record. | Authorized audio/test hardware + ENG-02 route | speech + QA / IT-07/11/12, NFR-001/006 / P0 |
| ENG-04 | P0 decision, remaining blockers and scoped alternatives if failure. | ENG-01–03 | IFC + QA / gate sign-off / P0 |
| ENG-05 | Approved architecture/toolchain/version/rights/signing plan and requirements sign-off. | P0 pass + Stage 4 review | product/desktop/security / readiness review / before code |
| ENG-06 | Versioned contracts, deterministic fake adapters, safe config/stop/mode core and redacted diagnostics. | ENG-05 | core/security / TS-POLICY/PRIVACY / MVP |
| ENG-07 | Per-OS selected-input capture, permissions/meter/hotplug, bounded local worker and offline model verification. | ENG-06 + model evidence | audio/speech / TS-AUDIO/STT/RESILIENCE / MVP |
| ENG-08 | Canonical aliases/numbers/validation/intent/stabilizer/corrections/dedup/TTL with licensed metadata. | ENG-06/07 | parser / corpus + TS-PARSER/POLICY / MVP |
| ENG-09 | Full UI/setup/dry-run/Confirm/stop with focus and truthful result labels. | ENG-06–08 | UX/desktop / TS-UX / MVP |
| ENG-10 | Proven connector route, target/translation/fidelity/capability checks, safe receipts/readback/reconnect. | ENG-02/06/09 | integration / TS-CONNECTOR/E2E-01/05/07/09 / MVP |
| ENG-11 | Guarded Auto with intent/ownership gates and correction/expiry/stop races proven; no startup resume. | ENG-08–10 + heldout evidence | core + QA / TS-POLICY/E2E-03/04/08 / MVP |
| ENG-12 | Signed Windows/macOS installers, model/license notices, clean installs/rollback and runbook rehearsal. | ENG-07–11 + credentials/rights | desktop/ops / TS-PACKAGE/RESILIENCE / MVP |
| ENG-13 | Independent UAT/10h rehearsal, resource/quality metrics and go/no-go evidence. | ENG-12 | QA + IFC / all MVP NFR/TS-FIELD / MVP |
| ENG-14 | Relative context/ranges, edit/manual fallback/history/nav/translation/profiles/compact/optional controls. | Stable MVP + v1 scope | parser/UX/integration / all v1 FR regression / v1 |
| ENG-15 | Rich diagnostics/settings import/export and signed update channel/rollback with approved hosting. | ENG-14 + security/budget | desktop/security / TS-PRIVACY/PACKAGE / v1 |
| ENG-16 | Optional second local provider; separately approved cloud/quote/language/central support features. | Stable v1 + new approvals | speech/security/product / feature benchmarks + full safety regression / v2 |

Deliver vertically: no long build of speech/UI before route is proved. Keep provider/connector fakes distinct from HIL evidence. Estimate ranges/skills/recurring/capital assumptions in docs/08; if ENG-01–04 fail invalidate downstream estimates. One engineer may own several modules; QA/production sign-off should be independent of the implementer where practical.

## Definition of done
Per task: accepted requirements mapped, meaningful acceptance/fault cases pass on claimed environments, no unsafe route/rights/default drift, sanitized evidence retained, docs/traceability/ADRs updated, reviewer and IFC operational decision recorded where required. Reversible cosmetic changes do not need redundant tests mirroring implementation; safety/capture/parser/connector/packaging checks must remain substantive. Release done additionally requires all named Must/NFR gates and actual signed artifacts, field volunteer/manual recovery evidence, no unresolved critical safety issue and explicit IFC release authorization. Documentation done is not app done.

No implementation may begin merely because this plan exists or a provisional architecture was recommended. Next engineering action remains an authorized feasibility session; without that, finish/review documentation and retain blockers. No live host/cloud/purchase/GitHub action follows automatically.

Audit: repo recommendation, build sequence, P0 spikes, module contracts, task dependencies, readiness/done, staffing/delivery/cost cross-reference and no-code restrictions covered. No directories/build files/application modules from the future layout were created.
