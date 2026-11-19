---
'@asgardeo/nextjs': patch
---

`useAsgardeo().user` and the current organization are `null` instead of empty objects while signed out or unavailable, so `<User fallback>` and `<Organization fallback>` render their fallbacks and `OrganizationSwitcher` no longer offers to manage an organization with an empty ID. With `preferences.user.fetchUserProfile` set to `false`, the user and profile are now populated from the ID token claims, as in the React SDK, instead of being left empty.
