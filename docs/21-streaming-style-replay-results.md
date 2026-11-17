# Streaming-style replay and persistent-model diagnostics

2026-11-17 UTC. **P0 PENDING. Throwaway diagnostics, not production application code.** User instructed the next step; existing recording/personal test/GitHub permissions retained. No microphone/loopback routing, cloud speech upload or ProPresenter control in these tests. All integration/architecture implications remain **PROVISIONAL**.

## Purpose and fixtures
The completed-file pilot in docs/20 processed 300 seconds faster than audio duration, but that did not establish low-latency incremental recognition. This step checks short-window inference cost and hypothesis changes using private REAL-PILOT-001/002/004 clips from the same user-provided IFC service at 1:18:10 onward. Independent listening labels remain pending; clips are a development pilot, not held-out accuracy evidence.

Pinned assets unchanged: whisper.cpp b5454 CPU Windows x64, base.en, official archive SHA256/model SHA1 verified by each probe; four CPU threads, one processor, no GPU. Tool/model/audio paths remain ignored under poc/private/ and recordings/. No dependency/build system, production provider/connector or application scaffold selected.

## Experiment A — bounded simulated arrival, cold CLI
`poc/replay-stt-windows.mjs` exposes audio in two-second arrival steps. Initial window requires six seconds; window length is bounded to twelve seconds. It processes only a latest available window when inference falls behind, counts skipped older scheduled windows, and never queues an unbounded backlog. Inference is serial with a twenty-second per-process timeout. Each request reloads the CLI/model, intentionally establishing a cold-start baseline rather than claiming efficient streaming.

At each clip end, two or three seconds of **synthetic silence padding** allow a final diagnostic window; the padding is not real recorded speech and cannot count as additional real accent evidence. No audio is played or injected into devices. Arrival is a monotonic file simulation, not a microphone/audio-driver integration. Prior machine-segment ends (9.8/12.44/10.72 seconds within the selected clips) are unverified reference-end proxies; lag fields are not independently annotated audible-end latency.

Actual run: **17:48:54.734–17:50:26.719 UTC**, eight decoded windows across three clips, **12 scheduled windows skipped**, decode p50 **7,642 ms**, nearest-rank p95 **14,008 ms**. At n=8 this p95 is simply the largest observation, not a reliable population percentile. These times include child startup/model load/file decode. Overload/drop observations justify bounded queues; they do not establish a production queue implementation or safe policy.

## Experiment B — model kept loaded, beam five
The pinned `whisper-stream` help describes capture-device input; its `--file` option is transcript output, not a file-replay input. No live microphone access or mixer routing was used to work around that limit.

Instead, `poc/compare-warm-stt.mjs` starts the official whisper-server example, owned by the diagnostic process, bound only to **127.0.0.1:58173**. It refuses an occupied port, uses an empty private public directory, enables no FFmpeg conversion or model-load operation, and posts only the same eight fixed PCM WAV windows to documented `/inference`. Requests have a twenty-second timeout, the process a 180-second bound, and finally kills/waits for the child. This is an ephemeral local measurement endpoint, not an application server or public listener. Both successful server instances were confirmed exited.

First startup attempt stopped immediately because `-nc` is not accepted by this binary, despite appearing in the pinned README help. Inspected installed help and pinned source instead: server defaults `no_context=true`, so the corrected invocation omitted that unsupported flag. No audio inference occurred during the failed startup. This is a diagnostic compatibility finding, not a system permission failure.

Beam size/best-of were explicitly set to five, English, four CPU threads/no GPU. Same windows were submitted **back-to-back**, not under arrival replay. Server/CLI have other implementation/default differences, so this is not a perfectly isolated estimate of model-loading cost. No previous transcript or expected reference prompt was supplied to steer recognition.

Actual successful run: **17:52:50.383–17:53:41.350 UTC**. Startup **900 ms**; request p50 **6,193 ms**, p95/max **9,527 ms**. Local HTTP timing includes request/response processing and inference. It excludes audio capture, arrival wait, independent transcript stabilization, reference policy, volunteer response and ProPresenter/display. Keeping a model loaded did not by itself yield the desired turnaround in this sample.

## Experiment C — model kept loaded, beam one
One additional fixed comparison used beam size/best-of **one**, preserving a separate private output set. All other requested settings/inputs unchanged. This was development-sample speed/quality exploration, not a final decoding/model selection.

Actual run: **17:54:42.508–17:55:16.756 UTC**. Startup **484 ms**; request p50 **4,099 ms**, p95/max **5,273 ms**. Two of eight requests were below four seconds; none establish full end-of-reference-to-output timing. No formal accuracy scoring or statistical speed comparison; ambient host workload was uncontrolled and no shared-ProPresenter CPU/GPU/media baseline was instrumented.

## Per-window content-free measurements
[Machine-readable metrics](evidence/replay-stt-metrics.json). Durations are milliseconds. Clip-relative endpoints are not absolute service times. Cold and warm request timings are different measurement scopes and must not be pooled into a single claimed live-latency distribution.

| Clip | Window end (s) | Cold CLI | Warm beam 5 | Warm beam 1 |
|---|---:|---:|---:|---:|
| REAL-PILOT-001 | 6 | 7,642 | 6,590 | 3,440 |
| REAL-PILOT-001 | 12 | 4,849 | 6,866 | 4,099 |
| REAL-PILOT-001 | 18 | 7,324 | 6,193 | 4,090 |
| REAL-PILOT-002 | 6 | 6,589 | 6,488 | 3,819 |
| REAL-PILOT-002 | 12 | 10,297 | 5,035 | 4,151 |
| REAL-PILOT-002 | 20 | 14,008 | 9,527 | 4,264 |
| REAL-PILOT-004 | 6 | 10,975 | 5,082 | 5,273 |
| REAL-PILOT-004 | 14 | 12,197 | 4,220 | 4,580 |

## Recognition/stability observations
- Invalid Samuel ordinal reappeared in a short cold/beam-five window. Beam-one changed that selected window to a First Samuel chapter proposal, still incomplete and independently unverified. Agreement with a caption is not a gold label.
- Another selected short window proposed **Psalm** where longer context/automatic-caption hypotheses concerned Samuel. Psalm is itself a Bible book, so checking only nonexistent book ordinals is insufficient. Full bounds/context, translation and intent checks plus human review remain essential. Do not repair a valid alternative book silently.
- By the final overlapping window, book information from the earlier phrase could be outside the window even while a verse range remained. A context-free window decoder is not a safe reference-context system.
- Isaiah appeared first as chapter-only, then a fuller range proposal. Stable mention of a chapter is not enough for exact-verse Auto. No repeated qualifying usable range was established by this sparse selected-window sequence.
- Narrow diagnostic hint matching covers only a few observed forms. Initial `NO_SELECTED_COMPLETE_HINT` labels omitted Psalm-shaped output and must not be interpreted as no Scripture speech/zero false positives. Post-review flags in public metrics explicitly record that omission. The initial replay also recorded equal no-hints as raw repetitions; these are not stable candidates. Probe now counts repetition only when a qualifying proposal exists; no inference timings were altered or rerun to hide this issue.

All selected outputs remain `auto_eligible=false`, expected labels unverified, no confidence calibration/precision/recall claimed. Raw text stays private; no recognition result was sent to ProPresenter. These are safety findings for requirements FR-010/013/016/018/021/023/045–049 and NFR-001–004/006/008, not completed acceptance tests of a production parser/policy.

## Decision and next evidence
This personal Windows **base.en/four-CPU/no-GPU configuration is not demonstrated suitable for the live latency/quality requirements**. Do not interpret that as failure of every local model/hardware option or silently relax targets. P0 overall remains **PENDING**, with existing dynamic-lookup/focus, clipping-free theme/two-output fidelity, Mac/LAN, concurrency/recovery and real quality evidence gaps.

Next diagnostic options: evaluate a smaller/quantized model or supported acceleration on authorized hardware, with independently listened labels/audible-end timestamps and a real streaming/VAD/stabilization path. Any speed improvement must be checked against reference precision, not accepted from one tuned pilot. IFC's Mac M4 remains unmeasured; no claim that Windows CPU observations transfer to it. Formal 90-minute/3-hour/10-hour/held-out and microphone-to-output tests remain unperformed. Production application code/committed architecture stays gated.

## Completion state
Both diagnostics finished; local inference servers exited, no microphone/network setting changed, ProPresenter requests **zero**. Raw windows/transcripts/models remain ignored, cleanup review date unchanged **2026-11-24**. Content-free report/metrics and clearly labelled probe sources may be published under existing private-GitHub authorization. This bounded step is complete; it does not imply background work continues after the final reply.
