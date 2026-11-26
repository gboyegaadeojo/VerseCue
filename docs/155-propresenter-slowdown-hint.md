# ProPresenter slowdown hint

2026-11-26. [NR-030](../NEW_REQUESTS.md). This follows [docs/153](153-narrow-propresenter-reading.md) and [docs/154](154-open-from-spoken-verse.md).

On Windows, ProPresenter gets slower over a session once VerseCue has opened chapters in its Bible, and only restarting ProPresenter clears it. In the packaged check on a freshly restarted ProPresenter, the first five chapters opened in 3-9 s and later ones took 8-24 s. Without a hint, the operator only notices when passages arrive late.

## What the operator sees

When ProPresenter is clearly slowing, the message bar shows:

> ProPresenter is slowing down: recent passages took 15 s and 21 s to open. Restart ProPresenter at a quiet moment, such as during worship. VerseCue does not restart it.

The same sentence follows the passage status while chapters are opening or open. When the stop was for slowness ("ProPresenter is responding too slowly..."), the message says so.

## Rules

| Rule | Value |
| --- | --- |
| Shown when | 2 of the last 3 chapters took 12 s or more to open in ProPresenter, or a preparation stopped because ProPresenter was responding too slowly |
| Counted | The time ProPresenter took for each chapter, measured by VerseCue's ProPresenter helper (early and final chapter preparation in Prepare for volunteer). This excludes the time taken to recognise speech |
| Shown once | The message bar shows it once. It is not repeated while ProPresenter stays slow |
| Cleared | When a chapter opens in under 6 s (usually right after a restart). The slow chapters before that no longer count |
| Logged | `PROPRESENTER_SLOWING` (code and reason only) |

The thresholds come from the live measurements:

- On a fresh ProPresenter, the helper took 1-5 s per chapter.
- Once ProPresenter had slowed, chapters took 8-52 s.

## Safety

- The hint is advice only. VerseCue never restarts, closes or clicks ProPresenter for it, and it changes nothing about preparation or output.
- Every existing check still applies, including the stop when ProPresenter is responding too slowly.

## Verification

| Check | Result |
| --- | --- |
| `tests/propresenter-slowdown.test.cjs` | Needs 2 slow chapters out of 3, not 1. Not repeated while slow. Cleared by a quick chapter, and the earlier slow chapters stop counting. Bad times ignored. A "responding too slowly" stop raises it at once; other failures do not. The coordinator puts it in the app state and the message bar once, logs it once, and still sends nothing |
| `npm test` | 654/654 |
