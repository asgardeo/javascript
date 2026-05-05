---
"@asgardeo/react": patch
"@asgardeo/vue": patch
---

Fix social signup popup callback handling

When social signup (Google/GitHub) opens a popup for federated authentication, the Callback component now detects the popup context and sends OAuth parameters back to the parent window via postMessage. Also prevents a race condition where both the postMessage handler and the popup URL monitor could double-process the callback.
