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
 * @fileoverview ESLint config to be used in React based projects.
 */

module.exports = {
  extends: ['airbnb', 'airbnb/hooks', 'airbnb-typescript', 'plugin:@wso2/javascript', 'plugin:@wso2/typescript'],
  overrides: [
    {
      files: ['**/*.ts?(x)'],
      rules: {
        'react/default-props-match-prop-types': 'off',
        'react/require-default-props': 'off',
      },
    },
  ],
  plugins: ['@wso2'],
  rules: {
    // We prefer to write functional components as arrow-functions.
    // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/function-component-definition.md
    'react/function-component-definition': ['error', {namedComponents: 'arrow-function'}],
    // JSX can be in `mdx` files as well.
    // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-filename-extension.md
    'react/jsx-filename-extension': ['error', {extensions: ['.tsx', '.jsx', '.mdx']}],
    // We need prop spreading when writing wrapper components.
    // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-props-no-spreading.md
    'react/jsx-props-no-spreading': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
