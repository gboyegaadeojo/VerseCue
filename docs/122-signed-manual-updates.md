# Signed manual updates with a service lock

2026-11-21. Implements the MVP part of FR-060 ("enforce in-service update lock; MVP manual signed updates") and part of NFR-014 (an unsigned or tampered package is rejected). Windows code signing, Apple notarization, an automatic update channel and rollback remain open; they need paid certificates or later work and are not claimed here.

## How it works

- **IFC's own key.** `scripts/generate-update-key.cjs` creates an Ed25519 key pair in a folder outside the repository (it refuses to write inside it). The private key stays offline. Only the public `*.pub.pem` file is copied into [`legal/update-keys/`](../legal/update-keys/README.md), which ships with each build. The repository ships with **no** trusted key, so nothing can be verified until IFC adds one.
- **Signing a release.** `scripts/sign-release.cjs <release.zip> <private key> <version>` writes `<release.zip>.sig.json`: a small manifest (product, file name, version, size, SHA-256) and an Ed25519 signature over it.
- **Checking in the app.** Setup > Advanced > **Check a downloaded update** picks a ZIP and reads the `.sig.json` beside it. VerseCue reports one of:
  - **Verified:** the release name, version and signing key, and whether it is newer than the running version. It then says to install it after the service; nothing is installed.
  - **Not verified:** with the reason (no trusted key, unknown key, invalid signature, different product, renamed file, or the file changed after signing).
- **Service lock.** The check is refused while audio is being captured or while output is armed (not dry run): "Update checks wait until the service ends: stop listening and return to dry run." With no trusted key, no file dialog opens.

VerseCue has no automatic updater and never downloads or installs anything. Settings are kept by the normal settings file when a newer build is installed manually.

## Verification

| Check | Result |
| --- | --- |
| `tests/update-verify.test.cjs` (throwaway keys): valid and newer; untrusted key; no keys; forged manifest; bad signature; wrong product; unknown fields; malformed file; renamed file; one changed byte; key loading filters; generator refuses the repository; generator plus signer round trip | 4/4 pass |
| `scripts/test-update-check.cjs` (source): refused while listening; "no trusted key" result and UI message; no dialog without a key | Pass |
| One-off source check with a throwaway key placed temporarily in `legal/update-keys`: a signed ZIP verified as newer; the same ZIP with one changed byte was rejected; the key was removed and not committed | Pass |
| `npm.cmd test`, `npm.cmd run check`, source scenario sweep | 584/584; check passes; all scenarios pass |

## Not established

An Ed25519 release signature proves origin and integrity to VerseCue itself. It does not stop Windows SmartScreen or macOS Gatekeeper warnings, which need Authenticode signing and notarization (paid, not authorized). Rollback, uninstall cleanliness and a signed update channel remain open under FR-060 v1 and NFR-014.
