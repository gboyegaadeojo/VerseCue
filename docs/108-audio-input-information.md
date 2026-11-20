# Selected input information and startup validation

2026-11-20. FR-001/002/003/005/007/008 follow-up. Synthetic evidence only; real interface and OS permission acceptance remain pending.

Audio settings now show the active selected channel and the browser track's reported channel count, sample rate, sample size and available ranges. Missing, invalid or unsupported values remain unknown. These are capture-track properties, not proof of physical interface channels; the page distinguishes them from16 kHz mono recognition conversion. Raw device identifiers are not included in the displayed information or persisted by this feature.

Startup validates the saved zero-based channel0–7 before requesting capture. If the returned track reports another device ID, or its reported channel count excludes the selected channel, all returned tracks stop before AudioContext/worklet creation. No default input is substituted. Unsupported metadata does not invent a reason to reject; the existing worklet still blocks an unavailable selected channel. Cancellation during permission acquisition cannot publish stale input information. Stop, reset and selection changes clear transient information. Metadata is published only after processing setup succeeds.

Denied permissions produce platform-specific guidance; unavailable/busy inputs have actionable messages. VerseCue never changes OS settings or automatically retries. Refresh retains the existing explicit permission request for device labels; it does not scan every device or begin recognition. Permission guidance is advisory, and must be verified on claimed OS versions.

Seven focused synthetic module groups cover sanitized metadata/ranges, unavailable channels before processing, device mismatch without fallback, invalid selection before permission, unknown/throwing metadata, cancellation and platform error guidance. The synthetic desktop test starts the real renderer capture controller with fake browser tracks, checks visible values, selection clearing, unavailable-channel feedback, denial guidance and640/900/1280 layout. No real microphone or ProPresenter is accessed. Full source/package/Mac verification is recorded separately before merge.

## Sources and limitations

- [W3C Media Capture and Streams](https://www.w3.org/TR/mediacapture-streams/), accessed2026-11-20: track settings and capability ranges are browser-reported properties; optional metadata cannot establish hardware fidelity.
- [Microsoft microphone permissions](https://support.microsoft.com/en-us/windows/privacy/turn-on-app-permissions-for-your-microphone-in-windows), accessed2026-11-20: Windows microphone and desktop app access guidance.
- [Apple microphone access](https://support.apple.com/en-tj/guide/mac-help/mchla1b1e1fe/mac), accessed2026-11-20: Privacy & Security microphone access guidance.

MOTU M4 channel mapping, format conversion, hardware unplug/replug and actual permission revocation remain real-hardware acceptance. This component does not establish native macOS ProPresenter support, speech accuracy, latency, physical output or service readiness.
