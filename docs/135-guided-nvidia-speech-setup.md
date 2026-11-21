# Guided NVIDIA speech setup

2026-11-21. User request: a "Set up NVIDIA graphics card" option in Settings > Speech for Windows PCs with an NVIDIA card (the church PC has an RTX 4070). VerseCue must not bundle, host or download NVIDIA files.

## Why it is guided

NVIDIA's CUDA licence (shipped with cuBLAS) allows its runtime libraries to be distributed only inside an application, and forbids distributing them "as a stand-alone product". A VerseCue add-on ZIP would be mostly NVIDIA files, so VerseCue doesn't offer one. Instead the operator downloads the official archives and VerseCue verifies them.

## What it does

Settings > Speech > Set up NVIDIA graphics card (hidden on a Mac, which already uses Metal):

1. **Open the two download pages.** Opens exactly two pinned pages in the browser: the whisper.cpp b5454 release on GitHub, and NVIDIA's cuBLAS 11.11.3.6 Windows x64 archive.
2. **Choose the downloaded ZIP files.** VerseCue hashes each chosen file and accepts only the two pinned SHA-256 digests, in any order and under any file name:
   - whisper.cpp CUDA 11.8: `e81c86c542be6e3d7b7245392d4e1c52ab6e5c61dbe38721754bc0ab59d4d027`
   - cuBLAS: `67b0934a6359e4ee26fff823c356021589d392c4fd49ca12624f570edc08e2b9`

   These match RESEARCH_SOURCES SRC-61/62.
3. VerseCue unpacks both with Windows' built-in `tar` into a staging folder under its own app data (`speech-engines`). It copies `cublas64_11.dll` and `cublasLt64_11.dll` next to `whisper-cli.exe` and checks that every required file is there, then moves the result into place and writes a receipt.
4. **Card check.** VerseCue runs one second of silence through the new engine and reads the engine's own report: "found N CUDA devices" and "loaded CUDA backend". The first run compiles the card's kernels (about a minute once), which also warms the card up for the service.
5. Only if the check passes does VerseCue select the CUDA `whisper-cli.exe` and turn on "Use the graphics card". The bundled speech model stays selected.

If anything fails, VerseCue keeps the built-in engine and explains why in plain words:
- the file isn't one of the two official archives
- a file is missing
- no NVIDIA card was detected
- the NVIDIA driver is too old for CUDA 11.8
- the check took too long

**Go back to the built-in engine** reselects the engine that ships with VerseCue.

## Verification

| Check | Result |
| --- | --- |
| `tests/cuda-engine.test.cjs`: pinned digests, wrong or duplicate files refused, install layout and receipt (Windows `tar`), Mac refused, card check passes only with a loaded CUDA backend and reports driver/no-card/crash plainly | Pass |
| Real install from the two official archives on the test laptop | Pass (about 2 minutes to unpack 1.2 GB) |
| Real card check on the test laptop | Pass: "NVIDIA GeForce RTX 2060 with Max-Q Design", 17.6 s after a first 63 s warm-up |

Not yet verified on the church RTX 4070 PC.
