---
'@asgardeo/nextjs': patch
---

Editing an organization through `<OrganizationProfile />` works. The component called the Organizations API from the browser without an access token (the token lives in the HttpOnly session cookie), so every save was rejected. Updates now go through a server action (`updateOrganizationAction`, backed by `AsgardeoNextClient.updateOrganization()`) that attaches the token on the server, and a failed save surfaces its reason instead of a bare request error.
