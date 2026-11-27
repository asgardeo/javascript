---
'@asgardeo/javascript': patch
'@asgardeo/react': patch
---

Fix `signInSilently()` always resolving `false`.

The authorize request replaced the caller's `state` with the `instance_<id>` prefix, so the `sign-in-silently` marker never reached the hidden iframe and the identity provider's response was never handed back to the parent window. The state now keeps both parts (for example `instance_0_sign-in-silently_request_0`).

`AsgardeoProvider` also hands that response back to the parent before resuming a session. The iframe shares the parent's session storage, so it previously saw an active session and returned early, leaving the parent waiting until its silent sign-in timed out.
