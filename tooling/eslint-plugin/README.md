# @asgardeo/eslint-plugin

ESLint 9 flat configs and custom rules for the Asgardeo JavaScript SDKs.

## Usage

Add the plugin and the Prettier config as workspace dev dependencies:

```json
{
  "devDependencies": {
    "@asgardeo/eslint-plugin": "workspace:*",
    "@asgardeo/prettier-config": "workspace:*"
  }
}
```

Then spread a config into the package's `eslint.config.js`:

```js
import asgardeo from '@asgardeo/eslint-plugin';

export default [
  {
    ignores: ['dist/**', 'build/**', 'node_modules/**', 'coverage/**'],
  },
  ...asgardeo.configs.typescript,
  ...asgardeo.configs.vitest,
];
```

## Configs

| Config       | Use for                                                                     |
| ------------ | --------------------------------------------------------------------------- |
| `javascript` | JavaScript-only packages.                                                   |
| `typescript` | TypeScript packages, with type-aware linting.                               |
| `react`      | TypeScript + React packages.                                                |
| `vue`        | TypeScript + Vue packages with `.vue` single-file components.               |
| `vitest`     | An overlay for Vitest test files. Spread it after one of the configs above. |

Every config except `vitest` includes the `@asgardeo/copyright-header` rule and ends with `eslint-config-prettier`, so
formatting is left to Prettier.

### Type information

The `typescript`, `react` and `vue` configs lint with type information. The parser options are resolved from the working
directory:

- When the nearest directory with a tsconfig has a `tsconfig.eslint.json`, it is used as the project. Include every file
  you want linted in it (sources, tests and config files).
- Otherwise the typescript-eslint project service is used, and root-level `*.js`, `*.cjs` and `*.mjs` files fall back to
  the default project.

`createParserOptions()` is exported for packages that need to override this.

## Rules

### `@asgardeo/copyright-header`

Requires the WSO2 Apache 2.0 license header at the top of every source file. The year is not validated, so historical
years and ranges pass. The autofix inserts the header with the current year, or replaces a leading comment that looks
like a different license header.

Options:

- `template`: the header to require and insert, in place of the WSO2 header.
- `excludePatterns`: regular expressions for file paths to skip.
- `allowShebang`: allow a `#!` line above the header (default `true`).

## Pending rules

Some rules from the type-checked presets report on existing SDK code and need code changes to pass. They are grouped in
the `asgardeo/typescript-pending` and `asgardeo/react-pending` blocks (and one rule in the `vitest` config), either
switched off or lowered to `warn`. Fix the reports for a rule, then remove it from the block to enforce it.

## Development

```bash
pnpm build      # Build dist/ (ESM + CommonJS + types).
pnpm test       # Run the rule tests.
pnpm lint       # Lint this package with its own built config.
```
