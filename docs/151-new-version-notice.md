# New version notice

2026-11-25. [NR-028](../NEW_REQUESTS.md). Supports FR-060 (updates with an in-service lock); it is not an updater.

## What the operator sees

When a newer VerseCue release is published, one line appears under the toolbar: "VerseCue 0.7.0 is available. Download it after the service; nothing is installed for you." with **See what's new** (opens the release page in the browser) and **Not now** (hides that version for good). The line is hidden while listening and comes back when listening stops. **Settings > Advanced > New version notice** has the on/off choice (on by default), **Check now** and the result of the last check.

## How it works

- `core/update-notice.cjs` reads `https://api.github.com/repos/gboyegaadeojo/VerseCue/releases?per_page=20` and picks the highest `vX.Y.Z` tag that is not a draft and is newer than the running version. Other tags (pre-release suffixes, "latest") are ignored.
- **When:** 20 s after start, then every 15 minutes it checks again if 12 hours have passed. Never while listening (the timer skips; **Check now** is refused with "Checking for a new version waits until you stop listening.").
- **What is sent:** a GET with `Accept` and a generic `User-Agent: VerseCue` header (GitHub requires one). No version, settings, identity or cookies. Nothing is downloaded or installed.
- **Network boundary:** the app's own session still blocks every network request. The check uses a separate in-memory session (`versecue-update-notice`, no cache, nothing kept on disk) whose request filter allows exactly the one release-list address. Redirects are refused, the response is limited to 4 MB and the request times out after 10 s.
- **Link:** the page opened is built from the version number (`https://github.com/gboyegaadeojo/VerseCue/releases/tag/vX.Y.Z`), never taken from the response.
- **Tests:** with `VERSECUE_AUTOMATION=1` no request is made unless `VERSECUE_TEST_UPDATE_URL` names a server on `127.0.0.1`.
- **Settings:** `updateNotice` (default `true`) and `dismissedUpdateVersion` (the version hidden with **Not now**).

## Verification

| Check | Result |
| --- | --- |
| `tests/update-notice.test.cjs`: newest newer release chosen; current/older ignored; drafts, odd tags, malformed entries and the response's own link ignored; only `Accept` and `User-Agent` sent, credentials omitted, redirects refused; HTTP error, offline, bad JSON, oversized and timeout handled | 4/4 pass |
| `scripts/test-update-notice.cjs` (local stand-in server): notice shown for 99.0.0; one request with `User-Agent: VerseCue` and no cookie; hidden while listening and **Check now** refused; shown again after stopping; **See what's new** opens only the VerseCue release page; **Not now** hides it and is saved; a later check keeps it hidden | Pass |
| Real GitHub, through an Electron in-memory session with the same filter and options | As 0.6.8: 0.6.9 found. As 0.6.9: nothing newer |

## Not established

This tells the operator about a release; it does not verify or install it. Use **Check a downloaded update** ([docs/122](122-signed-manual-updates.md)) to verify a downloaded release once IFC's signing key is added. Code signing, notarization and an automatic update channel remain open under FR-060 and NFR-014.
