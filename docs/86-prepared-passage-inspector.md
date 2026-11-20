# Prepared passage inspector consistency

## Problem and behavior

A detected suggestion expires after fifteen seconds, while a deliberately prepared review has its own two-minute lifetime. The inspector previously depended only on the suggestion queue, so an empty queue said Awaiting reference and No reference selected while a valid prepared passage remained on screen. The legacy preview note also incorrectly claimed that no exact text review was available.

When there is no selected suggestion, the passage UI now supplies its existing prepared reference, translation and phase to the inspector. It distinguishes preparing, prepared review, expired review, confirming, continuing, part shown, readback matched, blocked, uncertain and Auto approved. Stop and recovery labels retain precedence. A newer selected suggestion remains the inspector selection. Canceled/idle preparation does not resurrect an old reference. The existing one-second review refresh keeps expiry visible without renewing the deadline.

The preview note says that prepared passages show saved ProPresenter text, that slide appearance and Looks require separate checks, and that recognized speech is not Bible text. Matching readback remains explicitly a software observation, not proof of physical screens.

## Validation and boundary

The strengthened synthetic desktop test waits for actual suggestion expiry, requires the prepared reference and Prepared review label, and checks the updated preview explanation. Its renderer-clock expiry case additionally requires Review expired in the inspector and a disabled Confirm with zero output. It retains the original deliberate keyboard confirmation, split-passage, takeover, stale continuation, Stop, zoom and no-page-error assertions.420 module tests and JavaScript syntax checks pass. Exact package and Mac checks follow; no actual host outcome or field pass is included in this change.

No backend parser, connector, deadline, output authorization, Bible content, theme, Look, playlist, audio or native preparation behavior changes.

Before/after result: the new test failed on the previous exact d544069 Windows package at the Prepared review inspector wait after queue expiry; the corrected source passed, including the Review expired inspector assertion. The old run reached that specific assertion rather than failing during setup.
