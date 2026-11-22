# Synthetic accuracy-check audio (NR-022): Windows' built-in voices read every prompt in core/data/accuracy-prompts.json
# as 16 kHz mono WAV, plus silence and noise, with labels.json for scripts/evaluate-speech-hints.cjs.
# Synthetic speech shows software behaviour only; it is not evidence of accuracy with real preachers.
param([Parameter(Mandatory=$true)][string]$Out)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Speech
New-Item -ItemType Directory -Force $Out | Out-Null
$data=Get-Content -Raw (Join-Path $PSScriptRoot '..\core\data\accuracy-prompts.json') | ConvertFrom-Json
$voices=(New-Object System.Speech.Synthesis.SpeechSynthesizer).GetInstalledVoices() | Where-Object {$_.Enabled} | ForEach-Object {$_.VoiceInfo.Name}
$format=New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(16000,[System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen,[System.Speech.AudioFormat.AudioChannel]::Mono)
$labels=@();$i=0
foreach($p in @($data.prompts)+@($data.withoutReferences)){
  $i++;$voice=$voices[$i % $voices.Count];$file=('tts-{0:d3}.wav' -f $i)
  $s=New-Object System.Speech.Synthesis.SpeechSynthesizer;$s.SelectVoice($voice);$s.Rate=@(0,1,-1)[$i % 3]
  $s.SetOutputToWaveFile((Join-Path $Out $file),$format);$s.Speak($p.say);$s.Dispose()
  $labels+=[pscustomobject]@{file=$file;say=$p.say;expected=$p.expected;voice=$voice}
}
$labels | ConvertTo-Json -Depth 3 | Set-Content -Encoding utf8 (Join-Path $Out 'labels.json')
"Wrote $($labels.Count) clips with voices: $($voices -join ', ')"
