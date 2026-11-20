# Reference metadata in diagnostics

FR-011 requires dictionary version information in diagnostics; the original audit found application version alone was exported. Redacted diagnostics now include an explicit dictionary version addressed by the SHA256 of bundled parser source, plus the KJV bounds schema/source/version/license and source hash. CRLF normalization keeps identical Windows/Mac source versions equivalent.

The parser-source hash conservatively includes parser logic as well as canonical book names and tested aliases; it is not presented as an independently extracted dictionary digest. Bounds provenance remains the shipped metadata's source/version, not an assertion about every installed Bible edition. No Bible text, bounds table, local path, host address, reference or transcript is added. The export explanation names the metadata versions before the existing explicit file-save choice.

An isolated synthetic desktop test seeds an actual candidate and source phrase, verifies cancellation invokes no save or write, saves diagnostics through test-only dialogs, compares the exported version objects with the bundled source, and rejects the seeded content, address and unique test-path marker. This accesses no microphone or ProPresenter. Initial476 module tests and source export scenario pass; current-base packaging and Mac verification remain before merge.
