# Bounded continuous capture

2026-11-17, source0.2.5. Development implementation; full streaming STT, recall and latency acceptance remain pending.

## Change and limits

Earlier versions immediately discarded every incoming worklet block while the CLI was recognizing the preceding window. Capture now continues into an in-memory buffer while one owned inference request runs. The existing one-second silence/maximum-twelve-second segmentation remains. No second inference runs concurrently and no unbounded queue is created.

The buffer holds at most192,000 mono16kHz samples (twelve seconds). Overflow removes the oldest samples and increments a visible session drop count. A completed waiting window older than four seconds is discarded with an explicit stale-audio warning. This four-second waiting limit prevents an unlimited recognition backlog; it does not prove four-second end-to-output latency. Processing a window can still exceed the proposed latency target. Sustained slow inference can still lose references, so this is a partial improvement, not a claim of uninterrupted recognition or measured recall.

Stop clears pending samples and prevents a queued dispatch microtask from starting. Restart waits for the owned in-flight promise to settle before dispatching the new session's buffered audio. Main-process epoch checks and speech cancellation continue to discard stale recognition results. No waveform or transcript file is added by the buffer; existing CLI transient-file privacy limits remain.

## Verification

Five new deterministic tests verify retaining the next window while busy, bounded oldest-sample overflow, expiration of waiting audio, stop/restart ownership and stop-before-dispatch cancellation. A sixth lifecycle test verifies that stopping during asynchronous worklet initialization releases the late context and track. All125 regression tests passed. The0.2.5 packaged desktop and authorized12second fixture-worker checks passed (9,750ms, zero sends);116manifest files and source hashes matched. ZIP315,758,041bytes, SHA256 `6d89e40ad280a9be5935611a132c52ba9600ea2bd9b846d25e74ba5b77dedf32`. These checks do not establish MOTU driver behavior, Mac compatibility, speech accuracy or live service latency.

Partial requirement links: FR-001–FR-009 audio capture/health, FR-010 continuous recognition, NFR latency/safety/resource constraints as defined in the original requirements. Remaining work includes true incremental recognition/partial-versus-final semantics, supported persistent worker lifecycle, representative live capture, held-out recording labels, physical output latency and shared-host media tests. Auto remains unavailable.
