# Recording labeller

2026-11-26. The user approved "build the labelling tool" ([NR-031](../NEW_REQUESTS.md)). It supports the Auto trust gate (NFR-003, NR-010) and recognition scoring (NFR-002) in [docs/107](107-remaining-work-and-acceptance.md). Both need real sermon recordings in which a person has marked every reference by ear. The [rehearsal harness](117-auto-rehearsal-harness.md) and the [offline evaluator](112-labeled-recognition-evaluation.md) already existed; there was no way to make the labels.

## Using it

1. Convert the recording to WAV (PCM16 mono 16 kHz, the format the rehearsal builder reads).
2. Run `npm run label` from a source checkout and choose **Open recording…**. The recording ID comes from the file name; use the same ID when you build the stream.
3. Play the recording. When a reference finishes, press **M**. Playback pauses and the time is recorded.
4. Type what you heard (`jn 3 16`, `Romans 8:28 NIV`). The window shows exactly what will be saved ("Will be saved as John 3:16 (KJV)") or why it cannot be saved: not a reference, more than one, no verse, or a verse that does not exist.
5. Choose **Show it on screen** (1) or **Only mentioned it** (2). There is no default, because a wrong default would hide wrong automatic sends. While typing, use Alt+1 or Alt+2.
6. Press **Enter**. Playback resumes. Labels can be edited, nudged 1 s earlier or later, replayed from 3 s before, or deleted.
7. When the whole recording has been checked, tick the two boxes: the church authorized the recording, and the labels are complete. Both always start unticked.

Labels save automatically to `test-results/auto-rehearsal/labels/<recordingId>.labels.json`, which git ignores. Reopening the same recording continues where you left off. A different recording under the same ID is refused, so its labels are never overwritten.

Then build the stream, copy the labels into it and score it:

```text
node scripts/build-rehearsal-stream.cjs <whisper-cli> <model> <recording.wav> <recordingId> <stream.json>
node scripts/apply-rehearsal-labels.cjs <stream.json> test-results/auto-rehearsal/labels/<recordingId>.labels.json <labelled-stream.json>
node scripts/run-auto-rehearsal.cjs <report.json> <labelled-stream.json>
```

`apply-rehearsal-labels` writes a new stream file and never overwrites one. It refuses labels for a different recording ID, a recording of a different length (more than 1 s apart), or a stream that already has labels. It prints the label counts, whether the stream counts towards the trust gate, and the labels file's SHA-256 for the evaluator's `annotationSha256` field.

## Safeguards

| Safeguard | How |
| --- | --- |
| Labels come from listening | The labeller never opens a stream and never shows VerseCue's transcript. The apply step copies labels into the stream without reading its recognized text |
| Canonical references | Typing goes through VerseCue's own parser, so labels use the same spelling the scorer requires (`John 3:16`, `1 John 1:9`). Chapter-only references are refused because the rehearsal scores verses |
| Private | No network requests (every non-local request is blocked), no permissions granted, audio stays in memory. Labels hold times and references only, never words |
| Not shipped | The `labeller/` window is not part of the installed app. Only the small `core/rehearsal-labels.cjs` checker is in `core/` |
| Attestations | "Authorized" and "complete" are separate, deliberate ticks. Only real, held-out recordings with both ticked count towards the 10-hour gate |

## Timing

Press **M** as soon as the reference has been said. The scorer counts an automatic send as correct when a matching **show** label is at most 20 s before it. VerseCue sends after the phrase ends, the speech engine finishes and the 1 s hold window passes. A prompt mark therefore lands before the send. A mark made after the send would make a correct send look wrong, which is the safe direction. Use **1 s earlier** if you were slow.

## Verification

| Check | Result |
| --- | --- |
| `tests/rehearsal-labels.test.cjs`: typed references, file shape, rejected transcripts/times/spellings/IDs, apply refusals, scoring through the rehearsal, WAV length | 6/6 pass |
| `scripts/test-rehearsal-labeller.cjs` (also on Mac CI): synthetic WAV, keyboard marking, show/mention required, chapter-only refused, Escape cancels, edit and nudge, autosave, resume, clash refused, network blocked, axe-core WCAG 2.2 AA with the form open, labels applied and scored | Pass: 1 correct send, 0 wrong |

The first run found and fixed three problems. Enter after **1 s earlier** nudged again instead of saving. A clash warning was replaced by "Recording open". The Mark button's hover colour was below AA contrast.

## Limits

The labeller cannot know whether the listener heard correctly, whether consent exists, or whether the recordings represent your services. Those stay with the people doing the labelling. A second listener reviewing the labels is good practice. No real sermon has been labelled yet, so the trust gate and recall remain unmeasured. P0 stays pending.
