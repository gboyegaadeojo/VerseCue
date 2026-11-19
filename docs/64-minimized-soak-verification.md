# Minimized development soak with exact package identity

2026-11-19 UTC. Original90-minute continuous-use requirement remains a service acceptance obligation. This is a narrower development regression, not its replacement.

## Workload and boundaries

The existing authorized private fixture is repeatedly passed through the packaged resident CPU recognizer, followed by manual canonical review/dry-run simulation. An isolated user-data directory holds only test state. There is no microphone, actual device capture, ProPresenter connection, native Bible preparation, Companion/media activity or physical output. The app acquires an explicitly authorized capture lease for direct test IPC, not an OS microphone stream.

`--minimized` keeps the test window minimized and checks its state and background-protection lease each cycle. Queue/history/event bounds and zero simulated-network output are asserted. Transcripts and audio are not written to the content-free soak report; only nonempty-recognition flags, timings, counts and Electron metrics are retained. Electron metrics exclude the external recognizer process and do not pass the total-memory budget. Shared-host load remains uncontrolled.

The SHA-256 of the package's manifest identifies the actual tested artifact, alongside its version. Later source changes do not inherit this result merely because the version string is unchanged. Existing older development evidence, including the0.5.5 three-hour run, remains preserved and scoped to those artifacts.

## Procedure and evidence rules

Run `node scripts/soak-desktop.cjs <isolated-executable> 90 --minimized` from the workspace using the already-authorized private fixture. It writes a unique ignored `test-results/soak-<run-id>.json` and prints content-free heartbeats. Do not summarize an unfinished, failed, interrupted or short run as acceptance evidence. A one-minute harness check passed before the current90-minute run; that short check cannot satisfy the required duration.

After completion, `node scripts/summarize-soak.cjs <completed-report>` requires the requested90–180 minutes to be completed, zero output, declared fixture-only scope and bounded runtime counts. If minimization was requested, it must have been maintained. The summary distinguishes90 minutes from three hours and does not require the final sample row to happen after the duration boundary. It never scores accuracy/live latency or passes full-service acceptance.

New evidence filenames contain version, package-manifest hash prefix and run start time; exclusive creation prevents overwriting earlier evidence. Legacy reports lacking a manifest are labelled accordingly rather than receiving fabricated package/minimized proof. Three module tests cover90-minute versus three-hour meaning, invalid/incomplete/wrong-scope runs, and legacy artifact identity. All384 module tests pass locally.

## Current run

The90-minute run is **IN PROGRESS**, not passed. It uses the Windows e8bed42 production-source package, version0.6.0, manifest SHA-256 `4c951c11652a7ceeadc03cd552142005dd360fe1a2364443d7a0995e91884e19`. The source after e8bed42 adds test/documentation changes only at this checkpoint. Exact run/session/report resume details are in PROGRESS.md. Review completion before creating public evidence. Actual microphone/native preparation/media/Companion/physical-screen, representative hardware and field testing remain pending.
