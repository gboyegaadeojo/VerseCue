# THROWAWAY DIAGNOSTIC — NOT PRODUCTION CODE
# Personal authorized test host only. Read-only allowlist; no retries or output commands.
[CmdletBinding()]
param(
    [ValidateSet('127.0.0.1','localhost')][string]$TargetHost = '127.0.0.1',
    [ValidateRange(1,65535)][int]$Port = 1025,
    [ValidateSet('/version','/v1/libraries','/v1/looks','/v1/macros','/v1/presentation/active','/v1/presentation/slide_index','/v1/status/slide','/v1/status/layers','/v1/status/screens','/v1/themes')]
    [string]$Path = '/version'
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Net.Http
$handler = [System.Net.Http.HttpClientHandler]::new()
$handler.AllowAutoRedirect = $false
$client = [System.Net.Http.HttpClient]::new($handler)
$client.Timeout = [TimeSpan]::FromSeconds(3)
try {
    $timer = [Diagnostics.Stopwatch]::StartNew()
    $response = $client.GetAsync("http://${TargetHost}:${Port}${Path}").GetAwaiter().GetResult()
    $body = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
    $timer.Stop()
    [pscustomobject]@{ path=$Path; status=[int]$response.StatusCode; elapsed_ms=$timer.ElapsedMilliseconds } | ConvertTo-Json -Compress
    if (-not $response.IsSuccessStatusCode) { throw "Read-only probe rejected: HTTP $([int]$response.StatusCode)" }
    $data = $body | ConvertFrom-Json
    if ($Path -eq '/version') {
        $data | Select-Object platform,os_version,host_description,api_version | ConvertTo-Json -Depth 5
    } elseif ($Path -eq '/v1/status/slide') {
        # Avoid persisting or printing licensed verse text/notes.
        [pscustomobject]@{current_uuid=$data.current.uuid; current_text_length=([string]$data.current.text).Length; next_uuid=$data.next.uuid} | ConvertTo-Json
    } else {
        $data | ConvertTo-Json -Depth 25
    }
} finally {
    $client.Dispose()
    $handler.Dispose()
}
