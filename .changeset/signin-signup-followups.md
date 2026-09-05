---
'@asgardeo/react': patch
'@asgardeo/nextjs': patch
'@asgardeo/i18n': patch
---

Fixes for the embedded `<SignIn />` and `<SignUp />` components:

- Social login buttons in the sign-in, sign-up and recovery flows no longer receive internal form-state props (`formValues`, `formErrors`, `touchedFields`, `isFormValid`, `onInputChange`, `inputClassName`), which React reported as unknown attributes on the `<button>` element.
- When the identity server rejects the embedded sign-in because the redirect URI (`afterSignInUrl`) is not registered for the application, the form shows a translated, actionable message naming the URL to register (`errors.signin.redirect.uri.mismatch`) instead of the raw `invalid_callback - callback.not.match` text. The Next.js README documents the redirect URL requirements.
- When the automatic sign-in after an embedded registration cannot be performed, the reason is reported in the browser console as well as the server log.
- `<SignUp />` renders `RICH_TEXT` flow components (for example the terms of service text), which were previously dropped, leaving the submit button jammed against the last field.
- The Next.js `<SignUp />` forwards all remaining props to the underlying form (`showTitle`, `showSubtitle`, `showLogo`, `onComplete`, `onFlowChange`, class names, ...), so for instance `showTitle={false}` now works when a registration flow renders its own heading.
- After a server-side validation error (for example a rejected password), `<SignUp />` now keeps the values the user entered and the submit button stays enabled, so the user can correct the field and resubmit. Previously the form's validation errors were recorded under keys no input could clear, which left the button disabled permanently. Form validation also runs against the value being typed instead of the previous one.
