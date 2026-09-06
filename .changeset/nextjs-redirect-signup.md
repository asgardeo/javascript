---
'@asgardeo/nextjs': patch
---

Redirect-based sign-up works. `SignUpButton` (and `useAsgardeo().signUp()`) did nothing unless a custom `signUpUrl` was configured, because the server action returned an empty URL and the client threw "Not implemented" for a non-embedded sign-up. The action now resolves the configured `signUpUrl`, or the identity server's self-registration page derived from `baseUrl`, `clientId` and `applicationId` as the React SDK does, and the browser navigates there. When neither can be resolved (for example a custom domain without `signUpUrl`) the action reports an error instead of silently doing nothing.
