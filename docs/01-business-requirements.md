# Business requirements

2026-11-17. **All ProPresenter-dependent outcomes are PROVISIONAL; P0 PENDING.** Requirements are proposed for IFC review, except explicit user/master constraints. No implementation approval.

## Problem, stakeholders and journeys
Today a volunteer hears a reference, searches ProPresenter, verifies translation and sends it. Delay is reported qualitatively; no baseline seconds, error rate or staffing saving has been measured. The business benefit is timely correct Scripture with less volunteer workload while preserving existing production. Do not claim labor savings or guaranteed timing from this package.

| Role/persona | Need and authority | Journey / pain point |
|---|---|---|
| IFC sponsor/leadership | Scope, budget, release acceptance | Review cost/risk and authorize scope/gates; cannot accept hidden recurring charges. |
| Pastor/speaker | References followed accurately; consent/privacy | Speak naturally, correct references; provide consented samples rather than changing sermon for software. |
| Volunteer operator | Fast readable suggestions, control, immediate recovery | Preflight; hear/see John 3:16; review selected translation; Show once; dismiss error; resume manual Bible immediately if link fails. |
| Audio lead | Clean authorized pastor feed | Verify MOTU M4 channel and gain without changing live mixer routing; diagnose silence/clip/hotplug. |
| Livestream/production lead | Stable Looks/media and Companion coexistence | Compare room/stream baseline, retain control arbitration, prohibit unreviewed macro/output changes. |
| Maintainer/security/licensing lead | Supportable local deployment and rights | Maintain signed packages/rollback, inspect redacted diagnostics, review each dependency and translation use. |

Named owners are TBD; IFC production lead is interim operational decision owner. One person can fill several roles; safety and test sign-off should involve a second operator.

## Objectives and business requirements
Priorities: Must/Should/Could/Won't this release. Objective IDs support docs/12. All acceptance below is proposed and measurable; integration portions **PROVISIONAL**.

| Objective | BR | Requirement and rationale | Priority / owner | Acceptance / phase |
|---|---|---|---|---|
| OBJ-01 Timely accurate reference | BR-001 | Detect explicit English Scripture references from authorized pastor feed; volunteer sees stable valid candidate before send. | Must / product + QA | Held-out real data precision ≥95%, recall ≥90%; system p50 ≤2 s/p95 ≤4 s for Auto subject to accepted P0 profile. P0/MVP. |
| OBJ-02 Preserve existing production | BR-002 | ProPresenter owns text/themes/Looks/output; retain manual and Companion operation. | Must / production lead | Exact reference/text/translation and two-output fidelity; no unintended media/lyric/stage interruption in P0 and UAT. P0/MVP. |
| OBJ-03 Keep human authority | BR-003 | Confirm default; explicit Auto; Suggest-only, Pause and emergency stop; uncertain/stale sends fail closed. | Must / operator lead | All mode/conflict/correction/expiry tests pass; zero unapproved wrong displays in 10-hour rehearsal. MVP. |
| OBJ-04 Free, local, private use | BR-004 | No required paid speech service/new purchase; default no recorded audio/transcript, no cloud upload. | Must / sponsor + security | Offline rehearsal with no metered dependency; disk/network inspection clean; cost exceptions explicitly reviewed. MVP. |
| OBJ-05 Inclusive reliable deployment | BR-005 | Installable Windows/macOS companion, same-PC first and LAN capable; booth-accessible UI. | Must / desktop + ops | Signed installation matrix and 90-minute/3-hour runs; representative volunteers complete ≤5-minute orientation. MVP. |
| OBJ-06 Maintainable and lawful operation | BR-006 | Document rights/security, trace tests, recovery and controlled updates. | Must / maintainer | License ledger approved, redaction tests, backup/restore and rollback rehearsal, no orphan requirements. P0 onward. |

## KPIs and measurement ownership
| KPI | Current baseline | Proposed target / interpretation | Method / owner |
|---|---|---|---|
| Manual audible-end to output | UNKNOWN | Measure before claiming improvement | Observe consented rehearsal of ≥30 references; timestamp audio and screen, record reaction separately; QA/operator. |
| System detection/output latency | No implementation | Auto median ≤2 s, p95 ≤4 s, accepted target not result | Timestamp segments, video evidence, same-M4 load and wired-LAN profiles; performance lead. |
| Exact reference quality | UNKNOWN | Precision ≥95%, recall ≥90%, report component accuracy and sample intervals | Held-out real recordings split by sermon/speaker, no tuning on holdout; speech lead. |
| Wrong unauthorized output | UNKNOWN | Zero in 10-hour rehearsal; any occurrence stops release | Supervised recorded output, independent labels, include silence/background/discussion; QA. |
| Media/operator interference | UNKNOWN | Zero unintended interruptions in concurrency/soak/UAT | Operator/Companion test actions with media monitoring; production lead. |
| Usability | UNKNOWN | ≤5-minute orientation; all core tasks completed without unsafe sends | At least 3 representative volunteers including less experienced user; UX lead. |
| Stability and cost | UNKNOWN | 90 min minimum plus 3 h soak; USD 0 required STT usage | Resource/disk/network logs and budget ledger; ops. |

These are release criteria, not statistical proof of universal safety. Report denominators, exclusions and confidence intervals. If targets cannot coexist with free local operation and uninterrupted production, stop for IFC scope/resource decision.

## Scope, constraints and release policy
MVP thin slice: one selected input, one local STT backend, explicit-reference parser, stable candidates, Confirm plus guarded Auto, Suggest-only/Pause/stop, proven **PROVISIONAL** connector and installation on both OS families. Default no cloud/audio retention. v1 adds richer context/ranges/edit/manual fallback/history/navigation/translation overrides/profiles/update resiliency; full manual search may fast-follow only with explicit release decision. v2 optional alternative recognition provider, expanded languages only if approved, quote/paraphrase always confirm and advanced support only if approved. English-only remains IFC's current scope; multilingual features are not authorized initial work.

All functional/nonfunctional requirements remain documented regardless of phase. Advanced context may wait; MVP must safely reject unsupported forms rather than guess. Basic correction cancellation, stale expiry and context reset are safety requirements from day one. No drop of guarded Auto or dual-OS installability can be called completed MVP without explicit scope change.

Non-goals: direct screen/video/NDI output, competing presentation suite, sermon editor, lyrics/media management, recording service or SaaS. Preserve real installed Bible content; unsupported route/unlicensed text/fidelity changes are blockers, not acceptable shortcuts. No production host/output access, GitHub/publication, spending or implementation without explicit approval.

## Operating cost and approval criteria
Recurring STT target: USD 0/session with local inference. Cost = developer hours × actual agreed rate + approved hardware/signing capital + recurring electricity/support/signing renewal; no hourly rate or hardware quote invented. Preliminary ranges/assumptions are in docs/08. Existing ProPresenter/Bible licenses remain IFC-managed and not priced as free assets. Dated vendor price formulas are in docs/09. Signing budget/waiver decision must be resolved before promising zero-cash distribution. No procurement authorized.

Feasibility approval requires documented supportable arbitrary-reference route, exact text/theme/Looks/translation, Windows/macOS viability and representative timing/concurrency/recovery evidence. Requirements approval requires all docs/FR/NFR/tests, cost decisions and remaining P0 blockers reviewed at Stage 4. Field release requires actual passing evidence and IFC operator/sponsor sign-off. “Continue provisionally” permits this package only. Product changes require a decision record with affected requirements/tests/releases; accepted answers are not asked again.

Audit: objectives/BRs have owners, metrics and phases; assumptions remain linked to intake; no business benefit or integration success is represented as measured.
