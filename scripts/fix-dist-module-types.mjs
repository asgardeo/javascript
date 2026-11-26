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

/**
 * Post-build step for the packages built with esbuild + `tsc --emitDeclarationOnly`. Run it from the package
 * directory after the build:
 *
 *   node ../../scripts/fix-dist-module-types.mjs
 *
 * It fixes two problems with the published output of a `"type": "module"` package:
 *
 * 1. `dist/cjs/index.js` is CommonJS, but Node.js reads every `.js` file in the package as ESM, so `require()` throws
 *    "module is not defined in ES module scope". A `package.json` with `"type": "commonjs"` in `dist/cjs` fixes that.
 * 2. `tsc` keeps the extensionless relative imports of the sources (`from './models'`) in the `.d.ts` files. With
 *    `moduleResolution: node16`/`nodenext` those imports don't resolve, so every type silently becomes `any`. This adds
 *    the extensions (`./models/index.js`, `./client.js`) that the resolver needs.
 */

import {existsSync, readdirSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';

const distDir = resolve(process.argv[2] ?? 'dist');

if (!existsSync(distDir)) {
  console.error(`[fix-dist-module-types] ${distDir} does not exist. Run the build first.`);
  process.exit(1);
}

const cjsDir = join(distDir, 'cjs');

if (existsSync(cjsDir)) {
  writeFileSync(join(cjsDir, 'package.json'), `${JSON.stringify({type: 'commonjs'}, null, 2)}\n`);
}

/**
 * Resolves a relative specifier written without an extension to the form Node.js ESM resolution expects.
 */
const withExtension = (fromFile, specifier) => {
  if (/\.(c|m)?js$/.test(specifier) || specifier.endsWith('.json')) {
    return specifier;
  }

  const target = resolve(dirname(fromFile), specifier);

  if (existsSync(`${target}.d.ts`)) {
    return `${specifier}.js`;
  }

  if (existsSync(join(target, 'index.d.ts'))) {
    return `${specifier.replace(/\/$/, '')}/index.js`;
  }

  return specifier;
};

// Matches the module specifier of `import`/`export ... from '...'`, `import('...')` and bare `import '...'`.
const SPECIFIER_PATTERN = /(\bfrom\s+|\bimport\s*\(\s*|\bimport\s+)(['"])(\.{1,2}\/[^'"]*|\.{1,2})\2/g;

const fixDeclarationFile = file => {
  const source = readFileSync(file, 'utf8');
  const fixed = source.replace(
    SPECIFIER_PATTERN,
    (match, prefix, quote, specifier) => `${prefix}${quote}${withExtension(file, specifier)}${quote}`,
  );

  if (fixed !== source) {
    writeFileSync(file, fixed);
  }
};

const walk = dir => {
  readdirSync(dir).forEach(entry => {
    const path = join(dir, entry);

    if (statSync(path).isDirectory()) {
      walk(path);
    } else if (entry.endsWith('.d.ts')) {
      fixDeclarationFile(path);
    }
  });
};

walk(distDir);
