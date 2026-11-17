# Local model size comparison

2026-11-17. Diagnostic only; default/bundled base.en unchanged. No microphone or ProPresenter request. Existing user-authorized private fixtures were processed in the production resident CPU classes, four threads/beam1; each model loaded once for four sequential requests.

| Model |6second first request including startup|12second warm request1|12second warm request2|12second warm request3|
|---|---:|---:|---:|---:|
|base.en|8,430ms|8,052ms|8,114ms|7,010ms|
|tiny.en|3,943ms|3,062ms|3,552ms|3,041ms|

These are request durations, not audible-end-to-output latency or representative percentiles. Background load was uncontrolled; only four development windows per model were used. No independent expected labels exist. Corresponding transcript hashes differed. Deterministic parser review found both models proposed a1Samuel3chapter-only reference in one window; another produced aPsalm3chapter-only/NIV proposal with base but no proposal with tiny; a third produced Isaiah6:1-8 with base and Isaiah6:1 with tiny. These disagreements are observations, not proof of which transcript is correct or a quantified accuracy score. Chapter-only candidates remain blocked from sending.

The result motivates further speed/quality work and held-out labeling; it does not justify silently replacing the default model or enabling Auto. Tiny.en remains a private diagnostic asset and is not bundled. The current setup already allows an operator to choose an independently trusted local GGML model explicitly.

Official maintainer metadata https://huggingface.co/api/models/ggerganov/whisper.cpp?blobs=true reported tiny.en77,704,715bytes and SHA256 `921e4cf8686fdd993dcd081a5da5b6c365bfde1162e72b08d75ac75289920b1f`; download matched before execution. Maintainer/license provenance remains SRC-45; model-specific metadata SRC-64. Raw transcripts stay ignored under recordings/model-comparison-private. [Content-free result rows](evidence/model-size-comparison.json) retain timings/hashes, no transcript.

Reproduce with `node poc/compare-resident-models.cjs` after preparing the pinned private assets. Each inference is bounded20seconds and each model's owned worker is stopped in finally. No remote inference, purchase, driver change, production-host access or accuracy/latency acceptance is implied. Original FR/NFR acceptance criteria remain unchanged.
