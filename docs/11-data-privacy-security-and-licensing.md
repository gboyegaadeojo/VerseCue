# Data privacy, security and licensing

2026-11-17. **ProPresenter-dependent controls/data paths are PROVISIONAL; P0 PENDING.** Policy/design document, not a security assessment of installed IFC systems or legal advice. No host/audio accessed, secrets collected or Bible text extracted. Security/licensing owners are IFC-designated roles, named assignees TBD. FR-053–059/NFR-010–014/018–021 apply.

## Data inventory and flows
| Data | Purpose / route | Default storage and retention | Access / deletion |
|---|---|---|---|
| Pastor audio frames | Authorized M4 channel → native capture → local worker | RAM only, ring ≤10 s, queued STT audio ≤2 s; discarded after processing/reset/exit | Local process only; no cloud/recording by default; OS swap/crash limitations disclosed. |
| Partial/final transcript | Worker → stabilizer/parser → rolling preview | RAM rolling ≤2 min; no persistent transcript by default | Operator view; clear/reset/exit; cannot promise forensic memory erasure or control OS swap. |
| Candidate/context/history | Canonical reference, translation, source phrase, expiry/state → policy/UI | RAM active ≤5 candidates, context 120 s TTL, history N=20 when offered | Source phrase removed with session/reset; diagnostics omit content; no persistent sermon index. |
| Command and receipt | Core → configured local PP route → reconciler | In-memory exact expected tuple; sanitized event IDs/status/timings in bounded log | ProPresenter owns its own logs/content separately; VerseCue deletion does not delete PP assets. |
| Settings/profile | Input/channel, host allowlist, expected translation/assets, consent flags | Local nonsecret config; retain latest + two known-good backups | User/OS account permissions; validated import/export; reset/explicit delete; host/IP treated sensitive in exports. |
| Provider/API secrets | Optional future provider credential → OS vault | Vault reference only in settings; no plaintext fallback | Core only; operator revokes/deletes vault entry; never bundled or logged. |
| Diagnostics | Safe event category/severity/correlation, version, timing, health | Local rotation ≤20 MB and 7 days, delete oldest first; no default raw phrase/audio/token | Explicit redacted export preview; no upload default; local path/IP masking. |
| Optional diagnostic recording/transcript | Separate explicitly enabled purpose/consent | Default optional retention 7 days, expiry deletion at startup/daily; not on by default | Consent screen identifies fields/use/location; delete-now and expiry, revoke stops collection; backups/export copies outside app explained. |
| IFC research excerpts | Consent-based QA dataset, independently annotated references | Separate private user-approved location, expiry per consent; never copied into repo automatically | Limited QA/speech reviewers; delete/revoke procedure records affected benchmarks; no claim that Git deletion erases copies. |
| Bible text | Existing licensed ProPresenter → existing outputs; optional preview only if supported/rights cleared | No VerseCue database/bundle/scraped cache | PP license and rights govern; reference-only card until exact supported readback/preview rights established. |

Data boundary: microphone content is sensitive even during a public sermon. Local processing does not eliminate privacy risk from OS crash dumps/swap, shared accounts, malware or optional exports. Document these limitations and use OS account protection; do not silently record to simplify debugging. Session reset clears transient state but never automatically clears audience output. Logs are operational diagnostics, not a transcript archive.

Cloud STT is absent from required free/local MVP. Any future adapter requires new explicit opt-in naming vendor/model, transmitted content, region, retention/training terms, costs and deletion limits; TLS validation and vault-backed keys mandatory. No secret-bearing request in renderer/log. Data terms for all compared cloud vendors remain REQUIRES VERIFICATION, not inferred from pricing. Consent off means zero audio upload, including “fallback” or diagnostic support. Changing provider resets transient buffers and cannot replay a sermon to a different vendor.

## Threat and operational hazard controls
Risk owners must retain test evidence and residual-risk acceptance; no row is tested yet. All output-related rows **PROVISIONAL**.

| Hazard | Preventive controls | Detection / operator indication | Safe recovery | Owner / test | Residual risk |
|---|---|---|---|---|---|
| H-01 Wrong on-air reference | Stable complete parse, canonical bounds, verified translation, Confirm default, fail-closed Auto | Needs review reasons; expected/readback/observed mismatch | Stop sends, manual PP correction; invalidate candidate/context | parser + QA / T-FR-013/019, T-NFR-003/004 | Unseen accents/STT errors can survive checks. |
| H-02 Quotation/discussion mistaken for instruction | Intent policy, explicit-source feed, no quote Auto | Discussion/negation evidence and reference source shown | Dismiss and clear stale Auto eligibility | speech / UT-017/056/057/060, T-FR-018 | Intent cannot be perfectly inferred. |
| H-03 Multiple passages in one sentence | Ordered review-only queue, no Auto chain | Multiple-reference label | Select one deliberately; expire others | parser / UT-015, T-FR-020 | Volunteer may choose wrong item. |
| H-04 Translation absent/AMP ambiguity | Exact installed IDs, no default substitution | Translation unavailable/choose edition | Block sends until fresh explicit valid selection | licensing + integration / T-FR-021/043 | Installed metadata/API may not expose all facts. |
| H-05 Hidden STT lag/stale output | Bounded queues, monotonic TTL, revision cancellation | Dropped/behind status and age | Pause/restart worker; discard backlog, no replay | speech / T-FR-006/023, T-NFR-008 | Short undetected lag remains. |
| H-06 Audio loss/feedback/wrong mic | Channel lock, no default-device substitution, meter/no-signal/clipping | Input missing/poor quality | Pause/Auto off; audio lead restores approved channel | audio / T-FR-004/005/007 | Mixed feed/feedback can contain plausible references. |
| H-07 Repeated trigger loop | Duplicate cooldown/local command identity, one dispatcher, no blind retries | Repeated/canceled/uncertain event counts | Stop, reconcile actual PP state; intentional fresh resend only | integration / T-FR-022/047 | Remote controllers can independently repeat. |
| H-08 AI overrides lyric/operator | Ownership/revision checks, Confirm default, reviewed actions, no broad clear | Presentation changed elsewhere | Yield, disable Auto and relative context; manual control | production / T-FR-045, E2E-04 | No atomic PP lock may leave race; block Auto if inadequate. |
| H-09 Insecure LAN/wrong host | Allowlist/identity preflight, trusted segment/firewall, redirects off, no public listener | Wrong identity/network warning | Disable connector; administrator checks settings | security / T-FR-041, T-NFR-012 | Existing API transport/auth may be weak. |
| H-10 Cloud disclosure | No default cloud, explicit consent/terms/TLS, no silent fallback | Provider/consent status visible | Stop upload/revoke key; follow provider deletion terms | security / T-NFR-011, TS-PRIVACY | Data already sent may be retained under vendor terms. |
| H-11 Secrets leakage | Vault, redacted structured logs, scoped IPC, no key in build/export | Canary scan and export preview | Revoke/rotate key, remove exposed artifacts, incident review | security / T-FR-053/055 | OS compromise/privileged user can access runtime secrets. |
| H-12 Concurrent Companion/remote controllers | Inspect action graph, explicit session control expectations, state-change invalidation | Ownership changed label/readback mismatch | Stop automatic sends, coordinate volunteer review | production / IT-10, T-NFR-024 | Other clients may bypass VerseCue entirely. |
| H-13 Restart into Auto | Arming only session memory, startup safe mode | Confirm/Paused banner on restart | Preflight then deliberate re-arm | ops / T-FR-028/057, T-NFR-019 | Operator can intentionally re-arm prematurely. |
| H-14 Update during service | Service lock, manual MVP update outside service, signed rollback | Deferred update notice | Keep current version; rollback safe config without Auto | ops / T-FR-060, T-NFR-014 | OS/PP updates external to VerseCue need booth discipline. |
| H-15 False output success claim | Receipt/readback/observed states separate; no inferred screen success | “Output unconfirmed” | Operator observes actual screens; no blind retry | UX/integration / T-FR-046 | Runtime output may remain physically unobservable. |
| H-16 Untrusted settings/IPC/dependency | Validate schemas/ranges, narrow IPC/network capability, no arbitrary shell, pinned hashes/SBOM | Validation errors and dependency findings | Safe config restore, disable affected module, review update | security / T-FR-056/058, T-NFR-018/020 | Upstream/OS supply-chain risk persists. |

## Least privilege and reliability controls
Ordinary app requires microphone access, its own config/log directory and configured local PP connection. No admin/root, general file crawler, shell execution endpoint, LAN listener or public port-forward. UI cannot issue arbitrary API requests; core validates typed commands, origins, sizes and revisions. Local worker uses constrained private IPC and known model hashes. Native helper permissions must be documented individually; no accessibility/automation permissions unless a separately approved UI fallback actually requires them. Installer privilege is distinct from runtime privilege.

Transport security is installation-specific: do not claim PP REST is authenticated/TLS because Remote has a password. Inspect actual documentation/settings in authorized lab; firewall/segmentation is required if unprotected. No automatic secret discovery. Updates require signature/hash/architecture verification with protected private signing keys outside app; no update during service; rollback and credential revocation runbooks must be rehearsed. Review dependency/SBOM/model/font/native-binary terms and vulnerabilities before release. ProPresenter changes must never be made by an installer/uninstaller.

## Rights ledger — no redistribution authorized
| Item | Evidence / current status | Required approval/action |
|---|---|---|
| ProPresenter 21/API and existing Bible assets | IFC user report; SRC-01–11 documented workflows, not installation license inspection | Verify installed version/use terms and supported route; preserve PP source/text/themes/Looks. |
| KJV | Exact edition/territory rights REQUIRES VERIFICATION | IFC licensing lead verifies Canadian/service/stream use; do not bundle text on assumed public-domain status. |
| AMP | Lockman SRC-34 has edition-specific notice/conditions | Match installed edition and exact live/stream/preview use; no database redistribution assumed. |
| AMPC | Lockman SRC-34 distinguishes classic edition | Separate ID/notice from AMP; resolve ambiguous requests explicitly. |
| NIV | Biblica SRC-35 permissions | Review applicable app and stream use/rights; quotation allowance is not blanket app-content license. |
| NKJV | SRC-37 retrieval failed | Locate current publisher official permissions/support response for intended use; unresolved means no external-text path. |
| The Message | NavPress SRC-36, online/audio permission procedure | IFC verifies exact service/stream use and notices; preserve verse grouping/text fidelity. |
| whisper.cpp/faster-whisper | SRC-13/14 repositories identify MIT code | Pin release, include license; model weights, transitive/native/codec dependencies separately audited before bundling. |
| Desktop framework/audio/native libraries | Candidate only | Verify selected versions/license/SBOM and all redistribution requirements before choosing toolchain. |
| Fonts/icons | Not chosen | Prefer OS fonts/licensed assets; ledger required for any bundled asset; no copied SmartVerses design/assets. |
| Optional cloud speech | No provider selected; pricing research only | Current service terms/DPA/retention/training/region/keys/budget review and consent before use. |
| Reference metadata | No metadata database chosen | Rights-cleared canonical book/chapter/verse bounds with edition limitations and source/version trace; no verse-text extraction shortcut. |

Permissions sources, publisher URLs and access dates are in RESEARCH_SOURCES.md; no source grants broader rights than explicitly reviewed. If external verse text is necessary, written applicable rights and exact fidelity tests are prerequisites; absent rights reject that design. Full verse content is not required on the candidate card if licensed preview cannot be established. No purchases, publisher messages or license applications sent.

## Incident/retention process
Stop automatic sends and revert to manual PP; preserve only minimal redacted event IDs/times/settings versions, never secretly save audio. Notify IFC production lead internally through its chosen human process (no automated messages authorized). Record affected outputs, candidate/command states, actual observed outcome and potential credential/data exposure. Rotate/revoke any exposed secrets, isolate affected local-network access, review scope/rights and dependency changes, fix/retest before re-arm. Export/upload only with explicit consent and reviewed destination. Content deletion covers app-owned storage; explain external backups/provider copies and OS forensic limits. Optional recording expiry is tested using controlled clock/session fixtures, not a promise of secure physical erasure.

Audit: inventory/flows, default/optional retention, secrets/TLS/network exposure, all mandatory hazards with controls/detection/recovery/owner/test/residual risk, per-translation/model/font/binary licensing and update controls covered. All empirical/security/legal installation checks remain pending.
