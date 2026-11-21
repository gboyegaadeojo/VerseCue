# Connection health tolerance

2026-11-21. User report: after "Test saved connection" showed ProPresenter 21.4.2, the status went back to "Not connected" a few seconds later, and references stopped appearing. Traces to FR-048 (bounded health retry) and NFR-022.

## Cause

VerseCue checks ProPresenter every 2 seconds with a 2-second limit. While local speech recognition keeps the computer busy, ProPresenter on the same computer can answer one check late. Before this change, one late answer marked the link offline and disarmed output, and the next good answer was treated as a reconnect: VerseCue stopped listening and switched to Paused. A test that runs real recognition reproduced this on unchanged main (LINK_LOST, then LINK_RECOVERED_REARM_REQUIRED).

## Rule now

- A late or failed check shows **Slow to respond - ProPresenter ...** and logs `LINK_SLOW`. Listening and the mode continue. Any pending automatic send is canceled, and `connector.send` refuses output unless the status is connected, so nothing is sent while the link is uncertain.
- The next good answer restores **connected** and logs `LINK_SLOW_RECOVERED`, without pausing.
- Only failures lasting **15 seconds** (and at least three checks) count as a lost link. That keeps the earlier safe behavior: listening stops, output is disarmed, VerseCue pauses, and a reconnect requires a deliberate resume.
- The manual **Test saved connection** behaves as before.

## Verification

| Check | Result |
| --- | --- |
| `scripts/test-health-tolerance.cjs` (synthetic server that answers late on demand): slow answer keeps listening and mode; recovery does not pause; 15 s of failures loses the link; reconnect requires resume; zero output requests | Pass |
| `tests/connector-health.test.cjs`: an armed send is refused while slow, before any request | Pass |
| `scripts/test-background-quotes.cjs` (real recognition, busy computer) | Link now shows slow then recovered instead of being lost; one run still failed because the speech worker itself exceeded 20 s under load |

The real cure for a busy computer is lighter recognition load; see the speech-engine follow-ups.
