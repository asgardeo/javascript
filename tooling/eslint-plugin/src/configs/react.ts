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

import type {Linter} from 'eslint';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

const reactConfig: Linter.Config[] = [
  reactPlugin.configs.flat['recommended'] as Linter.Config,
  reactPlugin.configs.flat['jsx-runtime'] as Linter.Config,
  reactHooks.configs.flat.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    languageOptions: {
      globals: globals.browser,
    },
    name: 'asgardeo/react-settings',
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    name: 'asgardeo/react-overrides',
    rules: {
      // Disallow the use of `dangerouslySetInnerHTML` to prevent potential XSS vulnerabilities.
      // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-danger.md
      'react/no-danger': ['error', {customComponentNames: ['*']}],
      // Enforce removing unused prop types to maintain clean and efficient code.
      // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-unused-prop-types.md
      'react/no-unused-prop-types': 'error',
      // Avoid unnecessary wrapper fragments.
      // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-no-useless-fragment.md
      'react/jsx-no-useless-fragment': 'error',
      // Prevent issues with list rendering and reconciliation.
      // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-array-index-key.md
      'react/no-array-index-key': 'error',
      // Prop types are covered by TypeScript.
      // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/prop-types.md
      'react/prop-types': 'off',
      // Avoid the deprecated `defaultProps` in favour of default arguments.
      // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/require-default-props.md
      'react/require-default-props': [
        'error',
        {
          classes: 'ignore',
          forbidDefaultForRequired: true,
          functions: 'defaultArguments',
        },
      ],
    },
  },
  {
    // Rules the SDKs do not pass yet. Re-enable them one at a time.
    name: 'asgardeo/react-pending',
    rules: {
      // TODO: Give optional props default arguments.
      // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/require-default-props.md
      'react/require-default-props': 'off',
      // TODO: Fix the existing reports, then raise these back to errors.
      ...Object.fromEntries(
        [
          'jsx-a11y/click-events-have-key-events',
          'react-hooks/immutability',
          'react-hooks/preserve-manual-memoization',
          'react-hooks/refs',
          'react-hooks/set-state-in-effect',
          'react-hooks/static-components',
          'react/display-name',
          'react/jsx-no-useless-fragment',
          'react/no-array-index-key',
          'react/no-children-prop',
          'react/no-danger',
          'react/no-unused-prop-types',
        ].map((rule: string) => [rule, 'warn'] as const),
      ),
    },
  },
];

export default reactConfig;
