# Troubleshooting

## Known Issues

<details>
<summary><h3>Plugin "@typescript-eslint" was conflicted</h3></summary>
If you're using the ESLint Plugin inside a Create React App project, you might encounter a stacktrace like below.

```bash
[eslint] Plugin "@typescript-eslint" was conflicted between ".eslintrc.cjs » plugin:@wso2/react » plugin:@wso2/typescript#overrides[0]" and ".eslintrc.cjs » plugin:@wso2/react » plugin:@wso2/typescript » eslint-config-airbnb-typescript/base » /<PATH>/node_modules/.pnpm/eslint-config-airbnb-typescript@17.0.0_mnxwss6wgpp5zz53fmtbuvhzim/node_modules/eslint-config-airbnb-typescript/lib/shared.js".
```

#### Reason

A possible reason for the above would be that Create React app has it's own eslint configuration([eslint-config-react-ap](https://github.com/facebook/create-react-app/tree/main/packages/eslint-config-react-app)). This package has it's own eslint-plugins declared as dependencies and these can cause conflicts. Even if you remove the extension in the eslint config, there's no way to remove this dependency without ejecting.

#### Workaround

You can disable the inbuilt eslint plugin using the following config.

```env
DISABLE_ESLINT_PLUGIN=true
```

The caveat of this approach is that it'll disable webpack from running linter when the development server starts.

You may have to extend the CRA webpack config and add the logic yourself using `webpack-eslint-loader`.

</details>
