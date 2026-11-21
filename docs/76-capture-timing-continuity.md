# Capture timing and continuity

2026-11-19. PR22 capture producer extracted independently from desktop recognition consumers.

The audio worklet reports ordered sample offsets and its audio-clock capture timestamp. The renderer detects missing/out-of-order frames, discards partial windows after gaps, reports clipping and stops the input lifecycle on missing timing/channel or suspended/interrupted/closed audio context. It requires an explicit restart after interruption.

Bounded recognition windows carry a capture-session UUID, ordered sequence, unique window UUID, duration, original buffered age, speech-end age, dropped/clipped sample counts and silence/window-limit evidence. Queue waiting and delayed worklet delivery remain part of age instead of becoming fresh recognition. Overflow and stale-buffer removal remain explicit. Audio stays memory-only; this adds no recording, cloud service or output authorization.

## Verification

All376 combined module tests and syntax checks pass on Windows. Synthetic browser tests exercise suspension, channel/timing loss, capture gaps, delayed delivery and clipping. Tests execute the actual capture processor at44100 and48000Hz to check ordered offsets, audio-clock timestamps and selected-channel errors. These tests do not request an OS microphone, prove transcription accuracy or measure physical-input latency. Hosted Mac verification is pending.

Desktop speech-evidence consumption, citation assembly and lifecycle/output-policy wiring remain separate PR22 dependencies. Timing is explicitly a capture-monotonic proxy, not a hardware timestamp or a claim of physical-output freshness. Original platform, live microphone, minimized/shared-hardware and full-service acceptance remain pending.

## Verification update - 2026-11-19

PR32 merged at66a1b1b. Final combined head4295fb0 passed393 module tests/syntax and standard Mac44594866353. No physical microphone/timing acceptance inferred. Original real-host/platform/service limitations remain.
