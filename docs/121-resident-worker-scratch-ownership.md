# Resident worker folder ownership

2026-11-21. Traces to FR-059 and NFR-010 (no unintended residue), following [interrupted speech scratch recovery](109-interrupted-speech-scratch-recovery.md).

## Change

The resident ("keep model loaded") worker starts whisper-server with a `--public` folder. That folder was created in the computer's global temporary directory as `versecue-worker-*` and removed on stop. A crash or forced quit left it behind, and VerseCue deliberately never scans the global temporary directory to clean up.

The folder is now an owned `run-<uuid>` folder inside VerseCue's own speech scratch directory, the same place the CLI worker writes its temporary audio. Stop and worker exit remove it through the existing safe removal (owned names only, no links, no unexpected files). A folder left by a crash is removed at the next startup by the existing scratch recovery. The old global temporary location remains only as a fallback for callers that never initialized scratch, such as some diagnostic scripts. The app always initializes scratch first.

The resident worker still sends audio to whisper-server in memory; the folder stays empty.

## Verification

| Check | Result |
| --- | --- |
| `tests/resident-scratch.test.cjs`: folder is an owned run folder under the scratch root; stop removes it; a leftover is removed at startup; no folder before recovery finishes | 3/3 pass |
| `npm.cmd test`, `npm.cmd run check` | 580/580 pass; check passes |
| Private local check with the real whisper-server and the pilot clip | Two recognitions succeeded; one owned folder while running, none after stop, none in the global temporary folder |

## Not established

Folders left by earlier versions in the global temporary directory are not removed, because VerseCue does not scan that directory. Swap, crash-dump and full filesystem retention assurance remain open.
