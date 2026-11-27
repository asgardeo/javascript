---
'@asgardeo/vue': patch
---

Fix `createAsgardeoGuard()` always redirecting: router guards can't inject the context that `<AsgardeoProvider>`
provides, so the provider now registers it for the guard, and the guard waits for the provider to mount. Also:

- Make `<CreateOrganization>` create the organization, and connect `useUser().updateProfile()`.
- Add the `preferences`, `afterSignUpUrl`, `allowedExternalUrls`, `signOutOptions`, `signUpOptions` and
  `tokenValidation` props to `<AsgardeoProvider>`, accept `scopes` as a string, apply the theme and i18n preferences,
  fetch the branding preference when `preferences.theme.inheritFromBranding` is set, and honour
  `preferences.user.fetchUserProfile` and `fetchOrganizations`.
- Translate the sign-in, sign-out and sign-up button labels and the user dropdown items.
- Offer only languages that have a translation bundle in `<LanguageSwitcher>` by default.
- Emit `click` from the action buttons before the action starts, and pass the loading state to `<UserProfile>`.
