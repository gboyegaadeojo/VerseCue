# Testing the Auto-first build on your own computer

2026-11-21. A step-by-step guide for testing VerseCue with your personal copy of ProPresenter. It covers the Auto-first behavior from [NR-010](../NEW_REQUESTS.md). This is a supervised personal test, not church service acceptance. Do not use the church's production ProPresenter or any screen that reaches the congregation or livestream.

## Before you start: make the screens safe

1. Open ProPresenter on your own computer.
2. Turn off **Audience** and **Stage** output in ProPresenter. Look at them and confirm both are off, then check again during the test. Nothing VerseCue does should be able to reach a real screen.
3. Use a personal test library, not the church's Sunday playlist.
4. In ProPresenter, make sure the network API is enabled (the earlier tests used port 1025 on this computer).

If at any point a real screen shows output, press **Esc** in VerseCue (Emergency stop) and stop the test. VerseCue never clears ProPresenter for you.

## 1. Start VerseCue

Run `VerseCue.exe` from the review build folder named in the handoff (`test-results/pr-split/packaged-main-check/test-results/build-review-<revision>-.../dist/VerseCue-0.6.0-win32-x64/`). It is an unsigned development build, so Windows may warn you; that is expected.

What you should see:
- A white workspace with a black header and **LIVE SCRIPTURE** at the top.
- **DRY RUN** in the banner. Nothing can reach ProPresenter yet.
- The mode shows **Auto** and the status says **AUTO SIMULATION**. That is the new default.
- A progress line: **Heard → Matched → Ready → On screen**.

## 2. Connect and set up audio

1. Open **Settings > ProPresenter**, enter `127.0.0.1` and port `1025`, save, and press **Test saved connection**. The status should show your ProPresenter version.
2. Open **Settings > Audio**. Press **Request audio permission / refresh inputs**, choose your microphone or MOTU input and the pastor channel, and save. Read the line under the device: if it says **System loopback** or **Virtual audio input**, VerseCue asks you to confirm only the pastor's audio goes there.
3. Use **Test saved input - 10 seconds** and watch the meter move when you speak.
4. **Settings > Speech** is already set up in this build (bundled local recognition).

## 3. Try Auto safely in dry run

1. Tick **I am authorized to process this selected audio feed locally** and press **Start listening**.
2. Say clearly: "Please turn to John chapter three verse sixteen," then pause for a second.
3. Within a few seconds the reference should appear large. The progress line moves to **Sending**, and a black **Hold - sending in 1.0s** button appears first.
4. Let it run: the last step should read **Simulated**. Nothing went to ProPresenter.
5. Say another reference and press **H** while it says Sending. It should change to **Held** and nothing is sent.
6. Try things that should **not** send on their own: "John says a lot about love", "as Romans 8:28 tells us" (no instruction to show), two references in one sentence, or "sorry, I meant John four sixteen". These should wait for review instead.
7. Press **Esc**. Auto pauses, Emergency stop shows, and resuming returns to **Confirm**, never straight back to Auto.

Optional: tick **Show provisional speech while the pastor is still talking** in the audio panel to see grey unfinished text. It uses extra computer power and never sends anything.

## 4. Real test output (personal ProPresenter only)

Only continue once you have confirmed in step "Before you start" that Audience and Stage are off.

1. Say or type a reference, then use **Prepare this passage**. VerseCue uses ProPresenter's own Bible tool to prepare it; ProPresenter may come to the front briefly. Experimental preparation must be allowed in **Settings > Advanced** first.
2. Check the passage text, translation, theme and Looks in ProPresenter, tick the review boxes, and use **Approve and arm for Auto**. This approves only that one passage for automatic test output, in this window, this session.
3. In **Settings > Output**, tick **This is an authorized supervised test target, disconnected from a live service** and press **Arm prepared test output**. The banner changes from DRY RUN.
4. Re-enable Auto from the mode menu if VerseCue returned to Confirm (arming or changing setup leaves Auto on purpose).
5. Say "Please show John chapter three verse sixteen". When the countdown ends, the slide should change in ProPresenter. VerseCue reports **ProPresenter confirmed** when ProPresenter's own readback matches. That is not proof of what the room or stream saw, so look at ProPresenter yourself.

## What to note and send back

For each try, note: what you said, what VerseCue showed, whether it sent or waited, how long it took after you finished speaking, and anything confusing on screen. Also note anything that went wrong with ProPresenter itself. Keep any recordings or screenshots on your computer; they stay private.

## Known limits of this build

- Recognition takes about 2 seconds per window on the development computer, so Auto usually shows a verse 3–4 seconds after you finish speaking, plus the 1-second hold.
- Three dropped-audio events within a minute pause Auto, because recognition cannot keep up.
- Only KJV numbering is used for automatic sends; other editions need review.
- Arbitrary Bible lookup through ProPresenter's API is not available; preparation uses ProPresenter's Bible window on Windows only. Mac preparation is not built yet.
- P0 and service acceptance remain pending. Trusting Auto in a real service needs the ten-hour rehearsal with labelled recordings ([docs/117](117-auto-rehearsal-harness.md)).
