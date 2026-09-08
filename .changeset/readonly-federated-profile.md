---
'@asgardeo/javascript': patch
'@asgardeo/i18n': patch
'@asgardeo/react': patch
'@asgardeo/nextjs': patch
---

Render a read-only profile for users whose attributes are owned by an identity provider.

Asgardeo rejects attribute updates for accounts provisioned from a social or enterprise connection, so the profile used to offer edit controls that always failed with a raw SCIM error.

- `<UserProfile />` accepts `editable="auto"` in React and Next.js. On Asgardeo it looks up the signed-in user's federated associations and, when the account is linked to a connection, renders the profile read-only with a short note naming the provider. On WSO2 Identity Server, where the same updates succeed, the profile stays editable.
- `BaseUserProfile` accepts a predicate for `editable`, so applications can decide per user without any lookup, and a `readOnlyNote` to explain why editing is unavailable.
- A rejected update is now reported in plain words instead of the raw SCIM error, and switches the profile to read-only for the rest of the session. The Next.js `<UserProfile />` previously ignored update failures entirely.
- New API `getMeFederatedAssociations` in `@asgardeo/javascript` and `@asgardeo/react`, plus the `signup`-style texts `user.profile.readonly.federated` and `user.profile.update.not.allowed.error` in all i18n bundles.
