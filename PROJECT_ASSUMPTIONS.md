# VerseCue intake assumptions and questions

Date: 2026-11-17 UTC. Authority: master specification, Sections 1, 3 and 15. These are working defaults, not IFC approvals, vendor facts or measured results. Owner for unanswered operational questions: IFC production lead, consulting pastor/audio/livestream leads as appropriate. Answers replace defaults and are recorded here without asking the same answered question again.

## Scope and boundaries
VerseCue is a small, installable, native-feeling Windows/macOS desktop companion that listens to an authorized pastor audio feed, detects and validates explicit Scripture references, and offers a clear candidate for volunteer confirmation. Optional guarded Auto, Suggest-only/Paused and emergency stop are required. ProPresenter retains Bible content wherever possible, styling/themes, audience Looks, routing and actual presentation. Ordinary manual ProPresenter operation must remain available if VerseCue fails.

Out of scope: a presentation engine, direct audience graphics/video/NDI/overlays, lyrics management, sermon editing, cloud SaaS, unlicensed Bible redistribution, and silently replacing ProPresenter. No desktop framework, STT provider, build system or final integration route has been selected.

## Material intake questions and explicit defaults
All questions below were asked together on 2026-11-17 and answered in part the same day. The table preserves original defaults; the response register below supersedes answered items. Continue research using defaults rather than waiting. Unknown installation facts must remain unknown, not fabricated defaults.

| ID | Question | Working default if unanswered | Decision due / effect |
|---|---|---|---|
| Q-01 | Exact ProPresenter version/build and host OS? | One authorized instance; exact build/OS UNKNOWN. Public documentation is not installation evidence. | Before installed API verification and P0 pass. |
| Q-02 | Current Bible theme and separate in-room/livestream Looks? | Preserve existing IFC Bible appearance and both outputs; names/configuration UNKNOWN. | Before fidelity tests; never replace styling. |
| Q-03 | Mixer, audio interface and clean pastor microphone routing? | One dedicated clean mono aux/matrix pastor feed; actual devices/routing UNKNOWN. No assumption of equal OS loopback support. | Before audio/latency tests. |
| Q-04 | Default and alternate installed Bible translations? | Use IFC's installed/selected ProPresenter translation; identity and rights UNKNOWN. Never silently substitute or bundle paid text. | Before exact-text tests and translation policy approval. |
| Q-05 | Same-PC or LAN deployment, and CPU/RAM/GPU/OS inventory? | Assess both same host and trusted-LAN companion; shared codebase preferred; hardware UNKNOWN. Windows/macOS installation essential, actual OS/CPU support uncommitted. | Before performance and packaging commitments. |
| Q-06 | Offline/cloud preference, data restrictions and recurring budget? | No persistent audio or transcript storage by default; transient processing only; cloud STT opt-in and not selected. Budget UNKNOWN. | Before provider recommendation/acceptance; no purchases or cloud selection authorized. |
| Q-07 | Maximum acceptable detection-to-output delay? | Proposed Auto p50 ≤2.0 s, p95 ≤4.0 s from audible reference end to observed output, subject to evidence. Confirm metric excludes volunteer reaction. | Validate in representative P0; targets are hypotheses. |
| Q-08 | Automation policy and existing controllers/Companion? | Confirm default; Auto disabled until intentionally enabled and safeguarded; emergency stop; manual operator priority. Other controllers UNKNOWN. References discussed are not automatically display commands. | Before command arbitration/Auto acceptance. |
| Q-09 | Languages, accents and simultaneous speakers? | English initially; one pastor/microphone. Nigerian, Canadian and international accents require real-recording testing. No measured accent capability claimed. | Before recognition benchmark acceptance. |

## Additional carried assumptions
| ID | Assumption | Status / validation |
|---|---|---|
| A-01 | Volunteer retains manual ProPresenter control throughout service. | Required boundary; concurrency behavior must be tested. |
| A-02 | At least 90 minutes continuous use; 3-hour soak and 10-hour wrong-display rehearsal set planned. | Specified test expectations; no runs performed. |
| A-03 | Cross-platform installability is essential; OS-specific capture/permissions/packaging may be necessary. | Required outcome; support versions require vendor research and testing. |
| A-04 | Arbitrary Bible lookup via official API is not yet verified. Presentation triggering alone proves no Bible lookup capability. | P0 blocker; research and reproduction required. |
| A-05 | All persistent recordings/transcripts remain off by default; diagnostic exports redact sensitive content. | Required privacy default; eventual implementation/test pending. |
| A-06 | Name is provisional. | Five alternative names and recommendation due in later business package; no name availability claims. |

## Real audio request and evidence handling
DATA-01: IFC was asked on 2026-11-17 to supply 3–5 short recorded sermon excerpts containing Scripture references, with the pastor's consent. Pending delivery. IFC should identify expected references, language/accent as consented, and any permitted retention/use limits. Do not collect new audio or access a live feed implicitly. Until supplied, accent and accuracy claims are **REQUIRES VERIFICATION**. Synthetic text or explicitly labelled SYNTHETIC TTS may support smoke tests only and cannot establish real accent/accuracy performance.

## Authorization and mandatory gates
- Documentation and public-source research are authorized. Only labelled, non-destructive throwaway diagnostic code under poc/ is permitted in this phase; none written at intake.
- No production-host access, live outputs, production code, application scaffold, build-system selection, purchases, cloud-provider selection or GitHub initialization/publication.
- Stage 1 must end at a STOP with PASSED/FAILED/PENDING evidence. PENDING requires IFC reply such as "continue provisionally" to advance; later integration-dependent statements then remain PROVISIONAL.
- Failed P0 requires an honest product decision, never a standalone presentation workaround.
- Stage 4 requires a separate requirements/implementation approval STOP. Provisional documentation continuation is not implementation authorization.

## Intake audit
Checked against Sections 1, 3, 15 and execution rules: scope/non-goals, nine material questions with defaults, consented real audio request, privacy/manual control/cross-platform defaults and both mandatory gates are captured. All installation/performance facts remain unverified.

## IFC response register — 2026-11-17
User-reported operational facts, not independently inspected installation evidence:

| Question | Answer / adopted constraint | Remaining verification |
|---|---|---|
| Q-01 | ProPresenter version 21. | Exact point/build number and macOS version unknown; do not re-ask major version. |
| Q-02 | Different themes, Looks and macros already exist in ProPresenter. Preserve them. | Names, assignments, actions and visual baseline require authorized inspection. |
| Q-03 | MOTU M4 interface. | Clean pastor channel/routing, permissions, format and signal quality untested. |
| Q-04 | KJV, Amplified, Amplified classic, NIV, NKJV, The Message installed (user names retained). | Default not specified; exact installed identifiers/editions and rights evidence pending. |
| Q-05 | Currently same computer: Mac mini M4; also design for LAN companion. | RAM, macOS version, loads, LAN profile and Windows test machine unknown. |
| Q-06 | Must be free. | Interpret as no required paid subscription, metered STT or new purchase; distinguish existing hardware/licenses and development/signing costs. No paid provider selected. Full meaning of distribution/development costs remains open for later cost review. |
| Q-07 | Proposed delay is good enough. | Accepted target, not measured achievement: Auto p50 ≤2 s / p95 ≤4 s. |
| Q-08 | Companion in use; agent may choose best safety policy. | Retain Confirm default, Auto disabled; inspect controller/macro conflicts only with authorization. |
| Q-09 | English only. | No additional languages in initial scope. Accents and speaker overlap remain unmeasured. |

These answers do not authorize production-host access, live output tests, cloud use, implementation or passing a gate. DATA-01 remains pending.

## Documentation continuation — 2026-11-17
IFC explicitly authorized **continue provisionally** after Stage 1. Remaining research/requirements documentation may proceed; all integration-dependent recommendations remain PROVISIONAL and P0 PENDING. Stage 4 requirements approval and actual feasibility pass are still prerequisites to production code. No live access/output/purchase/cloud/GitHub authorization follows from continuation.
