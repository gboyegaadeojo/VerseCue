# Short-window recognition diagnostic

2026-11-18, shared personal Windows host, pinned whisper.cpp b5454 resident CPU worker, four threads, beam/best-of one, already downloaded hash-verified base.en and tiny.en. No microphone, cloud, ProPresenter control, default change or independently scored accuracy.

The probe used the final four, six and eight seconds of three previously authorized private sermon fixtures. Each different duration includes different linguistic context. The first request per model includes startup and is excluded from the warm timing summaries below. Percentiles use nearest rank; with only two or three observations they are descriptive values, not reliable performance estimates.

| Model | Window | Warm n | p50 request ms | p95 request ms |
|---|---:|---:|---:|---:|
| base.en | 4 seconds | 2 | 5,359 | 5,379 |
| base.en | 6 seconds | 3 | 5,393 | 15,160 |
| base.en | 8 seconds | 3 | 5,515 | 5,710 |
| tiny.en | 4 seconds | 2 | 2,264 | 2,645 |
| tiny.en | 6 seconds | 3 | 2,197 | 2,288 |
| tiny.en | 8 seconds | 3 | 2,314 | 2,338 |

These are back-to-back whole-recognition-call durations, not audible-reference-end-to-screen latency or a streaming arrival simulation. Host load was uncontrolled. Every transcript was nonempty, but none of these unlabelled tail windows produced a complete parser reference. That is not an accuracy score: removing the earlier book/chapter context changes the task, and expected labels are unavailable.

The result supports investigating smaller models and better window continuity, not switching defaults or claiming live Auto readiness. Base did not meet the proposed system latency targets in this diagnostic; tiny still requires accuracy, assembly, full-pipeline timing and shared-host evidence. No automatic concatenation of unrelated sermon fragments or newly extended candidate lifetimes was introduced.

Reproduction: `node poc/compare-short-windows.cjs`, with the existing authorized private fixtures/models/runtime present. [Sanitized metrics](evidence/short-window-benchmark.json) contain no raw recordings or transcripts. Derived text remains in ignored `recordings/short-window-private/` under the existing private diagnostic retention policy. Workers are stopped after each model. Original [audio safety limits](53-audio-age-and-continuity.md), [workflow requirements](51-reference-driven-bible-workflow.md) and P0 acceptance remain in force.
