# Decision records

2026-11-17 UTC. Stage 2 records finalized for the provisional Stage 3D documentation package. Accepted boundaries come from IFC/master specification. Recommendations are not approvals. **Every integration-dependent decision is PROVISIONAL; P0 PENDING.** Owners are roles pending assignment. Reopen records on failed tests, vendor changes or changed constraints. Sources: docs/09 and RESEARCH_SOURCES.md.

## ADR-001 — Preserve ProPresenter ownership
Status: ACCEPTED scope constraint. Owner: IFC sponsor. Context: existing Bible appearance, Looks and live operation must remain authoritative. Options: companion control; separate output engine. Criteria: fidelity, operator continuity, rights, scope. Decision: companion only; reject competing presentation/output engine. Consequence: absence of supportable arbitrary lookup blocks the intended product; it cannot be fixed by rendering VerseCue graphics. Validation: P0 IT-01/05/06/10 and BR-002/FR integration requirements. Change only by explicit scope approval, never silent fallback.

## ADR-002 — Integration route remains unresolved
Status: PROVISIONAL investigation, no route accepted. Owner: integration lead + IFC production lead. Options: installed direct API if found; saved Bible presentations; macros; last-resort UI automation; rights-cleared supported import; another documented vendor route. Criteria/weights and scores: docs/10. Decision: inspect installed version 21 docs and establish saved-presentation baseline; do not equate that with arbitrary lookup. Consequence: connector designs/costs/releases remain conditional. Exit: all P0 evidence, not a two-verse-only demonstration; reopen on any route inability.

## ADR-003 — Local STT first
Status: RECOMMENDED, not backend/model acceptance. Owner: speech lead. Options: whisper.cpp, faster-whisper, cloud services and OS speech (full comparison docs/09). Criteria: free recurring operation, offline/privacy, M4 shared-host load, cross-platform packaging, accuracy/latency. Recommendation: evaluate constrained whisper.cpp worker with base.en/small.en; optional future faster-whisper adapter. Consequence: local compute and model packaging cost; no accuracy/latency promise. Cloud alternatives require new IFC opt-in/budget/terms review and cannot activate as fallback. Exit: held-out real recordings and shared-host load tests; no real evidence yet.

## ADR-004 — Desktop framework candidate
Status: **PROVISIONAL RECOMMENDATION** contingent on P0, packaging and accessibility spikes. Owner: desktop lead. Options: Tauri, Electron, Avalonia, MAUI. Criteria: mixed Windows/macOS, small footprint, native audio bridge, local ML, accessibility, team skills. Candidate: Tauri 2 webview shell + native core/worker, not native OS widgets. Consequence: Rust/web skills and OS-specific bridges; Electron fallback if evidence/team fit favors it. No build system/dependencies selected or scaffold created. Exit: approved architecture plus clean installer, capture, VoiceOver/NVDA and worker containment evidence.

## ADR-005 — Deterministic parser authority
Status: RECOMMENDED. Owner: parser/QA leads. Options: grammar, LLM-only, hybrid. Decision recommendation: canonical aliases/number grammar and licensed metadata validation; context only with safe provenance. Reject LLM-only auto authority. Consequence: ambiguous cases need human review; novel accent/STT variants require dictionary work backed by tests. Future hybrid may suggest but cannot bypass validation. Exit: corpus, correction/context invariants and held-out recognition benchmark.

## ADR-006 — Explicit modes and ownership
Status: safety policy RECOMMENDED; output behavior **PROVISIONAL**. Owner: IFC operator lead. Default Confirm; Suggest-only continues recognition with sending disabled; Paused stops capture/recognition and sending; emergency stop cancels unsent commands, disables sends and requires separate intentional re-arm. Reconnect/restart never resumes Auto. Existing Companion/manual operator takes priority; lack of reliable ownership/readback prevents Auto. This distinguishes the specification's combined Suggest-only(Paused) wording into clear substates without weakening it. Alternative always-on Auto rejected. Validate stale/correction, focus, concurrency and kill-switch tests.

## ADR-007 — No bundled copyrighted Bible text
Status: ACCEPTED scope/legal guard; installed-use rights still unverified. Owner: IFC licensing lead. Options: installed ProPresenter source; external Bible provider; bundled database. Prefer existing licensed installation; reject fallback without exact rights. **PROVISIONAL** preview/output retrieval requires supported API and rights evidence. Consequence: candidate can be reference-only; AMP/AMPC and default translation cannot be guessed. Sources SRC-05/34–37; no verse databases extracted. Exit: per-edition ledger and P0 translation fidelity.

## ADR-008 — Free operation versus distribution expenses
Status: free-use constraint ACCEPTED; cost interpretation pending final review. Owner: IFC sponsor. No required metered STT/subscription/new purchase. Existing equipment/licenses treated as sunk, not declared free. Developer effort, electricity, signed packaging and maintenance must remain visible. Apple fee-waiver eligibility and Windows signing quote unverified; no purchase authorized. Consequence: free signed public distribution may be blocked unless existing credentials/approved waiver cover costs. Do not weaken signing or ask users to disable OS protection to satisfy a zero-cost slogan.

## ADR-009 — Release phasing and manual recovery
Status: PROVISIONAL release recommendation. Owner: product + QA leads. Preserve all FRs; phase MVP explicit detection/Confirm/guarded Auto/safe controls/installability first, v1 context/ranges/edit/history/manual controls, v2 optional providers/paraphrase. Manual reference entry may fast-follow only with explicit recorded release waiver; manual ProPresenter operation always available. No feature omission from requirements package. Exit: FR/NFR traceability and release go/no-go. A delayed Auto or integration feature cannot be called the specified MVP without IFC scope decision.

## ADR-010 — Updates and diagnostic data
Status: RECOMMENDED privacy/reliability policy. Owner: security/operations lead. No persisted audio/transcript by default; redacted local event logs; uploads require explicit opt-in. Manual signed MVP updates outside service; v1 update channel with signature verification and rollback, no silent live-service update. Consequence: less automatic support data; consented diagnostic export needed. Exit: retention/secret/rollback and incident tests. No hosting/update provider selected.

## Package reconciliation — Stage 3D
2026-11-17. ADR-001–010 reviewed against docs/00–13 and planned handoff. Boundary/free-use/English/same-PC constraints are accepted inputs; engine/framework/parser/update/release recommendations remain proposed. ADR-002/004/006/007/009 output/integration statements remain **PROVISIONAL** with P0 PENDING, no accepted connector/architecture. Traceability lists 62 FR/24 NFR cases; no runtime evidence or implementation approval exists.

- ADR-003 → FR-009/010/058, NFR-001/002/006/007/023, TS-STT/RESILIENCE. Model choice remains deferred to measured shared-M4 evidence.
- ADR-004 → FR-001/039/061, NFR-013–018, TS-AUDIO/UX/PACKAGE. No build-system/toolchain selected.
- ADR-005 → FR-011–025, NFR-002–004/021, UT-001–066/TS-PARSER/POLICY. Reference metadata source/rights still open.
- ADR-006 → FR-016/019/023/028–034/045–049, NFR-004/008/024, E2E-03–09. Suggest-only and Paused remain distinct; stop gates all sends but cannot undo dispatched output.
- ADR-007/008 → FR-021/043/053/059, NFR-021/023, licensing ledger/roadmap. No external text, paid signup or fee-waiver assumption.
- ADR-009/010 → FR-036/052/054–060/062, NFR-010/014/019/022, roadmap/runbook. Manual PP is always available; manual VerseCue lookup is v1 fast-follow. Safety-critical corrections/reset/expiry never deferred.

No decision automatically becomes accepted because its document is audited. Final requirements review must name owners, resolve scope/cost decisions and explicitly preserve all unresolved feasibility blockers. Any later acceptance record includes date, approver, evidence and affected requirements/tests; none added now.


## Stage 4 requirements approval — 2026-11-17
IFC user replied **I approve** to the provisional package handoff. Requirements baseline approved with its existing feasibility/verification caveats; no need to repeat that gate for unchanged requirements. Recommendations remain conditional technical choices until P0 evidence, rather than committed architecture/backend/model/toolchain. P0 PENDING and live access/output, spending/cloud/GitHub restrictions unchanged. Next step is separately scoped authorization for non-live feasibility tests, not production code.
