/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com).
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

import {mkdirSync, readdirSync, writeFileSync} from 'fs';
import {join} from 'path';
import {build} from 'esbuild';

/**
 * Collects every source file under `directory`, skipping tests.
 *
 * Unlike the sibling packages this one cannot be bundled: Next.js needs the `'use client'` /
 * `'use server'` directives on the module that defines each component or server action, and a
 * bundle cannot keep them per module. Every file is therefore transpiled on its own and the
 * output mirrors the `src` tree for both formats.
 */
const collectSourceFiles = directory =>
  readdirSync(directory, {withFileTypes: true}).flatMap(entry => {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      return entry.name === '__tests__' ? [] : collectSourceFiles(path);
    }

    return /\.tsx?$/.test(entry.name) && !/\.(test|spec)\.tsx?$/.test(entry.name) ? [path] : [];
  });

const commonOptions = {
  bundle: false,
  entryPoints: collectSourceFiles('src'),
  outbase: 'src',
  platform: 'node',
  target: ['node18'],
};

await build({
  ...commonOptions,
  format: 'esm',
  outdir: 'dist/esm',
  sourcemap: true,
});

await build({
  ...commonOptions,
  format: 'cjs',
  outdir: 'dist/cjs',
  sourcemap: true,
});

// The package is `"type": "module"`, so Node would otherwise parse the CommonJS output as ESM.
mkdirSync('dist/cjs', {recursive: true});
writeFileSync('dist/cjs/package.json', `${JSON.stringify({type: 'commonjs'}, null, 2)}\n`);
