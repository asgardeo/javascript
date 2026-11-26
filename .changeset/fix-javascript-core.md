---
'@asgardeo/javascript': patch
---

Fix several core client bugs:

- `reInitialize()` merged the new config into a Promise and lost the stored config.
- The short `endpoints` names (`authorization`, `token`, `endSession`, `jwks`, `userInfo`, ...) had no effect. They now
  override the matching endpoints; the legacy names (`tokenEndpoint`, `jwksUri`, ...) still work.
- Setting only part of `tokenValidation` (for example `clockTolerance`) turned ID token validation off. It is now merged
  with the defaults.
- `getDecodedIdToken(userId, idToken)` decoded the stored ID token instead of the one passed in.
- Storage writes weren't awaited, so a slow async store could return stale data, and `revokeAccessToken()` didn't wait
  for the session to be cleared.
- Network errors from the V2 flow functions and `getMeFederatedAssociations()` are now reported as `AsgardeoAPIError`,
  and `initializeEmbeddedSignInFlow()` reports an invalid URL with its own error code.
- A `redirect_uri` passed to `getSignInUrl()` replaced the one in the authorize request but not in the token request, so
  the code exchange failed. The token request now sends the same `redirect_uri`.
- Add `clearSession()` on the client instance; the static `clearSession()` clears the most recently initialized client.
- Export the `OrgDiscoveryType` and `OrgAuthorizationUrlOptions` types, and correct stale JSDoc.
