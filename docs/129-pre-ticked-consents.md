# Pre-ticked authorization and preparation boxes

2026-11-21. NR-011: after testing 0.6.0, the product owner asked for the setup boxes to be ticked by default in the next build.

These start ticked at launch and after a session reset:

- **I am authorized to process this selected audio feed locally** (main workspace)
- **I accept experimental focus changes on my supervised personal test host** (Settings > Advanced)
- **Also allow creating a new saved Bible presentation in the sole local ProPresenter library** (Settings > Advanced)

The operator can still untick any of them for a session. **Settings > Advanced > Start each session with the audio authorization and preparation boxes below already ticked** turns the behavior off (saved with the setup; default on).

Unchanged and deliberately not pre-ticked: arming test output (**This is an authorized supervised test target**), per-passage Auto approval, the input test consent, provisional speech (extra CPU), quoted-wording matching (needs a permitted local index), the private API and its preparation permission. VerseCue still starts in dry run.

## Verification

| Check | Result |
| --- | --- |
| `scripts/test-default-consents.cjs`: the three boxes start ticked and test-target arming does not; dry run at start; reset keeps the ticks; an operator can untick; turning the option off leaves audio authorization unticked after reset | Pass |
| `npm.cmd test` | 587/587 |