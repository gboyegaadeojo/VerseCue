# Preserve newer intent after a superseded passage preflight

Small PR22 correction based on main. Two regressions first failed: an old Confirm/Continue read could pause and erase a newer reference, and its late failure could disarm a newly configured target's mapping.

The coordinator now distinguishes its read-only preflight from the start of output-authorizing Session transitions. If reference/epoch/target/generation changes supersede that read-only stage, it retires only the old review/active token. It preserves the newer queue, operator-selected mode, target arming and mapping; it releases the shared operation owner without retrying. A stale Continue click likewise cannot disarm a different target.

This exception ends before output-authorizing state changes. Genuine current-session errors, Stop/recovery and failures after that boundary retain the existing fail-closed behavior. An accepted trigger followed by new intent still yields an uncertain receipt, pauses/disarms and requires inspection without retry. No Clear/restore, automatic resume, new output permission or Auto-policy change is introduced. An inert old internal mapping does not regain a review token or become usable through legacy/API/Auto sends.

All367 module tests and JavaScript syntax checks passed. After strengthening the new-target fixture to prepare a genuine synthetic mapping, all39 coordinator cases passed again. Cases cover Confirm and continuation; cancellation during inspection and after mapping; newer references/cancel/mode/target before and during checks; unchanged-session failure; Stop; and accepted-trigger uncertainty. Tests use synthetic metadata/HTTP and no actual ProPresenter, microphone or physical output. Matching platform verification runs on the committed PR before merge.

The broader RF19 hardware/field acceptance and normal workspace/provider wiring remain tracked in PR22. Later Session/Connector dispatch errors still use the conservative existing pause rules; this change does not claim every later cancellation can safely retain a newer request.
