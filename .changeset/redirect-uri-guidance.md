---
'@asgardeo/react': patch
'@asgardeo/i18n': patch
'@asgardeo/nextjs': patch
---

When the identity server rejects the embedded sign-in because the redirect URI (`afterSignInUrl`) is not registered for the application, the sign-in form now shows a translated, actionable message naming the URL to register (`errors.signin.redirect.uri.mismatch`), instead of the raw `invalid_callback - callback.not.match` text. The Next.js README documents the redirect URL requirements.
