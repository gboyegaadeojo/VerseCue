# VerseCue change requests

Recorded 2026-11-18 UTC. These additions preserve the original 62 FR/24 NFR baseline. Later user instructions authorize implementation and a pull request; production-host access, cloud inference, purchases and unverified unattended output remain outside the approved scope.

## NR-001 — Work while minimized

User request: ProPresenter remains the main screen while VerseCue listens and controls Bible passages in the background, including when minimized.

Requirements: an explicitly started audio session must continue processing when its VerseCue window is minimized or unfocused; no automatic microphone acquisition on startup/resume; no activation of VerseCue during recognition or ordinary API sends; Emergency Stop and owner loss must still cancel the worker. Disable Chromium background throttling for companion windows and hold a prevent-app-suspension blocker only during an authorized audio session. Minimize is not close, OS sleep/shutdown, or permission to enable Auto. Native Bible preparation still requires ProPresenter focus and its supervised experimental consent; it cannot be described as a focus-free vendor API.

Acceptance: minimize the owning window, verify audio-worklet messages and recognition/candidate processing continue, verify it remains minimized, and verify stop releases the suspension blocker. Use synthetic muted audio and an authorized private recording fixture without a microphone or actual output. Real MOTU/Mac/service workload remains field acceptance.

## NR-002 — Identify a verse from quoted preaching

User example: “For God so loved the world that he gave…” should identify John 3:16 without an explicit citation and lead to presentation through ProPresenter.

Implementation: explicitly enabled local quote matching against an operator-supplied, rights-acknowledged passage index. No copyrighted translation text is downloaded/bundled or silently substituted. Match sufficiently distinctive partial quotations and conservative near-verbatim wording; suppress short/generic, ambiguous, negated and conflicting phrases. Match results are review candidates, with source/translation/evidence shown, and use the existing verified ProPresenter output gate after confirmation. Explicit spoken references take precedence. Broad semantic paraphrase matching and automatic/unattended quote display require separate accuracy/intent/HIL evidence and remain disabled.

Acceptance: supplied John 3:16 example yields the correct reference with an appropriate local index; punctuation/case and modest word variation are handled; generic/short/ambiguous/denied/translation-mismatched speech does not become a sendable quote. Opt-out, stop, paused state, expiry and missing prepared-cue mapping block output. Tests are SYNTHETIC-TEXT and do not establish pastor/accent accuracy. Quote text is local matching input, never an alternative audience presentation engine.

Delivery: separate feature branch and PR containing implementation, tests, usage, limitations and traceability to the original future quote/paraphrase requirement. No automatic merge requested.

Delivery record2026-11-18: [PR #1](https://github.com/gboyegaadeojo/VerseCue/pull/1), branch feat/quoted-scripture-and-background, open for review. Source153regression tests pass. Source and packaged minimized worklet/private-file speech/quote recognition/explicit fake-target send checks passed for0.3.0;0.3.1 adds a requested-language rejection regression and is validated separately. This is opt-in near-verbatim/partial quotation matching, not general semantic paraphrase or unattended output. Setup/index format: [feature guide](docs/35-background-and-quoted-scripture.md).

Final patch0.3.1 passed packaged minimized recognition/quote/confirmed fake-target readback, stop/blocker cleanup, full desktop smoke and default offline-worker checks.121package/source files verified; local ZIP SHA256264ff805207d8c08d756da716cbe0dead7ac455c6be438c1b186accf1d16a8ee. Production/Mac/physical-output/accuracy acceptance remains pending.

## NR-004 - Definitive Figma-inspired VerseCue Control redesign

2026-11-18: IFC selects the Figma-inspired reference as the sole visual direction; Apple and Meta alternatives are superseded. Implement a professional dark-first desktop operator workspace with persistent left navigation, central Scripture review, contextual right inspector, compact real status indicators, consistent controls and dedicated technical settings. Preserve all current backend/integration/safety behavior and verify builds and existing workflows. No requirement permits mocked readiness, unlicensed Bible text or removal of preparation/output consent. Implementation, keyboard/settings map and validation: [workspace guide](docs/38-figma-control-workspace.md). Delivered on a separate stacked feature branch/PR, keeping the change revertible.

NR-004 delivery: [PR #4](https://github.com/gboyegaadeojo/VerseCue/pull/4), version0.5.1 including the requested button-spacing refinement.170 regression tests and packaged workspace/background/Auto/recovery checks passed; detailed results in docs/38 and docs/evidence/control-workspace-0.5.1.json.

## NR-005 - Broader preaching citation forms and clear quote readiness

2026-11-18: user reported Revelation/Revelations variants, vs/and verse/starting from verse, abbreviations and hyphenated STT output failing, plus a noisy John3:16 quotation. Implement exact citation normalization, invalid-number retention and actionable missing-verse explanation, with regressions and visible quote-index readiness. Never guess a different spoken book, split impossible digits into a preferred verse, or allow ambiguous punctuation/quotes to Auto-send. See docs/40-preaching-reference-forms.md. User also requests smoothness and completing the actual ProPresenter output workflow before hardware testing; keep those active in separate focused PRs.

## NR-006 - Spoken next-verse navigation

2026-11-18: user asks how Hosea1:1 followed by a spoken navigation command should work, then explicitly clarifies "next verse", not "next slide". Plan exact canonical verse progression with the same translation, verified current passage context, remote-state revalidation, split-slide/range/boundary semantics, deduplication and safe preparation/output. Current parser already resolves next verse from recent verified context; relative Auto remains blocked and exact destination preparation is still required. This turn requests investigation/planning, not enabling new output. Full implementation sequence and NV-001 through NV-012 acceptance cases: [spoken next-verse plan](docs/48-spoken-next-verse-plan.md). Preserve original FR/NFR baseline and approval gates.

## NR-007 - Full conversational preaching workflow gap review

2026-11-18: user requests a full-application review for missing capabilities around NR-006 and similar preaching commands. Source review and synthetic probes found16 prioritized work items across live passage ownership, intent/range correctness, exact preparation/coverage, platform support, speech continuity/age/loss, translation-only commands, navigation deduplication, operator UX and acceptance. See [full review](docs/49-preaching-workflow-gap-review.md). Planning/review only; no runtime or output behavior changed.

## NR-008 - Three clickable premium UI directions

2026-11-18: user supplies Pewbeam screenshot, asks for internet-researched polished and easy desktop design, then explicitly requests three clickable ideas before choosing the real application look. Built standalone Studio, Focus and Command concepts in design-review/, with synthetic local-only interactions and research notes. No production UI/backend changed; selection is pending. See [design room](design-review/README.md).

NR-008 selection and implementation: user chooses Studio with Focus readability, then requests premium/non-generic styling. Version0.6.0 implements that direction in the real UI, preserving existing safety/IPC/backend behavior. See [Studio implementation](docs/50-premium-studio-workspace.md). Isolated concepts PR19 merged after selection.

## NR-009 - Complete reference-driven Bible workflow implementation PR

2026-11-18: user rejects per-passage Library/Presentation/Cue selection and asks for every required fix plus an implementation PR. Desired workflow: pastor cites a passage; VerseCue prepares the exact installed Bible/edition and uses passage-level Confirm or explicitly validated Auto while preserving Sunday Service playlist and existing Looks. docs/51 contains22 tracked fixes and full demonstration. Initial draft code adds exact-reference lookup, internal full cue-index planning and KJV range-label completeness checks; it does not finish arbitrary preparation, normal UI orchestration or unattended output. Keep draft unmerged until its exit criteria pass.

## NR-010 - Start in Auto with an Auto-first Route workspace

2026-11-21: the user, as IFC product owner, decides VerseCue should start in Auto. Confirming every reference defeats the purpose of the product. They chose design direction C (Route) from three clickable concepts, adapted to Auto-first: the main view shows the automatic pipeline (Heard, Matched, Ready, On screen) and the primary control is Hold rather than Show.

This changes the FR-028 startup default from Confirm to Auto by explicit product decision. It does not remove Auto's safeguards. Ambiguous, relative, corrected, quoted, slow, lossy, unprepared or unapproved references still go to review; actual output still needs an armed target and cues approved for Auto; Emergency Stop, connection loss, wake and configuration changes still drop Auto and require a deliberate resume; settings import and profiles cannot turn Auto on. A configurable hold window (within the existing 0.75-3 second correction grace) lets the operator Hold a pending automatic send.

Trust gate: the original 10-hour representative rehearsal with zero unapproved wrong displays (NFR-003), plus precision/recall on held-out labelled recordings (NFR-002), before Auto is relied on in a real service. P0 remains pending.

## NR-011 - Pre-ticked setup boxes

2026-11-21: after testing 0.6.0, the user asked that the setup boxes be turned on by default in the next build. Audio authorization, experimental preparation focus changes and saved-copy creation now start ticked (opt-out setting). Arming output and per-passage Auto approval remain deliberate steps. See [docs/129](docs/129-pre-ticked-consents.md).

## NR-012 - Prepare for volunteer

2026-11-21: the user asked for an option where VerseCue triggers the referenced Bible passage in ProPresenter and the volunteer clicks it live, so nobody has to babysit VerseCue or type the reference. Implemented as the start mode Prepare for volunteer: Confirm mode, no output, automatic preparation of each clear detected reference through ProPresenter's Bible. See [docs/130](docs/130-prepare-for-volunteer.md).

## NR-013 - Quotes prepare passages with free public-domain Bibles

2026-11-21: the user asked that recognized quotes use the Prepare-for-volunteer workflow, with a free public-domain Bible (KJV or WEB) via one-click import, labelled as matched from quoted wording, on by default in Prepare for volunteer, prepared in the default installed translation. See [docs/132](docs/132-public-domain-quote-preparation.md).

## NR-014 - Whole chapter at the spoken verse; higher verse limit

2026-11-21: the user asked that a detected reference such as Proverbs 3:5 open the entire chapter in ProPresenter, positioned at the spoken verse, so the volunteer can go to earlier or later verses with next/previous instead of searching again. The user also asked to raise the verse limit in case a minister reads a whole chapter. Implemented for Prepare for volunteer (no output, no saved copy); the configurable limit now reaches 176 (Psalm 119). Auto keeps its 10-verse limit, because the user did not ask to change Auto and its safety rules need a recorded reason. See [docs/134](docs/134-whole-chapter-preparation.md).

## NR-015 - Faster detection and a simple open-and-connect start

2026-11-21: the user asked to "improve the application as a whole, make voice detection faster and every trigger faster" and to "turn on everything that makes it simple to just open and connect to ProPresenter". Implemented: automatic read-only connection to the saved ProPresenter, start listening on open once an input is set up (both settings, on by default), a 15 s audio context and 0.7 s end-of-speech silence for faster recognition, and heard-clarity values for the Halo badge. Auto's send rules, hold window and 10-verse limit are unchanged. See [docs/137](docs/137-faster-simpler-start.md).

## NR-016 - Halo design with compact controls in Standard size

2026-11-21: the user chose design 5 (Halo) and asked for smaller fonts and smaller, better-looking buttons ("the buttons are too big"). Standard (the default text size) now uses Halo's compact controls: at least 28 px, 12–13 px text. Large ("booth distance") keeps the original booth readability: 18 px text and 44 px targets, every booth check unchanged (docs/111, docs/126). The Hold button stays 44 px in both sizes because it is the operator's safety control. See [docs/136](docs/136-halo-design.md).

## NR-017 - Any ProPresenter version, any computer and graphics card, ready out of the box

2026-11-21: the user asked that VerseCue (1) work with any ProPresenter version, current and future, on both Windows and Mac, because churches and media houses run different versions; (2) work on any computer and any AMD or NVIDIA graphics card; and (3) have every setting needed to "hit the ground running" preset out of the box, except connecting to ProPresenter.

Implemented in this change: Bible preparation is no longer pinned to ProPresenter 21.4.2 (any ProPresenter on Windows; the helper still verifies every control and stops safely if a version differs, and never sends output). The Mac helper has no version pin. The computer's default microphone is preselected; the bundled engine, graphics card, quotes, authorizations, auto-connect and auto-listen are on by default. Graphics support for AMD/NVIDIA/Intel through a Vulkan speech engine and an Intel Mac download follow in their own change.

