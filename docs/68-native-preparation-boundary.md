# Native helper response and cancellation fix

Extracted from PR22 as a standalone reliability change based directly on `main`. This does not enable the unfinished reference-driven workflow or claim arbitrary Bible/Auto/platform/service acceptance.

The existing native helper now must return strict success, save-copy and clipping booleans, the exact requested reference/edition, zero output requests and a positive bounded generated-reference count. Missing clipping evidence cannot become a no-warning result. Malformed/nonobject JSON and unknown helper failures use fixed operator guidance instead of exposing raw payloads. Existing successful C# responses already carry the required fields; native UI actions and the12second maximum deadline are unchanged.

A running helper is killed when its external ownership guard is revoked, rather than waiting for the normal deadline. Cancellation never claims preparation was unchanged or automatically retries. Timing data is limited to known bounded numeric stage starts and cannot certify formatting or output.

Validation on the isolated branch:232 module tests and JavaScript syntax checks passed. Cases include cancellation before launch/during work, timeout, reference/output mismatch, missing/malformed clipping evidence, incomplete completion evidence, malformed protocol privacy and explicit separate saving. Tests use simulated child processes, not real ProPresenter. Real preparation latency, clipping correction and full-service acceptance remain in PR22.
