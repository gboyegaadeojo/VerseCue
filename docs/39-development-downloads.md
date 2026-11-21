# Development downloads and native Mac build

Current download links are maintained in the [README](../README.md). Windows and Apple Silicon 0.6.0 packages (2026-11-21, Auto-first Route build) are the current published development builds; 0.5.5 and earlier remain on the releases page. Historical notes below: the earlier private-runner rejection below is historical and was resolved by explicit public-repository authorization. Version 0.5.8 Windows is built and verified; matching Mac run 44314557897 is queued, not yet published.

2026-11-18. User requested a readable README and downloadable Windows/Mac applications. Current application version0.5.1 already includes merged PRs #2-4. Merging those PRs does not invalidate the matching packaged application. These distribution/documentation changes do not change runtime application contents or silently update downloaded applications.

## Windows

The verified Windows x64 ZIP and SHA256 sidecar are published as a private GitHub prerelease tagged v0.5.1. Users need repository access and must extract the whole ZIP. Original SHA256:44ad81069d404692f077c43fa140414d648a155d5d508f4dadc1ba204e73a224. It includes the reviewed CPU-only recognizer/model; it is unsigned and development-only. The original124-file manifest and packaged test evidence remain valid. Git checkout CRLF normalization does not change the normalized application content.

## Mac

A native Apple Silicon build process is prepared in `.github/workflows/macos-development.yml` and `scripts/package-macos.cjs`. The workflow is manual-only: no push, PR or tag event starts a runner. It uses a standard macos-15 Apple Silicon runner with a20minute timeout, read-only repository permission and pinned official action revisions. It never changes billing, repository visibility, certificates, OS settings or ProPresenter output.

The build compiles pinned whisper.cpp commit d1be6fde11ac6e0407606b4e42fe72d34add8037 (b5454), CPU-only/static with Metal/BLAS disabled; downloads base.en and verifies the previously reviewed SHA256; packages the pinned Electron runtime, adds the native speech files/notices and applies a local ad-hoc signature. It verifies codesign, preserves framework symlinks, records hashes and creates a ZIP/checksum. A packaged workspace smoke test must pass before artifact upload. Artifact retention is one day. Signing with an Apple Developer ID, notarization, actual MOTU capture and ProPresenter/Mac output compatibility remain separate pending acceptance.

**No Mac binary has been built or published yet.** Automatic approval review rejected starting the hosted build because a private-repository macOS runner may consume paid minutes and the user requires free use. Billing visibility was unavailable with existing credentials; no broader credential scope was requested. Do not dispatch the workflow without explicit approval for potentially chargeable runner usage or proof of a free authorized execution environment. The same build can run on an authorized local Apple Silicon Mac without buying a hosted runner; speech inputs must first be built/staged using the exact pinned commands in the workflow.

The README links to release status for Mac rather than inventing a nonexistent downloadable asset. Once an authorized native build succeeds, download and verify its artifact, publish the Mac ZIP/checksum on v0.5.1, and replace the status link with the actual asset URL. Native CI launch is not service acceptance.

## Documentation and first-use guidance

README now leads with the product purpose, screenshot, downloads, capabilities, simple workflow, mode explanations, five-minute typed/voice dry-run test, privacy, current limits and developer instructions. The full ordered00-17 document index remains present; original chronological README notes were preserved in DEVELOPMENT_HISTORY.md with an explicit historical label. No required deliverable or test corpus was removed.

Primary packaging sources: [Electron distribution](https://github.com/electron/electron/blob/main/docs/tutorial/application-distribution.md), [Electron signing](https://www.electronjs.org/docs/latest/tutorial/code-signing), [official runner architecture/reference](https://docs.github.com/en/actions/reference/runners/github-hosted-runners). Checked2026-11-18. A native runner is needed for reliable Mac signing and execution checks; a Windows EXE is not a Mac app.
