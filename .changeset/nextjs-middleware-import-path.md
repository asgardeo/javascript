---
'@asgardeo/nextjs': patch
---

Point the bundled sample, the JSDoc examples and the quick start at `@asgardeo/nextjs/middleware`, the Edge-safe entry point that has exported `asgardeoMiddleware` and `createRouteMatcher` since the token refresh moved into the middleware. The quick start showed a `new AsgardeoNext()` / `asgardeo.middleware()` setup that does not exist, and the sample still imported the middleware from `@asgardeo/nextjs/server`, which no longer exports it. The README now documents the middleware entry point.
