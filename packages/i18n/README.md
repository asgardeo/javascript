# @asgardeo/i18n

This package provides internationalization bundles used by Asgardeo SDKs.

## Chinese (Simplified) - zh-CN

The `zh-CN` (简体中文) bundle has been added. You can import and use it in your application via the `@asgardeo/i18n` package.

Example usage with `AsgardeoProvider`:

```tsx
import { AsgardeoProvider } from '@asgardeo/react';
import { zh_CN } from '@asgardeo/i18n';

<AsgardeoProvider
  baseUrl={import.meta.env.VITE_ASGARDEO_BASE_URL}
  clientId={import.meta.env.VITE_ASGARDEO_CLIENT_ID}
  preferences={{
    i18n: {
      language: 'zh-CN',
      bundles: {
        'zh-CN': zh_CN,
      },
    },
  }}
>
  <App />
</AsgardeoProvider>
```

Notes:
- The bundle's export name is `zh_CN` and the locale code is `zh-CN`.
- To test locally, build the `@asgardeo/i18n` package and link it to your application (see the repository `CONTRIBUTING.md` for testing instructions).
