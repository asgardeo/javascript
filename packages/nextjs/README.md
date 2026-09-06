<p align="center" style="color: #343a40">
  <h1 align="center">@asgardeo/nextjs</h1>
</p>
<p align="center" style="font-size: 1.2rem;">Next.js SDK for Asgardeo</p>
<div align="center">
  <img alt="npm (scoped)" src="https://img.shields.io/npm/v/@asgardeo/nextjs">
  <img alt="npm" src="https://img.shields.io/npm/dw/@asgardeo/nextjs">
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg" alt="License"></a>
</div>

## Quick Start

Get started with Asgardeo in your Next.js application in minutes. Follow our [Next.js Quick Start Guide](https://wso2.com/asgardeo/docs/quick-starts/nextjs/) for step-by-step instructions on integrating authentication into your app.

## Redirect URLs

The SDK sends `afterSignInUrl` (`NEXT_PUBLIC_ASGARDEO_AFTER_SIGN_IN_URL`, or the `afterSignInUrl` prop of
`<AsgardeoProvider>`) to the identity server as the OAuth `redirect_uri`. A relative value such as `/dashboard` is
resolved against your app's origin. Register the resolved URL, for example `http://localhost:3000/dashboard` and its
production equivalent, under the application's **Authorized redirect URLs** in the console; the bare origin is not
enough. If it is missing, the embedded `<SignIn />` fails to initialise and shows the exact URL to register.

Social login with app-native authentication needs two more redirect URIs on the social provider's OAuth client (for
Google: the OAuth client's **Authorized redirect URIs**), because the identity server sends different callbacks for
the two flows:

- sign-in: the same resolved `afterSignInUrl`, e.g. `http://localhost:3000/dashboard`
- sign-up (self registration): the identity server's registration callback,
  `https://accounts.asgardeo.io/t/<organization>/accounts/register`

A missing entry surfaces as Google's `Error 400: redirect_uri_mismatch`.

`afterSignOutUrl` (default: the app origin) is sent as the post-logout redirect URI and must be registered as well.

## Customising texts

Every text the embedded components render can be overridden through `preferences.i18n.bundles`, either globally on
`<AsgardeoProvider>` or per component through the `preferences` prop of `<SignIn />` and `<SignUp />`. Only the keys
you change need to be present; the rest come from the built-in bundle. For example, if your users sign in with an
email address, relabel the identifier field:

```tsx
<AsgardeoProvider
  preferences={{
    i18n: {
      bundles: {
        'en-US': {
          translations: {
            'elements.fields.username.label': 'Email',
            'elements.fields.username.placeholder': 'Enter your email',
          },
        },
      },
    },
  }}
>
  {children}
</AsgardeoProvider>
```

The available keys are listed in the `@asgardeo/i18n` package (`I18nTranslations`).

## Logging

The SDK logs at `error` level by default. Set `ASGARDEO_LOG_LEVEL` to `warn`, `info` or `debug` to see more,
for example why a user's profile fell back to the ID token claims:

```bash
ASGARDEO_LOG_LEVEL=warn
```

## API Documentation

For complete API documentation including all components, hooks, and customization options, see the [Next.js SDK Documentation](https://wso2.com/asgardeo/docs/sdks/nextjs/overview).

## License

Licenses this source under the Apache License, Version 2.0 [LICENSE](./LICENSE), You may not use this file except in compliance with the License.
