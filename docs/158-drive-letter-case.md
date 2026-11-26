# VerseCue refused its own window when started from "c:\"

2026-11-26. Found while releasing 0.6.12.

## What happened

The packaged scenario sweep failed in 52 of 57 tests. Every one of them stopped at the first request to the app, with "Untrusted caller". The same tests passed when run on their own. The difference was the path the sweep used to start VerseCue: it began with a lowercase `c:\`, while the passing runs used `C:\`.

VerseCue accepts requests (settings, listening, output) only from its own page, and grants the microphone only to that page. It checked this by comparing the page's address with the expected address, letter for letter. The expected address came from the folder VerseCue was started from (`file:///c:/...`). Chromium always writes the drive letter in capitals (`file:///C:/...`), so the two never matched and VerseCue refused its own window.

The installer's shortcuts and Explorer use `C:`, so ordinary use was not affected. A command line, script or hand-made shortcut that wrote `c:` would have left VerseCue unable to listen. This has been the case since the check was added. Released versions up to 0.6.11 have it.

## Fix

`core/local-page.cjs` compares the file location rather than the text of the address. On Windows the comparison ignores letter case, as Windows file names do. On macOS and Linux it stays exact. It still refuses:

- any other page;
- another drive;
- a network share;
- a `#` fragment;
- any non-file address.

`desktop/main.cjs` uses it in the three places that checked the address: the request check and the two microphone permission checks.

## Verification

| Check | Result |
| --- | --- |
| `tests/local-page.test.cjs`: drive and folder case on Windows; refused pages, drives, hosts, fragments, schemes and malformed input; exact match on macOS | 3/3 pass |
| `scripts/test-drive-letter-case.cjs`: starts VerseCue from a lowercase drive path, then reads settings and starts listening (Windows only) | Fails on the earlier 0.6.12 build ("Untrusted caller"); passes with the fix, from source and packaged |
