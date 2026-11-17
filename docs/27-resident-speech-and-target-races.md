# Resident speech worker and target-change safety

2026-11-17, development0.2.6. **P0/service acceptance pending.** This supplements the original requirements rather than reducing them.

## Optional resident recognition

Setup now offers default bounded CLI or experimental resident CPU mode. Resident mode lazily launches the trusted CLI's sibling whisper-server when the first authorized audio window is processed. Startup never launches the server automatically. The Windows package includes the server only from the same digest-verified official CPU archive; no GPU libraries, cloud service or new model are added.

The child binds only127.0.0.1 on an OS-selected unused port, with a fresh256-bit random request-path prefix held in memory. Health and inference use that prefix and refuse redirects. An empty owned temporary directory serves as the static public directory. WAV bytes are posted in memory with conversion disabled; the reviewed upstream server reads WAV bytes directly in that configuration. No request asks it to load a different model. Child stdout/stderr are drained without writing logs; token/path/response/audio are not exported in diagnostics. This random route is a local capability, not TLS or a complete OS security boundary: another process with access to command-line arguments or process memory could discover it. Trusted local processes and an uncompromised test machine remain assumptions.

One window runs at a time, with a20second total startup/inference deadline. Failure, timeout, cancellation, mode/settings change or application exit terminates the owned child;90seconds of idle time also terminates it. Stop aborts the request and invalidates late results. Temporary directories contain no audio and are removed on stop/child exit when possible; an abrupt OS crash can leave an empty directory. This eliminates per-window WAV-file transport in this optional mode; the default CLI still has its previously documented crash-cleanup limitation. It does not promise that OS paging/crash dumps cannot contain transient audio.

## Actual local test

The production ResidentSpeech/LocalSpeech classes processed the same authorized12second private recording twice: request1 including startup8,015ms; request2 reusing the model6,825ms. Both produced nonempty transcripts. The script canceled the worker and verified the private health endpoint stopped responding. No microphone, ProPresenter request or output send occurred. Raw transcript was not written by this test. These are uncontrolled fixture request timings, not accuracy scores or audible-end output latency. The target remains unmet; keep resident mode opt-in pending broader tests.

Reproduce with `node scripts/test-resident-speech.cjs` after preparing the existing ignored assets. Content-free report: test-results/resident-speech-integration.json (ignored). Packaged resident-mode integration remains to be executed for0.2.6. No Mac runtime or physical audio behavior is inferred.

Packaged follow-up:0.2.6 desktop smoke passed; its own bundled CLI/model processed the fixture in8,316ms and its own resident worker processed it in8,762ms, both nonempty/zero sends. The CLI check was explicitly pinned to the current package resources so an older test-profile path could not supply its assets. All129regression tests passed.118package files/source hashes verified; ZIP316,112,088bytes, SHA256 `ba4efc9cb40059ff02090f3b106bdf212ac2505f54382cb38c5b7448710dc4ba`. No accuracy/live-latency pass follows. The source packaging script also now copies Electron's complete dist root rather than the executable parent, which is nested inside the Mac app bundle; Mac execution remains untested.

## Target configuration races

Connector reads capture target address and configuration generation, then discard a response if the target changed while awaiting it. A delayed old-host health response cannot overwrite the new host's identity/status or disarm a newly verified target. Mapping checks retain the same generation; no old-host presentation can be registered after reconfiguration. Dispatch rechecks generation/address immediately before the write and treats a configuration change after an accepted write as uncertain. It never reads a replacement target as confirmation of the old command or retries a write.

Two regression tests exercise delayed health and presentation responses across target changes; both passed. Additional tests verify explicit resident settings, single-worker ownership and cancellation of a late resident transcript. Original FR audio/provider/connector/privacy criteria and all NFR measurements remain in force. Source provenance: RESEARCH_SOURCES.md SRC-46–SRC-47 and the pinned upstream server's memory-WAV, health and request-path code, reviewed2026-11-17.
