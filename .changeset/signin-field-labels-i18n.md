---
'@asgardeo/javascript': patch
'@asgardeo/react': patch
'@asgardeo/nextjs': patch
---

Let applications relabel the embedded sign-in fields through i18n.

- The username and password fields of the embedded sign-in form now take their label and placeholder from the i18n bundle (`elements.fields.<field>.label` / `elements.fields.<field>.placeholder`) when a translation is provided, falling back to the text returned by the identity server. This lets applications whose users sign in with an email address relabel the identifier field without changing the login flow.
- `preferences.i18n.bundles` now accepts partial bundles (`I18nBundleOverride`): only the keys being changed need to be supplied, and the bundle metadata is optional. This was already the runtime behaviour but the types required a complete bundle.
- The Next.js `<SignIn />` component now accepts the `preferences` prop, so texts can be overridden per component as with `<SignUp />` and the React SDK.
