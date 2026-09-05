---
'@asgardeo/react': patch
---

Social login buttons rendered by the embedded sign-in, sign-up and recovery flows no longer receive the internal form-state props (`formValues`, `formErrors`, `touchedFields`, `isFormValid`, `onInputChange`, `inputClassName`), which React reported as unknown attributes on the underlying `<button>` element.
