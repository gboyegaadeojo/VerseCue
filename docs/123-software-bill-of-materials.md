# Software bill of materials

2026-11-21. Supports NFR-018 (reproducible delivery and SBOM coverage) and NFR-020 (dependency, security and license review).

`legal/sbom.cdx.json` is a CycloneDX 1.5 software bill of materials for VerseCue. `scripts/sbom.cjs` builds it only from the reviewed records already in the repository:

- the npm components, licenses and SHA-512 integrity values in [`legal/dependency-inventory.json`](../legal/dependency-inventory.json), each with a package URL;
- the bundled IBM Plex Sans font files and their SHA-256 hashes from [`legal/font-inventory.json`](../legal/font-inventory.json);
- the pinned whisper.cpp Windows archive and `ggml-base.en` model hashes enforced by `scripts/bundle-local-speech.cjs`.

Development-only npm packages are marked `excluded`, except Electron, whose runtime ships in every packaged build and is marked `required`. The speech archive and model are `optional`, because only Windows builds with local speech include them. The file has no timestamps and a serial number derived from the version and lockfile hash, so rebuilding it gives the same bytes.

`npm.cmd run check` now fails if the committed SBOM does not match the inventories. After a dependency, font or speech change, update the inventories as before and run `node scripts/sbom.cjs --write`.

## Verification

| Check | Result |
| --- | --- |
| `tests/sbom.test.cjs`: matches inventories; deterministic; CycloneDX 1.5; Electron required; model and font hashes present; package URLs well formed; no timestamps | Pass |
| `npm.cmd test`, `npm.cmd run check` | 585/585 pass; check passes |

## Not established

An SBOM lists components; it is not a vulnerability scan, a license clearance or an independent security review. Those remain open under NFR-020. Electron's own bundled Chromium components are covered by its shipped `LICENSES.chromium.html`, not itemized here.
