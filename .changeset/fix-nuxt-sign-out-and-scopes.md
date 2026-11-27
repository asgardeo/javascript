---
'@asgardeo/nuxt': patch
---

Fix several Nuxt SDK bugs:

- Sign-out ended on an identity server error page; `post_logout_redirect_uri` is now absolute, resolved against the
  origin of each sign-out request.
- The sign-in callback URL (`redirect_uri`) was taken from the first request the server handled and used for every user.
  It is now resolved from the origin of each sign-in request.
- Request the `internal_login` scope by default so the user profile and organizations load. Custom `scopes`, in the
  module options or `runtimeConfig`, now replace the defaults instead of being appended to them.
- `requireScopes` and `requireOrganization` always redirected signed-in users. They now check the session's granted
  scopes and organization.
- Switching organization didn't update the page until it reloaded.
- `useBranding().refetch()` did nothing.
- `getAsgardeoContext(event)` returned `null` in API routes.
- Embedded sign-up ignored the `afterSignUpUrl` prop, and `POST /api/auth/signin` ignored `returnTo`.
- Token refresh ignored `tokenRequest.authMethod` and a custom token endpoint, and `ASGARDEO_CLIENT_SECRET` set only at
  runtime was ignored.
- `platform` accepts a `Platform` key (for example `'IdentityServer'`) as well as its value.
