---
"@asgardeo/javascript": minor
"@asgardeo/react": minor
"@asgardeo/i18n": minor
---

Add SDK support for declarative input validation rules on flow prompts.

- New `ValidationRule` and `FieldError` types in `@asgardeo/javascript`.
- New framework-agnostic utilities `evaluateValidationRule` and `buildValidatorFromRules`.
- `EmbeddedFlowComponent.validation` and `EmbeddedFlowResponseData.fieldErrors` added to the v2 flow models.
- Wires client-side rule evaluation and server-side `fieldErrors` surfacing into `BaseSignIn`, `BaseSignUp`, `BaseAcceptInvite`, `BaseInviteUser`, `BaseRecovery`.
- Adds `fieldErrors` to `SignInRenderProps` so render-prop consumers can display server-side validation errors.
- Adds default validation message i18n keys (`validation.pattern.invalid`, `validation.minLength.invalid`, `validation.maxLength.invalid`) to all locale bundles.

Refs asgardeo/thunder#2410.
