---
'@asgardeo/nextjs': patch
---

The session stays alive while a page is open. Tokens were only refreshed by the middleware on navigation, so a long-lived page, or an app set up without the middleware, silently lost its session once the access token expired even though the refresh token was still valid; the `refreshToken` server action existed but nothing called it. `AsgardeoProvider` now passes the session expiry to the client, which refreshes the token shortly before it expires and schedules the next refresh from the result, as the React SDK does. The scheduled refresh asks the action to refresh only when the token is actually about to expire, so it does not compete with a refresh the middleware has just done.
