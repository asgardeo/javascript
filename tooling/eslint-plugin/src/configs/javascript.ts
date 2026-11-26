/**
 * Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com).
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

import eslint from '@eslint/js';
import type {Linter} from 'eslint';
import {importX} from 'eslint-plugin-import-x';
import globals from 'globals';

const javascriptConfig: Linter.Config[] = [
  eslint.configs.recommended,
  importX.flatConfigs.recommended as Linter.Config,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    name: 'asgardeo/javascript-overrides',
    rules: {
      // Disallow the use of console in-favor of the Logger.
      // https://eslint.org/docs/latest/rules/no-console
      'no-console': 'error',
      // Disallow new operators outside of assignments or comparisons.
      // https://eslint.org/docs/latest/rules/no-new
      'no-new': 'error',
      // Modify the order a bit to make the imports more readable.
      // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/order.md
      'import-x/order': [
        'warn',
        {
          alphabetize: {
            caseInsensitive: true,
            order: 'asc',
          },
          groups: ['builtin', 'external', 'index', 'sibling', 'parent', 'internal'],
        },
      ],
      // Allow imports without file extensions for JavaScript files.
      // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/extensions.md
      'import-x/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'never',
          jsx: 'never',
        },
      ],
      // Enforce no cycles in imports to prevent circular dependencies.
      // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-cycle.md
      'import-x/no-cycle': 'error',
      // Disallow importing packages that are not declared in `package.json`.
      // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-extraneous-dependencies.md
      'import-x/no-extraneous-dependencies': 'error',
    },
  },
  {
    // Build, test and tooling config files run in Node.js.
    files: ['**/*.{js,cjs,mjs}'],
    languageOptions: {
      globals: globals.node,
    },
    name: 'asgardeo/node-scripts',
  },
];

export default javascriptConfig;
