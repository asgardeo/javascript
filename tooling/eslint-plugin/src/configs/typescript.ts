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
import {createTypeScriptImportResolver} from 'eslint-import-resolver-typescript';
import {importX} from 'eslint-plugin-import-x';
import {configs as tseslintConfigs} from 'typescript-eslint';
import createParserOptions from '../utils/tsconfig-resolver';

const typescriptConfig: Linter.Config[] = [
  ...(tseslintConfigs.recommendedTypeChecked as Linter.Config[]),
  ...(tseslintConfigs.stylisticTypeChecked as Linter.Config[]),
  importX.flatConfigs.typescript as Linter.Config,
  {
    languageOptions: {
      parserOptions: createParserOptions(),
    },
    name: 'asgardeo/typescript-parser',
  },
  {
    name: 'asgardeo/typescript-resolver',
    settings: {
      'import-x/resolver-next': [createTypeScriptImportResolver({alwaysTryTypes: true})],
    },
  },
  {
    name: 'asgardeo/typescript-overrides',
    rules: {
      // The codebase annotates every declaration, including ones initialised with a literal.
      // https://typescript-eslint.io/rules/no-inferrable-types/
      '@typescript-eslint/no-inferrable-types': 'off',
      // Allow unused `catch` bindings, and unused siblings of a rest property (used to omit keys from an object).
      // https://typescript-eslint.io/rules/no-unused-vars/
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrors: 'none',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^_',
        },
      ],
      // Allow imports without file extensions for TypeScript files.
      // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/extensions.md
      'import-x/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'never',
          jsx: 'never',
          ts: 'never',
          tsx: 'never',
        },
      ],
    },
  },
  {
    // Rules from the type-checked presets that the SDKs do not pass yet. Each one needs code changes (typing work, or
    // behaviour changes such as `||` to `??`), so they are switched off or lowered to warnings here. Re-enable them one
    // at a time.
    name: 'asgardeo/typescript-pending',
    rules: {
      // TODO: Switch bracket access on properties the types do not declare to typed access, then enable. The autofix
      // turns such access into a type error, so it cannot be applied blindly.
      // https://typescript-eslint.io/rules/dot-notation/
      '@typescript-eslint/dot-notation': 'off',
      // TODO: Replace `any` with precise types.
      // https://typescript-eslint.io/rules/no-explicit-any/
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      // TODO: Await, return or explicitly `void` every promise.
      // https://typescript-eslint.io/rules/no-floating-promises/
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      // TODO: Move to `??` where falsy values other than `null` and `undefined` are not meant to fall through.
      // https://typescript-eslint.io/rules/prefer-nullish-coalescing/
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      // TODO: Fix the existing reports, then raise these back to errors.
      ...Object.fromEntries(
        [
          '@typescript-eslint/await-thenable',
          '@typescript-eslint/ban-ts-comment',
          '@typescript-eslint/consistent-indexed-object-style',
          '@typescript-eslint/no-base-to-string',
          '@typescript-eslint/no-empty-function',
          '@typescript-eslint/no-empty-object-type',
          '@typescript-eslint/no-namespace',
          '@typescript-eslint/no-non-null-asserted-optional-chain',
          '@typescript-eslint/no-redundant-type-constituents',
          '@typescript-eslint/no-unsafe-function-type',
          '@typescript-eslint/only-throw-error',
          '@typescript-eslint/prefer-optional-chain',
          '@typescript-eslint/prefer-promise-reject-errors',
          '@typescript-eslint/require-await',
          '@typescript-eslint/restrict-template-expressions',
          '@typescript-eslint/unbound-method',
          'import-x/export',
          'import-x/namespace',
          'prefer-const',
        ].map((rule: string) => [rule, 'warn'] as const),
      ),
    },
  },
  // Plain JavaScript files are not part of a TypeScript program, so turn type-aware rules off for them. Keep this last
  // so that no later block switches a type-aware rule back on.
  {
    files: ['**/*.{js,jsx,cjs,mjs}'],
    ...(tseslintConfigs.disableTypeChecked as Linter.Config),
  },
];

export default typescriptConfig;
