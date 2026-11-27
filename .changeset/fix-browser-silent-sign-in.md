---
'@asgardeo/javascript': patch
'@asgardeo/browser': patch
'@asgardeo/react': patch
---

Fix `signInSilently()` never completing: keep the silent sign-in marker in the `state` parameter when an instance ID is
set, and hand the authorization code from the silent sign-in iframe back to the parent window instead of redeeming it
inside the iframe. Scheduling the automatic token refresh now replaces an existing timer instead of adding another, and
the React provider schedules it for a session another tab signed in to.
