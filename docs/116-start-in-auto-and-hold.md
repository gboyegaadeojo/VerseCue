# Start in Auto, with a hold window

2026-11-21. Implements NR-010, the product owner's decision that VerseCue starts in Auto. This changes the FR-028 startup default by explicit decision. FR-030 (Emergency Stop and deliberate re-arm), FR-056 (import cannot enable Auto), NFR-003 and NFR-004 (fail-closed Auto) are kept.

## Behavior

| Situation | Mode afterwards |
| --- | --- |
| Launch, with the saved start preference Auto (the default for new and existing settings) | Auto, in dry run. Auto simulates until output is deliberately armed and cues are approved for Auto. |
| Session reset | The saved start preference (Auto or Confirm) |
| Launch after corrupt settings were recovered | Confirm |
| Wake recovery | Paused, unchanged |
| Emergency Stop, then Resume | Confirm, unchanged. Re-enabling Auto is deliberate. |
| Saving setup, arming test output, loading a profile, restoring a backup | Leaves Auto, unchanged |
| Connection loss, target change, uncertain dispatch | Paused, unchanged |

Settings import and profile loading keep the current start preference, so a file or profile cannot switch it.

Every Auto eligibility rule in [guarded Auto](37-guarded-auto-mode.md) is unchanged. Only completed, loss-free, recent, explicit, single, valid KJV-numbered references with a show/read instruction can be sent, and real output still needs an armed loopback target and a cue approved for Auto. Everything else stays in review.

## Hold window

The existing correction grace before an automatic send is now a setting, **Auto hold window**, of 0.75–3 seconds (default 1 second). While a send is pending, the status shows **Hold - sending in N s**. Hold cancels that send, logs `AUTO_HELD`, keeps Auto on and leaves the reference in the queue for deliberate review. New speech, Stop, reset and configuration changes still cancel a pending send as before.

The countdown adds to delay from speech to display. The p50 ≤ 2 s and p95 ≤ 4 s targets are measured from the end of speech, so a longer hold window spends part of that budget.

## Verification

| Check | Result |
| --- | --- |
| `tests/start-in-auto.test.cjs`: defaults and validation; launch/reset/Stop/wake/corrupt-settings/configure transitions; hold window bounds; Hold cancels with zero sends and keeps the reference | 4/4 pass |
| `npm.cmd test`, `npm.cmd run check` | 566/566 pass; check passes |
| `scripts/test-start-in-auto.cjs` (source): fresh install starts in Auto dry run; manual reference does not auto-send; Hold appears while pending; Stop/Resume returns to Confirm; reset returns to the preference; Confirm preference honored; out-of-range hold window rejected | Pass |
| Existing source scenarios | Updated where they asserted a Confirm start; see the PR |

## Trust gate

Starting in Auto is a product choice, not evidence that Auto is accurate. Before relying on Auto in a real service, IFC needs the 10-hour representative rehearsal with zero unapproved wrong displays (NFR-003) and precision/recall on held-out labelled sermon recordings (NFR-002). Both remain pending, as do P0 and physical output verification.
