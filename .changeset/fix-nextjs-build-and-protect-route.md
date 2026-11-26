---
'@asgardeo/nextjs': patch
---

Fix `next build` failing with "Failed to initialize Asgardeo client: Dynamic server usage" by letting Next.js handle its
own control-flow errors in `AsgardeoProvider`, and make `await asgardeo.protectRoute()` redirect signed-out users even
when the middleware handler does not return its result. Support Next.js 16 Cache Components by rendering the server
provider inside a Suspense boundary and at request time only, and only mark the client as initialized once
initialization has finished.
