# Background listening and quoted Scripture

2026-11-18 UTC. New requests NR-001/NR-002 in [NEW_REQUESTS.md](../NEW_REQUESTS.md); development0.3.0. Original requirements, P0 and release gates remain in force. Implementation is on a feature branch for review, not automatically merged.

## Minimized operation

VerseCue windows disable Chromium background throttling. An explicitly authorized capture lease holds Electron's prevent-app-suspension blocker until stop, owner loss or application exit; it does not keep the display awake or change permanent OS power settings. Minimize does not stop capture. No recognition/candidate/send operation restores or activates VerseCue. Closing/reloading the owning window still stops capture, revokes the private API and pauses the session. Startup/resume never opens a microphone automatically.

ProPresenter can remain the foreground application. The existing API connector operates in the main process. The experimental native preparation helper still enters a reference inside ProPresenter's own Bible interface and can change focus there. It is not an invisible arbitrary-passage API. Confirm mode and the currently disabled Auto feature are unchanged: background execution does not by itself authorize unattended output. Locked screens, manual sleep/hibernation, shutdown, permission revocation, actual MOTU drivers and Mac behavior require separate acceptance; this change does not promise operation through those conditions.

## Quoted wording detection

The user requested identifying John3:16 from “For God so loved the world that he gave…” without a spoken citation. The new local matcher supports distinctive partial quotations and a conservative single-word substitution. General semantic paraphrases are not claimed. Explicit references take precedence; a malformed explicit citation does not silently become a quote-derived verse.

Quote matching is off at startup. Importing an index does not enable it. The operator acknowledges rights, imports a JSON passage index, and explicitly checks **Identify quoted wording during this session**. The index lives only in application memory, is not copied into settings/profiles, is not exported in diagnostics, and is cleared by Reset/exit. Its source file remains wherever the operator chose it. There is no bundled/downloaded Bible text, paid translation database, cloud service or LLM dependency.

Example format, using only the user's supplied excerpt (demonstration, not a complete Bible corpus):

```json
{
  "schemaVersion": 1,
  "translation": "KJV",
  "passages": [
    {
      "reference": "John 3:16",
      "text": "For God so loved the world that he gave"
    }
  ]
}
```

Use a local text source whose terms permit this indexing/use; purchasing a ProPresenter translation does not automatically authorize exporting its text. This feature does not scrape or export ProPresenter's licensed databases. A larger index must include single-verse canonical references, one translation matching the selected translation, unique references and bounded text. Limits:16MB selected file,40,000passages,12million text characters,400tokens/8,000characters per passage. The selected index is a matching aid, not the authoritative presentation text. ProPresenter retains the exact installed Bible text/theme/Looks/output.

## Matching and safeguards

The deterministic engine normalizes case/punctuation, uses a nontrivial-word inverted index and compares aligned local word spans. A result needs at least8aligned words,7matches,87.5%word agreement and3distinct informative words. At most one substitution is accepted; insertion/reordering/broad paraphrase support is deferred. Competing passages within a two-point heuristic margin are suppressed, and excessive candidate fan-out is rejected rather than truncated into false uniqueness. These numbers are conservative engineering thresholds, not calibrated probabilities or measured accuracy guarantees.

Short/generic phrases, no-show/denial language, an explicitly different translation and ambiguous matches yield no quote candidate. Matching is suppressed for unauthorized audio, partial recognition, stopped/paused sessions or a missing/mismatched index. A successful quote appears as a review candidate with its matching method, configured translation and confirmation warning. Wording alone does not identify a translation.

Uniqueness is measured only against the imported index. An incomplete index can omit competing passages, so a unique local result is not proof of a unique Bible-wide interpretation. The operator must review the reference and actual ProPresenter text.

The ordinary expiry, generation, mode, stop, duplicate, exact prepared-cue mapping, version/fingerprint and uncertain-receipt gates still apply. Quote candidates cannot be sent through the private API; the desktop operator confirms them. Automatic quote display and general paraphrase recognition remain disabled pending representative intent/accuracy and hardware-in-loop acceptance. No new output engine is introduced.

## Verification and outstanding work

Eleven SYNTHETIC-TEXT matcher/session tests plus a private-API integration case use the user's supplied example to verify exact/partial wording, punctuation/prefix/single substitution, generic/negative/ambiguous rejection, translation boundaries, index rights/validation, explicit-reference precedence, opt-in/stop/reset/expiry behavior and desktop confirmation/private-API blocking. All152regression tests and the source desktop smoke passed. These do not establish preacher/accent accuracy. Existing tests remain intact.

The source minimized integration test imported a temporary example index through the real import handler/dialog flow, enabled matching, observed muted synthetic AudioWorklet messages while minimized, identified John3:16, and explicitly confirmed one send/readback against a fake loopback ProPresenter target. VerseCue stayed minimized; stop released the suspension blocker. No microphone or real ProPresenter output was used. The extended test also runs the existing private12second recording through the real resident worker while minimized; its actual result is recorded when complete. Packaged tests and large-index/held-out accuracy, Mac/MOTU, live output/theme/Looks and Auto acceptance remain separate.

Reproduce with `node scripts/test-background-quotes.cjs [packaged-executable]` after preparing the already authorized ignored speech fixtures. `npm.cmd test` runs the text/module regressions without those private assets. The PR contains no recording, raw transcript, corpus text file, model, private route/token or packaged binary.

## Traceability

NR-001 extends audio continuity/compact operation and lifecycle/resource NFRs. NR-002 implements an opt-in review-first portion of original FR-025 (future quote/paraphrase matching) and its safety/privacy/licensing dependencies; its release timing is advanced by the user's new instruction, not its unattended-display acceptance. All original62FR/24NFR rows remain present. NEW_REQUESTS.md adds acceptance for these two changes without renumbering the baseline.

Extended source test result: the real resident worker returned a nonempty transcript from the authorized12second private recording in3,042ms while minimized. The silent worklet delivered29messages during the initial minimized interval. The quoted example and one explicitly confirmed fake-target readback passed; the window remained minimized and the suspension blocker was released on stop. This single request is not live end-to-output latency or speech/quote accuracy evidence.

Packaged0.3.0 follow-up passed the same minimized import/opt-in/worklet/recognition/quote/confirmed fake-target readback/stop checks. The fixture request took3,033ms, with29silent worklet messages in the initial minimized interval. This is packaged development evidence, not a physical microphone, actual output, Mac or unattended-display acceptance pass.

Review follow-up0.3.1 rejects unsupported requested languages on quote-derived references as well as explicit citations;153regression tests pass. [PR #1](https://github.com/gboyegaadeojo/VerseCue/pull/1) contains the implementation and usage notes. No merge or live-service rollout has been performed.

Final0.3.1 packaged checks passed: minimized worklet29messages, private-file resident request2,896ms/nonempty, user-example John3:16 quote match and one explicit fake-target confirmed readback while still minimized; default CLI fixture request3,189ms; full desktop smoke with no renderer errors/HTTP requests. No physical microphone or real ProPresenter access occurred. Version-bound artifact evidence prevents earlier test reports from certifying a newer package. Archive creation was retried after the test app closed because its runtime snapshot file was locked; no content was changed to bypass the lock.
