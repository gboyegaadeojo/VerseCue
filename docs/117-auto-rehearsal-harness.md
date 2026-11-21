# Ten-hour Auto rehearsal harness

2026-11-21. Supports NFR-003 (safe Auto precision and false-positive burden: zero unapproved wrong displays in a 10-hour rehearsal set) and the NR-010 trust gate for starting in Auto. It complements the [offline recognition evaluator](112-labeled-recognition-evaluation.md), which scores citation proposals but cannot count wrong automatic outputs per hour.

## What it does

`core/auto-rehearsal.cjs` replays a timed stream of recognition windows through the application's own `CitationStabilizer`, `Session` and `GuardedAuto` code, in Auto and dry run, with a simulated clock. Each window goes through the same steps as the desktop audio handler: stabilization, context reset on lossy or forced windows, candidate ingestion, review notes for assembled or lossy speech, and the Auto decision with its hold window. New speech arriving inside the hold window cancels a pending send, as in the app.

Every automatic send is matched against the stream's labels:

- **Correct:** a `display` label with the same reference and translation, at most 20 seconds before the send. Each label matches once.
- **Wrong reference:** a `display` label was nearby, but for a different reference.
- **Mention displayed:** only a `mention` label was nearby (the pastor cited it without asking to show it).
- **Spurious:** no label nearby.

All three wrong kinds count as wrong automatic outputs. `display` labels without a send are reported as missed; they are a recall cost, not a wrong output.

**Gate:** passes only when reviewed, held-out `REAL-RECORDING` streams total at least 36,000 seconds (10 hours) and contain zero wrong outputs. Synthetic, training, tuning and unreviewed streams are reported but never counted. `serviceAcceptancePassed` is always false.

## Running it

1. Build a private stream from an authorized PCM16 mono 16 kHz recording:

   ```text
   node scripts/build-rehearsal-stream.cjs <whisper-cli> <model> <recording.wav> <recordingId> <name.json>
   ```

   The stream is written under ignored `test-results/auto-rehearsal/streams/` and never overwrites an existing file. The builder feeds 100 ms packets through the app's `AudioWindowBuffer` in simulated real time and transcribes each window with the real local worker. Slow recognition therefore drops and splits audio exactly as it would live, using the app's session-cumulative dropped-sample count.

2. Add labels from **independent listening**, never from the transcript or captions: `{"atSeconds","reference","translation","intent":"display"|"mention"}`, with canonical references such as `John 3:16`. Set `dataUseAuthorized` and `labelsReviewed` only when both are true.

3. Score:

   ```text
   node scripts/run-auto-rehearsal.cjs <report.json> [--hold-ms=1000] [--policy=explicit-command] <stream.json>...
   ```

   The report is written under ignored `test-results/auto-rehearsal/reports/`. The console prints only counts.

## Finding from the first smoke run

A 12-second private pilot clip on the development PC produced four windows. Recognition took about 2 seconds per window, so while the worker was busy the buffer's 2-second pending limit forced 2-second fragments and dropped 0.3 seconds of audio. The app counts dropped audio per listening session and Auto requires zero drops. After the first overflow, every later reference in that session gets an "audio was dropped" note and cannot Auto-send. For an Auto-first product, this needs a per-window loss rule that keeps today's safety intent. That is the next component. This observation comes from one short clip on one PC; it is not a measured rate.

## Verification

| Check | Result |
| --- | --- |
| `tests/auto-rehearsal.test.cjs`: correct send; mention; spurious; wrong reference and miss; hold-window cancel; lossy and forced windows; gate eligibility and failure; malformed streams | 7/7 pass |
| Real worker smoke run on a 12-second private clip | 4 windows built; no labels; not scored |

## Limits

The harness replays supplied windows; it does not prove the labels, consent or recording representativeness. It does not exercise ProPresenter, preparation, cue approval, physical screens or latency. It mirrors the desktop audio handler's decision steps, and differences in later handler changes must be reflected here. P0 and every field gate remain pending.
