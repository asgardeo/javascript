---
'@asgardeo/nextjs': patch
---

When the automatic sign-in after an embedded registration cannot be performed (for example the redirect URI is not registered, app-native authentication is disabled, the login flow needs more than one step, or the registration is multi-step), the reason is now reported in the browser console as well as the server log, so it is visible where developers look first.
