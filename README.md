# VerseCue

**Free, local Bible-reference cueing for ProPresenter.**

VerseCue listens to the preacher, recognises Bible references as they are spoken (and well-known verses when they are quoted), and gets the passage into ProPresenter. It can send it automatically, ask you to confirm first, or open it ready for a volunteer to take live. Speech recognition runs on your own computer: no cloud service, subscription or account.

ProPresenter stays in charge of your Bible text, themes, Looks and screens. VerseCue only tells it what to show.

![VerseCue workspace with a reference waiting to send (synthetic example)](docs/images/versecue-halo-workspace.png)

> **Status: development preview.** VerseCue works and is tested, but it hasn't yet been proven in long live services. Try it on a personal or test ProPresenter first, with your audience screens off, before relying on it on a Sunday.

## Who it is for

Churches and ministries that use **ProPresenter** (tested with ProPresenter 21.4 on Windows) and want Scripture on screen as soon as it's read, without a volunteer searching for every reference.

You need:
- **Windows 10/11 (64-bit)** or a **Mac with Apple silicon** (M1 or newer).
- **ProPresenter** with its network API turned on (ProPresenter > Settings > Network).
- The **preacher's microphone feed** going into the computer, for example through an audio interface such as a MOTU M4, or a USB microphone for testing.

## Download

**Latest version: 0.6.2** (development preview)

| Computer | Download |
|---|---|
| Windows (Intel/AMD 64-bit) | [VerseCue for Windows (ZIP)](https://github.com/gboyegaadeojo/VerseCue/releases/download/v0.6.2/VerseCue-0.6.2-win32-x64.zip) |
| Mac with Apple silicon | [VerseCue for Mac (ZIP)](https://github.com/gboyegaadeojo/VerseCue/releases/download/v0.6.2/VerseCue-0.6.2-darwin-arm64.zip) |

Checksums and older versions are on the [releases page](https://github.com/gboyegaadeojo/VerseCue/releases). Don't use GitHub's automatic "Source code" ZIP to run the app.

- **Windows:** extract the whole ZIP, then open **VerseCue.exe** in the extracted folder. The app isn't signed by a registered publisher yet, so Windows may show a warning.
- **Mac:** extract the ZIP and move **VerseCue.app** to Applications. It isn't notarized by Apple yet, so macOS may ask you to confirm before opening it.

To remove VerseCue or go back to an earlier version, see [rollback and removal](docs/125-rollback-and-uninstall.md).

## What it does

- **Hears references:** "Turn with me to Proverbs chapter three, verse five", "First Peter two verse one", "Psalm 119 verse 105".
- **Recognises quoted verses:** if the preacher quotes "Trust in the Lord with all thine heart" without saying the reference, VerseCue can find Proverbs 3:5. It uses the free, public-domain King James and World English Bibles, prepares the verse in your own installed translation, and labels it "matched from quoted wording".
- **Shows how clearly it heard:** each reference gets a badge, "Heard clearly", "Likely" or "Check this", based on how confident the speech engine was.
- **Three ways to work:**
  - **Auto:** complete, explicit references go to ProPresenter automatically after a short hold window. Press **H** to hold one, or **Esc** for Emergency stop.
  - **Confirm:** you review every passage, then send it.
  - **Prepare for volunteer:** VerseCue never sends anything. It opens the passage in ProPresenter's own Bible view, and by default the **whole chapter** at the spoken verse, so your volunteer clicks it live and uses ProPresenter's next/previous for the verses around it.
- **Fast on modern computers:** recognition starts as soon as the preacher pauses (0.7 s) and uses the graphics card automatically: Metal on Macs, and any AMD, NVIDIA or Intel card on Windows. An optional [NVIDIA CUDA setup](docs/135-guided-nvidia-speech-setup.md) is also available.
- **Calm, readable workspace:** a dark, compact design with a Large "booth distance" text size for reading from across the room.

## Getting started

1. **Use a test setup first.** Open ProPresenter with your **Audience and Stage screens turned off**.
2. **Open VerseCue.** It starts in a safe **dry run**: everything works, but nothing is sent to ProPresenter.
3. **Connect ProPresenter.** VerseCue tries the usual address (`127.0.0.1`, port `1025`) on its own and keeps trying. If ProPresenter is on another computer or uses a different port, enter them in **Settings > ProPresenter**. This is the only setting you need.
4. **Everything else is ready.** VerseCue uses the computer's default microphone and starts listening when it opens. It warms up the graphics card in the background, using the processor until the card is ready. To use a different input, such as the preacher's channel on an audio interface, choose it in **Settings > Audio** and run the 10-second input test.
5. **Start listening** and say "Please turn to John chapter three verse sixteen", then pause. The reference appears with its badge and progress.
6. When you're comfortable, choose your mode (Auto, Confirm or Prepare for volunteer), arm output and test with a real passage, still with the screens off.

A fuller walkthrough is in the [personal test guide](docs/124-personal-auto-first-test-guide.md).

## Safety by design

- Starts in dry run every time. Sending to ProPresenter needs deliberate setup.
- **H** holds one automatic send; **Esc** (Emergency stop) stops everything.
- Auto sends only complete, explicit references, at most 10 verses, from passages you approved. Anything unclear, quoted, corrected or slow waits for a person.
- If the connection drops, output is disarmed and VerseCue pauses.
- VerseCue never clears ProPresenter, never deletes anything and never changes ProPresenter's settings.

## Privacy

Audio is processed on your computer and isn't saved. Temporary recognition files are deleted after each phrase. VerseCue needs no account or internet connection, except for downloading it and, if you choose, the optional NVIDIA engine files. Bible text comes from ProPresenter. The bundled public-domain Bibles are used only to recognise quoted wording.

## Current limits

- Real-world accuracy across many preachers, accents and rooms is still being measured. Treat Auto as supervised until you have tested it in your own setting.
- Opening passages in ProPresenter's Bible view (Prepare for volunteer) is verified on Windows. The Mac version is being verified.
- Recognition speed depends on the computer. A graphics card makes it much faster.
- Automatic sends use King James verse numbering. Other editions are reviewed by a person.

## Keyboard shortcuts

| Key | Action |
|---|---|
| **H** | Hold the pending automatic send |
| **Esc** | Emergency stop |
| **Ctrl/Cmd+K** | Type a reference |
| **Alt+1–4** | Switch workspace pages |

## For developers

VerseCue is an Electron app with a local whisper.cpp speech engine and ProPresenter's HTTP API. Start with [CLAUDE.md](CLAUDE.md), the [handoff](HANDOFF.md) and the [remaining-work list](docs/107-remaining-work-and-acceptance.md).

```
npm ci
npm test          # module tests
npm run check     # syntax, dependency inventory and SBOM
npm start         # run from source
```

Third-party licences are in [legal/](legal/).
