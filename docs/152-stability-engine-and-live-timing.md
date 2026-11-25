# 0.6.9 stability runs, speech engine 1.9.6 evaluation and live ProPresenter timing

2026-11-25. Requested by the user ("Do 1, 2, 3 and 4"). Extends the [development stability protocol](33-development-stability-protocol.md). Full service acceptance remains PENDING.

Computer: the user's Windows 11 PC (NVIDIA RTX 2060, 16 GB). Package: released 0.6.9 (`SHA256-MANIFEST.json` c5997fa3...), Large-v3-turbo on the graphics card (warm-up finished before the runs).

## 1. Three-hour run: passed

`VERSECUE_AUTOMATION=1 VERSECUE_TEST_WARMUP=1 node scripts/soak-desktop.cjs <0.6.9 VerseCue.exe> 180`

| Measure | Result |
| --- | --- |
| Duration, cycles | 10,802,241 ms (3 h + 2 s), 361 cycles, no failure or interruption, zero output requests |
| Speech model | `ggml-large-v3-turbo-q5_0.bin` on the GPU in every cycle |
| Request time (12 s private recording) | p50 740 ms, p95 822 ms |
| Queue/history/event maxima | 1 / 20 / 100 (the caps) |
| VerseCue (Electron) memory, first 10 vs last 10 cycles | 590 MB to 585 MB (peak 609 MB): no growth |
| Speech worker memory (working set / private) | 182 to 183 MB / 1,399 to 1,402 MB: no growth |
| Speech worker processor time | 132 s over 3 h, 1.2% of one core on average |

Cycles 51-55 (about 25 minutes in) counted two `whisper-server` processes: the separate engine comparison below was running at the same time, and its server was included in the operating-system reading. VerseCue itself ran one worker throughout.

[Content-free evidence](evidence/development-soak-0.6.9.json).

## 2. Ninety-minute minimized run

`... soak-desktop.cjs <0.6.9 VerseCue.exe> 90 --minimized`: **passed** on the second attempt.

| Measure | Result |
| --- | --- |
| Duration, cycles | 5,402,018 ms (90 min + 2 s), 181 cycles, window minimized throughout, listening protected in the background, zero output requests |
| Speech model | Large-v3-turbo on the GPU in every cycle |
| Request time | p50 550 ms, p95 575 ms |
| VerseCue (Electron) memory | 585 MB to 601 MB (peak 604 MB). The rise slowed over the run (about 3 MB per 10 minutes at first, about 1 MB per 10 minutes at the end); the 3-hour visible run showed no rise. Worth watching in a longer minimized run, not a leak shown here |
| Speech worker memory (working set / private) | 182 to 183 MB / 1,398 to 1,401 MB: no growth |
| Speech worker processor time | 65 s over 90 min, 1.2% of one core |

The first attempt stopped at 55 minutes with `WINDOW_NOT_MINIMIZED`: the window was restored 38 s after the user opened ProPresenter on the same computer, so it was not a VerseCue fault but it does not count as a pass. ProPresenter stayed open (and idle) during the passing run.

[Content-free evidence](evidence/development-soak-0.6.9-minimized.json).

## 3. Speech engine whisper.cpp v1.9.6: evaluated, not adopted

VerseCue keeps whisper.cpp b5454 (v1.9.5, commit d1be6fde). v1.9.6 (commit 96ec4d98) was built for Windows (Vulkan) and both Mac types in CI (built successfully) on an evaluation branch that was not merged.

| Measure (same 62 labelled synthetic clips) | b5454 | v1.9.6 |
| --- | --- | --- |
| Large-v3-turbo, references right | 50/50 | 50/50 |
| base.en, references right | 47/50 | 47/50 |
| Invented references | 0 | 0 |
| Cold command-line turbo, interleaved | 2,022 ms | 2,096 ms |
| Warm resident turbo, three paired runs (medians) | 511 / 567 / 549 ms | 600 / 582 / 606 ms |

Same accuracy and consistently a little slower on the RTX 2060, with nothing in the release notes that VerseCue needs, so it was not adopted. Revisit with the next engine release.

## 4. Live ProPresenter timing (Prepare for volunteer)

The user's personal ProPresenter 21.4.2, opened by the user. Audience and Stage were read as off through ProPresenter's API before, during (every 400 ms) and after every step: 3,710 checks across four runs, all off. VerseCue sent no output, the live slide did not change, and every run ended in dry run with no history.

Method: a private scratch script plays labelled synthetic recordings (Windows voices) into the packaged 0.6.9 app through the normal speech path (Large-v3-turbo, GPU) in Prepare for volunteer, then times each step from the end of the phrase. Preparation opens the whole chapter at the spoken verse in ProPresenter's Bible (the default).

| Run | ProPresenter state | Speech to text | Ready in ProPresenter (from end of phrase) | Not prepared |
| --- | --- | --- | --- | --- |
| 1 (6 phrases) | just opened | 0.9-1.3 s (first phrase 3.1 s) | 2.7, 5.9, 6.8, 7.7, 10.9 s | 1: Ecclesiastes 3:1 blocked |
| 2 (2 phrases) | after 6 preparations | 0.9-1.7 s (first 4.1 s) | 7.5, 15.5 s | none (Ecclesiastes 3:1 prepared) |
| 3 (14 phrases) | after 8 preparations | 2.7-5.2 s | 14.1-46.0 s, median 25 s | 2: Lamentations 3:22-23 (time limit while scrolling to the verse), Song of Songs 2:4 (translation check did not finish) |
| 4 (3 phrases) | after 20 preparations | 3.1-4.1 s (first 15.8 s) | 20.7, 35.1 s | 1: first phrase too old by the time it was recognised (cancelled, as designed) |

Every unprepared case stopped safely: VerseCue blocked and asked for ProPresenter to be checked, or dropped a phrase that had become too old. Nothing was clicked after a failed check and nothing was sent.

### What this shows

- **Fresh ProPresenter is fast enough to help a volunteer:** the passage is usually open in ProPresenter's Bible about 3-7 s after the preacher finishes the reference (chapters with many verses take longer).
- **ProPresenter slows down within one service's worth of references.** After about 8 preparations, each one took 3-6 times longer, and VerseCue's own recognition slowed too (0.5 s to 0.9 s engine time, more on the first phrase). While idle between runs ProPresenter kept using about 10% of the processor and 42% of the graphics card, with 1.7 GB of memory. This matches the README advice to restart ProPresenter before each service, but shows that a fresh start may not last a whole service when many references are prepared.
- Most of the native time is ProPresenter answering its own controls: in the two blocked cases, finding the edition control took about 6 s and, in the slow case, the translation check took 30 s.

### Follow-up

- Reduce how much of ProPresenter's screen VerseCue reads per preparation (the edition and translation checks dominate) and measure whether the slowdown still builds up.
- Repeat on the Mac mini M4 (Friday), where ProPresenter is read differently.
- These are synthetic voices and a personal setup, not the church's live service.

Follow-up: [docs/153](153-narrow-propresenter-reading.md) narrows what the Windows helper reads (edition and slide labels).
