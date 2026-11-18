# Native saved-Bible preparation

Version 0.5.8 adds an explicitly enabled Windows preparation workflow. It uses ProPresenter's installed Bible and existing formatting to create a local presentation copy, then locates that new presentation through the HTTP catalog. It never creates Bible text itself.

## Operator workflow

1. Connect to local ProPresenter. In Settings / Advanced, separately acknowledge the focus change and creation of a local Bible copy.
2. Review a valid, unexpired reference. Choose **Prepare and save a Bible copy - no output**, or press Ctrl+Shift+P while VerseCue is focused.
3. Allow ProPresenter to finish preparation. VerseCue pauses recognition/output, disarms the connection and remains in dry run.
4. Review the newly selected presentation and cue in Settings / Output. Check the exact passage, translation, complete text, formatting and intended outputs in ProPresenter before explicitly verifying any mapping.

Saving does not map, arm or trigger a cue. Verification checkboxes remain unchecked. A clipping warning requires correction in ProPresenter before sending. Ordinary Confirm/Auto safeguards remain in force.

## Verified personal-host result

On 2026-11-18, the authorized personal Windows ProPresenter 21.4.2 test prepared **Nahum 1:7 / KJV**, created a genuine saved presentation and selected its single cue in VerseCue. The application remained Paused, dry run and disarmed, with neither mapping verification checkbox checked. Active output identity was unchanged. No output command or microphone capture was requested. The private report is excluded from Git and contains no public Bible-text artifact.

This verifies preparation and saved-copy discovery on that installation. ProPresenter reported clipped text, so formatting fidelity **has not passed**. Physical room/stream output, running-media coexistence, Companion coexistence, macOS native preparation, LAN preparation, other installed versions and end-to-end speech latency remain unverified.

## Restrictions and recovery

- Experimental native profile: local loopback target, Windows ProPresenter 21.4.2, one unambiguous library. Other layouts require manual ProPresenter preparation. The normal saved-cue HTTP workflow remains available separately.
- Input, translation, process identity, foreground focus and generated reference are checked before saving. Save controls use current accessibility bounds and a process/element hit test; no fixed screen coordinates are stored.
- Discovery accepts exactly one newly created presentation with matching translation suffix and enabled nonempty cues whose reference labels fit the request. Concurrent new presentations or changed output fail closed.
- Stop, target changes, owner-window loss and a new manual reference cancel pending preparation. A canceled transaction can leave a local copy; inspect ProPresenter before trying again. No automatic deletion or retry occurs.
- An accepted prepare-only operation may finish after its original candidate expires. That does not renew output eligibility: a fresh reference review and ordinary output verification are still required.
- The shortcut is local to the VerseCue window; it is not a global hotkey.

## Validation

The module suite covers unambiguous destination selection, cancellation/target changes, matching operation receipts, wrong passage/translation/cue rejection, changed output, clipping warnings and ambiguous new copies. The real-host harness requires `--authorized-personal-host` and a deliberate operator activation in the product UI. It does not trigger output. The full requirements and acceptance matrix remain authoritative; this route does not waive remaining acceptance tests.
