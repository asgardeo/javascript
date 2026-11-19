---
'@asgardeo/nuxt': patch
---

Harden server-side configuration resolution in the Nuxt SSR runtime. Config
extraction is centralized into a single `resolveAsgardeoServerConfig()` helper,
and invalid configuration (missing `baseUrl`/`clientId`, or missing
`sessionSecret` in production) now fails fast with a clear error instead of
silently skipping client initialization — which previously surfaced as an opaque
runtime crash on the first sign-in request.
