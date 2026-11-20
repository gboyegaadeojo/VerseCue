# Batched initial native window readiness

## Change and safety boundary

Bind the one verified ProPresenter main-window handle with an Element-scoped Raw-view CacheRequest containing IsEnabled, IsOffscreen, ProcessId and NativeWindowHandle. Require enabled, on-screen readiness and exact process/handle identity from that one snapshot. Full AutomationElement mode remains the default, so subsequent focus, reference, edition, generated-slide, Save As and Invoke checks still use their existing live queries. No cached root values authorize a later click or replace a later passage check.

This replaces separate initial Current readiness reads with a single retrieval-time property request. It does not keep a cache across requests, reuse another process, retry input, relax the native deadline, change clipping/formatting or send output. Compilation cannot prove provider compatibility or a speedup; runtime verification is required before merge.

## Source and measurement

Microsoft documents batching UI Automation property retrieval and activation scoped to the current thread in [Caching in UI Automation Clients](https://learn.microsoft.com/en-us/dotnet/framework/ui-automation/caching-in-ui-automation-clients) and [CacheRequest.Activate](https://learn.microsoft.com/en-us/dotnet/api/system.windows.automation.cacherequest.activate). Accessed 2026-11-20. Verified vendor guidance supports the mechanism, not a measured ProPresenter performance guarantee.

Compare a separately reserved preparation-only test through a current-source review build, retaining independent disabled-screen checks, output/Look/playlist identity, no microphone and at most one new copy. Personal results remain private pending publication permission. Different references, slide counts, cache warmth and shared-host load prevent a single run from establishing p50/p95 or audible-end latency. Existing clipping warnings remain blocking.
