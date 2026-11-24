# 148 - Large-v3-turbo speech model (NR-025)

Date: 2026-11-24. User decisions:

- use Whisper Large-v3-turbo from now on, for speech that is easier to understand with Nigerian-accented preaching;
- the target computers are a Mac mini M4 (the slowest), an M6, and an i9 with an RTX 4070;
- include the model in the download;
- fall back to base.en on computers without a working graphics chip.

## What ships

- **Model file:** `ggml-large-v3-turbo-q5_0.bin`, the official compressed ggml file from huggingface.co/ggerganov/whisper.cpp. 574,041,195 bytes, SHA-256 `394221709cd5ad1f40c46e6031ca61bce88931e6e088c188294c6d5a55ffa7e2`, matching the fingerprint published there.
- **Where it ships:** in `resources/speech` beside `ggml-base.en.bin`, in the Windows installer and ZIP and both Mac builds.
- **Fingerprint checks:** pinned in `scripts/bundle-local-speech.cjs`, `scripts/package-macos.cjs` and the Mac workflow. Every build stops on a mismatch.
- **SBOM:** the model is listed in `legal/sbom.cdx.json`.
- **Engine:** unchanged, whisper.cpp b5454, which supports Large-v3-turbo.

## When it is used

- **Switching:** the speech engine uses Large-v3-turbo once the graphics-chip warm-up has proven a GPU backend: Metal on Apple silicon, Vulkan, or the guided NVIDIA engine. Until then, or without one, it uses base.en, so recognition stays fast. Code: `LocalSpeech.activeModel()`.
- **Kept-loaded engine:** it restarts once with the new model when the switch happens.
- **Your own model:** Large-v3-turbo is offered only with VerseCue's own model. A model you choose yourself is used as is.
- **Settings > Speech:** shows the model in use ("Model: Large-v3-turbo (most accurate)").

## Measured on the development laptop (RTX 2060 Max-Q, Vulkan)

Test set: 62 synthetic clips (Windows voices reading 50 references and 12 sentences without one), no hints, same engine:

| Model | Correct | Wrong | Invented | Speech processing per clip |
|---|---|---|---|---|
| base.en | 47/50 | 0 | 0/12 | 0.08 s |
| Large-v3-turbo | **50/50** | 0 | 0/12 | 0.38 s |

Large-v3-turbo heard the three names base.en missed (Philemon, Haggai, Jude).

Packaged app (`scripts/test-gpu-model.cjs`, real 12-second sermon recording):

- the RTX 2060 was confirmed and Large-v3-turbo took over;
- the first phrase took 1.9 s, including loading the model; it can take longer once on a new install while the graphics card compiles its programs;
- each phrase after that took 0.54 s.

Synthetic voices show software behaviour only. Nigerian-accented speech should be checked with Settings > Speech > Check accuracy on the service computer.

## Size

The Windows installer and ZIP grew from about 330 MB to about 830 MB; the Mac disk images grew by about the same amount.
