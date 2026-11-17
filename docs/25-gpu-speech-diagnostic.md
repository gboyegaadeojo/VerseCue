# GPU speech diagnostic

2026-11-17. Diagnostic only; no accelerator is enabled in the application. No microphone or ProPresenter output was used. User-provided private recording fixtures remain ignored and are not published.

## Environment and initial comparison

Personal test computer: Ryzen7 4800HS, eight physical/sixteen logical cores, approximately15.4GiB RAM, RTX2060 Max-Q6GiB, NVIDIA driver610.88. Both official b5454 CPU and CUDA11.8 archives and the base.en model were digest-verified. Four fixed existing WAV windows were processed sequentially by each profile, four CPU threads, English, beam/best-of1, cold CLI,20second request limit. [Content-free results](evidence/gpu-stt-comparison.json) preserve all eight rows.

| Profile | Elapsed request times, milliseconds | Actual backend |
|---|---|---|
| CPU | 8537,8930,7741,7256 | CPU |
| CUDA archive, initial | 8294,8287,7740,7248 | CPU fallback, not acceleration |

All corresponding transcript hashes matched, but no independent accuracy labels exist. These times are neither audible-end latency nor target acceptance. Shared-host background load was uncontrolled.

## Backend diagnosis

An unsuppressed six-second diagnostic explicitly reported `no GPU found`. Read-only PE import inspection found ggml-cuda.dll requires cublas64_11.dll, which was absent from the downloaded whisper archive's runtime folder. The official NVIDIA CUDA11.8 manifest identified cuBLAS11.11.3.6; its archive matched SHA256 `67b0934a6359e4ee26fff823c356021589d392c4fd49ca12624f570edc08e2b9` before extraction. cublas64_11.dll and cublasLt64_11.dll were copied into the private diagnostic runtime folder only. No driver, system PATH, system directory or security setting was changed.

The next run detected one RTX2060 CUDA device, loaded the CUDA backend and allocated approximately147.37MB of model data there. It produced no transcript before the20second deadline. One further bounded90second diagnostic likewise produced no transcript and was killed after approximately90,493ms. Thus backend loading is verified; useful accelerated inference is **not**. The cause of the stall is unresolved. No claim is made that this GPU is unsuitable generally or that a different supported backend/build cannot work.

## Decision and continuation

Keep the existing tested CPU application worker; do not package these NVIDIA libraries or silently enable GPU usage on the shared presentation host. Redistribution/license inventory and representative-load acceptance would be required before including them. Continue improving bounded capture/worker lifecycle and evaluate a persistent CPU worker against existing warm-request evidence. Production still requires held-out labels, full latency, stability and media/Companion concurrency tests. No new approval is needed for independent implementation already authorized.

Reproduction scripts: poc/compare-gpu-stt.mjs, poc/inspect-gpu-backend.mjs and poc/inspect-cuda-imports.mjs; prerequisites and privacy boundaries in poc/README.md. Primary provenance: RESEARCH_SOURCES.md SRC-61–SRC-62. Cold startup deadlines were diagnostic20/90seconds; the application deadline remains20seconds.
