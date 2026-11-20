# VerseCue

**A Scripture assistant for the church production booth.**

VerseCue listens to an authorized pastor audio feed, identifies Bible references and helps an operator review and send prepared passages to ProPresenter. Built for Immanuel Fellowship Church, it works alongside ProPresenter while ProPresenter keeps control of Bible text, themes, Looks and screens.

![VerseCue Control workspace](docs/images/versecue-studio-workspace.png)

## Continuing development

Developers and coding agents: start with [CLAUDE.md](CLAUDE.md), the detailed [handoff](HANDOFF.md), and the [remaining-work list](docs/107-remaining-work-and-acceptance.md). These record verified progress, the next action and outstanding service acceptance.

## Download

**Current downloadable development version: 0.5.5.** These are supervised-test builds, not an approved live-service release. Source now includes the Studio 0.6.0 workspace shown above; matching public packages are being verified.

| Computer | Download | Status |
|---|---|---|
| Windows, Intel/AMD 64-bit | [Download Windows ZIP](https://github.com/gboyegaadeojo/VerseCue/releases/download/v0.5.5/VerseCue-0.5.5-win32-x64.zip) | Desktop, offline speech, minimized operation and guarded-Auto development checks passed |
| Mac, Apple Silicon (M1/M2/M3/M4) | [Download Mac Apple Silicon ZIP](https://github.com/gboyegaadeojo/VerseCue/releases/download/v0.5.5/VerseCue-0.5.5-darwin-arm64.zip) | Native CPU speech build, local signature verification and packaged workspace check passed; church-device/ProPresenter acceptance pending |

[All release files and checksums](https://github.com/gboyegaadeojo/VerseCue/releases/tag/v0.5.5). This repository is currently public; release downloads are available without repository membership. Do not use the automatically generated source-code ZIP as the installed application.

Windows: extract the **entire ZIP**, then open **VerseCue.exe** inside the extracted folder. Keep its supporting files together. The Windows package includes the verified local speech engine and model. These builds are not signed by a trusted software publisher.

Mac: extract the ZIP and move **VerseCue.app** to Applications. The package is for **Apple Silicon (M1/M2/M3/M4)** and includes the local speech engine/model. It is ad-hoc signed, not Developer ID signed or notarized; Gatekeeper may block it. Mac microphone/MOTU and ProPresenter field acceptance are not complete. Intel Mac builds are not provided.

## What it does

- Recognizes explicit English references, such as "John chapter three verse sixteen."
- Shows a reference, translation, source phrase and review state in a focused operator workspace.
- Offers manual reference entry, previous/next verse proposals, a short suggestion queue and session history.
- Continues an explicitly started audio session while minimized, so ProPresenter can remain the main screen.
- Optionally identifies distinctive quoted wording using a rights-cleared local passage index you import. Quoted matches always require confirmation.
- Uses local speech recognition without a paid cloud speech subscription.
- Provides service profiles, a compact view, connection settings and an optional private local API.

## New reference-driven workspace (unreleased source)

The development source replaces normal per-passage Library/Presentation/Cue setup. Connect your authorized test target, enter or detect a reference, click **Prepare passage**, review the exact saved text/preview, then explicitly **Confirm**. Split passages offer ordered continuation. Technical cue mappings remain an advanced fallback.

Settings / Output separates detected-reference preparation consent from output approval. Restricted native preparation can create a missing passage in the installed ProPresenter Bible, may change focus and requires review; unavailable routes explain their limitations. Eligible reviewed single-cue KJV passages have a separate guarded Auto approval. This is not unrestricted new-passage Auto or a live-service release.

See [the workspace guide](docs/79-normal-reference-passage-workspace.md) for workflow, test scope and remaining limitations. The downloads above retain their earlier behavior until a matching release is accepted.

## How the current download works

1. Open VerseCue and review the ProPresenter, audio and speech indicators.
2. In **Settings**, choose the intended ProPresenter connection, pastor audio device/channel and installed Bible translation.
3. Start in **dry run**, authorize the selected feed and click **Start listening** in Audio & recognition.
4. Review a detected reference, or enter one manually. Prepare and inspect the exact passage in ProPresenter.
5. For an authorized disconnected test, use **Load saved libraries**, choose the saved presentation/cue by name, select its exact translation, verify the mapping and arm test output in **Settings / Output**. Then deliberately confirm a passage.

**Preparing a passage and showing it are separate actions.** A successful request or matching readback does not prove what the congregation or livestream sees. Emergency Stop blocks further sends; ProPresenter remains available for manual operation.

## First five-minute test

You can test without connecting ProPresenter. If the speech indicator says **Local whisper.cpp - ready**, the bundled recognizer is already available.

1. Stay in **Confirm** with the **DRY RUN** banner visible.
2. In Overview, type **John 3:16** in the manual reference box and click **Review reference**.
3. A reference card should appear. Within 15 seconds, click **Simulate passage**. Recent actions should show **Simulated**, with no output request.
4. For voice input, open **Settings / Audio**, request audio permission/refresh inputs, select the microphone you are speaking into and its intended channel, then **Save setup - return to dry run**. A computer microphone is suitable for this first test if the MOTU is not connected; do not substitute an input silently during a service.
5. Open **Audio & recognition**, check authorization for that feed and click **Start listening**. The meter should move when you speak.
6. Say **"Please turn to John chapter three verse sixteen"**, then pause. Allow several seconds for a transcript and reference suggestion. Return to Overview to review it; suggestions expire after 15 seconds.
7. Test **Emergency Stop**, then deliberately resume Confirm. For a background check, start the authorized input again, minimize VerseCue, speak a fresh reference and reopen it promptly to inspect the suggestion.

If no meter movement appears, check the chosen device/channel and OS microphone permission. If the meter moves but recognition fails, read the status message and check Speech settings. Do not arm output to troubleshoot recognition. Actual ProPresenter display is a separate verified-cue test; this first test is simulation only.

## Modes in plain language

| Mode/state | What happens |
|---|---|
| Dry run | Recognition and review work, but output commands are simulated. Nothing is sent to ProPresenter output. This is the startup default. |
| Confirm | An operator reviews and explicitly confirms each passage. |
| Suggest only | References are offered for review; sending is blocked. |
| Paused / Emergency stopped | Recognition/output are paused or blocked; deliberate recovery is required. |
| Guarded Auto | Must be deliberately acknowledged. Eligible explicit references can simulate, or trigger complete saved cues separately verified for Auto on the armed local test target. It is not unrestricted automatic Bible lookup. |

Dry run is an output safety state, separate from the selected recognition mode. Restarting does not silently enable Auto or microphone capture.

## Spoken references and translations

Examples supported: **Revelations 1 vs 1**, **Revelation 1 and verse 1**, **Revelation 1 starting from verse 1**, **Jeremiah 2 vs 5**, **Gen 1:1**, and **John 5:10 in the Amplified version**. AMP and AMPC remain distinct. Punctuation such as John1-1 produces a reference for review; impossible numbers are never guessed into another verse. A wrong recognized book still needs correction.

In **Settings / Output**, choose the exact translation for each saved-cue mapping. ProPresenter must have that edition installed; VerseCue neither downloads paid Bibles nor substitutes KJV. The inspector shows whether optional quoted-wording matching has an enabled local index.

## Limits of the downloadable 0.5.5 build

In the published download linked above, arbitrary-passage lookup and output remain under investigation. That build uses **exact, verified saved cue mappings**. Experimental native Bible preparation is Windows-only and prepare-only. Exact verse text is not available in a verified VerseCue preview; ProPresenter remains the Bible-text authority.

Quoted-wording matching needs your own permitted local index. General semantic paraphrases and automatic quote display are not implemented. Held-out sermon accuracy, church Mac/M4, actual MOTU routing, physical output/Looks, Companion/media concurrency and full service acceptance remain pending. Development tests are not a claim of Sunday-service readiness.

## Development source and remaining acceptance

The current 0.6.0 development source is newer than the downloads above. Its normal workspace prepares and reviews a reference-driven ProPresenter passage, then confirms or continues it without making the operator select a Library/Presentation/Cue for every passage. Consented native preparation is restricted to the inspected Windows route; native Mac Bible preparation is not implemented. Prepared ProPresenter text/thumbnails can be reviewed, but matching readback is not physical room/stream confirmation. Development source also includes reviewed settings-backup recovery.

See the [complete original 86-row implementation/evidence audit](docs/99-original-requirement-evidence-audit.md) and [PR22 integration evidence map](docs/90-pr22-acceptance-state.md) for specific software gaps and remaining hardware/data/field/release gates. These development features are not an accepted Sunday-service release, and merging source does not update an already downloaded executable.

## Quick controls

- **Ctrl/Cmd+K:** focus manual reference in the full workspace.
- **Alt+1-4:** Overview, Scripture queue, Audio & recognition, Recent actions.
- **Enter in the reference field:** review a reference; never send it.
- **Escape:** Emergency Stop while VerseCue has focus.

## Privacy and Bible content

Audio is processed locally. Audio/transcripts are not recorded persistently by default; the default worker uses bounded temporary recognition files which are cleaned up after processing. No Bible translation corpus is bundled or downloaded. Import only passage text you have permission to use. The private API starts disabled and uses a session-only local token.

## For developers

Draft [PR #22](https://github.com/gboyegaadeojo/VerseCue/pull/22) adds reference-driven preparation/review/Confirm, saved-slide previews and [normal-workspace approval for guarded Auto](docs/67-normal-workspace-auto-approval.md). Its native-copy route is restricted to the inspected local Windows test profile, and its [full acceptance checklist](docs/51-reference-driven-bible-workflow.md) remains open. The linked public download is an earlier development build; current source is not a finished service release.

Use a current compatible Node.js installation and the pinned dependencies in the lockfile. On Windows use npm.cmd if PowerShell blocks npm.ps1.

```sh
npm ci
npm start
npm test
npm run check
npm run test:desktop
```

[Contributing and PR workflow](CONTRIBUTING.md) | [Current progress](PROGRESS.md) | [PR22 acceptance map](docs/90-pr22-acceptance-state.md) | [Implementation coverage](docs/implementation-coverage.json) | [Setup and release evidence](docs/22-development-build-and-release-status.md) | [Workspace guide](docs/50-premium-studio-workspace.md) | [Prepare and save a Bible copy](docs/46-native-saved-bible-preparation.md) | [Spoken next-verse plan](docs/48-spoken-next-verse-plan.md) | [Preaching workflow review](docs/49-preaching-workflow-gap-review.md).

Application improvements use focused pull requests so changes can be reviewed and reverted independently. Merging a PR updates source; it does not automatically replace an already downloaded app. Download a newer build only when its application contents/version change. Version 0.5.5 includes merged PRs #2-10, including expanded citation forms, smoother updates, translated saved-cue browsing and offline IBM Plex Sans.

## Project documentation

The unfinished reference-driven workflow is tracked in [draft PR #22](https://github.com/gboyegaadeojo/VerseCue/pull/22), with its [complete implementation checklist](docs/51-reference-driven-bible-workflow.md) and [personal-host preparation results](docs/52-native-edition-and-playlist-checks.md). These source changes are not yet a new downloadable release.

Development now includes [bounded citation assembly across speech windows](docs/57-cross-window-citation-stabilization.md) and [coordinator-backed private API review](docs/23-private-api-and-experimental-bible-bridge.md). These remain subject to the draft's real-service and platform acceptance requirements.

Passage review can also load [saved-slide thumbnails supplied by ProPresenter](docs/59-saved-slide-preview.md). They help inspection and do not certify live screen output or remove clipping warnings.

[Start with the leadership summary](docs/00-executive-summary.md), [operator runbook](docs/13-operations-and-runbook.md), or [requirements summary](REQUIREMENTS_SUMMARY.md). The [master specification](VerseCue_Master_Development_Prompt_v2_Codex.md) is authoritative. [Assumptions](PROJECT_ASSUMPTIONS.md), [research sources](RESEARCH_SOURCES.md), [change requests](NEW_REQUESTS.md) and [historical development notes](DEVELOPMENT_HISTORY.md) remain available. The [CSV](docs/test-data/versecue-utterances.csv) and [JSON](docs/test-data/versecue-utterances.json) retain all 66 matching synthetic test proposals.

## Ordered document package
| Order | Document | Review purpose |
|---|---|---|
| 00 | [Executive summary](docs/00-executive-summary.md) | Nontechnical business case, costs/risks/scope and names |
| 01 | [Business requirements](docs/01-business-requirements.md) | Stakeholders, six objectives/BRs, journeys, KPIs and gates |
| 02 | [Functional requirements](docs/02-functional-requirements.md) | 62 numbered detailed FRs with acceptance/owners/releases |
| 03 | [Non-functional requirements](docs/03-non-functional-requirements.md) | 24 measured NFRs, profiles and thresholds |
| 04 | [Technical requirements and architecture](docs/04-technical-requirements-and-architecture.md) | Provisional stack, C4/state diagrams, contracts/queues/deployment |
| 05 | [UX requirements](docs/05-ux-requirements.md) | Four ASCII layouts, modes, focus, Sunday flow and recovery |
| 06 | [Test and acceptance plan](docs/06-test-and-acceptance-plan.md) | Unit/contract/system/soak/HIL/UAT, dataset and go/no-go |
| 07 | [Risks and open questions](docs/07-risks-and-open-questions.md) | Ranked risks, decision owners and due points |
| 08 | [Roadmap](docs/08-roadmap.md) | P0 → MVP → v1 → optional v2, preliminary effort/costs |
| 09 | [Investigation findings](docs/09-investigation-findings.md) | Primary-source STT/framework/parser/content comparisons |
| 10 | [Integration feasibility and POC](docs/10-integration-feasibility-and-poc.md) | Route matrix, pending tests, exact evidence limitations, gate |
| 11 | [Privacy, security and licensing](docs/11-data-privacy-security-and-licensing.md) | Inventory/retention, 16 hazards, controls and rights ledger |
| 12 | [Traceability matrix](docs/12-traceability-matrix.md) | Objective/BR → each FR/NFR → tests/release |
| 13 | [Operations and runbook](docs/13-operations-and-runbook.md) | Preflight, five-minute guide, manual failback and incidents |
| 14 | [Decision records](docs/14-decision-records.md) | Options, recommendations/accepted constraints and consequences |
| 15 | [Implementation handoff](docs/15-implementation-handoff.md) | Post-gate repo/modules/tasks/readiness/done, no code |
| 16 | [Decision brief](docs/16-decision-brief.md) | Compact final review and next engineering step |
| 17 | [Package audit](docs/17-package-audit.md) | Completeness/consistency evidence and remaining verification |
