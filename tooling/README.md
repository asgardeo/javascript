# tooling

Shared lint and formatting configuration used by every package in this workspace.

- [`eslint-plugin/`](./eslint-plugin) — `@asgardeo/eslint-plugin`: ESLint 9 flat configs and the `copyright-header`
  rule.
- [`prettier-config/`](./prettier-config) — `@asgardeo/prettier-config`: the shared Prettier options.

Both packages are private workspace packages, consumed with `workspace:*`. Their layout follows ThunderID's
[`eslint-plugin`](https://github.com/thunder-id/thunderid/tree/main/frontend/packages/eslint-plugin) and
[`prettier-config`](https://github.com/thunder-id/thunderid/tree/main/frontend/packages/prettier-config): TypeScript
sources under `src/`, built to ESM and CommonJS with rolldown.

## Building

Consumers load the built output from `dist/`. Nx builds both packages before any `lint` target runs (`lint` depends on
`^build`), so `pnpm lint` works from a clean checkout. To build them by hand:

```bash
pnpm --filter @asgardeo/prettier-config --filter @asgardeo/eslint-plugin build
```
