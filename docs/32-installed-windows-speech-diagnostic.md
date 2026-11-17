# Installed Windows desktop speech diagnostic

2026-11-17. Windows-only throwaway comparison; no application backend/default was changed. No microphone was opened, no Windows feature/profile/privacy setting was changed, and no cloud recognizer or purchase was used.

## Method and actual availability

The personal computer reported Microsoft Speech Recognizer8.0 for Windows, en-US (MS-1033-80-DESK). A small compiled .NET System.Speech diagnostic created an in-process engine using that installed recognizer, loaded DictationGrammar, and fed only existing WAV files through SetInputToWaveFile. RecognizeAsync(Multiple) completed against each finite file. A20second internal wait and25second parent deadline bounded each run. Scores were retained privately as engine scores, never calibrated correctness probabilities.

The first restricted-process runs failed during engine construction with ArgumentException/HRESULT-2147024809, before reading audio. Selecting the installed RecognizerInfo explicitly did not resolve that restricted run. Running the same WAV-only probe in the authorized ordinary local process environment succeeded. This is an environment-specific observation, not proof that every user machine has a usable recognizer or that the application should request elevated privileges. Production would need normal-user clean-machine testing; no elevation requirement or security-setting workaround is introduced into VerseCue.

## Successful ordinary-process results

| Existing private window |Elapsed request|Recognized phrases|Parser reference proposals|
|---|---:|---:|---:|
|REAL-PILOT-001-6|4,708ms|1|0|
|REAL-PILOT-001-12|7,387ms|2|0|
|REAL-PILOT-002-12|11,161ms|1|0|
|REAL-PILOT-004-14|3,756ms|3|0|

All four produced text. None yielded a reference proposal when its phrases were passed through the current deterministic parser. Expected labels remain independently unverified, so these observations are not precision/recall/word-error metrics. The result does not support replacing the tested local Whisper backend. It also does not rule out a separately evaluated constrained grammar, different installed engine, training profile or OS-specific approach. Request durations do not measure live audible-end output latency.

## Reproduction and privacy

`node poc/build-windows-speech-probe.cjs` compiles the existing local .NET assemblies into ignored poc/private/tools. `node poc/compare-windows-speech.cjs` processes the four existing authorized private WAVs, keeping raw text/scores/stderr under ignored recordings/windows-speech-private. [Content-free measurements](evidence/windows-speech-diagnostic.json) contain timing/counts/hashes only. No recognized sermon text, recording, model, engine binary or Windows assembly is published or bundled. Scripts never call SetInputToDefaultAudioDevice or change recognizer/system settings.

Microsoft primary API sources were reviewed: [SetInputToWaveFile](https://learn.microsoft.com/en-us/dotnet/api/system.speech.recognition.speechrecognitionengine.setinputtowavefile?view=netframework-4.8.1) configures WAV input; [DictationGrammar](https://learn.microsoft.com/en-us/dotnet/api/system.speech.recognition.dictationgrammar?view=netframework-4.8.1) describes the installed desktop dictation language model. Actual installed availability/results are the scoped local evidence above, not a cross-platform or future-version promise. Source register SRC-65 records the access date and limits.

Original STT comparison/quality/latency/cross-platform requirements remain unchanged. P0, Mac, real audio hardware, exact Bible output and release acceptance remain pending.
