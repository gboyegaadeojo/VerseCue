# VerseCue - resume here

Checked: 2026-11-21 13:30 UTC. P0 and full service acceptance PENDING.

Read AGENTS.md, the entire master specification, HANDOFF.md, PROGRESS.md, NEW_REQUESTS.md, docs/107 and the complete docs/99 original audit. Keep all original 62 FR/24 NFR/86 trace/66 corpus and RF01-22 gates.

## Takeover

Use [HANDOFF.md](HANDOFF.md) as the takeover document. Public v0.6.0 pre-release (Windows + Apple Silicon) published 2026-11-21 from 04e3be1. Main is 587be79 (PR75-92; earlier note: ad57f65) (PR75-89 merged by Claude on 2026-11-21). Draft PR22 integrates main: 588 modules, check (syntax, inventory, SBOM), documentation audit and all source scenarios pass. The exact-source Windows review build of main ad57f65 passed all 42 packaged scenarios: test-results/pr-split/packaged-main-check/test-results/build-review-ad57f656-1cbceebe-cbfd-4a81-8c36-07cbaa9d8bad/dist/VerseCue-0.6.0-win32-x64/VerseCue.exe (local, ignored).

## Current authoritative state

- **NR-010 (user product decision):** VerseCue starts in Auto (dry run), with an Auto-first Route workspace (design canvas https://claude.ai/artifact/W11qaVvxvvBWuCMro8fSPs, board C). Trust gate: the 10-hour wrong-output rehearsal plus held-out precision/recall. Recorded in NEW_REQUESTS.md.
- Also merged: PR82 H hold shortcut + announcements + hold-window age fix (docs/120), PR83 docs/107 refresh, PR84 resident worker folder in app scratch (docs/121). PR85 (docs/122) IFC-owned Ed25519 release signing and a verify-only update check, locked while capturing/armed; no key shipped. PR86 CycloneDX SBOM enforced by npm run check (docs/123). PR87 loopback scenario packaged expectation.
- Merged earlier today: PR75 provisional speech (docs/114), PR76 loopback guidance FR-008 (docs/115), PR77 start in Auto + Hold window (docs/116), PR78 ten-hour Auto rehearsal harness (docs/117), PR79 per-window audio loss, Auto pauses only after 3 losses/60 s (docs/118), PR80 Route workspace (docs/119), PR81 repaired stale power-recovery/background-quotes fixtures.
- CI notes: the diagnostics workflow triggers only on specific paths, so dispatch `diagnostic-checks.yml` and `macos-development.yml` manually on each component branch. PROGRESS.md/audit JSON conflict on every integration: take HEAD PROGRESS and append new entries; take theirs for the audit JSON, then rerun `node scripts/audit-documentation.cjs`.
- Scenario sweep helper (scratch, recreate if missing): run every `scripts/test-*.cjs` except test-local-speech/test-packaged-speech/test-resident-speech. Worktrees need private assets copied from root (poc/private/tools/whisper-b5454, poc/private/models/ggml-base.en.bin, recordings/replay-private/REAL-PILOT-001-12.wav, poc/private/tools/whisper-bin-x64.zip for packaging) and NODE_PATH=root node_modules.

## Next queue

The user plans to test once the software is complete; the review build above and [docs/124](docs/124-personal-auto-first-test-guide.md) are ready for that. Remaining work needs the user, hardware or data:

1. Personal ProPresenter testing with the user (Audience/Stage verified off first).
2. Labelled, held-out real sermon recordings for the ten-hour Auto rehearsal (docs/117) and precision/recall (docs/112).
3. Mac native preparation (needs an authorized Mac and accessibility profile).
4. Code signing/notarization (paid; not authorized), volunteer, screen-reader and booth sessions, latency and soak on representative hosts.

Small software follow-ups if time allows: configurable STT confusion aliases only with labelled evidence (FR-024). Rollback/removal procedure is documented in docs/125 (PR90). Do not change Auto safety rules without a recorded reason.

## Integration and authorization

User (2026-11-21) approved running commands, building everything, merging component PRs and computer control for personal-computer VerseCue/ProPresenter testing. Safeguards still apply: Audience and Stage must be independently observed disabled before and during any personal ProPresenter test; no church production output, paid purchases, OS security/privacy/ACL changes, ProPresenter Clear/deletion, blind uncertain-output retry or automatic cue restoration; new personal-host telemetry stays private. A session cron (3d8f1551, :17/:47, 7-day expiry, this session only) resumes work after interruptions. Preserve design-reference/ and all test-results worktrees/private assets.

## Maintenance

Refresh about every 10 minutes while actively working and at merges/before interruption. Replace stale current directions; keep history in PROGRESS.md. Fresh agents require their own credentials, permissions and runtime handles.
