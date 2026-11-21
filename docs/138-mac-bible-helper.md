# Mac Bible helper (experimental)

2026-11-21. User request: "Build the Mac version of that ProPresenter helper", so the church Mac mini can prepare passages (including the whole chapter at the spoken verse) like the Windows PC.

## What it is

`native/macos/BibleBridge.swift` is a small command-line helper that uses Apple's Accessibility API, the macOS counterpart of Windows UI Automation. It speaks the same one-line JSON protocol as the Windows helper:

- **inspect** (read-only): lists ProPresenter's controls (role, identifier, description, title, placeholder, short values and positions; no long text), plus how many Bible reference fields it recognises.
- **prepare**: finds the one Bible reference field, focuses ProPresenter, types the exact reference, reads it back, confirms it (Return) and waits until matching verse labels appear.
- **prepare-chapter**: the same for a whole chapter, then scrolls the slide grid's scroll bar until the spoken verse is in view.

It never clicks or selects a slide and never triggers output. It refuses to run without macOS Accessibility permission, which only the user can grant in System Settings. VerseCue doesn't change any security setting.

## Why it is off for now

The element names in ProPresenter's Mac interface couldn't be inspected from the Windows test laptop. The Windows helper relies on names verified on a real ProPresenter. So on a Mac, automatic preparation stays unavailable, and the readiness check still says so, until the names are verified.

The next step needs the user's Mac:
1. Open ProPresenter and its Bible view.
2. In VerseCue, go to Settings > Advanced > "Inspect ProPresenter and save the result". macOS will ask to allow VerseCue under Accessibility.
3. Send the saved file.

From that file the helper's field and label matching will be locked to the real names, tested together on the Mac with Audience and Stage off, and then switched on.

## Build and packaging

The macOS workflow compiles the helper with `swiftc` and smoke-tests it (an unknown operation is refused). `scripts/package-macos.cjs` copies it into `VerseCue.app/Contents/Resources/native/` before ad-hoc signing. Windows is unchanged.

## Verification

| Check | Result |
| --- | --- |
| Mac CI: Swift build, refusal smoke test, packaged app | See PR CI |
| `npm test`, `npm run check` | See PR |
| Inspection and preparation on a real Mac with ProPresenter | Pending (needs the user's Mac) |
