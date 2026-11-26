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

import type {ESLint, Linter} from 'eslint';
import baseConfig from './configs/base';
import javascriptConfig from './configs/javascript';
import prettierConfig from './configs/prettier';
import reactConfig from './configs/react';
import typescriptConfig from './configs/typescript';
import vitestConfig from './configs/vitest';
import vueConfig from './configs/vue';
import copyrightHeaderRule from './rules/copyright-header';
import createParserOptions from './utils/tsconfig-resolver';

type ConfigName = 'javascript' | 'typescript' | 'react' | 'vue' | 'vitest';

interface AsgardeoPlugin extends ESLint.Plugin {
  configs: Record<ConfigName, Linter.Config[]>;
}

/**
 * Files that may import `devDependencies`: build, test and tooling configs, and scripts.
 */
const DEV_DEPENDENCIES_ALLOWED_FILES: string[] = [
  '**/*.config.{js,cjs,mjs,ts,mts,cts}',
  '**/.*.{js,cjs,mjs}',
  '**/scripts/**',
  '**/test-configs/**',
];

const plugin: AsgardeoPlugin = {
  configs: {} as AsgardeoPlugin['configs'],
  meta: {
    name: '@asgardeo/eslint-plugin',
    namespace: 'asgardeo',
  },
  processors: {},
  rules: {
    'copyright-header': copyrightHeaderRule,
  },
};

const setup: Linter.Config = {
  name: 'asgardeo/plugin-setup',
  plugins: {
    '@asgardeo': plugin,
  },
};

const devDependencies: Linter.Config = {
  files: DEV_DEPENDENCIES_ALLOWED_FILES,
  name: 'asgardeo/dev-dependencies',
  rules: {
    'import-x/no-extraneous-dependencies': ['error', {devDependencies: true}],
  },
};

Object.assign(plugin.configs, {
  // JavaScript-only projects.
  javascript: [setup, ...baseConfig, ...javascriptConfig, devDependencies, ...prettierConfig],
  // TypeScript projects, with type-aware linting.
  typescript: [setup, ...baseConfig, ...javascriptConfig, ...typescriptConfig, devDependencies, ...prettierConfig],
  // TypeScript + React projects.
  react: [
    setup,
    ...baseConfig,
    ...javascriptConfig,
    ...typescriptConfig,
    ...reactConfig,
    devDependencies,
    ...prettierConfig,
  ],
  // TypeScript + Vue projects.
  vue: [
    setup,
    ...baseConfig,
    ...javascriptConfig,
    ...typescriptConfig,
    ...vueConfig,
    devDependencies,
    ...prettierConfig,
  ],
  // Overlay for Vitest test files. Spread it after one of the configs above.
  vitest: [setup, ...vitestConfig],
} satisfies AsgardeoPlugin['configs']);

export default plugin;
export {createParserOptions, DEV_DEPENDENCIES_ALLOWED_FILES};
export type {CreateParserOptionsConfig, ParserOptions} from './utils/tsconfig-resolver';
