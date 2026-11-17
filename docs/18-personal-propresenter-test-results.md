# Personal ProPresenter feasibility session

2026-11-17 UTC. **P0 remains PENDING.** Requirements approved; user explicitly authorized their personal computer, read/trigger tests with outputs disconnected from congregation/livestream, and GitHub publication. This supersedes earlier withholding only for this personal test scope. Church production host and its Mac configuration were not accessed. User was present in the conversation; no second independent output observer participated.

## Environment and preflight
- Observed Windows ProPresenter **21.4.2 (352584193)** in About dialog; `/version` returned platform `win`, OS version `10.0.26200`, host description `ProPresenter 21.4.2`, API `v1`.
- Network already enabled, configured port 1025, optional TCP/IP/Remote/Stage App disabled. No network/security/privacy setting changed. Diagnostic requests used loopback only, not the displayed private LAN address. No credentials needed for the tested reads/triggers; this is evidence for this host/session, not a blanket security claim.
- Installed API Documentation button opened `/v1/doc/index.html`. Its referenced `swagger.json` retrieved as data, not executed. Installed schema has **205 paths** versus the public snapshot's 194; no Bible/Scripture/translation keyword or route found. Arbitrary Bible-reference API **NOT DOCUMENTED in inspected schema / NOT VERIFIED**, not proven unsupported.
- Data-only installed schema saved in docs/evidence/propresenter-installed-21.4.2-openapi.txt. Raw private network screenshots/config dumps and Bible text were not saved to repository.
- Screen status exposed one audience screen and one stage screen, both 1920×1080. No separate room and stream audience outputs demonstrated. Current Look labelled Scripture in UI; genuine Bible content selected KJV. Account settings displayed inactive seat; no activation/account change/purchase attempted.
- Initial layer status: all video_input/media/slide/announcements/props/messages/audio false. Thus no running-media continuity test was possible from this baseline; do not claim non-interruption of active media.

## Genuine content preparation
Through ProPresenter's existing Bible interface, loaded **John 3:16** and **Romans 8:28** with **King James Version** selected, then used **Save As Presentation**. Created `John 3_16 (KJV)` and `Romans 8_28 (KJV)` in the existing Default library; did not edit/delete the pre-existing Lower 3rd Scripture presentation. These are test assets left in the user's personal ProPresenter library, not files copied to VerseCue/GitHub.

Existing formatting split each verse across two cues, with lower-third preview text. Yellow warning icons were visible on generated thumbnails; cause not diagnosed, so exact theme fidelity/healthy asset status cannot be signed off. No theme, Look, macro or output routing was changed. Saved presentation readback reported presentation destination, no timeline, enabled cues and empty notes. Native Bible UI preparation is not automated arbitrary lookup through API.

## Reproducible disposable clients
See poc/README.md. `inspect-propresenter.mjs` is loopback/read-path allowlisted, no redirects/retries, strips verse text/host name from relevant output. `trigger-test-passage.mjs` defaults to zero-network dry-run, accepts only inspected fixture IDs/cue 0/1, verifies build/presentation identity and requires explicit `--send-authorized-personal-test`. Both have prescribed throwaway headers. PowerShell variant was blocked by execution policy; no policy bypass/change used. Node variant executed successfully.

First send attempt failed during preflight because the API presentation response has a `presentation` wrapper. No trigger was sent on that failure. Diagnostic corrected to unwrap it while retaining identity checks. First actual John trigger got 204 but immediate readback was still empty; later independent reads confirmed John presentation/cue 0 and nonempty current text. Subsequent diagnostic version polls **read-only state** for up to 2 seconds after the single trigger; it never repeats the write. Correctness checks compare saved/current text with whitespace normalization only, not a substitute external Bible.

## Actual command observations
Method: `GET /v1/presentation/{inspected-test-uuid}/{cue}/trigger`, no body. One request per trial, no retry. Fields below are sanitized; full licensed text stays transient. Times are single-run local HTTP/readback durations, **not** audible-reference-to-observed-output latency, percentiles or performance acceptance.

| UTC dispatch result | Passage / cue | HTTP | HTTP ms | Matching readback elapsed ms | Observed result |
|---|---|---:|---:|---:|---|
| 16:14:56.705 | John 3:16 / 0 | 204 | 146 | Not measured with bounded polling in first diagnostic | Preview changed to first John cue; immediate state stale, later reads correct UUID/index 0, current text length 123. Exact normalized match not recorded for this trial. |
| 16:15:34.779 | John 3:16 / 1 | 204 | 27 | 353 | Correct UUID/index 1, normalized text matches saved cue; preview showed concluding verse segment. |
| 16:15:45.060 | Romans 8:28 / 0 | 204 | 56 | 336 | Correct UUID/index 0, normalized text matches saved cue; preview showed first segment. |
| 16:15:54.585 | Romans 8:28 / 1 | 204 | 23 | 213 | Correct UUID/index 1, normalized text matches saved cue; preview showed concluding segment. |

ProPresenter preview was visually observed after each trigger. Physical audience/stage screens, church room/stream fidelity and downstream livestream capture were **not independently observed**. Audience/Stage toolbar controls appeared off/red; only preview/readback success is established. No claim that HTTP 204 means actual audience output. The final state was left on Romans 8:28 cue 1; no broad clear, media stop, theme alteration or deletion performed.

## Scope of evidence and gate
| P0 aspect | Outcome |
|---|---|
| Installed version/docs/read health | VERIFIED for this Windows personal host only. |
| Prepared genuine Bible presentation API trigger | PARTIALLY VERIFIED: both passages/cues accepted, preview changed, specified readbacks matched. |
| Arbitrary unprepared reference through documented integration | NOT VERIFIED; UI preparation remains manual. |
| Exact licensed text/template and separate IFC room/stream Looks | PENDING; personal preview not church output proof; warning icons unresolved. |
| Guarded Confirm/Auto policy, stale/correction/emergency stop | NOT TESTED as a policy system; intentional CLI sends are connector diagnostics only. |
| Failure/reconnect, running media/operator/Companion coexistence | NOT TESTED; no physical network changes or application restart performed. |
| Mac/Intel/LAN parity | NOT TESTED. |
| Real audio/accuracy/accent, end-to-end latency/soak | NOT TESTED; consented sermon excerpts still pending. |

Next investigation: examine a documented supportable way to resolve an unprepared reference on version 21 while preserving Bible appearance, with the installed docs/vendor clarification as evidence. If only prepared passages can work, IFC must explicitly decide reduced scope or defer; do not call that P0 passed or build a standalone presentation workaround. No production code authorized by these partial tests.

## GitHub authorization
User authorized publication in this turn. Destination selected: private `gboyegaadeojo/VerseCue`, avoiding public disclosure by default. Documentation, data-only schemas, synthetic corpus and labelled diagnostic sources are eligible after secret/file review; no real recordings, local address dumps, Bible databases or raw screenshot/verse text included. Publication result recorded in PROGRESS.md after push verification.

### Installed schema comparison and integrity
SHA256 of installed data-only schema: `E5709EDCF89B6758938C5274AC7AA8F4BA4275D13B28B6546A000AD4D8B76BB7`. Compared to public snapshot: 11 additional paths, all playlist cue-trigger/timeline operations; no added Bible/translation path. Public and installed schemas remain separately preserved. No proprietary Bible content copied into the evidence snapshot.
