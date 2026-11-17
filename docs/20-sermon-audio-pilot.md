# Sunday-service local speech pilot

2026-11-17 UTC. **Diagnostic evidence only. P0 PENDING. No production application code.** Requirements/personal integration tests/GitHub publication already authorized; user supplied the source in direct response to the request for a service recording for testing. No separate written pastor-consent artifact is held; IFC must retain/confirm applicable permission for formal acceptance use. No public redistribution of media/transcript or cloud STT use implied.

## Source and window
User source: https://www.youtube.com/watch?v=VbZV38kZjBg . Retrieved metadata: **Sunday Service || November 15th, 2026**, channel **Immanuel Fellowship Church**, upload date **2026-11-16**, duration **7,961 seconds**, public availability. Title/service date and upload date differ as expected; do not replace one with the other. User explicitly requested **01:18:10 (4,690 seconds)**. Supplied link parameter `t=2821s` is **00:47:01** and was not used as test start.

Evaluated window **01:18:10–01:23:10**, exactly **300 seconds**. Converted to PCM signed 16-bit WAV, mono, 16 kHz; ffprobe verified codec/format/duration. Audio SHA256 `7e3ed360d9fc3ff4b8e2f727b3501813b71a25c0e4ecd5f1a5f9d135fee0a912`. This is a real broadcast recording, not a clean dedicated pastor-mic feed; mixer/interface/room conditions are not independently characterized. No accent/nationality inferred.

YouTube exposed English automatic captions, no human-supplied subtitles. Captions are a separate machine hypothesis, not ground-truth labels or an accuracy oracle. Downloaded locally for annotation assistance only; extracted 88 caption events within the requested window into an ignored private file. No uploaded audio/new caption generation request made to a speech provider.

## Acquisition and minimization
Tools already installed: yt-dlp **2026.10.26**, FFmpeg build **N-127043-g5a54fcf75e-20260930**. Initial sandbox network request failed; approved network execution fetched metadata. Remote section seeking stalled and was stopped. Fallback temporarily retrieved the approximately 46.3 MiB format-139 audio-only source, trimmed the requested window locally, verified sample, then removed the temporary full audio, full-service caption file and incomplete section artifact. Only the requested five-minute sample, derived short clips and private analysis outputs remain. No video/thumbnail/full-service media retained.

Media/transcript/tool/model paths are under Git-ignored `recordings/` and `poc/private/`. Confirmed `git check-ignore` matches. Private retention/cleanup review due **2026-11-24**; no automatic cleanup scheduler implemented or promised. No recording, model archive, raw transcript, private log, signed media URL or Bible database included in GitHub publication. Public report contains minimal reference observations/metrics, not sermon text.

## Local recognition setup and integrity
Official whisper.cpp source release **v1.9.5** links build **b5454**. Used official CPU-only Windows x64 archive `whisper-bin-x64.zip`, not a production app dependency/stack commitment. GitHub-published archive SHA256 matched local bytes:
`6ba69e3482d7826214f90a6a9c84ca07782aec1e1d0c6a7c30c994fd5d816ccb`.

Model: **base.en**, from the maintainer's MIT-labelled converted-model repository. Published SHA1 matched `137c40403d78fd54d454da0f9bd998f78703390c`; local model SHA256 `a03779c86df3323075f5e796cb2ce5029f00ec8869eee3fdfb897afe36c6d002`. Model/tool remain ignored diagnostic assets, not bundled redistributed application components. Exact final model/runtime/license selection still requires release review.

`poc/run-local-stt-diagnostic.mjs` verifies artifact hashes, invokes only the fixed private input through local CLI, four CPU threads, one processor, **GPU disabled**, English, JSON output, stock five-beam/default decode configuration. Redirects transcript/stdout/stderr to ignored private files; 240-second timeout; no ProPresenter request or remote STT. Diagnostic scripts have required throwaway header/run instructions; no application scaffold/build system introduced.

## Measured result
| Field | Actual result |
|---|---|
| Start UTC | 2026-11-17T16:53:16.335Z |
| Finish UTC | 2026-11-17T16:54:23.609Z |
| Timed child-process wall duration | **67,256 ms** |
| Audio duration | **300 seconds** |
| Offline batch real-time factor | **0.22419** = 67.256 / 300 |
| Exit / timeout | 0 / false |
| GPU / threads | false / 4 |
| ProPresenter sends | **0** |
| Recognition accuracy/precision/recall | **NOT SCORED** |
| Stable partial/streaming/audible-end-to-output latency | **NOT MEASURED** |

Faster-than-audio batch throughput does not establish p50 ≤2 s/p95 ≤4 s live reference turnaround. CLI processed a completed file with long context; no streaming stabilization, microphone routing, UI confirmation, connector/display or independent audible-end instrumentation. Personal Windows host is not IFC's shared Mac M4 load profile. No CPU/RSS/media-drop acceptance instrumentation collected; no interference/90-minute/3-hour/10-hour acceptance claimed.

## Reference observations and safety implications
At sample-relative roughly 16–22 seconds, local output proposed **4 Samuel**, while existing automatic captions proposed **1 Samuel**. A numeric fourth Samuel is invalid in the intended canonical book set. Do not silently repair it to First Samuel or treat transcript agreement/disagreement as human truth. Another local segment used a **for Samuel** homophone around a chapter reference; this is ambiguous, not a safe ordinal. Nearby spoken translation request was recognized as **NIV**. The personal ProPresenter test installation exposed KJV/ASV rather than an independently verified NIV; do not silently substitute KJV during any eventual output test.

Later local segments proposed **Isaiah chapter 6** before a fuller **Isaiah 6:1–8** range. Chapter-only reference must remain review-only, contextual book changes invalidate old relative context, and reading/discussion of Samuel throughout the passage must not create repeated display commands. These observations support the requirements for canonical validation, uncertainty handling, translation blocking, contextual intent and duplicate suppression; they do not prove an implemented production parser's accuracy.

`poc/spot-check-sermon-references.mjs` is a narrow disposable check of these observed forms only, not a reusable canonical parser. It flagged invalid ordinal, ambiguous ordinal, two chapter-only segments and one unverified explicit-range proposal; all `auto_eligible=false`, `ground_truth_verified=false`, ProPresenter requests 0. No general precision/recall derived from these selected cases.

## Four real recording excerpts prepared for review
[Manifest](test-data/real-recording-pilot-manifest.json) records hashes, exact source times, source REAL-RECORDING, expected_reference=null pending independent listening, and permitted-use/retention status. Existing 66-row CSV/JSON synthetic corpus is unchanged and remains SYNTHETIC-TEXT.

| ID | Absolute service window | Duration | Review purpose |
|---|---|---:|---|
| REAL-PILOT-001 | 01:18:22–01:18:37 | 15 s | Samuel ordinal/chapter ambiguity |
| REAL-PILOT-002 | 01:19:33–01:19:51 | 18 s | NIV request, Samuel ordinal and verse range |
| REAL-PILOT-003 | 01:22:29–01:22:53 | 24 s | New book/chapter-only references and discussion |
| REAL-PILOT-004 | 01:22:58–01:23:10 | 12 s | Fuller Isaiah range after chapter-only context |

Expected reference labels and audible-end times need independent listening review; neither the model output nor automatic captions are sufficient. Four derived clips from one service are correlated pilot evidence, not four independent speakers/sermons or held-out accent validation. No need for the user to manually cut these excerpts.

## Gate and next action
Real source acquisition/local batch STT diagnostic now completed. Speech-quality and live-latency gates remain **PENDING**. Do not pass P0 based on batch throughput or two agreeing transcripts. Continue with independent reference/time annotation, a carefully bounded streaming diagnostic on approved hardware, and unresolved ProPresenter dynamic-route/fidelity/concurrency/platform work. Do not turn model-proposed references into production output; production code remains gated. User's existing authorizations remain valid; do not ask for the same approval again.
