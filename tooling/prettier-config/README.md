# `@wso2/prettier-config`

Shareable Prettier configurations used in WSO2 code bases.

## Installation

You'll first need to install [Prettier](https://prettier.io/):

### With npm

```sh
npm i prettier --save-dev
```

### With pnpm

```sh
pnpm add --save-dev prettier
```

### With Yarn

```sh
yard add --dev prettier
```

Next, install `@wso2/prettier-config`:

### With npm

```sh
npm i @wso2/prettier-config --save-dev
```

### With pnpm

```sh
pnpm add --save-dev @wso2/prettier-config
```

### With Yarn

```sh
yard add --dev @wso2/prettier-config
```

## Usage

You can extend the `@wso2/prettier-config` in your preferred configuration file flavor.

```js
// prettier.config.cjs

module.exports = require('@wso2/prettier-config');
```

For more extending strategies, read the
[official guide](https://prettier.io/docs/en/configuration.html#sharing-configurations).
