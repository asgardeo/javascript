---
'@asgardeo/nextjs': patch
---

Sessions that belong to an organization (a B2B sign-in or an organization switch, i.e. the ID token carries a `user_org` claim) now call the `/o` variants of the SCIM2 and organization APIs on the server, as the React SDK does. Until now `AsgardeoProvider` computed the `/o` base URL only for the client-side context, while the server actions behind the user profile, profile updates, and organization creation/lookup kept calling the root endpoints with the organization-scoped token, so those calls were rejected and the profile fell back to the ID token claims.
