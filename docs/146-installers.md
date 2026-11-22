# 146 - Installers (NR-023)

Date: 2026-11-22. Requirements: FR-060 and NFR-014/018 (installation, identification and removal). Code signing and notarization are still pending.

## Windows: VerseCue-Setup-&lt;version&gt;.exe

Built by `node scripts/package.cjs --zip --installer`: the packaged ZIP is embedded in `native/windows/Setup.cs`, compiled with the .NET Framework compiler included in Windows. No new dependency. The installer carries the VerseCue icon and version.

- **Current user only, no administrator rights:**
  - installs to `%LOCALAPPDATA%\Programs\VerseCue`;
  - adds Start-menu and desktop shortcuts;
  - adds a Settings > Apps entry (`HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\VerseCue`).
  - Nothing outside the user's profile changes, and no security settings change.
- **Safe replacement:** files unpack into `VerseCue.new` beside the target, which is then swapped in, so a failed install never leaves half a copy. Entries that would unpack outside the folder are refused.
- **VerseCue already open:** the installer asks the operator to close it and never closes it itself.
- **Uninstall** (`native/windows/Uninstall.cs`, shipped as `Uninstall VerseCue.exe` in every Windows package):
  - removes the program folder, both shortcuts and the Apps entry. It removes the Apps entry only when that entry points to this folder.
  - asks before removing settings (`%APPDATA%\VerseCue`) and keeps them by default.
  - runs from a temporary copy that waits for the first process to exit, then deletes itself.
- **Test options:** `--silent`, `--target <folder>`, and `--no-register` (installer only).

Verified on Windows 11, 2026-11-22:

- Silent install to a test folder: 166 files in 6 s, with no leftover `.new`/`.old` folders.
- The packaged workspace scenario passed against the installed copy.
- Reinstalling over it replaced the folder: a stale file was removed.
- Uninstall removed the folder and its temporary copy and kept settings.
- Full registration path:
  - The Apps entry read "VerseCue 0.6.5", about 370 MB.
  - The Start-menu shortcut pointed at the installed `VerseCue.exe`, and the desktop shortcut was created.
  - Uninstall removed the folder, both shortcuts and the Apps entry, and kept settings.

## Mac: VerseCue-&lt;version&gt;-darwin-&lt;arch&gt;.dmg

`scripts/package-macos.cjs` copies the same ad-hoc-signed `VerseCue.app` as the ZIP into a staging folder beside an `Applications` link. It creates a compressed disk image with `hdiutil` and checks it with `hdiutil verify`. Mac CI uploads the disk image and its `.sha256` with the ZIP.

## Not yet

- Code signing: Windows SmartScreen and macOS Gatekeeper still warn.
- Automatic updates.
