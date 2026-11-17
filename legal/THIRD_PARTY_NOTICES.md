# Third-party software and content

VerseCue distributes no Bible text or paid translation database. Bible text and presentation assets remain in the user's licensed ProPresenter installation.

Electron is distributed under the MIT license and contains Chromium, Node.js and their notices. Preserve the runtime's LICENSE and LICENSES.chromium.html in packaged output. Exact dependency versions and integrity hashes are recorded in package-lock.json. Playwright is a development test dependency and is not included in the desktop package. Packaging uses Electron's documented manual distribution layout without a third-party packaging framework.

Source checkouts do not contain whisper.cpp or model binaries. The optional Windows `--with-local-speech` development package includes only the previously verified official b5454 archive's CLI/shared libraries and base.en GGML model, checked against the recorded SHA256 values before copying. It preserves the upstream notices in WHISPER-LICENSE.txt and WHISPER-MODEL-LICENSE.txt. Native Mac speech assets remain separately required and unverified. No cloud recognizer is included. Sources and local pilot are recorded in RESEARCH_SOURCES.md.

No fonts, artwork, cloud SDKs or third-party Bible datasets are included in the application source. Interface uses platform fonts.
