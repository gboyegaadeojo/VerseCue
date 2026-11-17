# Exclusive audio session ownership

2026-11-17, development0.2.8. Full/compact windows share one main-process audio ownership lease. This closes a gap where both trusted windows could independently open the selected input and submit competing windows to one speech worker.

## Behavior

Starting audio requires explicit selected-feed authorization and a ready nonpaused/nonstopped session. Exactly one window owns capture. Main-process IPC rejects samples from every other window; releasing an unrelated window does not stop the owner. Both windows see capture ownership state and disable a competing Listen action. Stop, mode/settings/profile change, native preparation, link-loss handling, owner-window close and application exit revoke the lease and cancel recognition. Resume does not acquire a microphone automatically.

The renderer checks session authorization before capture and after asynchronous microphone/worklet initialization. Revoked authorization closes a late track/context instead of letting it become active. In-flight speech results remain subject to existing epoch/generation cancellation. No audio device is opened merely by acquiring a test lease; actual physical capture still requires the explicit Listen flow and browser/OS permission. Fixture tests use the lease/IPC contract with already authorized in-memory samples and do not request microphone access.

## Evidence

Two lease tests cover owner exclusivity, nonowner release, stop and blocked re-acquisition. A lifecycle test covers revocation while worklet initialization is pending. All138regression tests passed. Expanded desktop testing separately exercises both trusted windows, rejects second-window acquisition/audio, preserves the owner after nonowner release, revokes via cross-window stop and releases on owner close. Those runtime checks must be recorded after completion rather than inferred from unit tests. No live speech/driver/Mac or physical output acceptance follows.

This supports partial audio single-source, input-health, stop/compact UI and privacy/safety requirements. Ownership IDs are transient local process identifiers, not credentials, and are not included in diagnostic exports. A compromised trusted renderer or same-user process remains outside this ownership mechanism's security guarantee; renderer isolation and narrow IPC controls remain required.

Follow-up: source and packaged0.2.8 desktop checks passed all described ownership/closure assertions without microphone capture. The expanded suite reached139passing tests after adding a profile-store size-bound regression; oversized snapshots cannot create a file the bounded loader would later reject. Packaged default CLI fixture recognition passed7,751ms with the new lease contract, zero output history. Resident-mode/ZIP verification is recorded in the final package evidence after completion.
