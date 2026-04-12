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
 * Prepares local packages for symlinking into external projects.
 *
 * Problems this solves:
 *  - `catalog:` references in package.json are a pnpm workspace-only protocol.
 *    External consumers (even via `file:`) can't resolve them.
 *  - `workspace:*` references must become `file:` paths so the external project
 *    resolves inter-package dependencies to the local builds too.
 *
 * What it does:
 *  1. Reads the `catalog:` entries from pnpm-workspace.yaml.
 *  2. Builds all packages (pnpm build:packages).
 *  3. Patches every `packages/<*>/package.json`, replacing:
 *       `"catalog:"` → the real version string from the catalog
 *       `"workspace:*"` → `"file:<absolute-path-to-package>"`
 *  4. Prints ready-to-paste override snippets for pnpm and npm.
 *
 * To restore the source files after you're done:
 *   git checkout packages/<*>/package.json
 */

const fs = require('fs');
const path = require('path');
const {execSync} = require('child_process');

const ROOT = path.resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// 1. Parse catalog from pnpm-workspace.yaml
// ---------------------------------------------------------------------------

/**
 * Minimal YAML parser for the flat `catalog:` section in pnpm-workspace.yaml.
 * Handles both quoted and unquoted keys/values, and multi-word values.
 */
function parseCatalog() {
  const yamlPath = path.join(ROOT, 'pnpm-workspace.yaml');
  const yaml = fs.readFileSync(yamlPath, 'utf-8');
  const catalog = {};
  let inCatalog = false;

  for (const raw of yaml.split('\n')) {
    const line = raw.trimEnd();

    if (/^catalog:\s*$/.test(line)) {
      inCatalog = true;
      continue;
    }

    if (inCatalog) {
      // A non-indented, non-empty line signals the end of the catalog block.
      if (line.length > 0 && !/^\s/.test(line)) {
        inCatalog = false;
        continue;
      }

      // Match `  'key': value` or `  key: value`
      const match = line.match(/^\s+['"]?([^'":\s][^'":]*?)['"]?\s*:\s*(.+)$/);
      if (match) {
        catalog[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
      }
    }
  }

  return catalog;
}

// ---------------------------------------------------------------------------
// 2. Discover all publishable packages (packages/* minus workspace exclusions)
// ---------------------------------------------------------------------------

const EXCLUDED_PACKAGES = new Set(['nuxt']); // mirrors !packages/nuxt in pnpm-workspace.yaml

function findPackages() {
  const packagesDir = path.join(ROOT, 'packages');

  return fs
    .readdirSync(packagesDir, {withFileTypes: true})
    .filter(entry => entry.isDirectory() && !EXCLUDED_PACKAGES.has(entry.name))
    .map(entry => path.join(packagesDir, entry.name))
    .filter(pkgPath => fs.existsSync(path.join(pkgPath, 'package.json')));
}

// ---------------------------------------------------------------------------
// 3. Build packages
// ---------------------------------------------------------------------------

function buildPackages() {
  console.log('\nBuilding packages...\n');
  execSync('pnpm build:packages', {cwd: ROOT, stdio: 'inherit'});
  console.log('\nBuild complete.\n');
}

// ---------------------------------------------------------------------------
// 4. Patch package.json files – replace catalog: and workspace:* references
// ---------------------------------------------------------------------------

const DEP_FIELDS = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];

function patchPackages(pkgPaths, catalog) {
  // Build a name → absolute-path map for workspace packages.
  const workspaceMap = {};
  for (const pkgPath of pkgPaths) {
    const pkgJson = JSON.parse(fs.readFileSync(path.join(pkgPath, 'package.json'), 'utf-8'));
    if (pkgJson.name) workspaceMap[pkgJson.name] = pkgPath;
  }

  for (const pkgPath of pkgPaths) {
    const pkgJsonPath = path.join(pkgPath, 'package.json');
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
    let modified = false;

    for (const field of DEP_FIELDS) {
      if (!pkgJson[field]) continue;

      for (const [dep, version] of Object.entries(pkgJson[field])) {
        // catalog: (default catalog) or catalog:name (named catalog – treated the same here)
        if (typeof version === 'string' && version.startsWith('catalog:')) {
          const resolved = catalog[dep];
          if (resolved) {
            pkgJson[field][dep] = resolved;
            modified = true;
          } else {
            console.warn(`  [warn] No catalog entry for "${dep}" in ${pkgJson.name}`);
          }
        }

        if (version === 'workspace:*' || version === 'workspace:^' || version === 'workspace:~') {
          const resolved = workspaceMap[dep];
          if (resolved) {
            pkgJson[field][dep] = `file:${resolved}`;
            modified = true;
          } else {
            console.warn(`  [warn] Workspace package "${dep}" not found for ${pkgJson.name}`);
          }
        }
      }
    }

    if (modified) {
      fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2) + '\n');
      console.log(`  patched  ${pkgJson.name}`);
    }
  }
}

// ---------------------------------------------------------------------------
// 5. Print override snippets
// ---------------------------------------------------------------------------

function printSnippets(pkgPaths) {
  const overrides = {};
  for (const pkgPath of pkgPaths) {
    const pkgJson = JSON.parse(fs.readFileSync(path.join(pkgPath, 'package.json'), 'utf-8'));
    if (pkgJson.name) overrides[pkgJson.name] = `file:${pkgPath}`;
  }

  const divider = '─'.repeat(60);

  console.log(`\n${divider}`);
  console.log("  pnpm — add to your project's package.json");
  console.log(divider);
  console.log(JSON.stringify({pnpm: {overrides}}, null, 2));

  console.log(`\n${divider}`);
  console.log("  npm — add to your project's package.json");
  console.log(divider);
  console.log(JSON.stringify({overrides}, null, 2));

  console.log(`\n${divider}`);
  console.log("  Yarn (Berry) — add to your project's package.json");
  console.log(divider);
  console.log(JSON.stringify({resolutions: overrides}, null, 2));

  console.log(`\n${divider}`);
  console.log('  To restore source files when done:');
  console.log('    git checkout packages/*/package.json');
  console.log(divider + '\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

console.log('symlink — preparing local packages for external linking\n');

const catalog = parseCatalog();
console.log(`Catalog entries found: ${Object.keys(catalog).length}`);

const pkgPaths = findPackages();
console.log(`Packages found: ${pkgPaths.length} (${pkgPaths.map(p => path.basename(p)).join(', ')})`);

buildPackages();

console.log('Patching package.json files...');
patchPackages(pkgPaths, catalog);

printSnippets(pkgPaths);
