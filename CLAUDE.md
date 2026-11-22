# VerseCue - resume here

Checked: 2026-11-21 (late). P0 and full service acceptance PENDING.

Read AGENTS.md, the entire master specification, HANDOFF.md, PROGRESS.md, NEW_REQUESTS.md, docs/107 and the complete docs/99 original audit. Keep all original 62 FR/24 NFR/86 trace/66 corpus and RF01-22 gates.

## Takeover

Use [HANDOFF.md](HANDOFF.md) as the takeover document. **Public v0.6.2 pre-release is live** (target main 9343a1b; Windows ZIP sha 4472fb9e..., Mac ZIP sha 69063bc4...; README links verified). It includes PR93-104: Prepare for volunteer, Route layout/DM Sans, public-domain quotes (NR-013, docs/132), GPU speech (docs/133), whole chapter at the spoken verse + verse limit 176 (NR-014, docs/134). Packaged sweep 47/47, packaged speech CLI+resident pass. Draft PR22 integrates main (ef3cb60).

## Current authoritative state

- **NR-010 (user product decision):** VerseCue starts in Auto (dry run), with an Auto-first Route workspace (design canvas https://claude.ai/artifact/W11qaVvxvvBWuCMro8fSPs, board C). Trust gate: the 10-hour wrong-output rehearsal plus held-out precision/recall. Recorded in NEW_REQUESTS.md.
- NR-012 Prepare for volunteer (PR99, docs/130): start mode that prepares each clear detected reference in ProPresenter's Bible with no output; verified on the user's personal ProPresenter. PR100 Route artboard layout + DM Sans (docs/131).
- User-reported fixes merged 2026-11-21 (PR93-97): bundled speech engine fallback when the saved engine is missing; 1st/2nd/3rd ordinals and Whisper commas (1st John was read as John); connection health tolerance (slow answers show Slow to respond, 15 s to lost); 5 s queued speech (was 2 s); pre-ticked setup boxes NR-011 (docs/127-129). PR98 version 0.6.1.
- Also merged: PR82 H hold shortcut + announcements + hold-window age fix (docs/120), PR83 docs/107 refresh, PR84 resident worker folder in app scratch (docs/121). PR85 (docs/122) IFC-owned Ed25519 release signing and a verify-only update check, locked while capturing/armed; no key shipped. PR86 CycloneDX SBOM enforced by npm run check (docs/123). PR87 loopback scenario packaged expectation.
- Merged earlier today: PR75 provisional speech (docs/114), PR76 loopback guidance FR-008 (docs/115), PR77 start in Auto + Hold window (docs/116), PR78 ten-hour Auto rehearsal harness (docs/117), PR79 per-window audio loss, Auto pauses only after 3 losses/60 s (docs/118), PR80 Route workspace (docs/119), PR81 repaired stale power-recovery/background-quotes fixtures.
- CI notes: the diagnostics workflow triggers only on specific paths, so dispatch `diagnostic-checks.yml` and `macos-development.yml` manually on each component branch. PROGRESS.md/audit JSON conflict on every integration: take HEAD PROGRESS and append new entries; take theirs for the audit JSON, then rerun `node scripts/audit-documentation.cjs`.
- Scenario sweep helper (scratch, recreate if missing): run every `scripts/test-*.cjs` except test-local-speech/test-packaged-speech/test-resident-speech. Worktrees need private assets copied from root (poc/private/tools/whisper-b5454, poc/private/models/ggml-base.en.bin, recordings/replay-private/REAL-PILOT-001-12.wav, poc/private/tools/whisper-bin-x64.zip for packaging) and NODE_PATH=root node_modules.

## Next queue

PUBLISHED v0.6.4 (target main 7f1e631; Windows ZIP sha a54bca14..., Apple silicon 6cba7b17..., Intel Mac 25a8902d...; README links verified). Includes PR114-120: version switching, help/tour, MIT, Cue V logo (PR118), speed NR-020 + slow-ProPresenter guards (PR117, docs/143), privacy retention check (PR120, docs/144). Packaged sweep 48/48, packaged speech CLI+resident pass, 627 units, Mac arm64+Intel CI.
1. Live timing of PR117 skipped at the user's request (their computer is slow generally). If the user reports "ProPresenter is responding too slowly" in normal use, loosen the 2.5 s probe / 400 ms click limits (BibleBridge.cs) with a recorded reason.
2. Follow-ups (small): VerseCue.exe FileDescription says "Electron"; Mac Info.plist CFBundleShortVersionString shows Electron's version (45.3.3).
3. Waiting on user / hardware: Mac inspection file, live voice test, code signing, PR22 acceptance items (docs/107).
Standing rules: README updated with every change; Halo look matches canvas; test runs set VERSECUE_AUTOMATION=1. Scheduler: one cron (:17/:47).

## Integration and authorization

User (2026-11-21) approved running commands, building everything, merging component PRs and computer control for personal-computer VerseCue/ProPresenter testing. Safeguards still apply: Audience and Stage must be independently observed disabled before and during any personal ProPresenter test; no church production output, paid purchases, OS security/privacy/ACL changes, ProPresenter Clear/deletion, blind uncertain-output retry or automatic cue restoration; new personal-host telemetry stays private. A session cron (recreated after restarts; :17/:47, session only) resumes work after interruptions. Preserve design-reference/ and all test-results worktrees/private assets.

## Maintenance

Refresh about every 10 minutes while actively working and at merges/before interruption. Replace stale current directions; keep history in PROGRESS.md. Fresh agents require their own credentials, permissions and runtime handles.
