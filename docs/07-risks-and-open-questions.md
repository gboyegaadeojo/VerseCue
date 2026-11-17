# Risks, assumptions and open decisions

2026-11-17. **Integration-dependent risks/actions are PROVISIONAL; P0 PENDING.** No risk is retired by a documentation audit. Likelihood/impact scored 1–5 as qualitative engineering judgments, not probabilities; rank by product, then safety severity. Named owners TBD; roles below are accountable pending IFC assignment. Source evidence docs/09/10, intake PROJECT_ASSUMPTIONS.md.

| ID / rank | Risk and cause | L×I | Mitigation / evidence needed | Owner / due | Residual risk |
|---|---|---:|---|---|---|
| R-01 / 1 | No supported arbitrary Bible lookup retaining genuine text/theme. | 5×5=25 | Installed version 21 docs, vendor clarification, unprepared-reference HIL, no cache-only false pass. | integration + IFC / P0 | May force product deferral or explicitly reduced scope. |
| R-02 / 2 | Wrong verse/translation/stale send from STT, ambiguity or correction race. | 4×5=20 | Deterministic validation, fresh stable candidates, TTL, Confirm default, zero unsafe rehearsal displays. | speech + QA / MVP | Real sermon variation remains beyond samples. |
| R-03 / 3 | Operator/Companion/macro conflict interrupts lyrics/media/routing. | 4×5=20 | Inspect authorized actions, no silent focus/clear, ownership gate, concurrency/failure tests. | production lead / P0 | No atomic remote lock may block Auto. |
| R-04 / 4 | Local speech load/latency and accent performance fail shared-M4 target. | 4×4=16 | Real holdout audio, constrained base/small model comparison, baseline media/resource tests; existing dedicated LAN host alternative. | speech/performance / P0 | Free/local vs quality/timing may conflict. |
| R-05 / 5 | Rights or signed-distribution expenses conflict with free-use constraint. | 4×4=16 | No bundled text, exact license ledger, publisher terms, signing quote/waiver review. | sponsor + licensing / before distribution | Zero-cash signed distribution not guaranteed. |
| R-06 | LAN API exposure or wrong-host control. | 3×5=15 | Explicit allowlist/identity, trusted subnet/firewall, no public listener; installed auth/TLS review. | security / P0 | Existing local API may be unauthenticated/unencrypted. |
| R-07 | UI automation proves brittle across focus/scaling/permissions/updates. | 4×3=12 | Last resort only, explicit approval and separate OS spikes; no coordinate-only production automation. | desktop / route decision | Maintenance may render route unacceptable. |
| R-08 | Audio feed contains lyrics/noise/other speakers or M4 wrong channel. | 3×4=12 | Audio-lead preflight, source/channel lock, meters/no-signal, no default substitution. | audio lead / P0 | Mixed-source contamination still possible. |
| R-09 | Tests lack representative real recordings/negative hours. | 4×3=12 | DATA-01 consented 3–5 clips plus expanded held-out/rehearsal set; never claim synthetic accuracy. | IFC pastor + QA / benchmark | Small pilot cannot establish general accuracy. |
| R-10 | Windows/Intel/macOS signing/audio/accessibility parity costs exceed estimate. | 3×4=12 | Pinned matrix, clean host packages, actual test hardware and screen readers. | desktop / MVP readiness | Missing machines or unsupported OS blocks claim. |
| R-11 | Cloud activation leaks content or incurs cost. | 2×5=10 | No MVP cloud dependency, explicit consent/vault/TLS/terms/budget before optional future adapter. | security/sponsor / v2 | Provider policy may change. |
| R-12 | Misleading receipt called successful output. | 2×5=10 | Separate receipt/readback/observed state; two-output HIL video oracle. | integration + UX / MVP | Runtime physical output may remain unobservable. |
| R-13 | Update/restart resumes Auto during service. | 2×5=10 | Session-only arming, service update lock, signed rollback/restart drills. | operations / MVP | Operator can still act on wrong external state. |
| R-14 | Dependency/model license/security issue or corrupted settings. | 3×3=9 | SBOM/hash/license scans, safe restore, no arbitrary IPC/shell, bounded worker. | maintainer/security / every release | Upstream vulnerability/update burden persists. |

## Decision queue — do not repeat answered intake questions
| ID | Still unresolved | Current default / consequence | Owner / due point |
|---|---|---|---|
| D-01 | Exact PP 21 point/build/macOS, RAM and load profile | Unknown; no installed compatibility/performance claim. Major version/M4 answered already. | IFC production lead / authorized P0 preflight |
| D-02 | Supported arbitrary reference/translation/theme route | No proven route; R-01; no architecture commitment. | integration + vendor evidence / P0 |
| D-03 | Selected default Bible and exact installed edition IDs | Use selected ProPresenter default, identity unknown. AMP vs AMPC ambiguous requests blocked. Six installed names already supplied. | IFC operator/licensing lead / P0 |
| D-04 | Theme/Look/macro names/actions and Companion ownership policy | Preserve all; Confirm default, yield to external operation; no unreviewed macro triggers. Existing assets/controller use already answered. | IFC production lead / authorized P0 |
| D-05 | M4 clean channel/feed/format and consented recordings | Interface known; routing not measured; no live capture authorized. DATA-01 requested once, pending. | audio/pastor / P0 quality tests |
| D-06 | Windows/Intel test hosts and minimum supported OS versions | Windows/macOS essential; exact claims wait vendor/runtime/lifecycle tests. | desktop + IFC / MVP planning |
| D-07 | Signing credentials/waiver/maintenance budget within “free” | No required paid operation; no purchase approved; expose signing/dev costs. | sponsor / before distribution plan accepted |
| D-08 | Final STT/model/threads/acceleration and framework | Recommended local whisper.cpp/Tauri candidates, not selected or measured. | engineering + IFC / after P0/requirements approval |
| D-09 | Optional range/context/manual/history release sequencing | Full requirements retained; v1 fast-follow manual lookup, safety invalidation stays MVP. | product / Stage 4 requirements review |
| D-10 | Auto intent/ownership/readback evidence and tuning | Auto never unconditional reference-mention behavior; absent reliable ownership blocks Auto. | operator/QA / P0 then rehearsal |
| D-11 | KJV edition/territory, NKJV current terms, stream/preview rights for every edition | No redistribution; external-text fallback rejected until rights. | IFC licensing lead / P0/content path |
| D-12 | Future update hosting/channel and support scope | No provider/hosting selected; signed manual MVP update only. | maintainer + sponsor / v1 |

Accepted: English-only, same Mac mini M4 first plus LAN design, MOTU M4, free-use aim, latency targets, existing assets and Companion. These are not open questions to ask again. Architecture and empirics remain open. Assumptions A-01–06 and original defaults remain in PROJECT_ASSUMPTIONS.md, superseded by its response register and ADRs where applicable.

## Escalation and change control
Safety event/wrong display: stop Auto, retain redacted evidence, use manual PP; QA blocks release pending root cause/retest. P0 failed route: STOP for IFC product decision, not a standalone engine workaround. Target/rights/free-use conflict: show concrete options/impact and request sponsor decision; do not silently lower goals. All changes record date/owner, affected BR/FR/NFR/tests/release, reason and approval. Risk acceptance cannot fabricate test evidence or authorize production-host access.

Audit: top five, broader risks, owners/due points, recorded assumptions and remaining decisions are explicit; none marked resolved without evidence.
