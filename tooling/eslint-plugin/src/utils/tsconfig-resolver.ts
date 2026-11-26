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

import {existsSync} from 'fs';
import {dirname, join, parse, resolve} from 'path';

/**
 * Parser options for typed linting: either a dedicated ESLint tsconfig, or the typescript-eslint project service.
 */
export type ParserOptions =
  | {
      project: string;
      tsconfigRootDir: string;
    }
  | {
      projectService: {
        allowDefaultProject: string[];
        defaultProject?: string;
        maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING?: number;
      };
      tsconfigRootDir?: string;
    };

/**
 * Options accepted by {@link createParserOptions}.
 */
export interface CreateParserOptionsConfig {
  /** Extra glob patterns (relative to `tsconfigRootDir`) allowed to use the default project. */
  additionalPatterns?: string[];
  /** Raise the cap on files matched by `allowDefaultProject`. */
  maximumDefaultProjectFileMatchCount?: number;
  /** A tsconfig used for files that no other tsconfig includes, e.g. `./tsconfig.eslint.json`. */
  project?: string;
  /** The directory the tsconfig files resolve against. Detected from the working directory when omitted. */
  tsconfigRootDir?: string;
}

const ESLINT_TSCONFIG_FILE = 'tsconfig.eslint.json';

const TSCONFIG_FILES: string[] = [ESLINT_TSCONFIG_FILE, 'tsconfig.json'];

const DEFAULT_PROJECT_PATTERNS: string[] = ['*.js', '*.cjs', '*.mjs', '.*.js', '.*.cjs'];

const hasTsconfigFile = (directory: string): boolean =>
  TSCONFIG_FILES.some((file: string) => existsSync(join(directory, file)));

/**
 * Finds the nearest directory with a tsconfig, walking up from `startDir`.
 *
 * @param startDir - The directory to start from. Defaults to the working directory.
 * @returns The directory that holds a tsconfig, or `undefined` when none is found.
 */
export const resolveTsconfigRootDir = (startDir: string = process.cwd()): string | undefined => {
  let currentDir: string = resolve(startDir);
  const {root} = parse(currentDir);

  while (currentDir !== root) {
    if (hasTsconfigFile(currentDir)) {
      return currentDir;
    }

    currentDir = dirname(currentDir);
  }

  return hasTsconfigFile(root) ? root : undefined;
};

/**
 * Creates typescript-eslint parser options with the tsconfig root detected from the working directory.
 *
 * When the root has a `tsconfig.eslint.json`, it is used as the project, so every file it includes (sources, tests and
 * config files) is linted with type information. Otherwise the project service is used, with the usual root-level config
 * files allowed to use the default project.
 *
 * @param options - Extra patterns or an options object.
 * @returns Parser options for a typed-linting config.
 */
const createParserOptions = (options: CreateParserOptionsConfig | string[] = []): ParserOptions => {
  const {
    additionalPatterns = [],
    maximumDefaultProjectFileMatchCount = 20,
    project,
    tsconfigRootDir: manualTsconfigRootDir,
  }: CreateParserOptionsConfig = Array.isArray(options) ? {additionalPatterns: options} : options;

  const tsconfigRootDir: string | undefined = manualTsconfigRootDir
    ? resolve(manualTsconfigRootDir)
    : resolveTsconfigRootDir();

  if (!project && tsconfigRootDir && existsSync(join(tsconfigRootDir, ESLINT_TSCONFIG_FILE))) {
    return {
      project: join(tsconfigRootDir, ESLINT_TSCONFIG_FILE),
      tsconfigRootDir,
    };
  }

  const projectService: Extract<ParserOptions, {projectService: unknown}>['projectService'] = {
    allowDefaultProject: [...DEFAULT_PROJECT_PATTERNS, ...additionalPatterns],
    maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING: maximumDefaultProjectFileMatchCount,
  };

  if (project) {
    projectService.defaultProject = project;
  }

  return {
    projectService,
    ...(tsconfigRootDir && {tsconfigRootDir}),
  };
};

export default createParserOptions;
