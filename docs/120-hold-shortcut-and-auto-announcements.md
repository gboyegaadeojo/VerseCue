# Hold shortcut, Auto announcements and the hold-window age fix

2026-11-21. Traces to FR-031 (focused, deliberate keyboard actions; no global hotkeys by default), FR-061 and NFR-016 (screen-reader status semantics), and NR-010 (start in Auto, Hold).

## Hold shortcut

Press **H** to hold a pending automatic send. It works only while VerseCue is focused, no dialog is open, focus is not in a text field or menu, and a send is actually pending. Key repeat is ignored. The Hold button carries `aria-keyshortcuts="H"`. Typing "h" in the manual reference field types the letter. There is no system-wide hotkey, so the shortcut cannot collide with ProPresenter, Bitfocus Companion or other software. Emergency stop stays on Escape.

## Announcements

A visually hidden polite live region (`#auto-announcer`) speaks Auto transitions once each:

| Event | Announcement |
| --- | --- |
| A send is scheduled | "Sending John 3:16 in 1 second. Press H to hold." |
| Hold | "Held. The reference waits for your review." |
| Dry-run send | "John 3:16 simulated. No ProPresenter output." |
| Readback matched | "John 3:16 sent. ProPresenter confirmed the slide; check the screens." |
| Auto pauses | "Auto paused." plus the reason, or "Emergency stop is on." |

A window opened mid-session does not announce older history.

## Hold-window age fix

Testing the shortcut found a defect from [start in Auto](116-start-in-auto-and-hold.md). Auto re-checks audio age when the countdown ends, and the limit was 4 seconds including the hold. Speech-end age (at least 1 second, because a window ends after 1 second of silence) plus recognition time (about 2 seconds on the development PC) plus the hold quickly passes 4 seconds. With a 3-second hold, Auto could never send.

The 4-second limit now applies to the system's own delay when the send is scheduled. At send time, the operator's configured hold is allowed on top: at most 7 seconds in total with the largest hold. Candidate expiry (15 seconds), new speech, Stop, reset and every other eligibility rule still cancel the send. When a scheduled send is dropped, the status now gives the real reason (for example "too old") rather than always "New speech or a session change canceled Auto". The guarded-Auto boundary test was updated: aging past both the limit and the hold is still refused.

The p50 ≤ 2 s and p95 ≤ 4 s latency targets are unchanged and still measured from the end of speech. A longer hold window spends that budget by the operator's choice.

## Verification

| Check | Result |
| --- | --- |
| `scripts/test-hold-shortcut.cjs` (source, synthetic recognition, dry run): H holds a pending send; typing h in a field does not; H with nothing pending does nothing; the scheduled, held, simulated and paused announcements are spoken | Pass |
| `tests/start-in-auto.test.cjs`: a 3-second hold still sends a fresh reference; a send delayed past its allowance is dropped with "too old" | Pass |
| `npm.cmd test`, `npm.cmd run check` | 577/577 pass; check passes |
| Source scenario sweep | 41/41 pass |

## Not established

No real NVDA or VoiceOver session has been run, and speech output timing with an actual screen reader is unverified.
