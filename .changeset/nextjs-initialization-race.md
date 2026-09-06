---
'@asgardeo/nextjs': patch
---

Concurrent requests during a cold start no longer race on a half-initialized client. `AsgardeoNextClient.initialize()` marked the singleton as initialized before its first `await`, so a second request arriving while the first one was still resolving the app origin went on with an uninitialized legacy client and failed with `Cannot read properties of undefined (reading 'getConfigData')`. A failed initialization also left the client permanently "initialized" but unusable. Callers now share the initialization in progress, the client is only marked as initialized once that succeeds, and a failed attempt is retried by the next request.
