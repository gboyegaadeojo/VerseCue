# Private API startup and revocation ownership

## Reproduced race

A controlled synthetic listener reproduced start A, stop A, start B, then a delayed completion/failure from A. The old startup catch reset shared server/token fields belonging to B. B could subsequently report enabled even though its token/server ownership had been erased. The regression used no network port, ProPresenter, microphone or output.

## Correction

Each startup now owns a lifecycle epoch, token, pending-start rejection and abort controller. Stop revokes shared authority synchronously and settles/aborts its pending startup without waiting for a listen callback. Only the current startup may publish its verified listener address or enable accepting. Delayed completion/error cleanup closes only its own listener and cannot erase a replacement server, token or capabilities.

Every HTTP listener callback also checks its captured lifecycle and server identity before request handling. A revoked listener returns a fixed disabled response rather than authenticating with a replacement token. Old asynchronous close completion cannot publish a disabled event for a newly enabled listener. Revocation-hook failure still closes the owned listener through a finally block. No automatic restart/re-enable or authority expansion is introduced.

The API remains default-off, loopback-only, explicitly enabled and bearer-authenticated. Existing saved-review/prepared-send/native-preparation capabilities, request guards and revocation checks remain unchanged. Status still excludes tokens. This is local API lifecycle correctness, not a new ProPresenter Bible lookup endpoint.

## Verification and limits

Seven regressions cover delayed-start replacement ownership, immediate cancellation without a listen callback, stale callback requests, late bind errors, immediate real loopback cancellation/re-enable, cleanup despite a failed revocation hook, and stale disabled events. Existing API tests retain authentication, capabilities, expiry and dispatch-revocation coverage.459 module tests and syntax checks pass.

Full source desktop workflows, a current-source Windows review package and exact Mac development checks are required before merge. The real loopback unit test targets only its own temporary VerseCue test server. No actual-host telemetry, microphone or ProPresenter result is included. Original PR22 integration, platform, physical-output, style, audio and field gates remain unchanged.
