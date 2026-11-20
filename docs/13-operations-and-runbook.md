# Operations and volunteer runbook

2026-11-17. **PROVISIONAL operational design: a development application exists; P0 and live-service readiness remain PENDING.** See docs/22 and subsequent evidence supplements for implemented controls and measured limits. Do not use this guide as authorization to install/control production. Exact church PP version21 UI/assets and audio routing must be verified by IFC before adapting this guide for service. Owner: IFC production lead; backup operator and maintainer named before rehearsal.

## Authorization and operating boundaries
Production host reads, setting changes, test outputs and live-service actions each require explicit scope authorization. Existing user approvals cover development, disconnected personal Windows passage tests and publication of reviewed project source to the private repository; they do not authorize church production access/output, spending or cloud inference. Prefer isolated test library and non-live room/stream-equivalent windows. Never run a test during service, change mixer routing, trigger existing macros, Clear All or install updates without the applicable explicit scope. Never publish recordings, licensed Bible databases, secrets or unreviewed private diagnostics. Ordinary manual ProPresenter is the failback in every release.

## Pre-service checklist (after approved implementation and tests)
1. Confirm approved app/model/PP build and current test sign-off; verify no pending release blocker or unknown route/translation. Keep last known-good installer/config backup accessible, no updates during service.
2. ProPresenter operator confirms correct existing room/stream Looks/themes, stage settings, selected translation and running media. Review Companion state and who owns live changes; do not disable/alter controllers silently.
3. Select correct MOTU M4 device/channel; audio lead confirms clean pastor signal, cable/gain/permission and no unexpected music/mixed speaker feed. Check level/clipping/no-signal; do not turn on default built-in mic if M4 absent.
4. Verify configured approved host/port/identity/build with read-only health test and actual capability/translation mapping. No assumed sample port or auto-discovered host. Missing theme/Bible/Look check = not ready.
5. Verify local model/hash loaded and offline operation; cloud/recording/transcript retention off unless separately authorized. Check CPU/RAM/media baseline and sufficient headroom.
6. Enter dry-run; speak or play only authorized test sample; observe correct stable candidate, translation, source phrase and expiry; Show produces simulated status only. Dry-run never tests real output.
7. If specifically authorized for a pre-service non-live output test, use the inspected test target, John 3:16/Romans 8:28 baseline and observe both outputs/media continuity, then restore intended state under operator direction. Do not substitute a live output check casually.
8. Start in Confirm; explicit target/test status and no old candidates/context. Rehearse Stop and manual Bible failback. Guarded Auto can be armed only if its route/ownership policy has actual accepted test evidence and operator intentionally chooses it; no Auto remembered from last week.

Do not proceed if actual translation/target/fidelity/ownership is uncertain. Mark VerseCue unavailable, continue manual ProPresenter and record redacted issue after service.

## Five-minute volunteer orientation
| Time | Teach and practice |
|---|---|
| Minute 1 | Read separate target/connection/audio/listening/mode indicators. Confirm is default. Good meter is not proof of correct Bible output. |
| Minute 2 | Review reference, exact translation, source and freshness. Focus Show/click once only for current intended passage. Partial or Needs review/expired cannot send. |
| Minute 3 | Reject wrong card; Suggest-only means detection with sends blocked; Pause stops listening. No held-key sends. Manual entry in v1 validates first and needs explicit Show. |
| Minute 4 | Use Stop: no future sends, existing output remains controlled by ProPresenter. Stop is local while app focused unless separately configured global shortcut. Re-arm intentionally into Confirm; never automatically into Auto. |
| Minute 5 | Read output-unconfirmed honestly; check PP rather than repeat. Practice manual Bible failback and locate production lead. Do not troubleshoot network/updates during service. |

Verify the volunteer can independently Show/reject/pause/stop/failback and explain Confirm vs Auto and receipt vs observed output. NFR-017 requires actual ≤5-minute learning evidence with at least three volunteers, not merely a five-row guide.

## Live workflow and safe correction
Hear explicit reference → wait for stable card → inspect reference/translation/source → confirm intentional Show. **PROVISIONAL:** PP handles Bible styling/Looks/output; VerseCue reports receipt/readback only unless actual output observation exists. If relative context/advanced range unsupported in current release, use full manual PP reference; do not guess. Corrections invalidate pending cards. If old output already sent, use deliberate correct Show/manual PP action; Stop does not undo it. Expired suggestions never send; ask/enter a fresh reference.

When manual operator or Companion changes presentation, VerseCue yields, clears relative context and disables Auto if ownership uncertain. Volunteer never has to stop ordinary PP navigation for VerseCue. Avoid global shortcuts colliding with Companion/PP; default shortcuts act only within appropriate focused VerseCue controls.

## Immediate manual failback
1. Hit VerseCue Stop or close it if unresponsive; do not quit/restart ProPresenter, clear layers or stop media as a reflex.
2. Keep the designated PP operator in control. Open the existing Bible interface, select the intended installed translation, enter the full reference and verify existing theme/Look expectations using IFC's familiar manual method. Version-specific UI validated in rehearsal, not invented here.
3. Operator intentionally displays using normal ProPresenter workflow. Verify both room/stream as usual. No VerseCue dependency remains; target recovery drill ≤30 s without disrupting media.
4. Leave VerseCue stopped until after-service diagnosis. No late queue replay/reconnect/Auto rearm during unresolved incident.

## Troubleshooting decision table
| Symptom | Safe immediate action | After-service check / evidence |
|---|---|---|
| No meter/device missing | Pause/Stop; ask audio lead; manual PP | M4 cable/channel/permissions/device ID; never substitute mic; logs sanitized. |
| Meter good but transcript absent | Manual PP; no provider fallback | Local model loaded/version/hash, worker health/resource limits; test consented sample in dry-run. |
| Wrong book/reference | Reject/Stop Auto; manual correct passage | Source phrase only if explicitly consented diagnostic retention; canonical alias/confusion and corpus regression; never secretly record. |
| Candidate stale/delayed | Stop and discard queue; manual PP | STT queue age, dropped frames/CPU, model/threads, monotonic timings; no speed claim from HTTP alone. |
| ProPresenter offline/wrong host | Stop sends; manual PP remains | Intended identity/build/Network IP/port/firewall in approved window; read-only tests only, no network scan. |
| Unavailable translation/AMP ambiguity | Block; select exact installed edition deliberately | Actual IDs/default/rights and UI label; no silent substitute. |
| Request may have sent / response lost | Observe PP, do not repeat blindly | Reconcile actual state/reference/output; lost acknowledgment is uncertain, not failure proof. |
| Looks/media/lyrics changed unexpectedly | Stop; production lead restores through normal PP controls | Inspect action graph/ownership/Companion and output screenshots; block release/Auto until root cause and retest. |
| Permission revoked/sleep-wake | Pause and preflight; no Auto resume | Restore permission/input only in suitable window; clear session/context. |
| App crash/corrupt settings | Close/restart safely or leave off; manual PP | Redacted crash event, safe config backup; do not send content-bearing OS dump unreviewed. |
| Signing/update warning | Do not disable OS security or install unverified package | Verify trusted signature/hash/architecture, maintainer review, rollback safe release. |

## Backup, restore and update procedure
Back up VerseCue nonsecret config/profile before settings/update changes; keep two known-good revisions with schema/app/model version and hashes. Secrets stay in vault and are re-entered/relinked if needed, never exported into backup. Do not back up audio/transcripts by default. IFC's existing PP backup procedure covers its libraries/themes/Looks/macros separately; VerseCue never copies Bible databases.

Restore only from reviewed valid schema/host allowlist, never imported Auto=true. Start disconnected/dry-run, revalidate exact target/audio/translation/assets and run no-output tests; obtain separate authorization for any physical output check. Restore succeeds only after manual PP/media continuity check. Corrupt config yields safe setup, not an automatic write.

MVP update outside service: production lead approves window; verify package signature/hash/CPU/version and model compatibility; save safe config/current installer; install; verify permission/input/read-only identity; dry-run; supervised approved test if needed; only then return to Confirm. On failure reinstall previous verified package and compatible config, preserving no Auto arming. v1 automated channel still waits for intentional outside-service installation and supports rollback; no provider/hosting chosen. Uninstall removes app/helper/autostart, offers explicit user-data deletion and never alters PP assets/output.

## Post-service diagnostic and incident record
Stop/end session; no output clear implied. Record event ID/time, safe error category, app/OS/PP/model versions, input/device/channel and topology in redacted form, mode, candidate/command state, observed output/media effect, operator/Companion action and resolution. Preserve source phrase/audio only with explicit consent and approved expiry; otherwise reproduce using labelled synthetic text later. Preview redacted export; no automatic upload or email/Slack message. Maintainer assigns defect/owner/severity and linked FR/NFR/tests; wrong display or production interruption blocks Auto/release until root cause and regression evidence. Confirm retention expiry/default no-content disk state and ready backup for next service.

Audit: preflight, five-minute guide, manual failback, incidents, troubleshooting, backups/restore/update/uninstall and after-service diagnostics covered with no implicit live authorization.

## Recover a saved setup in development builds

Builds containing the reviewed recovery controls provide Settings / Profiles / Recover a saved setup. Select a previous setup, review its target/port, translation, audio channel/input and speech files, then acknowledge and restore. A startup recovery notice opens this panel after corrupt-settings fallback. Selection does not apply anything; changed backups require refreshed review. Restore leaves listening paused and output disarmed, preserves Emergency Stop, and revokes old API/approval state. Test connection/input/speech readiness before deliberately resuming Confirm. No ProPresenter output is cleared or triggered by recovery. See [reviewed recovery controls](98-reviewed-settings-recovery-ui.md) for tested scope and limitations. Older published builds may not contain these development controls.
