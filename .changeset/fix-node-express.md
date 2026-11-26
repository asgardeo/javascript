---
'@asgardeo/node': patch
'@asgardeo/express': patch
---

Fix several Node.js and Express SDK bugs:

- `isSignOutSuccessful()` and `didSignOutFail()` called themselves and overflowed the stack.
- An expired access token was never refreshed, so users were signed out when it expired. `isSignedIn()` (and so
  `protectRoute()`) now refreshes it with the refresh token, and `expires_in` is read as seconds instead of minutes.
- Sign-out now removes the user's tokens from the store.
- The client waits for its asynchronous initialization before handling calls.
- Session IDs from `generateSessionId()` are now random UUIDs from the Web Crypto API.
- Express:
  - Keep the `ASGARDEO_SESSION_ID` cookie for 24 hours instead of 90 seconds, stop marking it `Secure` by default, and
    honour `cookieConfig.maxAge: 0`.
  - Don't run later handlers after the sign-in redirect.
  - Pass errors from the session check in `protectRoute()` to Express.
  - Add `refreshAccessToken()`, pass `req` to the `asgardeoExpressAuth()` callbacks, make `afterSignInUrl` optional in
    the config type, type the middleware with Express's own types, and export the cookie defaults as
    `ExpressCookieConfig`.
