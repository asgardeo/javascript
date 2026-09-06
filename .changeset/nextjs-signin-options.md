---
'@asgardeo/nextjs': patch
---

`signInOptions` now reach the authorize request. The `signInOptions` configured on `AsgardeoProvider` (for example `fidp` or `prompt`) were never applied to the redirect-based sign-in, and passing `signInOptions` to `SignInButton` made the click fail because the server action mistook any non-empty object for an embedded-flow step. The action now only treats a payload with a `flowId` as an embedded-flow step and appends the configured options plus the caller's options to the authorize request. `SignInButton` also tracks its loading state and hands `signIn` and `isLoading` to render-prop children, as the React SDK does.
