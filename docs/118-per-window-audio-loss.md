# Per-window audio loss for Auto

2026-11-21. Traces to FR-006 (bounded buffering, indicate loss, discard stale processing), NFR-004 and NFR-008 (fail closed), and NR-010 (start in Auto). It responds to the finding in [the rehearsal harness](117-auto-rehearsal-harness.md).

## Problem

Dropped and clipped audio was counted per listening session. Recognition evidence used that session total, so after the first overflow every later window was "lossy": no reference could Auto-send until listening restarted. In addition, the first audio-loss event while in Auto paused Auto and disarmed output. On the development PC, recognition takes about 2 seconds per window, so continuous preaching overflows the 2-second pending buffer within seconds. Starting in Auto would have meant Auto switched itself off almost immediately.

## Rule now

- **Per-window evidence.** Each recognition window reports the audio dropped or clipped since the previous window was dispatched. A window is loss-free only if none was lost in that span. The session total is still reported separately (`sessionDroppedSamples`) and still shown to the operator.
- **Every loss still resets.** As before, each loss event cancels any pending automatic send, preparation and speech assembly, and clears queued candidates and passage context. The window that lost audio, and any reference assembled across it, cannot Auto-send.
- **Auto pauses on persistent loss.** Three loss events within 60 seconds pause Auto and disarm output (`AUTO_PAUSED_PERSISTENT_AUDIO_LOSS`), because recognition is not keeping up. Resuming is deliberate, as before. A single isolated loss shows "Audio was dropped. Auto continues with the next complete reference heard without loss." The loss history clears when Auto is enabled or the session is reset.
- **One rule in one place.** The thresholds live in `core/audio-loss-policy.cjs`, used by both the desktop handler and the rehearsal harness, so a rehearsal measures the same behavior. The stream builder now records per-window loss.

The renderer reports a discontinuity on the first loss after each dispatched window, rather than only the first loss of the session, so each new loss episode resets context in the main process.

## Why this keeps the safety intent

The original reason for blocking on loss is that missing audio could hide a correction, a negation or the rest of a citation. That risk belongs to the audio around the gap. Context reset, cancellation of pending sends, and refusing to assemble across lossy windows cover that. A later reference that is complete, ends in silence and lost no audio stands on its own evidence, under every other Auto rule. Persistent loss still stops Auto, because then the pipeline is degraded overall.

## Verification

| Check | Result |
| --- | --- |
| `tests/audio-loss-policy.test.cjs`: threshold and window; per-window versus session counters in `PastorAudio`; harness pause behavior | 3/3 pass |
| `npm.cmd test`, `npm.cmd run check` | 576/576 pass; check passes |
| `scripts/test-audio-loss-auto.cjs` (source): one and two losses keep Auto; three pause with the event code; reset clears history | Pass |
| Source scenario sweep | All pass except `test-background-quotes` and `test-power-recovery`, which fail identically on unchanged main |

## Not established

The 3-in-60-seconds threshold is a design choice, not a measured optimum. Real CPU speed, the resident worker and live preaching determine how often loss occurs; the ten-hour rehearsal and shared-host CPU measurements remain required. P0 remains pending.
