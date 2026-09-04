/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

const fs = require('fs');
const path = require('path');

/**
 * @fileoverview Entry point for the ESLint config.
 */

/**
 * Try to resolve a `tsconfig.json` file to avoid asking the user to provide one.
 */
const resolveTSConfig = () => {
  if (fs.existsSync('tsconfig.json')) {
    return path.resolve('tsconfig.json');
  }

  if (fs.existsSync('types/tsconfig.json')) {
    return path.resolve('types/tsconfig.json');
  }

  return undefined;
};

module.exports = {
  extends: ['plugin:@wso2/javascript'],
  overrides: [
    {
      extends: ['airbnb-typescript/base', 'plugin:typescript-sort-keys/recommended'],
      files: ['**/*.ts?(x)'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 2018,
        project: resolveTSConfig(),
        sourceType: 'module',
        warnOnUnsupportedTypeScriptVersion: true,
      },
      plugins: ['@typescript-eslint'],
      rules: {
        // TODO: Find a proper fix: ESLint seem to be breaking when this rule is enabled.
        // Getting a ``TypeError: Cannot read properties of undefined (reading 'length') Occurred.
        '@typescript-eslint/dot-notation': 'off',
        // TODO: Find a proper fix: ESLint seem to be breaking when this rule is enabled.
        // Getting a ``TypeError: Cannot read properties of undefined (reading 'length') Occurred.
        '@typescript-eslint/no-throw-literal': 'off',
        // TODO: Find a proper fix: ESLint seem to be breaking when this rule is enabled.
        // Getting a ``TypeError: Cannot read properties of undefined (reading 'length') Occurred.
        '@typescript-eslint/no-useless-constructor': 'off',
        // Harsh rule, Dev dependencies should to be used in test specs, configs, scripts and storybook files.
        // https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-extraneous-dependencies.md
        'import/no-extraneous-dependencies': [
          'error',
          {
            devDependencies: [
              '**/*.config.*cjs',
              '**/scripts/*.js',
              '**/*.stories.*',
              '**/*.test.*',
              '**/*.spec.*',
              '**/__tests__/**',
              '**/__mocks__/**',
              'test-configs/**',
            ],
          },
        ],
        // Disallow specified names in exports.
        // https://eslint.org/docs/rules/no-restricted-exports
        // FIXME: In Airbnb ruleset, `default` is also restricted which disallows `export { default } from` syntax.
        // There's a tracker (https://github.com/eslint/eslint/issues/15617) and a WIP PR to give first class support to bypass.
        // Until then, allowing `default` syntax.
        // Config is copied from https://github.com/airbnb/javascript/blob/f3d3a07/packages/eslint-config-airbnb-base/rules/es6.js#L65.
        'no-restricted-exports': [
          'error',
          {
            restrictedNamedExports: [
              'then', // this will cause tons of confusion when your module is dynamically `import()`ed, and will break in most node ESM versions
            ],
          },
        ],
      },
    },
  ],
  rules: {},
};
