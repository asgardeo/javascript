---
'@asgardeo/nextjs': patch
---

The organization list refreshes after an organization is created. `AsgardeoProvider` never passed a `revalidateMyOrganizations` function to the organization context, so `<CreateOrganization />` skipped the refresh and the switcher kept showing the old list until the page was reloaded. The provider now re-fetches the user's organizations through the `getMyOrganizations` server action and stores the result, as the React SDK does.
