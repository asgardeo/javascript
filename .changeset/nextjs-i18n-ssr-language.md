---
'@asgardeo/nextjs': patch
---

Server and client renders now agree on the UI language, which fixes hydration errors on translated texts (for example the sign-in button label) whenever the browser language, the persisted language cookie or a `?lang=` parameter differed from `en-US`. The server resolves the language the way the client would detect it (persisted cookie, then `Accept-Language`), the client provider adds the `lang` URL parameter it can see, and the result is handed to the i18n provider unless `preferences.i18n.language` is configured explicitly.
