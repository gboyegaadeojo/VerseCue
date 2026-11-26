# Overnight full test pass, VerseCue 0.6.3 (main 97b331d)

2026-11-22. The user asked: "test every single thing in the application to ensure they work as usual for both Mac and Windows".

| Area | Platform | Result |
| --- | --- | --- |
| Module tests (`npm test`) | Windows | 609 / 609 pass |
| Syntax, dependency inventory and SBOM (`npm run check`) | Windows | Pass |
| Every desktop scenario, from source (47 scripts) | Windows | 47 / 47 pass |
| Every desktop scenario, packaged 0.6.3 app (47 scripts) | Windows | 47 / 47 pass |
| Diagnostic checks (module tests, check, scenarios) | Windows, Apple silicon Mac, Intel Mac (CI run 44982209533) | Pass on all three |
| Native Mac build, signing, packaged workspace check | Apple silicon and Intel (CI run 44982204657) | Pass on both |
| Packaged speech with a real recording, per-phrase engine | Windows (Vulkan engine) | Pass, 12.9 s |
| Packaged speech with a real recording, model kept loaded | Windows | Pass, 26.9 s including model load |
| Local speech integration (bundled engine and model, private recording) | Windows | Pass |
| Resident speech scenario | Windows | Pass |
| Live, personal ProPresenter 21.4.2, Audience and Stage off throughout | Windows | Dry-run Auto detection (Romans 8:28) simulated with the slide unchanged; real Auto send of the saved Nahum 1:7 test cue confirmed by ProPresenter readback 2.7 s after the phrase, including the 1 s hold |

Not run live tonight:
- **Screen-reading Bible helper (Prepare for volunteer, whole chapter, version switching):** ProPresenter was in the slowed accessibility state described in docs/140. The helper's scenarios passed against synthetic targets. Live runs on a freshly restarted ProPresenter earlier the same night prepared Psalm 23 in 14 s, and in 41 s on a slowed one.
- **Mac on a real ProPresenter:** no Mac with ProPresenter is available here. The Mac helper waits for the user's inspection file.
