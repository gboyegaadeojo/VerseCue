# Exact Save As popup lookup candidate

This Windows helper candidate avoids a full descendant search only when the complete expected Save As popup profile is present. It is not a new output route or an extension of the preparation deadline.

The process-scoped window inventory must contain exactly one window whose handle is the current ProPresenter main window. That window must have exactly one visible enabled child Window belonging to the same process, with exactly one visible child Menu and exactly three visible same-process MenuItems in the expected order: Save As Presentation, Copy to Selected Presentation and Save to Playlist. Save As Presentation must be enabled. Names and capability fields are cached within that bounded read.

Different, missing or ambiguous topology uses the existing broad search and its ambiguity checks. The existing verified Save As button hit test, current foreground process, unchanged reference/edition and invokable-command checks remain before the one copy action. It does not select another command, extend a timeout, change formatting or trigger output. Provider errors still fail closed.

Two content-free allowlisted stage names distinguish profile matching from broad fallback. The existing timing privacy/bounds test covers them. The bounded acceptance harness adds an explicit popup-profile case with a different fixed reference and a separate attempt reservation; it requires the profile-matched stage rather than inferring use from successful copying. It never retries the baseline case automatically. All personal-host result files stay private unless separately authorized for publication.

Windows compilation,420 module tests and syntax checks pass. Matching package/CI and actual native validation remain required before this experimental candidate can be treated as verified. No hardware timing, appearance, arbitrary Auto, Mac/native/LAN or full-service pass is claimed here.

Build verification update:38c2925 passed420 module tests/syntax, source-compiled147-file Windows packaging/receipt checks and standard Mac44635751140. New personal-host outcomes are not published here. The harness records a minimization request, not continuous/final window-state proof. Product source is unchanged by this reporting-label correction. No full latency/appearance/platform/service acceptance follows.

The final630c396 Mac run44637601238 failed a synthetic Continue click after takeover. A controlled reproduction confirmed that the old click times out once the background safety monitor hides Continue. The corrected test waits for the ownership-loss event, requires the button hidden and explicitly rejects a stale continuation token without another fake trigger. Windows source/package checks pass; final Mac verification follows. The earlier failure remains recorded. This changes test timing, not product output policy.
