# Trusted update signing keys

VerseCue builds trust the Ed25519 public keys in this folder (`*.pub.pem`) when checking a downloaded release (Setup > Advanced > Check a downloaded update). The folder is intentionally empty until IFC creates its own key.

1. On an offline or trusted computer, outside this repository: `node scripts/generate-update-key.cjs <private folder> ifc-release-2026`.
2. Keep the `.private.pem` file offline and backed up. Never commit it.
3. Copy only `ifc-release-2026.pub.pem` into this folder and build.
4. Sign each release archive: `node scripts/sign-release.cjs <release.zip> <private key> <version>`, and publish the `.sig.json` beside the ZIP.

This proves a release came from the holder of IFC's key and was not changed. It is not Windows code signing or Apple notarization, which need paid certificates and remain open (NFR-014).
