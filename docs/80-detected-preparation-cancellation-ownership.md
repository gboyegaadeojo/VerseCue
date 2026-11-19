# Cancel only scheduler-owned preparation

2026-11-19. Independently reproduced follow-up to PR31; preserves the full PR22 workflow.

The detected-reference scheduler marks its drain loop running while waiting for a shared operation owner. Previously cancel() treated that waiting state as ownership of the coordinator operation. Disabling detected preparation or replacing queued detected work could therefore cancel a separately owned manual operation/review.

Track actual invocation of the supplied preparation callback separately from drain-loop activity. Cancellation still discards pending work and cancels scheduler-owned in-flight preparation, but waiting alone does not authorize coordinator cancellation. The preparation ownership flag clears in finally after success/failure. Desktop-wide Stop, target/input/session loss and explicit passage cancellation still use the existing central coordinator cancellation path; this does not weaken them.

The new regression failed before the change: an independently owned manual review was cleared while the scheduler merely waited. It now preserves that review for both disabling and replacing queued work; disabling starts no preparation and replacement starts only the latest request after the owner releases. Existing tests still cover cancellation of actual running scheduler work, Stop/disabling while waiting, bounded waiting, stale-reference rejection and native consent revocation.

All416 combined module tests and JavaScript syntax checks pass on Windows. Hosted Mac verification is pending. No real ProPresenter, OS microphone, native UI, physical output or full-service acceptance was exercised. The earlier three-hour soak package predates this fix and cannot validate it.
