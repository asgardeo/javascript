---
'@asgardeo/nextjs': patch
---

Organization switching, the current organization and the ID-token fallback of the user profile no longer depend on the in-memory session of the underlying Node client, which is empty after a server restart, on another serverless instance, or after the middleware refreshed the tokens in the Edge runtime. The claims of the ID token are now kept in the session cookie (single-use protocol claims such as `at_hash` and `nonce` are dropped), `getDecodedIdToken()` reads them from there, and the `organization_switch` exchange uses the access token from the cookie.
