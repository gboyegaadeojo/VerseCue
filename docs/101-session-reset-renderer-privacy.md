# Session reset across windows

FR-062 requires transient session state to be cleared without implicitly changing ProPresenter output. A synthetic two-window regression proved that backend reset left renderer transcript, unsubmitted reference and hidden candidate text behind.

Session snapshots now include a monotonic reset epoch. Every renderer clears its transcript, draft reference, hidden candidate fields and audio/save consent when that epoch advances. A delayed state snapshot from an earlier reset epoch is ignored. Recognition callbacks remember their reset epoch and cannot display an old successful response or overwrite a newer session's recognition. No transcript is added to the backend snapshot. Ordinary mode/configuration changes do not impersonate a session reset.

The regression uses isolated primary/compact windows and synthetic text, then models an already-in-transit audio reply through an isolated test-only IPC replacement. It verifies that new-session recognition still displays while an older success cannot restore old text. This does not exercise a real microphone or ProPresenter, certify every specialized panel, or prove crash/swap erasure. Existing no-clear/output safety remains required.

Initial source regression and existing471 module tests/syntax pass on the PR55 base. Full current-base source, Windows package and exact Mac verification remain before merge.
