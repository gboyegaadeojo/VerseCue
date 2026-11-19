# Bounded native-preparation acceptance harness

This opt-in Windows harness exercises one fixed short KJV reference through the normal detected-reference preparation setting in an explicitly supplied review-package executable. It does not constitute a completed hardware acceptance test.

```powershell
node scripts/hil-short-native-passage.cjs --authorized-personal-host --package="C:\path\to\verified-review-build\VerseCue.exe"
```

Use only an authorized personal ProPresenter21.4.2 Windows test host with Audience and Stage independently disabled. The harness checks the intended Look/playlist, rejects an existing saved test passage, reserves an exclusive private attempt record and opens an isolated VerseCue profile. Computer Use must inspect and activate Review reference; the script does not start the native action automatically. It checks both disabled-screen states during preparation and verifies that no output, Look or playlist change occurred. It never confirms output, captures microphone input, repairs formatting or deletes a copy.

An existing attempt record blocks repetition, including after interruption. Inspect any failed/uncertain attempt instead of deleting its record to retry. An actual clipping warning remains blocking; neither this test nor a successful preparation receipt approves output.

Results and attempt reservations are written only below Git-ignored poc/private. They can contain personal-host test metadata and must not be published without the user's explicit authorization. This code-only deliverable contains no newly collected host results or hardware pass claim. Syntax validation alone does not prove native feasibility, latency, appearance or physical/service acceptance.
