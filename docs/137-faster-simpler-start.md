# Faster detection and a simple open-and-connect start

2026-11-21, NR-015. The user asked to "make voice detection faster and every trigger faster" and to "turn on everything that makes it simple to just open and connect to ProPresenter".

## Simpler start

- **Connects automatically.** Every 3 s until it answers, VerseCue reads `/version` from the saved ProPresenter address. This is the same read-only check as "Test saved connection". Once connected, the existing health check takes over, so slow or lost connections are handled exactly as before. It never arms output. Setting: Settings > ProPresenter > "Connect to this ProPresenter automatically when VerseCue opens" (on by default).
- **Starts listening on open.** It does so only when an input device, the speech engine and model are set up and the audio authorization box is ticked, and not while VerseCue is paused or stopped. Setting: Settings > Audio > "Start listening when VerseCue opens, once this input is set up" (on by default).

## Out of the box and any ProPresenter version (NR-017)

- **Default microphone:** the computer's default microphone (`default`, channel 1) is preselected when no input has been chosen, so a new install can listen at once. The engine, model, graphics card, quotes, authorization boxes, auto-connect and auto-listen are already on. Only the ProPresenter address and port need entering, and the usual `127.0.0.1:1025` is tried automatically.
- **Any ProPresenter version:** Bible preparation is no longer limited to ProPresenter 21.4.2. Any ProPresenter on Windows is accepted. The helper still verifies the Bible view, reference field, edition and generated labels before doing anything, and stops with a clear message if a version differs. Readiness reports whether the running version is the one verified in testing (`versionVerified`).

## Faster recognition

- **Audio context 768 (15.36 s) instead of the default 1500 (30 s).** Speech windows are never longer than 10 s, so most of the default encoder work was wasted. The context must stay longer than any window: a 512 context (10.24 s) on a 12 s recording made whisper loop for over two minutes. So the 10 s window limit and the 768 context are documented together in `core/stt.cjs`. This applies to both the CLI worker and the resident server.
- **A window ends after 0.7 s of silence (was 1.0 s).** Every trigger is about 0.3 s sooner. A reference split by a longer pause ("Romans eight, verse twenty… twenty-eight") is still joined by the citation stabilizer, as before.

Auto's rules are unchanged: the 4 s speech-end age limit, the hold window, explicit references only and the 10-verse limit.

## Heard clarity

The speech engine now reports how confidently it heard each phrase. This is the value behind the Halo badge ("Heard clearly", "Likely", "Check this").
- **CLI worker:** `-ojf` writes token probabilities into the temporary recognition folder. The value is the mean probability of word tokens, ignoring special and punctuation tokens.
- **Resident worker:** `verbose_json` returns per-word probabilities. A real whisper-server b5454 check returned words with probabilities, for example " Bible" at 0.99996.
- **Where it's attached:** to candidates from a single window. It is not attached to quotes or to references assembled across windows, where it would be misleading.

It is display-only. It is never used to decide whether anything is sent.

## Measurements

The test laptop was heavily loaded during this check: ProPresenter alone was using about a quarter of all cores. So the default and new settings were run alternately on the same 5 s private clip (CLI, base.en, CPU, three rounds each). Absolute times are inflated; the comparison is fair.

| Audio context | Round 1 | Round 2 | Round 3 | Mean | Text |
| --- | --- | --- | --- | --- | --- |
| Default (1500) | 23.6 s | 22.2 s | 21.0 s | 22.3 s | "Let's open our Bible" |
| 768 | 12.9 s | 13.3 s | 13.0 s | 13.1 s | "Let's open our Bible." |

That is about 41% less recognition time per phrase, with the same words. Add the 0.3 s from the shorter silence, plus the graphics card where available.

## Verification

| Check | Result |
| --- | --- |
| Unit tests: heard clarity, `-ac 768` and `-ojf` on final windows only, 0.7 s silence ending, settings | Pass (607) |
| Resident `verbose_json` against the real b5454 server | Word probabilities returned |
| Scenario sweep, speed measurement | See PR |
