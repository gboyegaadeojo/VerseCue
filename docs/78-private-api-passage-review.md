# Private API passage review

2026-11-19. PR22 route/callback dependency; desktop coordinator hook wiring remains separate.

Authenticated loopback POST /v1/passages/review accepts only a current candidateId and calls the supplied coordinator review hook. It reports desktop-only confirmation and zero output requests. Native focus/copy consent, selected presentation identifiers and confirmation fields are rejected. Paused, stopped, recovering and Auto sessions cannot request passage review. Without the hook the route returns501 and status reports savedPassageReview=false.

Reference submission uses Session.ingestChecked with the current API token/session revocation guard. Relative commands therefore verify live passage context; disabling the API during verification cannot create a new candidate afterward. Existing token rotation, loopback/Host/Origin protection, request limits, emergency Stop and explicit legacy-output restrictions remain. This route adds neither an arbitrary Bible API nor remote Auto/rearm/clear.

All389 combined module tests and syntax checks pass on Windows, including17 API tests. Synthetic HTTP targets/callbacks cover denied fields/session states, unavailable hooks, in-flight review revocation and relative-context revocation. The latter uses the real Session check path and verifies no candidate/output after disabling the API. Hosted Mac verification is pending. No real ProPresenter, microphone, native UI or physical output used. Coordinator desktop wiring and full RF21/platform/service acceptance remain separate PR22 work.

## Verification update - 2026-11-19

PR34 merged at0eb409a. Final combined headda9fa2b passed415 module tests/syntax and standard Mac44597315623. Desktop hook wiring is tracked in PR35. Original real-host/platform/service limitations remain.
