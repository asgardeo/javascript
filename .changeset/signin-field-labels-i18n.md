---
'@asgardeo/react': patch
---

The username and password fields of the embedded sign-in form now take their label and placeholder from the i18n bundle (`elements.fields.<field>.label` / `elements.fields.<field>.placeholder`) when a translation is provided, falling back to the text returned by the identity server. This lets applications whose users sign in with an email address relabel the identifier field, for example through `preferences.i18n.bundles`, without changing the login flow.
