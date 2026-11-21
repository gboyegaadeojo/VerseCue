# Provisional speech from the local worker

2026-11-21. Traces to FR-009 (rolling preview, partial versus final), FR-058 (provider capabilities and cancellation), NFR-006 (shared-host CPU) and the master specification rule that a passage is never shown from an unstable partial transcript.

## What changed

PR71 and PR74 built the rolling preview and a separate provisional line, but both local providers returned only completed windows. This component lets the bounded CLI worker produce provisional text while the pastor is still speaking.

- **Opt-in for this session only.** The audio panel has an unchecked box: "Show provisional speech while the pastor is still talking (extra local CPU)". Launch, session reset and switching to the resident worker turn it off. It is not saved in settings, profiles or backups.
- **Snapshots, not streaming tokens.** whisper.cpp has no incremental token stream in the bundled CLI. While a window is still growing, the renderer copies it once at least two seconds of speech are present and at least two more seconds have arrived since the last copy. Only one provisional run can be in flight, and none while a completed window owns the worker or while the latest packet is silent. The copy does not clear, shorten or re-time the window.
- **Completed windows come first.** If a completed window is ready while a provisional run is still working, the provisional worker process is stopped and the completed window starts immediately. The completed window is never queued behind a preview and keeps the existing two-second queued-audio rule. Provisional runs also stop after eight seconds.
- **Display only.** Provisional text uses a separate `audio-provisional` IPC call. It never reaches the citation stabilizer, candidate parser, queue, history, guarded Auto, detected-reference preparation or ProPresenter connector. A provisional result does not cancel or invalidate an existing review. The main process checks the capture owner, recognition purpose, lease epoch, service generation, Stop and Paused state before and after the run, as the completed-window path does.
- **Resident worker excluded.** whisper-server cannot cancel a request it has accepted, so a preview there could delay a completed window. `LocalSpeech.capabilities()` reports `provisional:false` for resident mode, and the checkbox is disabled with an explanation.

Late provisional replies are discarded when a completed window has started, the box is unchecked, capture stops or restarts, or the session resets.

## Verification

| Check | Scope | Result |
| --- | --- | --- |
| `tests/provisional-speech.test.cjs` | Fake worker processes: non-final marking, scratch cleanup, preemption, no overlap with completed windows, Stop, resident refusal and buffer snapshot policy | 8/8 pass |
| `npm.cmd test` and `npm.cmd run check` | All module tests, JavaScript syntax and dependency inventory | 559/559 pass; check passes |
| `scripts/test-provisional-speech.cjs` (source) | Electron IPC with synthetic replies: off by default, opt-in required, other window rejected, Paused/stopped capture rejected, queue/history/stabilization unchanged, late reply discarded, reset clears opt-in | Pass |
| Packaged Windows review build of 38d04f8 | `test-provisional-speech.cjs` and `test-session-reset-privacy.cjs` against the packaged executable | Pass |
| Test stability | The first CI run failed because a test helper waited a fixed number of event-loop ticks during slow scratch I/O. It now waits up to five seconds | 30/30 local reruns pass |
| Existing source scenarios | Session reset privacy, citation stabilization, audio age, listening preparation, safe input test, booth readability, workspace | Pass |
| Real whisper-cli b5454 + base.en, synthetic low-level noise | A completed window preempted a running provisional worker process; the completed window returned final; no scratch audio remained | Pass. Timings on noise are not speech latency and are not recorded as evidence |

## What this does not establish

No microphone, real sermon audio, accent accuracy, streaming latency, CPU budget on a shared ProPresenter host, Mac worker behavior or ProPresenter output was tested. The preview adds local CPU work by design; it remains off by default until shared-host CPU and latency are measured under NFR-006 and NFR-001. P0 and all original acceptance gates remain pending.
