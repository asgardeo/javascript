# `@wso2/prettier-config`

Shareable Prettier configurations used in WSO2 code bases.

## Installation

This is a private workspace package (`"private": true`) vendored from
[`brionmario/wso2-ui-configs`](https://github.com/brionmario/wso2-ui-configs); it is not published to a registry.
Packages in this monorepo consume it with a `workspace:*` dependency:

```json
{
  "devDependencies": {
    "@wso2/prettier-config": "workspace:*",
    "prettier": "2.6.2"
  }
}
```

See [`../README.md`](../README.md) for provenance and how to update the vendored copy.

## Usage

You can extend the `@wso2/prettier-config` in your preferred configuration file flavor.

```js
// prettier.config.cjs

module.exports = require('@wso2/prettier-config');
```

For more extending strategies, read the
[official guide](https://prettier.io/docs/en/configuration.html#sharing-configurations).
