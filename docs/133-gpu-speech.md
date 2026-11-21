# Graphics-card speech recognition

2026-11-21. User request: the church computer will be a Mac mini (M4 or newer) or a 13th-gen Intel PC with an NVIDIA RTX 4070. This test laptop (RTX 2060) is for testing only.

## What changed

- **New setting:** Settings > Speech > "Use the graphics card when the speech engine supports it". It is ticked by default (`speechAcceleration: 'gpu'`). Unticking it saves `'cpu'`, which passes whisper.cpp's `-ng` (no GPU) flag to both the CLI worker and the resident worker. Any other value is rejected.
- **Warm-up allowance:** a graphics-card engine may compile its kernels the first time it runs, about a minute once per machine. On this laptop the first CUDA run took 57 s; later runs took 0.9 s. With GPU on, the first recognition after setup may take up to 90 s. Every later window keeps the 20 s limit, and provisional previews keep 8 s. CPU mode always uses 20 s.
- **Mac download:** the macOS workflow now builds the pinned whisper.cpp with `-DGGML_METAL=ON -DGGML_METAL_EMBED_LIBRARY=ON`, so Apple silicon Macs use the GPU through Metal. The shader library is embedded in the binary, so no extra files ship.
- **Windows download:** the bundled engine stays the official CPU build. It ignores the GPU setting, so behavior is unchanged. For an NVIDIA PC, select the official whisper.cpp CUDA build's `whisper-cli.exe` in Settings > Speech; VerseCue then uses the card. The CUDA runtime is large (over 1 GB), so it is not bundled.

No output gate, Auto rule, review rule or ProPresenter behavior changed. This only changes how fast local recognition runs.

## Measurements (this test laptop, private details kept local)

| Engine | Per window (base.en) |
| --- | --- |
| CPU build | 1.5–2 s |
| CUDA build, RTX 2060, after warm-up | about 0.9 s |
| CUDA build, first run | 57 s (one time) |

## Verification

| Check | Result |
| --- | --- |
| `tests/speech-acceleration.test.cjs`: GPU default, `-ng` only for CPU, 90 s only for the first GPU request, invalid values rejected | Pass |
| `npm test`, `npm run check` | Pass |
| Electron scenario sweep (settings save and fill) | See PR |
| Mac workflow Metal build | See PR CI |

Not yet verified on the target Mac mini or the RTX 4070 PC.
