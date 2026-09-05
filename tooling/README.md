# tooling

Shared lint and formatting configuration used by every package in this workspace.

Both packages are vendored copies of [`brionmario/wso2-ui-configs`](https://github.com/brionmario/wso2-ui-configs) at
commit `d3041825a4f8f235c8f9fa36b55cf29d54e791c8` (Apache-2.0, see `LICENSE`):

- `eslint-plugin/` — `@wso2/eslint-plugin` (`packages/eslint-plugin` upstream)
- `prettier-config/` — `@wso2/prettier-config` (`packages/prettier-config` upstream)

They used to be consumed as git dependencies with a `path:` subdirectory. pnpm resolves GitHub-hosted git dependencies
to a tarball of the whole repository and drops the `path:` fragment, so a clean install (CI, or a fresh store) ended up
with the repository root instead of the package and ESLint could not find the plugin. Consuming them as workspace
packages makes installs deterministic. To update, copy the upstream package contents over these directories and bump the
commit above.

Local deviations from upstream, to re-apply after an update: `package.json` is trimmed and marked `private`, the READMEs
describe `workspace:*` usage instead of registry installation, and the README/TROUBLESHOOTING Markdown was fixed to pass
markdownlint. Library code under `lib/` and `index.js` is unchanged.
