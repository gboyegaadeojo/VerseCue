# Windows native helper source and build parity

Windows packaging must compile the helper from the current checkout rather than silently copy a pre-existing executable. A successful build must also include the helper instead of silently omitting native preparation when the file is absent.

The promoted helper source includes the integration branch's Bible-view opening, exact installed-edition selection, scoped/cached control reads and content-free Save As timing boundaries. Existing process/path, focus/hit-test, reference/edition, clipping, cancellation and deadline rules remain. No output command, formatting repair or new platform capability is added.

## Build behavior

Every Windows x64 package invokes the existing Framework compiler. Compilation failure or source changes during compilation stop packaging. The compiler script writes a receipt containing only fixed build identity fields and source/helper SHA256 values. Packaging verifies both hashes against the current source and produced helper before copying the helper and receipt into the distribution manifest. The isolated review builder stages C# source and compiles there; it no longer imports a workspace binary as if it proved source consistency.

The receipt detects stale or replaced artifacts. It is a local build record, not a publisher signature, notarization, trusted attestation or proof of safe runtime behavior. It contains no ProPresenter address, reference, transcript, user path or personal-host test result. Mac packaging remains separate; this does not add a Mac native route.

## Verification

Four tests cover valid identities, stale source, replaced binary, malformed/foreign metadata, missing receipts and invalid inputs without echoing raw values. Local Windows compilation, all420 combined module tests and syntax checks pass. Fresh package verification is recorded when complete; no actual ProPresenter, microphone, physical-output, latency or field pass is claimed by these build checks. Native runtime acceptance remains separately required.
