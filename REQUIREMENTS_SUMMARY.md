# VerseCue requirements summary

2026-11-17 — IFC review baseline. **PROVISIONAL integration; P0 PENDING. Documentation only.**

VerseCue should reduce volunteer delay after explicit spoken Scripture references while leaving ProPresenter as the single presentation system. A clean authorized MOTU M4 pastor feed supplies local speech recognition; deterministic parsing and canonical validation produce a fresh reference card. Confirm is default. Guarded Auto is optional, intentionally armed and unavailable whenever translation, context, target or ownership is uncertain. Suggest-only blocks sends while listening; Paused stops capture; emergency stop blocks further sends without clearing existing output.

IFC reports ProPresenter 21 on a Mac mini M4, existing themes/room-stream Looks/macros, Companion, English and six installed translations. Same-PC first; LAN companion and Windows/macOS installation remain required. Exact installed build/macOS/default Bible/channel/assets and supported arbitrary-reference route are unverified. Public presentation triggers do not prove remote Bible lookup. No installed instance or live output has been accessed.

**Provisional approach:** investigate installed version 21 documentation and a genuine Bible-created presentation baseline; prove unprepared reference lookup and fidelity before committing architecture. Tauri 2 webview shell/native core, constrained local whisper.cpp and deterministic parser are research recommendations, with faster-whisper as a future local alternative. No final backend/model/framework/build system/cloud provider is selected. No standalone presentation engine, unlicensed text or altered IFC appearance is an acceptable workaround.

The full package contains six objectives/BRs, 62 detailed FRs, 24 measurable NFRs, 86 individual acceptance-case mappings, 66 identical CSV/JSON synthetic-text proposals, UX layouts, architecture/state/data contracts, route matrix/POC, privacy/rights controls, operations, roadmap and no-code handoff. Corpus text is not real accent or recognition evidence. Pastor-consented recordings and representative holdout/rehearsal data remain pending.

Success targets: accepted Auto p50 ≤2 s/p95 ≤4 s from audible reference end to observed output, Confirm system metric excluding volunteer reaction; proposed ≥95% reference precision and ≥90% explicit-reference recall; zero unapproved wrong displays over 10-hour rehearsal; 90-minute minimum plus 3-hour soak; no media/manual/Companion interference; ≤5-minute volunteer orientation. These are targets, not results or vendor guarantees.

IFC requires free recurring operation: recommend local STT without metered speech charge. Existing equipment/licenses, development time, electricity, maintenance and signed distribution expenses are separate. Preliminary effort/cost formulas in docs/08 are not quotes. No purchase/signup authorized; signing credentials/waiver/budget and translation-use rights need review.

Top five risks:
1. No proven supportable arbitrary Bible-reference route preserving genuine text/themes/Looks.
2. Wrong/ambiguous/corrected/stale reference reaches output; safety predicates and human review essential.
3. Companion/manual/macros race or interrupt lyrics, routing or media.
4. Shared-M4 local STT load/latency and real English accent performance remain untested.
5. Translation rights and trusted signed-distribution costs may conflict with free-use expectations.

**Approval boundary:** review the [decision brief](docs/16-decision-brief.md), [audit](docs/17-package-audit.md) and [P0 procedure](docs/10-integration-feasibility-and-poc.md). Stage 4 requires IFC requirements approval before implementation, and P0 still must pass. Next engineering action is a separately authorized isolated feasibility session. Production host/output access, spending, cloud choice and GitHub/publication remain unapproved. Full ordered links: [README](README.md).
