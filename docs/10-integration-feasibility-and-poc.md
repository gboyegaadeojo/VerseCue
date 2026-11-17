# ProPresenter integration feasibility and proof of concept

Date: 2026-11-17 UTC. Stage 1. Gate **PENDING**. Owner: VerseCue investigator; test authorization and acceptance owner: IFC production lead. No installation contacted, no output triggered, no code probe or production code created. All proposed integration behavior below is **PROVISIONAL** pending reproduction. This report is complete for the available research phase; experimental results are explicitly pending.

## 1. Installation and evidence boundary
IFC reports ProPresenter **21**, running on the same **Mac mini M4** intended for VerseCue; MOTU M4 input; English; Companion; existing themes, audience Looks and macros; KJV, Amplified, Amplified classic, NIV, NKJV and The Message. Exact build/macOS/RAM, translation identifiers/default, actions and routing have not been inspected. Version 21 is not assumed identical to an earlier ProPresenter 7 release. Public API metadata is not the application build. Windows viability and LAN deployment remain required investigations.

Evidence grades and URLs are in [RESEARCH_SOURCES](../RESEARCH_SOURCES.md). Access date for retrieved sources: 2026-11-17. No vendor publication/update date was exposed in the inspected article text; dates remain unknown. No performance, compatibility or licensing test has passed.

## 2. Direct Bible API question
**NOT VERIFIED / NOT DOCUMENTED in the retrieved public schema:** arbitrary normalized book/chapter/verse/range plus installed translation and current Bible theme lookup/selection. This is not a declaration of unsupported behavior. Inspect the installed version 21 documentation and obtain vendor clarification before concluding absence.

The [vendor schema](https://openapi.propresenter.com/swagger.json) identifies OpenAPI 3.0.2, API description version 1.0. Local inspection counted 194 paths, with no Bible/Scripture/translation match. It documents `GET /version`, presentation retrieval/triggers, macros, Looks and slide status. Its HTTP server example uses configurable port 50001; do not treat that as IFC's port. No security declaration was found. Installed authentication and transport protections require testing. (SRC-08, V-DOC; observation of this snapshot only.)

An exact direct-Bible method/path/request/response and a real working reproduction cannot be provided because none was found and no installation was tested. Do not invent one. Obtain documentation from Settings > Network > API Documentation on the authorized installation, retain its version and compare its paths/schemas against the snapshot. If a Bible route appears, record required fields, installed translation identifiers, theme selection semantics, side effects and errors before any call.

## 3. Route assessment
### R-01 — Documented direct Bible route, if discovered
Preferred investigation outcome, **not an available proven mechanism**. Would have to resolve arbitrary references using real installed text and existing themes. Required evidence: installed method/schema, vendor support statement, sandbox reproduction and complete tests below. Until then no architecture can rely on it.

### R-02 — ProPresenter-created Bible presentations plus documented API trigger
The [Bible workflow](https://support.renewedvision.com/hc/en-us/articles/360041347594-Using-Bibles-in-ProPresenter) documents installed-translation selection, passage search, theme application, saving Scripture as presentations and UI previous/next verse operations. (SRC-03, V-DOC.) Prepare test passages through that interface, preserve IFC theme, map inspected presentation/cue identifiers to expected references, then test a documented trigger. This can retain real ProPresenter Bible text and theme **if verified**. A finite prebuilt set does not satisfy arbitrary unscripted references. UI previous/next Bible behavior does not prove an API can generate new adjacent verses. No supported dynamic updating mechanism has been established. Manual operator preparation is a scope-limited alternative requiring IFC product approval if arbitrary lookup cannot be solved.

### R-03 — Existing macros/actions plus documented API
[Vendor macro guidance](https://support.renewedvision.com/hc/en-us/articles/4402663090323-Using-Macros-in-ProPresenter) documents grouped actions and triggering. (SRC-09, V-DOC.) Investigate an isolated copy of relevant IFC macro definitions, with operator review of every action. A macro is not proven to accept arbitrary Bible reference parameters. It may help preserve routing/Looks around a prepared presentation but may also stop media, clear layers or change other devices. Existing Companion control increases arbitration risk. Prefer explicit inspected IDs over focused/current targets. Do not create/edit/trigger existing production macros during research. Real text/theme preservation is conditional on the underlying Bible presentation route, not intrinsic to a macro.

### R-04 — Desktop UI automation, explicit last resort
No automation attempted and no claim of native API integration. Hypothesis: operate ProPresenter's own Bible interface to preserve installed text/theme. Assess Windows and macOS separately. First inspect accessibility elements on an isolated host; prefer semantic controls to coordinates. Verify search, translation and non-live selection independently from send. On macOS verify accessibility/automation permissions and dialogs; on Windows verify integrity levels and accessible controls. Test focus theft, typing during operator activity, scaling 100/125/150/200%, Retina/multiple displays, window positions, localization, OS permission prompts, locked screens and app updates. Any unknown target, changed UI or concurrent input must stop automation. Same-host agent would be needed for LAN use; this adds deployment/security cost and is not an accepted architecture. Do not use blind coordinate/key sequences on production. Latency, maintenance and permission assumptions remain REQUIRES VERIFICATION.

### R-05 — Supported import/presentation creation
[Vendor import guidance](https://support.renewedvision.com/hc/en-us/articles/45377042213011-Importing-PowerPoint-files-Natively-within-ProPresenter) describes editable PowerPoint importing from version 21, with limitations. (SRC-11, V-DOC.) That is not evidence of Bible lookup, automatic import API, exact Bible theme fidelity or permission to extract/repackage installed text. No general arbitrary Bible presentation creation API has been established. Test only a documented pathway with rights-cleared content and explicit IFC acceptance; reject a route requiring unlicensed external text or changing IFC's Bible appearance. ProPresenter-generated Bible presentations are preferable to regenerated text. No files/templates/Bibles were imported, extracted or redistributed.

### R-06 — Other documented mechanisms
[ProPresenter Control connection guidance](https://support.renewedvision.com/hc/en-us/articles/6024791423763-Connecting-to-ProPresenter-Control) describes same-LAN setup and Network settings. (SRC-10, V-DOC.) Control and optional TCP transport do not establish arbitrary Bible lookup. Ask vendor support whether version 21 exposes a supported Bible-search command, parameterized macro or presentation-generation workflow, and whether both OSs support it. No support inquiry sent. Legacy/reverse-engineered protocols are not accepted evidence of a supportable path. SmartVerses marketing is not API documentation. No additional route verified.

## 4. Experimental comparison coverage
All cells below are **PENDING**. Codes specify what to execute per route; no documentary capability is scored as an experimental pass. R-01/R-06 require a concrete documented mechanism first. R-05 requires rights approval first. Unavailable functions must be recorded FAIL for the route, not silently omitted.

| Test | Required scenario and pass evidence | Apply to routes |
|---|---|---|
| IT-01 | Resolve John 3:16 and Romans 8:28, then an unprepared reference selected by IFC; exact reference/text/translation. Finite-cache-only result fails arbitrary-reference requirement. | R-01–R-06 |
| IT-02 | 1 Corinthians 13:4–7 and cross-chapter range; all verses correct, ordered, no unexpected range expansion. | All |
| IT-03 | Next/previous from John 3:16, then chapter boundary; distinguish existing cue navigation from fetching new Bible verses. | All |
| IT-04 | Switch between two installed translations and request unavailable translation; correct identifiers, no silent substitution. | All |
| IT-05 | Compare screenshots against manual IFC Bible baseline: font, sizes, line breaks, references, translation display and template objects. | All |
| IT-06 | Room and stream Looks simultaneously match baseline; stage configuration unchanged. | All |
| IT-07 | Same Mac host then authorized wired-LAN client, and Windows host/client matrix; exact builds and permissions recorded. | All |
| IT-08 | Correlate send receipt, state readback and observed output. Unobservable audience output must be labelled unconfirmed. | All |
| IT-09 | Disconnect before send, lose response after send, restart ProPresenter, reconnect; no blind repeat or stale replay. | All |
| IT-10 | Operator navigates lyrics while Companion acts; no unintended focus change, lyric replacement or controller loop. Abort on ownership conflict. | All |
| IT-11 | Capture per-segment timing, end-to-end latency, CPU/RAM and media continuity under representative load. | All |
| IT-12 | Recheck after application/OS update in isolated environment; identifiers, UI, permissions and formatting stable or regression caught. | All |
| IT-13 | Review church licenses/translation rights, OS parity, supportability, operator preparation and maintenance effort; document recurring/capital costs separately. | All |

Execution log fields: test ID, route, UTC time, authorization scope, exact application/build/OS/hardware/network, request (sanitized), response/status, expected/actual, screenshots/video artifact path, media time continuity, operator observations, duration, PASS/FAIL/BLOCKED, owner and follow-up. No log entries exist yet.

## 5. Network, API and security verification
[Network setup](https://support.renewedvision.com/hc/en-us/articles/6024791423763-Connecting-to-ProPresenter-Control) requires enabling Network and using the actual displayed IP/port; it recommends wired LAN. Its sample address/port is illustrative. (SRC-10, V-DOC.) Do not enable settings or scan the network without authorization.

The [TCP guide](https://support.renewedvision.com/hc/en-us/articles/31606866768147-TCP-IP-Connections-with-ProPresenter-API) describes newline-delimited JSON, an HTTP-API subset, optional chunked updates, error responses, and no socket response for 204. (SRC-02, V-DOC.) Therefore a TCP timeout cannot alone prove failure. Verify exact socket framing, port, subset and reconnect behavior against the installed build before adopting it. HTTP is the initial inspection transport; no transport commitment.

| Concern | Authorized verification procedure | Current outcome |
|---|---|---|
| Enablement and port | Photograph Network settings with sensitive fields redacted; note actual host/interface/port and API docs link; compare before/after. | PENDING |
| Version/health | Allowlisted `GET /version`, body absent. Record status/body, including name, platform, os_version, host_description, api_version if present; compare About dialog build. | PENDING |
| Authentication/TLS | Review installed docs and settings; inspect an approved read-only request without/with required credentials. Do not brute force or assume Remote passwords protect REST. Check actual transport/certificate. | REQUIRES VERIFICATION |
| Discovery | Prefer manually configured host initially; inspect official discovery documentation before enabling broadcasts; constrain to trusted network. | NOT VERIFIED |
| Errors | On isolated target, test an invalid read-only resource and unreachable port with short timeout; record actual statuses/bodies. Never fuzz output or macro paths. | PENDING |
| Reconnect | Restore network/app; refetch version, active state, installed mapping and safety ownership; invalidate queued commands; require intentional resume. | PENDING |
| LAN exposure | IFC administrator reviews binding, firewall and trusted subnet. No public port forwarding/listener; limit access to approved controllers. | PENDING |

Some API GETs have side effects. A read-only probe must use a path allowlist, not just GET-only policy. Never crawl or automatically follow trigger/focus/clear links. Credentials and local addresses must be redacted in shared artifacts.

## 6. Weighted decision matrix
Scale 0–5: 0=no established route, 1=major unresolved gap, 2=significant limitations, 3=plausible, 4=good, 5=strong. These are **provisional investigation scores**, not measured reliability or feature support. Unknown criteria deliberately receive low scores. Formula: 0.30F + 0.25R + 0.20S + 0.10X + 0.10M + 0.05C; maximum 5. P0 pass is separate and cannot be purchased by a high weighted score.

| Route | Fit 30% | Reliability 25% | Safety 20% | Cross-platform 10% | Maintenance 10% | Cost 5% | Weighted /5 | Real PP text / IFC theme |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| R-01 direct route not found | 0 | 0 | 0 | 0 | 0 | 0 | 0.00 | Unknown / unknown |
| R-02 prepared Bible presentations | 2 | 3 | 3 | 2 | 2 | 3 | 2.50 | Conditional yes / conditional yes |
| R-03 macros around prepared material | 1 | 2 | 2 | 2 | 2 | 3 | 1.75 | Underlying route only / conditional |
| R-04 UI last resort | 2 | 1 | 1 | 1 | 1 | 2 | 1.35 | Conditional yes / conditional yes |
| R-05 import/generated material | 1 | 1 | 1 | 1 | 1 | 1 | 1.00 | Not established / not established |
| R-06 no new mechanism established | 0 | 0 | 0 | 0 | 0 | 0 | 0.00 | Unknown / unknown |

Rationale: R-02 can investigate genuine saved text but fails the unscripted-coverage assumption until dynamic creation is proved. R-03 adds action/conflict review and does not solve lookup. R-04 adds focus/permission/update failure points. R-05 adds rights and formatting uncertainties. Cost scores reflect unknown effort and the no-required-payment constraint, not researched vendor prices. Re-score from artifacts after IT-01–13; no final route or architecture selected.

## 7. Reproducible hardware-in-loop acceptance procedure
### Preconditions — no execution until authorized
1. IFC explicitly identifies authorized host, allowed reads/writes/outputs, test window and supervising operator. Approval to continue documentation is not this authorization. Prefer isolated test installation/library and disconnected/non-live outputs. If fidelity must be observed on production routing, obtain separately explicit authorization and confirm no congregation/stream destination is live.
2. Back up configuration/library/themes/Looks/macros using IFC's established procedure. Record restore owner; do not change production configurations for convenience. Map test room/stream monitors to equivalent routing and record any differences.
3. Capture About/build, macOS/Windows version, CPU/RAM, MOTU channel, network profile, installed translation IDs and selected default. Photograph manual John 3:16 and Romans 8:28 baseline in each output using IFC themes. Do not copy a Bible database or commit verse text without rights review.
4. Record running media and intended continuing layers. Inspect all test presentation/slide/macro actions for destructive effects. Stop if an action could clear/stop unrelated media or operate external equipment. Disable no production controller silently.
5. Retrieve installed API documentation. If it differs from public snapshot, use installed behavior/documentation as authoritative and amend this report. If no documented dynamic Bible route exists, restrict the first trial to ProPresenter-created test presentations and clearly label the coverage limitation.

### Read-only preflight
6. Use a manual HTTP test client configured for the exact approved host/port, timeout 2 seconds, redirects disabled, no automatic retry and no persisted secrets. Inspect only allowlisted version/resource/state paths. Confirm returned host/build matches intended instance before proceeding.
7. Read prepared presentation and cue mapping and selected Look/state. Compare expected reference, installed translation and manual baseline. A title containing a reference is insufficient proof of its text/translation. If response lacks content/translation evidence, have operator verify directly and record the limitation.

### Explicit send trials — not run
8. Confirm-path trial: prepare John 3:16 in the approved test route; operator reviews reference, translation and current target, then intentionally sends once using the documented installed method. A saved-cue candidate request is `GET /v1/presentation/{uuid}/{index}/trigger`, with inspected UUID/index, no request body; public schema lists 204/404. Do not substitute sample UUIDs or assume index mapping. Capture actual request/response without fabricating a sample success. (SRC-08, V-DOC.)
9. Read back state and capture both test outputs. Verify exact reference/text/translation, IFC template/Look, no unintended audience/stage change and continuous running media. Record separate transport receipt, readback and output-observed results. Repeat with Romans 8:28; then execute arbitrary-unprepared and range/translation/navigation tests IT-01–04. A prebuilt two-verse demonstration alone cannot pass P0.
10. Guarded Auto-path diagnostic trial: no application scaffold. In an explicitly authorized disposable harness/manual test driver, simulate stable validated candidates, intentional Auto enablement, state/translation/ownership checks and a single send through the same proven route. Demonstrate emergency stop before dispatch, correction invalidation and no send on ambiguity/expiry. Mark this a connector-policy diagnostic, not a production Auto implementation or STT accuracy test. Any script must have the prescribed throwaway header and run README, contain no secrets, default to dry-run and require separate write enablement/allowlist.
11. Cut test connection before send, then lose acknowledgment after a send. Verify no blind retry; inspect actual output/state before resolving uncertain completion. Reconnect/restart and show no stale queue replay or automatic resumption. Repeat while operator/Companion changes a test lyric cue; yield to operator and record conflicts. Never run this during a live service.
12. Repeat relevant tests on Windows and LAN topology. Record unsupported/version-specific cases rather than inferring Mac parity. Measure changing scaling/window focus/permission prompts if R-04 remains necessary.

### Timing and acceptance record
13. With consented real excerpts and an authorized audio feed, instrument monotonic timestamps at audible reference end, capture arrival, stable STT result, parsing, decision, dispatch, receipt/readback and observed output frame. Synchronize audio/video; report capture resolution and clock uncertainty. Record system-only Confirm delay separately from reaction time. Without STT evidence, connector-only timing does not meet end-to-end P0.
14. Proposed measurement run: at least 30 explicit references including both required passages and corrections under representative media load, report p50/p95, failures and sample limitations. Accepted target p50 ≤2 s / p95 ≤4 s remains a target; no measured figures exist. IFC must accept representative sub-4-second turnaround evidence, exact template/Look fidelity, translation policy, cross-platform viability and safe concurrency before pass.
15. Restore baseline if changed, verify ordinary manual Bible/lyrics/media operation, end diagnostic Auto mode and redact/archive evidence. IFC signs test results with date and remaining limitations. No actual audience success is inferred from a 204 or readback alone.

## 8. Gate decision and next actions
| Gate condition | Evidence | Status / owner |
|---|---|---|
| Supportable arbitrary passage route | No direct Bible method found in public snapshot; installed docs/test absent. | PENDING — investigator + IFC |
| Real text, translation policy, exact IFC theme and room/stream Looks | User confirms existing assets only. | PENDING — IFC production lead |
| Same-PC/LAN, Windows/macOS viability | User reports Mac mini M4; no experiment. | PENDING — investigator |
| Safe Confirm/Auto, operator/Companion coexistence, recovery | Procedures specified, none executed. | PENDING — IFC supervising operator |
| Representative sub-4-second turnaround | Target accepted; audio/test evidence absent. | PENDING — audio/test lead |

**P0 = PENDING, not PASSED and not FAILED.** Best next investigation is installed version 21 documentation/vendor clarification followed by R-02 as a limited baseline experiment, without committing architecture. No supportable arbitrary-reference route is yet demonstrated. If all supportable routes fail, options are manual ProPresenter with suggestion-only detection, an explicitly reduced prepared-passages scope, or deferring the project pending vendor support; each requires product decision. None permits a standalone presentation workaround.

**Mandatory STOP:** IFC may provide test evidence/authorize a specifically scoped test window, or reply **"continue provisionally"** to permit remaining research/documentation. Every later integration-dependent statement must then be PROVISIONAL. Implementation still requires the later requirements approval gate and satisfied feasibility requirements.

## 9. Stage audit
Sections 4 A–F covered: direct route with explicit absence limits; six alternatives; full pending test matrix; enablement/security/transport; weighted scores; reproducible hardware procedure and gate. No fabricated endpoints/results, stack selection, paid service, live access or production code. Remaining tests are not counted as complete. Public evidence snapshot retained under docs/evidence; installation-specific results require a future revision.

## Subsequent authorization record
IFC replied **continue provisionally** on 2026-11-17 after this Stage 1 STOP. Stages 2–4 documentation is permitted with integration-dependent statements PROVISIONAL. P0 is still PENDING; no test/host/output/code authorization or passing evidence was added by that reply.

## Personal-host evidence update — 2026-11-17
See docs/18-personal-propresenter-test-results.md for actual authorized Windows 21.4.2 results. Installed schema 205 paths, no Bible/Scripture/translation matches. Two genuine KJV Bible-UI-created presentations accepted single cue API triggers and changed local preview; matching readback recorded as specified. These partially verify R-02 only, not arbitrary lookup, physical room/stream fidelity, guarded Auto, media concurrency, Mac/LAN or STT latency. P0 remains PENDING. Historical earlier statements of no host tests are superseded only by this explicitly scoped evidence. Requirements approval remains valid; production code still prohibited.
