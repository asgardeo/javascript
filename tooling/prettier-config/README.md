# @asgardeo/prettier-config

The shared Prettier configuration for the Asgardeo JavaScript SDKs.

## Usage

Add it as a workspace dev dependency and re-export it from the package's `prettier.config.js`:

```json
{
  "devDependencies": {
    "@asgardeo/prettier-config": "workspace:*"
  }
}
```

```js
import config from '@asgardeo/prettier-config';

export default config;
```

The package is built to ESM and CommonJS, so it can also be loaded with `require()` from a `prettier.config.cjs`.
