---
'@asgardeo/react': patch
'@asgardeo/nextjs': patch
---

Show a success message and a sign-in button when a registration completes without signing the user in.

- `BaseSignUp` accepts a `signInUrl` prop. When the flow completes and the prop is set, the card keeps showing the "account created" message and renders a Sign In button that takes the user to that URL.
- The Next.js `<SignUp />` passes the configured `signInUrl` automatically, and the provider no longer navigates to `afterSignUpUrl` when no session was created (for example after a social sign-up, or a multi-step registration). Previously the user was sent to a protected page and bounced straight to the sign-in form without ever seeing that the account had been created. A per-component `afterSignUpUrl` prop is still honoured.
