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
 * @fileoverview The strict config for WSO2 ESLint config.
 */

module.exports = {
  overrides: [
    {
      files: ['*.ts', '*.mts', '*.cts', '*.tsx'],
      rules: {
        // Explicit return types make code visually more clearer.
        // https://typescript-eslint.io/rules/explicit-function-return-type/
        '@typescript-eslint/explicit-function-return-type': 'error',
        // Enforce type definitions since TypeScript cannot always infer types from usage.
        // https://typescript-eslint.io/rules/typedef/
        '@typescript-eslint/typedef': [
          'error',
          {
            arrayDestructuring: false,
            arrowParameter: true,
            memberVariableDeclaration: true,
            objectDestructuring: false,
            parameter: true,
            propertyDeclaration: true,
            variableDeclaration: true,
            variableDeclarationIgnoreFunction: true,
          },
        ],
      },
    },
  ],
  rules: {
    // Explicit return types are only needed for typescript files.
    '@typescript-eslint/explicit-function-return-type': 'off',
  },
};
