# Bounded speech replay diagnostics

2026-11-21. Follow-up to FR-004/009, NFR-008/010/019 and RF-14/20 verification. These scripts are development diagnostics, not capture, an accuracy benchmark or a production output route.

## Corrected contract

Five legacy replay scripts selected up to twelve seconds of PCM while the current speech boundary accepts at most160000 mono16kHz samples (ten seconds). A valid older private fixture could therefore fail before recognition. The shared [decoder](../scripts/speech-replay-fixture.cjs) now validates bounded RIFF/WAVE chunk sizes, PCM encoding, mono channel,16kHz rate, byte rate, block alignment and16-bit samples before selecting the first0.2-10 seconds. It rejects malformed/truncated/duplicate audio chunks and unsupported formats; it does not resample an unknown fixture.

Each report distinguishes source and processed sample counts/seconds, says explicitly whether selection was truncated, and records separate source-WAV/processed-PCM hashes. A ten-second selection of a twelve-second file is not a full-file test. Hashes identify artifacts; they do not anonymize private recordings or establish consent. Label any later accuracy experiment against exactly the audio actually processed, not the original longer file.

Replay uses no invented capture timestamps. Its timing basis is `untimed-file-replay`, with audible-end measurement false. Existing runtime ownership and unknown-timing/Auto restrictions remain unchanged. Worker time is not audible-reference-end to confirmed-output latency.

## Callers and isolation

- [Local CLI](../scripts/test-local-speech.cjs): explicit trusted worker/model/authorized fixture arguments; unique scratch root and cleanup check confined to that root. No scan of unrelated global temporary files.
- [Resident worker](../scripts/test-resident-speech.cjs): authorized private fixture; two bounded requests and worker-stop check.
- [Packaged speech](../scripts/test-packaged-speech.cjs): explicit package/fixture, optional `--resident`, fresh profile per run and dry-run/no-history checks.
- [Background quotes](../scripts/test-background-quotes.cjs): explicit capture lease, synthetic muted worklet, authorized private speech replay and deliberately confirmed synthetic-target quote; zero real ProPresenter access. The quote result tests a synthetic local index separately from unscored speech.
- [Desktop soak](../scripts/soak-desktop.cjs): explicit package,1-180 minutes and optional `--minimized`; fresh profile, repeated private fixture and dry-run simulation only. Retains the integration branch's package-manifest identity, sampled minimized-state/suspension checks and content-free failure categories. Sampling does not prove the absence of every between-sample window transition. No automatic restoration or real output.

Run from the repository root with the documented private fixtures/assets already available. No script downloads a recording/model or opens a microphone. Preserve prior private reports before rerunning these legacy named-report diagnostics. Detailed reports, fixture hashes and host measurements remain ignored under `test-results/`; this PR publishes no fresh personal-host result. Never run `summarize-soak` into tracked evidence for new host records without the separate publication authorization.

## Verification and remaining gates

Six synthetic groups test signed PCM, the runtime sample boundary, explicit truncation/provenance, padded/nonstandard chunk placement, unsupported formats and malformed/duplicate/short input. They use no real recording/model. Full local module/syntax checks and public Windows/Mac ARM/Intel diagnostic CI must be recorded at the tested head before merge. Any interrupted or timed-out run remains a non-pass; do not extend production recognition deadlines to make a diagnostic green.

This changes unbundled diagnostics only. It does not establish actual worker performance, a new current-build90-minute/three-hour soak, real microphone continuity, accent/reference accuracy, native preparation, ProPresenter/Companion coexistence, physical output, representative CPU/RAM budgets or service readiness. Existing historical soak results retain only their recorded revision and scope. P0 and every original acceptance gate remain pending where their actual evidence is missing.
