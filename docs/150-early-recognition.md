# 150 - Early recognition during the pause (NR-027)

Date: 2026-11-24. The user chose quicker end-of-phrase handling as the next improvement.

## Before

A phrase ends after 0.7 s of silence. Only then was it recognised, which takes about 0.5 s with Large-v3-turbo on a graphics card and longer on a processor. The reference appeared about 1.2 s after the speaker's last word.

## Now

- **Early start:** after **0.3 s** of silence, the phrase so far is sent for recognition in the background. The window marks this request `speculative`, and the main process holds the result instead of using it.
- **Pause confirmed:** if the pause reaches 0.7 s, the window closes exactly as before and asks the main process to use that held result (`audio-commit`). It then goes through the same steps as any phrase: stabilizer, reference reading, candidates, Auto rules.
- **Speech resumes:** if speech starts again, the early result is discarded (`audio-discard`) and the phrase carries on normally. A new early start can happen in the next pause.

### Safety

- **Boundaries:** phrase boundaries, and so the words in each phrase, are unchanged. Only silence is added between the early start and the confirmed pause.
- **Lost or clipped audio:** anything lost or clipped after the early start still counts against the phrase, using the evidence rules applied to every phrase.
- **Interruptible:** an early recognition can be interrupted by a real phrase, like the live preview. A failed or expired early result falls back to normal recognition of the phrase.
- **Limits:** held results expire after 15 s, at most four are held, and each can be used once and only by the window that started it.

## Measured (RTX 2060 Max-Q, real engine, recorded Bible references through a simulated microphone)

| Model | Without early start | With early start |
|---|---|---|
| Large-v3-turbo | about 1.19 s per phrase | about **0.81 s** |
| base.en | about 0.82 s | about 0.71 s |

These times run from the last word to the recognised text, and the first phrase of each run (which includes loading the model) is left out. With Large-v3-turbo, recognition now finishes during the pause.

## Tests

- `tests/early-recognition.test.cjs` (phrase buffer):
  - the early start begins at 0.3 s and is used at 0.7 s;
  - resumed speech discards it, and the whole phrase is still sent;
  - a failure falls back to normal recognition;
  - a slow early result is waited for and never sent twice;
  - short windows don't trigger it, and stopping discards it.
- `scripts/test-early-recognition.cjs` (app, stubbed speech):
  - an early result creates nothing on its own;
  - committing it gives the candidate, and only once;
  - a discarded one can't be committed.
