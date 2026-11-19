---
'@asgardeo/nextjs': patch
---

`useAsgardeo()` exposes more of what the React SDK's context provides: `organization` (the current organization, which the bundled sample already reads), `isInitialized`, `clientId`, `signInOptions`, `switchOrganization()` (which re-renders the server components once the switch has happened) and `getDecodedIdToken()` (the ID token claims, resolved through a server action so the tokens themselves stay in the HttpOnly cookie).
