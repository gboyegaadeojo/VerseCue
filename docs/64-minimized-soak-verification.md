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

The90-minute run **FAILED** after5371174ms (about89.5 minutes),179 completed cycles, because its window was no longer minimized. It was not interrupted, but did not reach completion and cannot produce passing evidence. The cause of restoration is not established. [Sanitized failure evidence](evidence/minimized-soak-failure-e8bed42-2026-11-19.json) retains the result and bounded counts/zero output.

It tested the Windows e8bed42 package, version0.6.0, manifest SHA-256 `4c951c11652a7ceeadc03cd552142005dd360fe1a2364443d7a0995e91884e19`. Later application changes, including saved-origin guidance, are outside that artifact. The updated harness records a safe failure code and bounded event-code/capture-state snapshot for future runs, without transcripts, paths or raw exceptions. Another complete matching run is required. Actual microphone/native preparation/media/Companion/physical-screen, representative hardware and field testing remain pending.

## Fresh identified retry

A new90-minute run began 2026-11-19T11:40:11.634Z using7ff7923, manifest SHA-256 `1198213a69d594122308dbe7f67d11271d547bf12d4b8b23956bf0fa45d5a7c7`. Its initial heartbeat confirms minimized background ownership andzeroOutput. The live execution handle returned exit0 with completed=true at2026-11-19T13:10:14.487Z:5402852ms,181cycles, minimized throughout, no interruption/failure andzeroOutput. [Sanitized completed evidence](evidence/development-soak-0.6.0-1198213a-20261119T114011634Z.json) passed the summary assertions. This is a scoped development pass for7ff7923 only;1525a66 bare-citation policy and49705b4 normal Auto approval are excluded. Full-service acceptance remains PENDING. The earlier failed run is retained separately.
