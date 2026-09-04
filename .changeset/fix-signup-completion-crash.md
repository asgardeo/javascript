---
'@asgardeo/react': patch
'@asgardeo/nextjs': patch
'@asgardeo/i18n': patch
'@asgardeo/javascript': patch
---

Fix `<SignUp />` crashing with `Cannot read properties of undefined (reading 'flowStatus')` right after a successful registration in Next.js. The sign-up server action now returns the completed flow response along with `afterSignUpUrl`, the client provider hands it back to the component instead of `undefined`, and the embedded sign-up components guard against an empty response. Once registration completes, the form is replaced by a success message instead of lingering with the filled-in fields. Server-side validation failures returned with an incomplete registration flow (for example, a password that does not meet the policy) are now shown in the form, and the sign-up and recovery renderers no longer trigger React `key` warnings.

Add a dedicated `afterSignUpUrl` setting (`NEXT_PUBLIC_ASGARDEO_AFTER_SIGN_UP_URL` in Next.js) for where to land after a successful embedded sign-up, falling back to `afterSignInUrl`; the `afterSignUpUrl` prop of the Next.js `<SignUp />` component now overrides it per form instead of being ignored. Fix `createRouteMatcher` so wildcard patterns such as `/dashboard(.*)` match as documented.

Show the actual server error in the embedded sign-in and sign-up components instead of a generic "An error occurred while initializing" message, including errors that crossed a Next.js server action boundary (for example, "App native authentication is not enabled for the application").

Next.js: the `afterSignInUrl` and `afterSignOutUrl` props of `<AsgardeoProvider>` are now applied to the client configuration (they were previously dropped, so sign-in always redirected to the app origin), relative values such as `"/dashboard"` are resolved against the app origin before being used as OAuth redirect URIs, and `afterSignInUrl` is exposed through `useAsgardeo()`. Add `useAsgardeo().http.request` / `http.requestAll` for authenticated calls from Client Components, backed by a server action that attaches the session's access token on the server and only allows requests to the identity server or the app's own origin. When the SCIM2 profile cannot be loaded, the SDK now logs a warning explaining the fallback to ID token claims (and hints at the missing `internal_login` scope) instead of failing silently.

React: `<UserProfile />` now recognises the camelCase mutability values (`readWrite`, `readOnly`) returned by SCIM2 schemas, so empty editable attributes are offered for editing and read-only ones are not.

Next.js: after a successful embedded sign-up the SDK now signs the new user in automatically with the credentials they just submitted (via the app-native sign-in flow) and sets the session cookie, so `<SignUp />` lands the user inside the app instead of on a login page. When an automatic sign-in is not possible (app-native authentication disabled, MFA, multi-step registration) the user is sent to `afterSignUpUrl` without a session and a warning explains why.

Resolve the OIDC provider metadata on demand when building the sign-out URL, so signing out after an app-native sign-in (or on a fresh server instance) no longer fails with "Sign-out endpoint not found".
