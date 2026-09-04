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

/**
 * @fileoverview ESLint config to be used in JavaScript based projects.
 */

const MAX_LINE_LENGTH = 120;

module.exports = {
  extends: ['plugin:@wso2/core', 'airbnb-base'],
  rules: {
    // These TS ESLit rules require `parserOptions` even for non TS files.
    // TODO: Remove these rules once the issue is fixed.
    '@typescript-eslint/dot-notation': 'off',
    '@typescript-eslint/naming-convention': 'off',
    '@typescript-eslint/no-implied-eval': 'off',
    '@typescript-eslint/no-throw-literal': 'off',
    '@typescript-eslint/return-await': 'off',
    // Harsh rule, Dev dependencies should to be used in test specs, configs, scripts and storybook files.
    // https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-extraneous-dependencies.md
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '**/*.config.*', // Match config files in JS, TS, CJS, and MJS
          '**/scripts/*.{js,ts,cjs,mjs}', // Match script files in JS and TS
          '**/*.stories.*', // Storybook files
          '**/*.test.*', // Test files in JS and TS
          '**/*.spec.*', // Spec files in JS and TS
          '**/__tests__/**', // Test directories
          '**/__mocks__/**', // Mock directories
          'test-configs/**', // Test configuration files
        ],
      },
    ],
    // Modify the order a bit to make the imports more readable.
    // https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/order.md
    'import/order': [
      'warn',
      {
        alphabetize: {
          caseInsensitive: true,
          order: 'asc',
        },
        groups: ['builtin', 'external', 'index', 'sibling', 'parent', 'internal'],
      },
    ],
    // Bit harsh rule, some developers will like to have consistent exports in a module.
    // If there are a mixture of export types, the imports will look ugly.
    // https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/prefer-default-export.md
    'import/prefer-default-export': 'off',
    // Set the `max-len` to 120 characters since `airbnb-base` uses 100 characters and our prettier config has `120`.
    // https://eslint.org/docs/rules/max-len
    'max-len': [
      'error',
      MAX_LINE_LENGTH,
      2,
      {
        ignoreComments: false,
        ignoreRegExpLiterals: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreUrls: true,
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
    // Enforces sorting object properties in alphabetical order for readability.
    // https://eslint.org/docs/latest/rules/sort-keys
    'sort-keys': ['error', 'asc', {caseSensitive: true, minKeys: 2, natural: false}],
  },
};
