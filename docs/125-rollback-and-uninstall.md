# Rolling back and removing a VerseCue build

2026-11-21. Operating procedure for the portable Windows review builds, toward FR-060 v1 (rollback) and NFR-014 (uninstall cleanliness). It is a manual procedure, not an automatic updater or installer, and it has not been exercised on a church computer.

## Where things live

| Item | Location | Removed by deleting the app folder? |
| --- | --- | --- |
| The application | The folder you extracted, for example `VerseCue-0.6.0-win32-x64` | Yes |
| Settings, two setting backups, saved profiles | `%APPDATA%\VerseCue\` (`settings.json`, `settings.json.backup`, `settings.json.backup2`, `profiles.json`) | No |
| Temporary speech files during recognition | `%APPDATA%\VerseCue\speech-scratch\` (removed after each window and at startup) | No |
| ProPresenter libraries, Bible copies, themes and Looks | Inside ProPresenter | Never touched by removing VerseCue |

VerseCue installs no service, startup entry, driver or system setting.

## Before installing a newer build

1. Do it outside a service: stop listening and return to dry run. The update check refuses to run during a service ([docs/122](122-signed-manual-updates.md)).
2. Verify the downloaded release with **Setup > Advanced > Check a downloaded update** once IFC has a signing key.
3. Keep the previous extracted folder; do not overwrite it. Extract the new build to a new folder next to it.
4. Optionally copy `%APPDATA%\VerseCue\` somewhere safe. VerseCue also keeps two automatic setting backups.

## Rolling back

1. Close the newer VerseCue.
2. Start `VerseCue.exe` from the previous folder you kept.
3. The previous build reads the same settings. It ignores fields it does not know (for example the start-in-Auto preference and hold window added in [docs/116](116-start-in-auto-and-hold.md)), so it opens safely, in dry run and with output disarmed. If you save settings in the older build, those newer fields are dropped, and the newer build uses its defaults (start in Auto, 1-second hold) when you return to it.
4. If the settings do not load, VerseCue starts with safe defaults and shows the recovery notice. Use **Settings > Profiles > Recover a saved setup** to review and restore a backup.

Rollback never restores ProPresenter output, cue mappings or Auto approvals; those are per session by design.

## Removing VerseCue

1. Close VerseCue.
2. Delete the extracted application folder.
3. To remove your settings and profiles as well, delete `%APPDATA%\VerseCue\`. This is your choice; leaving it keeps your setup for a later reinstall.
4. Nothing needs to be removed from ProPresenter. Any Bible copies you chose to save in ProPresenter during testing stay there under ProPresenter's control, as with any presentation you create.

## Not established

There is no automatic rollback after a failed install, no signed update channel and no Windows installer. Uninstall cleanliness has been reviewed from the code paths above, not by a clean-host inspection. These remain open under FR-060 v1 and NFR-014.
