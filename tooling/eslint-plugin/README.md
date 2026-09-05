# `@wso2/eslint-plugin`

ESLint plugin containing configurations & custom rules used in WSO2 code bases.

## Installation

This is a private workspace package (`"private": true`) vendored from
[`brionmario/wso2-ui-configs`](https://github.com/brionmario/wso2-ui-configs); it is not published to a registry.
Packages in this monorepo consume it with a `workspace:*` dependency:

```json
{
  "devDependencies": {
    "@wso2/eslint-plugin": "workspace:*",
    "eslint": "8.57.0"
  }
}
```

See [`../README.md`](../README.md) for provenance and how to update the vendored copy.

## Usage

### For JavaScript projects

If you're working on any `es5` or `es6` projects, do the following extension in your `eslint` config.

```json
{
  "extends": "plugin:@wso2/javascript"
}
```

### For TypeScript projects

If you're working on a TypeScript based project, do the following extension in your `eslint` config.

```json
{
  "extends": "plugin:@wso2/typescript"
}
```

#### Stricter Rules

If you want to enforce more stricter rules like mandating types for variables, mandating return types etc, do the
following extension in your `eslint` config.

```diff
{
  "extends": [
    "plugin:@wso2/typescript"
+   "plugin:@wso2/strict"
  ]
}
```

### For React projects

If you're working on a React project, do the following extension in your `eslint` config.

#### React JavaScript

```json
{
  "extends": ["plugin:@wso2/javascript", "plugin:@wso2/react"]
}
```

#### React TypeScript

```json
{
  "extends": ["plugin:@wso2/typescript", "plugin:@wso2/react"]
}
```

#### Jest & React Testing Library.

If you're working on project that uses [`Jest`](https://jestjs.io/) &
[`React Testing Library`](https://testing-library.com/docs/react-testing-library/intro/) for unit testing, do the
following extension in your `eslint` config.

```diff
{
  "extends": [
    ...,
+   "plugin:@wso2/jest",
  ]
}
```

### Prettier

If you want to integrate the [`prettier`](https://github.com/prettier/prettier-eslint) ESLint in to your project, do the
following extension in your `eslint` config.

```diff
{
  "extends": [
    ...,
+   "plugin:@wso2/prettier",
  ]
}
```

### For WSO2 Project

For WSO2 projects, do the following extension in your `eslint` config to enforce company specific standards.

```diff
{
  "extends": [
    ...,
+   "plugin:@wso2/internal",
  ]
}
```
