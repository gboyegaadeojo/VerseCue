# Audio age, continuity and continuation safety

2026-11-18. Draft PR22, source 0.6.0. These changes preserve the local, explicit-input, Confirm-first defaults. They do not establish recognition accuracy or service latency acceptance.

## Behavior

- Capture worklet messages carry sample offsets and an AudioContext capture-frame time. The selected input detects missing/out-of-order frames and carries delivery delay into the bounded audio buffer. A burst of old renderer messages cannot automatically count as newly captured speech.
- Each recognition window has a unique identity, duration, original buffered age and a speech-end timing proxy. Durations cross IPC; backend and renderer wall clocks are not subtracted. Total backend recognition time is added to the original age.
- Speech candidates receive only the remainder of the fifteen-second lifetime measured conservatively from the oldest captured sample. Expired audio is discarded and clears context. An explicit manual correction receives a new manual lifetime.
- Auto requires known original timing and rechecks the speech-end age proxy after the correction grace. Missing/old timing, dropped/clipped audio, forced cuts and existing parser/recognition safeguards withhold Auto. The proxy is not a measurement of the audible end of the particular Bible reference.
- Buffer loss, missing capture frames or clipping immediately invalidates pending context/preparation. Auto pauses/disarms. Confirm can retain the authorized input while new explicit references remain for review. A suspended/interrupted context, missing pastor channel or missing capture timing stops the input lifecycle and requires explicit restart; it does not silently reacquire a microphone.
- Recognition window IDs prevent duplicated requests from creating new candidates. This is window deduplication, not a claim of full cross-window utterance assembly or streaming STT.
- A new reference invalidates an older multi-part continuation, including when the newer suggestion was subsequently dismissed. Ordinary preaching without a new reference does not itself invalidate an intentional Continue action. Current identity/text/fingerprint are still checked before every remaining part.

An expired/unknown/cut utterance cannot borrow the prior book/chapter context to produce a fresh relative instruction. No new raw-audio or transcript persistence is introduced. Existing local-worker temporary-file behavior and cleanup remain unchanged.

## Verification

298 module tests pass, including synthetic input lifecycle, original/queued/delivery age, expiration, window identity, clipping/loss, invalid clocks and stale continuation. The normal desktop audio regression verifies forced-cut context reset, expiration during inference, shortened lifetime, repeated-window deduplication and loss during an in-flight recognition. Its one trigger is an explicit synthetic-target setup action; no real ProPresenter or microphone is used. [Sanitized report](evidence/audio-age.json).

Actual browser AudioWorklet execution with an inaudible oscillator verifies contiguous sample offsets and increasing capture-frame times. Source desktop/workspace, guarded Auto, minimized local recognition/quote confirmation, normal passage continuation, renderer recovery and simulated power recovery regressions pass. These tests do not measure actual microphone/device unplug performance, accent accuracy or physical screen latency. The minimized fixture's several-second inference remains incompatible with claiming the proposed live latency targets passed.

## Remaining work

RF13 still requires reliable assembly/stabilization of citations split across speech windows; no concatenation of unrelated sermon text was added. RF14 still needs real device/loss/minimized acceptance. RF15 still needs independently labeled audible-reference-end timing and physical output measurement on representative shared hardware. Native preparation still pauses and changes focus. Original P0, real formatting/Looks, Mac/companion route and field acceptance remain pending. See [the complete workflow checklist](51-reference-driven-bible-workflow.md).
