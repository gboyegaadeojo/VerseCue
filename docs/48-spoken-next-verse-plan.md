# Spoken next-verse workflow plan

2026-11-18. Request NR-006. User clarification: **next verse**, not next slide. This document plans the change; it does not enable new output behavior or change the original acceptance gates.

## Intended operator experience

The pastor says "Hosea one one." VerseCue identifies **Hosea 1:1** in the requested/default translation and shows its preparation state. Recognizing a reference, preparing it, and displaying it are distinct states. In Confirm mode the operator deliberately sends a verified passage. Guarded Auto continues to require its existing explicit consent and eligibility checks; a bare citation currently does not satisfy its explicit display-instruction rule.

Once ProPresenter's readback matches the accepted Hosea 1:1 output, the pastor says "next verse." VerseCue resolves **Hosea 1:2**, retaining the translation. It prepares/selects that exact verse and offers it for confirmation. A successful matching readback then advances context to 1:2, so the next independent "next verse" resolves to 1:3.

If 1:1 is only a suggestion or a prepared copy, the app must not assume it is live. It shows "Choose or confirm the current passage before using next verse." An operator can explicitly select a preparation anchor for review-only navigation; this must be visibly separate from verified live context and never authorize automatic output.

## Current code findings

- `core/parser.cjs` already resolves "next verse" from verified passage context no older than 120 seconds. A local text probe confirmed Hosea 1:1 followed by "next verse" resolves Hosea 1:2. This is deterministic text evidence, not live microphone evidence.
- `core/session.cjs` establishes context only after `readback-matched`; simulation does not establish real ProPresenter context. Manual Previous/Next currently proposes references for review and is limited to verified KJV numbering.
- `core/guarded-auto.cjs` explicitly rejects relative references. Spoken next-verse output therefore currently requires confirmation, even with Auto selected.
- The connector requires a separately verified exact reference/translation mapping. Resolving 1:2 alone cannot display it when only 1:1 has been mapped.
- Current context does not retain the full displayed presentation/cue fingerprint for a new pre-navigation readback. That is insufficient to safely assume the operator or Companion has not changed the passage since the last successful send.
- The experimental native save route works only on the inspected local Windows build/one-library layout, pauses listening, changes focus and requires review. It is not yet a seamless background arbitrary-verse engine on both platforms.

## Planned behavior and safety policy

| Situation | Planned response |
|---|---|
| Verified displayed Hosea 1:1, "next verse" | Propose Hosea 1:2 in the same translation; Confirm before output initially |
| Hosea 1:1 is queued/prepared but not displayed | No implicit live anchor; offer explicit review-only anchor selection |
| A verse occupies two slide cues | Skip to the next canonical verse, not the next slide fragment; never use generic Next |
| Displayed range Hosea 1:1-3 | Next verse means 1:4, after the range end; inspector states the resolved destination |
| Chapter edge | Use verified numbering to cross to the next chapter; never guess translation-specific bounds |
| Book end | Stop and ask for an explicit book/reference; do not jump books automatically |
| Unknown numbering in the selected translation | Needs review/manual preparation; never silently switch to KJV |
| Operator/Companion changes cue, presentation or content | Invalidate live context; require explicit reference or intentional adoption after inspection |
| Output uncertain, offline, Stop, profile/target/translation change, sleep or reset | Cancel pending navigation and clear context |
| Repeated partials/revisions of one utterance | One navigation proposal, not several increments |
| Pastor repeats "next verse" before the prior output is acknowledged | Do not accumulate advances or infer an unshown intermediate verse |
| "Don't go to the next verse", quotation or discussion of the command | No navigation output; review ambiguous intent |
| New explicit citation or correction during preparation | Cancel stale navigation and review the new reference |

Use final authorized speech only. A new relative request receives its own 15-second candidate lifetime; context remains bounded to 120 seconds and is rechecked against current remote identity. A proposal does not renew context or advance the anchor. Previous verse anchors at the displayed range start; next verse anchors at its end. These rules must be consistent across voice, keyboard and manual navigation.

## Implementation sequence

1. **Verified passage context.** Introduce a context record containing canonical start/end, translation, target generation/version, presentation UUID, cue index, presentation fingerprint, last matching readback time and context origin. Before resolving/dispatching relative commands, re-read identity and inspect the expected presentation. Any mismatch invalidates the anchor. Surface a clear reason in the inspector. Bound reads and discard stale responses.
2. **Navigation intent and resolver.** Recognize conservative forms such as "next verse," "the next verse," "read the next verse," "go to the next verse," "verse two," "previous verse" and "go back to verse one." Separate these intents from explicit citation parsing and quoted-word matching. Apply negation/correction handling, range-end semantics, verified numbering and utterance deduplication. Keep incomplete chapter-only anchors invalid.
3. **Exact passage preparation.** Resolve to a canonical destination, find an existing verified saved mapping, or show a specific preparation action for the supported route. Do not send a generic ProPresenter Next command: it could advance a song or a fragment of the same verse. Preserve Bible text, translation, themes and Looks. Missing preparation is visible, never reported as successful output.
4. **Confirm workflow first.** Show "Next verse: Hosea 1:2 / KJV" with its anchor and readiness. Require the ordinary explicit confirmation and existing output guard. Keep listening/minimized behavior and no-focus-stealing API dispatch. Clearly identify native preparation's focus/listening limitations.
5. **Optional guarded automatic navigation later.** Keep relative Auto disabled until separate intent, concurrency, readback, preparation and real-host acceptance evidence is available. Any later enablement requires an explicit per-session navigation policy, valid active Bible ownership, complete verified destination, fresh remote preflight, one write in flight and cancellation on new speech. Never inherit permission from merely choosing ordinary Auto. No automatic quoted-passage navigation.

Deliver these as focused implementation PRs with their tests and evidence. This planning request does not itself enable automatic relative output.

## Acceptance scenarios

| ID | Given / When | Required result |
|---|---|---|
| NV-001 | Hosea 1:1 has matching real readback; final "next verse" arrives | Exactly one Hosea 1:2 candidate, same translation, anchor visible; zero output before confirmation |
| NV-002 | The 1:2 cue is verified; operator confirms | One exact-cue trigger; bounded matching readback advances anchor to 1:2 |
| NV-003 | 1:1 is only prepared, simulated, expired or unacknowledged | No implicit live-relative output/context |
| NV-004 | 1:1 is split across multiple cues | Destination is verse 2, never the remaining fragment or next unrelated presentation |
| NV-005 | Current range ends at verse 3 | Next resolves to verse 4; previous resolves before range start |
| NV-006 | Chapter/book boundary or unavailable translation numbering | Verified chapter transition, or actionable review/block; no fabricated bound/substitution |
| NV-007 | Operator/Companion changes output before/during resolution | Context invalidated, pending command canceled before write where observable |
| NV-008 | Duplicate STT revisions, repeats while busy, negation or discussion | No cascading verse advances; ambiguity requires review |
| NV-009 | New reference/correction, Stop, target/profile/translation change, disconnect or owner loss | Stale navigation canceled, no automatic retry |
| NV-010 | Real background listening with ProPresenter foreground | Correct recognition/preparation/confirmation without stealing focus on the HTTP route; separately measure actual latency |
| NV-011 | Current Auto mode receives relative command | Review-only until separately approved and verified navigation policy exists |
| NV-012 | Live current-state read changes after the last preflight | Report residual controller race honestly; uncertain readback pauses/disarms without retry |

Unit/fake-target tests come first, then authorized personal-host KJV single/split-cue/range tests, other installed translations and both platforms. Real microphone/accent, Companion/media coexistence and physical room/stream fidelity remain required field evidence. No test was executed against ProPresenter for this planning request.

## Traceability and evidence

Extends FR-015 (relative context), FR-016 (context invalidation), FR-017 (ambiguity/intent), FR-038 (navigation), FR-048 (recovery) and existing output concurrency/privacy/latency requirements. Original FR/NFR counts remain unchanged. Source inspection and the local text probe support the current-behavior findings. The previously captured installed schema describes current-cue readback and exact-cue trigger routes; endpoint presence is not proof of this entire new workflow. There is no claim of an atomic compare-and-trigger API that eliminates external-controller races.
