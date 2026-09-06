---
'@asgardeo/nextjs': patch
---

Fewer identity-server requests per server render. `AsgardeoProvider` requested the SCIM2 `Me` and `Schemas` resources twice per render (once for the user, once for the profile) and fetched the branding preference on every request. The user is now derived from the profile response, the branding preference is cached in memory for a few minutes per base URL, type, name and locale (a failed fetch is not cached), and the branding request uses the configured `preferences.i18n.language` instead of a hard-coded `en-US`.
