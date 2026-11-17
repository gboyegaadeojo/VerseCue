# Development stability protocol

2026-11-17. **RUNNING / result pending.** This is a scoped software/speech stability test, not full live-service acceptance.

## Running test

`node scripts/soak-desktop.cjs dist/VerseCue-0.2.8-win32-x64/VerseCue.exe 180` launched the verified0.2.8 package in a fresh isolated profile. Run ID1f007748-e9c3-4034-94e4-cc3c2fb2c619. The helper repeats the existing authorized12second private recording through opt-in resident CPU recognition, creates one explicit synthetic manual reference, and simulates its send in dry run approximately every30seconds. No microphone permission/capture, target connection, ProPresenter request, cloud inference or production output occurs.

The requested duration is180minutes measured by a monotonic clock. The same run may provide a90minute checkpoint only after actual elapsed time reaches it; initial heartbeats are not a completed soak. Each cycle checks nonempty recognition, dry-run receipt/zero network sends, offline connector, active owned session, and bounded queues/history/events. Electron process metrics are sampled without raw paths or transcripts; external whisper-worker memory is not included in those metrics, so no total resource-budget acceptance can be inferred.

## Reports and stop behavior

The running helper emits content-free heartbeat rows and writes ignored test-results/soak-1f007748-e9c3-4034-94e4-cc3c2fb2c619.json. Raw recording/transcript is not included in the report. SIGINT/SIGTERM request a stop; inference is independently bounded20seconds. Normal completion/error closes the owned Electron process and cancels its worker. A requested short diagnostic duration is explicitly shorter evidence, never a90minute/three-hour pass.

On completion, review actual elapsed time, completion/interruption/failure flags, number of cycles, renderer errors, request timings, queue/history/event caps and memory trend. Only then publish a redacted final report and update this document. Do not label the run passed while its process is still active.

## Scope and remaining acceptance

Repeated fixtures are not representative held-out speech or a recall/precision/false-display dataset. This run does not exercise physical MOTU capture, hotplug, Mac permissions, native Bible preparation, actual ProPresenter output/Looks, livestream/media/GPU contention, Companion or power/sleep recovery. It supports limited stability evidence for a particular development artifact. Full NFR/resource/90minute/three-hour/live-service requirements remain pending their representative combined workload tests. Later source versions require separate regression/release assessment; a0.2.8 run does not certify future changes.
