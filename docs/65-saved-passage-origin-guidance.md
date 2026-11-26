# Explain the origin evidence for a saved passage

2026-11-19 UTC. PR22 / RF-06 and RF-09. Origin guidance does not grant output permission or prove licensed text or physical appearance.

Normal review now distinguishes three cases:

- **ProPresenter Bible copy prepared now:** the current native save transaction returned complete metadata, and the coordinator re-resolved the exact new UUID/fingerprint.
- **Recorded ProPresenter Bible copy:** a verified local managed-copy entry matches the current target, UUID and fingerprint, including after restart.
- **Existing saved presentation, Bible origin unverified:** saved title/edition/cue metadata match, but no matching native-save receipt is recorded locally. The operator must check the complete text in ProPresenter.

Ordinary templates remain excluded by exact reference/edition/coverage checks. Matching labels alone cannot establish Bible origin; presentation-supplied fields cannot set the trusted classification. A changed fingerprint or different target loses the recorded classification. Earlier untracked copies are not retrospectively labelled as app-created. Local accounting is not cryptographically signed vendor attestation or a security barrier against a person editing app data.

All three cases retain `bibleTextVerified=false` and `formattingVerified=false`. The normal appearance/translation/authorized-target acknowledgments, clipping block, Stop/context/target guards and no-retry output policy remain unchanged. This guidance neither approves Auto nor creates an alternate Bible/presentation engine.

387 module tests and syntax checks pass. Boundary tests cover untrusted presentation properties, exact target/fingerprint receipt matching and fresh native receipts. Actual source desktop tests against synthetic targets cover the unverified-existing-copy label and200% fit, current native-copy recovery, and recorded-origin display after app restart. No actual microphone, ProPresenter, physical fidelity or new release acceptance is inferred from these tests.

One synthetic accounting completion previously failed with an unclassified filesystem error; readiness was withheld and no output/retry occurred. It did not reproduce in four fresh subsequent accounting/restart runs. Its root cause remains unresolved. Accounting now exposes only allowlisted filesystem error codes, never raw paths or text. A real filesystem replacement-failure unit test proves the prior reservation remains and native readiness is blocked. This is improved diagnosis and safe failure behavior, not a claim that intermittent storage failure is eliminated.
