# Audio cadence and queue bounds

This component corrects the source contradictions identified in the [original audit](99-original-requirement-evidence-audit.md), FR-004/006 and NFR-008/010. It does not certify real microphone cadence, end-to-end latency or service readiness.

The worklet emits exactly 1,600 converted samples per packet, including when a packet ends inside a processing block. Offsets remain contiguous; timestamps identify the actual source sample at the packet boundary. A synthetic 16 kHz one-second stream produces ten packets rather than nine oversized packets. Existing 44.1/48 kHz tests retain channel, level and clock checks.

Active capture has a ten-second/160,000-sample maximum. While inference owns the worker, a separate pending limit retains at most two seconds/32,000 samples. Overflow reports dropped oldest samples; it does not renew pending age. Both completed pending windows and unfinished queued fragments expire after two seconds waiting for the worker. Exactly two seconds remains within the boundary. The existing original capture age, loss reporting, session identity, Stop cancellation and Auto restrictions remain in force. A forced window boundary is not silence evidence.

The WAV boundary also rejects more than 160,000 samples. Real audio is still local and selected explicitly; no microphone, ProPresenter or output is accessed by the module tests. Slow inference can cause visible loss and suppress automation; the bounds do not promise sufficient inference performance.

Verification in progress: four regressions failed on the old implementation; the corrected source passes 476 module tests and syntax checks. Desktop, packaged Windows and hosted Mac checks must finish before merge. Original MOTU, physical-output, speech accuracy, latency, crash-residue and field gates remain open.
