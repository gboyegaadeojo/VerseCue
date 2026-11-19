# Normal reviewed Auto approval backend

2026-11-19. Backend extraction from PR22; normal desktop approval controls and window lifecycle wiring remain separate.

The Confirm coordinator can approve a current complete unclipped single-cue KJV passage for guarded test Auto without exposing Library/Presentation/Cue selection. It requires three explicit acknowledgments, a positive owning-window identity, the unchanged review and a connected loopback target. It does not send output or switch to Auto. Approval rejects quotes, relative references, split passages, other editions and foreign active-input owners.

The connector samples current Look and saved PNG twice around fresh saved metadata checks. Memory-only hashes bind the grant to that appearance; automatic dispatch rechecks them and revokes only the exact changed mapping. Owner-bound guarded local speech is the only normal path permitted to use the grant; legacy desktop/private-API sends still need passage-level review. Superseded approval cannot delete or disarm a newer target grant. Desktop lifecycle must remove owner grants when the window closes or reloads.

Auto defaults to explicit current show/read instructions. A separately acknowledged per-session policy can accept complete anchored bare citations. Stop, resume, mode/configuration/reset and uncertainty restore the default policy. Original speech-end age including correction grace must remain within four seconds; missing/old timing, lost audio, quotes, corrections, manual input and unapproved mappings remain blocked. Shared passage ownership blocks competing automatic sends. Recovery messages use allowlisted reasons, never raw remote errors.

## Verification and limitations

All401 combined module tests and syntax checks pass on Windows. Coverage includes owner matching, zero-output approval, denied bypasses, target/reference races, unstable appearance, changed Look/PNG, Stop, bare-policy grammar/reset and aging during correction grace. Existing PR29 timing and PR30 preflight regression coverage is retained. Matching hosted Mac verification is pending. These synthetic API checks are not physical-rendering proof: metadata/cache timing is non-atomic, and appearance differences can conservatively require review. No actual ProPresenter, microphone or physical output was used.

No arbitrary newly created passage gains Auto approval. Native preparation remains too slow and may clip under current personal-host evidence. Desktop/IPC/control dialog/lifecycle wiring, platform/native/installed-edition/shared-hardware and full-service acceptance remain PR22 work. This PR is not a release.
