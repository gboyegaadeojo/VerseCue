# Any graphics card on Windows, and Intel Macs

2026-11-21, NR-017. User request: VerseCue "should be able to work with any computer and any AMD or Nvidia graphics card".

## Windows: Vulkan engine (AMD, NVIDIA, Intel)

The bundled Windows engine is now built from the official whisper.cpp source by `.github/workflows/speech-engines.yml`. It uses the same pinned release (b5454, commit d1be6fd) as before, built with:

- `GGML_VULKAN=ON`: runs on any graphics card with a Vulkan driver, which covers current AMD, NVIDIA and Intel graphics. The Vulkan runtime (`vulkan-1.dll`) ships with the graphics driver and isn't bundled. No NVIDIA libraries are included.
- `GGML_BACKEND_DL=ON` and `GGML_CPU_ALL_VARIANTS=ON`: the processor engine is chosen for the computer at run time. Without a usable graphics card, or with "Use the graphics card" off (`-ng`), it runs on the processor.

The archive is pinned by SHA-256 `9c16b302a33997482d88154cac702ed030baf65d62d3580096bc6ddc09b03e6e` in `scripts/bundle-local-speech.cjs` and recorded in the SBOM. The CI build smoke-tests it on a runner without a graphics card, where it must fall back to the processor and transcribe the jfk sample.

**On the test laptop:** the engine found **two** Vulkan devices, the NVIDIA GeForce RTX 2060 and the AMD Radeon integrated graphics. It used the NVIDIA card and produced the same words as the processor engine. On a heavily loaded computer, a 5 s phrase took 12.5 s on the graphics card versus 17.4 s on the processor.

The first run on a computer compiles the graphics shaders. That took 156 s on the loaded test laptop, once only. VerseCue therefore warms the card up in the background when it opens and uses the processor until the card is ready (see docs/137).

The optional guided NVIDIA CUDA setup (docs/135) remains available as an alternative for NVIDIA cards.

## Mac: Intel as well as Apple silicon

The macOS workflow now builds and packages the app on both Apple silicon (`macos-15`) and Intel (`macos-15-intel`) runners. Each builds its own whisper.cpp with Metal (`GGML_NATIVE=OFF` for portability) and passes the same packaged workspace check. The Intel engine alone also transcribed the jfk sample in CI.

## Verification

| Check | Result |
| --- | --- |
| Windows Vulkan engine build and processor-fallback smoke test (run 44949801094) | Pass |
| Mac Apple silicon and Intel app builds and packaged checks (run 44949919396) | Pass |
| Vulkan engine on the test laptop (NVIDIA + AMD found, NVIDIA used) | Pass |
| Packaged Windows build with the Vulkan engine, scenario sweep | Before release |
