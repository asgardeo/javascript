#!/usr/bin/env node

/**
 * NPM Package Security Audit Script for Asgardeo JavaScript SDK
 *
 * This script analyzes all package.json files in the workspace and checks
 * the publish dates of dependencies against a cutoff date to identify
 * potentially compromised packages.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CUTOFF_DATE = new Date('2025-11-01T00:00:00Z');
const ROOT_DIR = process.argv[2] || process.cwd();

function fetchPackageInfo(packageName) {
  return new Promise((resolve, reject) => {
    const url = `https://registry.npmjs.org/${packageName.replace('/', '%2F')}`;

    https.get(url, { headers: { 'Accept': 'application/json' } }, (res) => {
      let data = '';

      // Handle HTTP errors
      if (res.statusCode === 404) {
        reject(new Error(`Package not found on npm registry`));
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: Failed to fetch package info`));
        return;
      }

      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) {
            reject(new Error(json.error));
          } else {
            resolve(json);
          }
        } catch (e) {
          reject(new Error(`Failed to parse npm response: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Parse version specification and return the actual version to look up
 * Returns an object with: { version, shouldSkip, skipReason, resolveLatest }
 */
function parseVersion(versionSpec) {
  if (!versionSpec) {
    return { shouldSkip: true, skipReason: 'Empty version' };
  }

  // Handle workspace protocol
  if (versionSpec === 'workspace:*' || versionSpec.startsWith('workspace:')) {
    return { shouldSkip: true, skipReason: 'Workspace dependency (local package)' };
  }

  // Handle catalog protocol
  if (versionSpec === 'catalog:') {
    return { shouldSkip: true, skipReason: 'Catalog reference (resolved from workspace)' };
  }

  // Handle git URLs
  if (versionSpec.startsWith('git+') || versionSpec.includes('github.com')) {
    return { shouldSkip: true, skipReason: 'Git dependency' };
  }

  // Handle link: protocol (local links)
  if (versionSpec.startsWith('link:') || versionSpec === 'link:') {
    return { shouldSkip: true, skipReason: 'Local link dependency' };
  }

  // Handle file: protocol
  if (versionSpec.startsWith('file:')) {
    return { shouldSkip: true, skipReason: 'Local file dependency' };
  }

  // Handle "latest" tag - need to resolve it
  if (versionSpec === 'latest') {
    return { resolveLatest: true };
  }

  // Handle npm: aliases (e.g., npm:package@version)
  if (versionSpec.startsWith('npm:')) {
    const parts = versionSpec.split('@');
    const version = parts[parts.length - 1];
    return { version: version.replace(/^[\^~>=<]+/, '') };
  }

  // Handle version ranges - extract the base version number
  // Examples: ^1.2.3, ~1.2.3, >=1.2.3, =4, >1.0.0
  let cleanVersion = versionSpec;

  // Remove leading operators (^, ~, >=, >, <=, <, =)
  cleanVersion = cleanVersion.replace(/^[\^~>=<]+/, '');

  // Handle x-ranges like "4.x" or "4.*"
  if (cleanVersion.includes('x') || cleanVersion.includes('*')) {
    return { resolveLatest: true, rangeHint: cleanVersion };
  }

  // Handle hyphen ranges like "1.0.0 - 2.0.0"
  if (cleanVersion.includes(' - ')) {
    cleanVersion = cleanVersion.split(' - ')[1].trim();
  }

  // Handle || ranges - take the first part
  if (cleanVersion.includes('||')) {
    cleanVersion = cleanVersion.split('||')[0].trim().replace(/^[\^~>=<]+/, '');
  }

  // If it's just a major version like "4", we need to resolve the actual version
  if (/^\d+$/.test(cleanVersion)) {
    return { resolveLatest: true, majorVersion: cleanVersion };
  }

  // If it's major.minor like "4.1", we need to resolve too
  if (/^\d+\.\d+$/.test(cleanVersion)) {
    return { resolveLatest: true, minorVersion: cleanVersion };
  }

  // Remove prerelease suffix for lookup but preserve it
  const baseVersion = cleanVersion.split('-')[0];

  return { version: baseVersion };
}

/**
 * Resolve the actual version from npm registry for "latest" or version ranges
 */
function resolveVersion(packageInfo, versionHint) {
  const distTags = packageInfo['dist-tags'] || {};
  const allVersions = Object.keys(packageInfo.time || {})
    .filter(v => v !== 'created' && v !== 'modified');

  // Filter out pre-release versions
  const stableVersions = allVersions.filter(v =>
    v.indexOf('alpha') === -1 &&
    v.indexOf('beta') === -1 &&
    v.indexOf('rc') === -1 &&
    v.indexOf('canary') === -1 &&
    v.indexOf('experimental') === -1
  );

  // IMPORTANT: Check for major/minor version hints FIRST before falling back to "latest"
  // This ensures ">=13" or "=13" resolves to latest 13.x, not the absolute latest

  // If we have a major version hint (e.g., "13" from ">=13" or "=13"), find latest in that major
  if (versionHint && versionHint.majorVersion) {
    const major = versionHint.majorVersion;
    const matching = stableVersions
      .filter(v => v.startsWith(`${major}.`))
      .sort((a, b) => new Date(packageInfo.time[b]) - new Date(packageInfo.time[a]));

    if (matching.length > 0) {
      return matching[0];
    }
    // Fall through to latest if no matching major version found
  }

  // If we have a minor version hint (e.g., "4.1"), find latest patch
  if (versionHint && versionHint.minorVersion) {
    const [major, minor] = versionHint.minorVersion.split('.');
    const matching = stableVersions
      .filter(v => v.startsWith(`${major}.${minor}.`))
      .sort((a, b) => new Date(packageInfo.time[b]) - new Date(packageInfo.time[a]));

    if (matching.length > 0) {
      return matching[0];
    }
    // Fall through to latest if no matching minor version found
  }

  // Default: If hint is just "latest" (no major/minor constraint), use the dist-tag
  if (distTags.latest) {
    return distTags.latest;
  }

  // Fallback to most recent stable version
  const sorted = stableVersions
    .sort((a, b) => new Date(packageInfo.time[b]) - new Date(packageInfo.time[a]));
  return sorted[0];
}

function findAllPackageJsonFiles(rootDir) {
  try {
    const output = execSync(
      `find "${rootDir}" -name "package.json" -not -path "*/node_modules/*" -type f`,
      { encoding: 'utf8' }
    );
    return output.trim().split('\n').filter(Boolean);
  } catch (error) {
    console.error('Error finding package.json files:', error.message);
    return [];
  }
}

function parseWorkspaceCatalog(workspaceFile) {
  if (!workspaceFile || !fs.existsSync(workspaceFile)) return null;

  try {
    const content = fs.readFileSync(workspaceFile, 'utf8');
    const lines = content.split('\n');
    const catalog = {};
    let inCatalog = false;

    for (const line of lines) {
      if (line.trim() === 'catalog:') {
        inCatalog = true;
        continue;
      }

      // Exit catalog section if we hit another top-level key
      if (inCatalog && line.match(/^[a-zA-Z]/)) {
        break;
      }

      if (inCatalog && line.includes(':')) {
        const match = line.match(/^\s*['"]?([^'":\s]+)['"]?\s*:\s*(.+)$/);
        if (match) {
          const [, packageName, version] = match;
          catalog[packageName] = version.trim().replace(/^['"]|['"]$/g, '');
        }
      }
    }

    return Object.keys(catalog).length > 0 ? catalog : null;
  } catch (error) {
    console.error('Error parsing workspace file:', error.message);
    return null;
  }
}

async function analyzePackage(name, versionSpec, context = '') {
  try {
    const parsed = parseVersion(versionSpec);

    // Handle skipped packages
    if (parsed.shouldSkip) {
      return {
        name,
        versionSpec,
        context,
        skipped: true,
        skipReason: parsed.skipReason,
      };
    }

    // Fetch package info from npm
    const info = await fetchPackageInfo(name);

    // Resolve the actual version if needed
    let currentVersion;
    if (parsed.resolveLatest || parsed.majorVersion || parsed.minorVersion) {
      currentVersion = resolveVersion(info, parsed);
      if (!currentVersion) {
        return {
          name,
          versionSpec,
          context,
          error: `Could not resolve version for ${versionSpec}`,
        };
      }
    } else {
      currentVersion = parsed.version;
    }

    // Check if the version exists in the registry
    if (!info.time || !info.time[currentVersion]) {
      // Try to find a matching version
      const allVersions = Object.keys(info.time || {}).filter(v => v !== 'created' && v !== 'modified');

      // Try exact match first, then try with/without 'v' prefix
      let matchedVersion = allVersions.find(v => v === currentVersion);
      if (!matchedVersion) {
        matchedVersion = allVersions.find(v => v === `v${currentVersion}` || v === currentVersion.replace(/^v/, ''));
      }

      if (matchedVersion) {
        currentVersion = matchedVersion;
      } else {
        return {
          name,
          versionSpec,
          currentVersion,
          context,
          error: `Version ${currentVersion} not found. Available: ${allVersions.slice(-5).join(', ')}`,
        };
      }
    }

    const publishDate = new Date(info.time[currentVersion]);
    const isAfterCutoff = publishDate >= CUTOFF_DATE;
    const isFutureDate = publishDate > new Date();

    const result = {
      name,
      versionSpec,
      currentVersion,
      publishDate: publishDate.toISOString(),
      publishDateFormatted: publishDate.toUTCString(),
      publishDateShort: publishDate.toISOString().split('T')[0],
      context,
      isAfterCutoff,
      isFutureDate,
      safeAlternatives: [],
    };

    if (isAfterCutoff) {
      const allVersions = Object.keys(info.time)
        .filter(v => v !== 'created' && v !== 'modified')
        .filter(v => !v.includes('canary') && !v.includes('experimental') && !v.includes('rc') && !v.includes('alpha') && !v.includes('beta'))
        .map(v => ({
          version: v,
          date: new Date(info.time[v])
        }))
        .filter(v => v.date < CUTOFF_DATE && v.date <= new Date())
        .sort((a, b) => b.date - a.date);

      result.safeAlternatives = allVersions.slice(0, 3).map(v => ({
        version: v.version,
        date: v.date.toISOString().split('T')[0]
      }));
    }

    return result;
  } catch (error) {
    return {
      name,
      versionSpec,
      context,
      error: error.message,
    };
  }
}

// Helper function to pad/truncate strings for table formatting
function padString(str, len, align = 'left') {
  if (str.length > len) {
    return str.substring(0, len - 3) + '...';
  }
  if (align === 'left') {
    return str.padEnd(len);
  }
  return str.padStart(len);
}

async function main() {
  const outputLines = [];

  outputLines.push('================================================================================');
  outputLines.push('ASGARDEO JAVASCRIPT SDK - NPM PACKAGE SECURITY AUDIT REPORT');
  outputLines.push('Supply Chain Attack Vector Analysis');
  outputLines.push('================================================================================');
  outputLines.push('');
  outputLines.push(`Root directory: ${ROOT_DIR}`);
  outputLines.push(`Cutoff date: November 1, 2025 00:00:00 UTC`);
  outputLines.push(`Report generated: ${new Date().toISOString()}`);
  outputLines.push(`Current date: ${new Date().toUTCString()}`);
  outputLines.push('');
  outputLines.push('================================================================================');
  outputLines.push('');

  // Find all package.json files
  const packageFiles = findAllPackageJsonFiles(ROOT_DIR);
  outputLines.push(`Found ${packageFiles.length} package.json files (excluding node_modules)`);
  outputLines.push('');

  // Find and parse workspace catalog
  const workspaceFile = path.join(ROOT_DIR, 'pnpm-workspace.yaml');
  let workspaceCatalog = null;

  if (fs.existsSync(workspaceFile)) {
    outputLines.push(`Workspace file: ${workspaceFile}`);
    workspaceCatalog = parseWorkspaceCatalog(workspaceFile);
    if (workspaceCatalog) {
      outputLines.push(`Workspace catalog packages: ${Object.keys(workspaceCatalog).length}`);
    }
  }
  outputLines.push('');

  const allResults = [];
  const packageVersionMap = new Map();
  const analyzedPackages = new Set();
  const skippedPackages = [];

  // Analyze workspace catalog first
  if (workspaceCatalog) {
    outputLines.push('Analyzing workspace catalog...');
    for (const [name, version] of Object.entries(workspaceCatalog)) {
      const key = `${name}@${version}`;
      if (!packageVersionMap.has(key)) {
        packageVersionMap.set(key, []);
      }
      packageVersionMap.get(key).push('workspace-catalog');

      if (!analyzedPackages.has(key)) {
        analyzedPackages.add(key);
        const result = await analyzePackage(name, version, 'workspace-catalog');
        if (result.skipped) {
          skippedPackages.push(result);
        } else {
          allResults.push(result);
        }
        process.stdout.write('.');
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    console.log('');
  }

  // Analyze each package.json
  for (const filePath of packageFiles) {
    try {
      const relPath = path.relative(ROOT_DIR, filePath);
      const packageJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
        ...packageJson.peerDependencies,
      };

      if (Object.keys(allDeps).length === 0) {
        continue;
      }

      outputLines.push(`Analyzing: ${relPath}`);

      for (const [name, version] of Object.entries(allDeps)) {
        // Skip workspace and catalog references - they're local packages
        if (version === 'workspace:*' || version.startsWith('workspace:') || version === 'catalog:') {
          continue;
        }

        const key = `${name}@${version}`;
        if (!packageVersionMap.has(key)) {
          packageVersionMap.set(key, []);
        }
        packageVersionMap.get(key).push(relPath);

        if (!analyzedPackages.has(key)) {
          analyzedPackages.add(key);
          const result = await analyzePackage(name, version, relPath);
          if (result.skipped) {
            skippedPackages.push(result);
          } else {
            allResults.push(result);
          }
          process.stdout.write('.');
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    } catch (error) {
      outputLines.push(`Error processing ${filePath}: ${error.message}`);
    }
  }
  console.log('');
  outputLines.push('');

  // Generate summary
  const totalPackages = allResults.length;
  const uniquePackages = new Set(allResults.map(r => r.name)).size;
  const afterCutoff = allResults.filter(r => r.isAfterCutoff);
  const withFutureDate = allResults.filter(r => r.isFutureDate);
  const errors = allResults.filter(r => r.error);
  const safe = allResults.filter(r => !r.isAfterCutoff && !r.error);

  outputLines.push('================================================================================');
  outputLines.push('EXECUTIVE SUMMARY');
  outputLines.push('================================================================================');
  outputLines.push('');
  outputLines.push(`Total package entries analyzed: ${totalPackages}`);
  outputLines.push(`Unique packages: ${uniquePackages}`);
  outputLines.push(`Packages published BEFORE Nov 1, 2025 (SAFE): ${safe.length}`);
  outputLines.push(`Packages published ON/AFTER Nov 1, 2025 (REVIEW NEEDED): ${afterCutoff.length}`);
  outputLines.push(`Packages with FUTURE dates (CRITICAL - Registry compromise): ${withFutureDate.length}`);
  outputLines.push(`Packages with errors/not found: ${errors.length}`);
  outputLines.push(`Skipped (local/workspace dependencies): ${skippedPackages.length}`);
  outputLines.push('');

  // Group by package name for all sections
  const grouped = new Map();
  afterCutoff.forEach(r => {
    if (!grouped.has(r.name)) {
      grouped.set(r.name, []);
    }
    grouped.get(r.name).push(r);
  });

  // Sort grouped entries by publish date descending (newest first)
  const sortedGrouped = [...grouped.entries()].sort((a, b) => {
    const dateA = a[1][0].publishDate ? new Date(a[1][0].publishDate) : new Date(0);
    const dateB = b[1][0].publishDate ? new Date(b[1][0].publishDate) : new Date(0);
    return dateB - dateA;
  });

  if (afterCutoff.length > 0) {
    outputLines.push('================================================================================');
    outputLines.push('PACKAGES REQUIRING ATTENTION (sorted by publish date, newest first)');
    outputLines.push('================================================================================');
    outputLines.push('');

    // Table header
    const tableHeader = `| ${'Date'.padEnd(12)} | ${'Package'.padEnd(45)} | ${'Recommended'.padEnd(20)} | Used In`;
    const tableSeparator = `|${'-'.repeat(14)}|${'-'.repeat(47)}|${'-'.repeat(22)}|${'-'.repeat(50)}`;

    outputLines.push(tableHeader);
    outputLines.push(tableSeparator);

    sortedGrouped.forEach(([packageName, results]) => {
      const firstResult = results[0];
      const allLocations = [];
      results.forEach(r => {
        const locations = packageVersionMap.get(`${r.name}@${r.versionSpec}`) || [r.context];
        allLocations.push(...locations);
      });
      const uniqueLocations = [...new Set(allLocations)];
      const dateStr = firstResult.publishDateShort || 'N/A';
      const pkgStr = `${packageName}@${firstResult.currentVersion}`;
      const recStr = firstResult.safeAlternatives.length > 0
        ? firstResult.safeAlternatives[0].version
        : 'No safe version';
      const locStr = uniqueLocations.slice(0, 3).join(', ') + (uniqueLocations.length > 3 ? '...' : '');

      outputLines.push(`| ${padString(dateStr, 12)} | ${padString(pkgStr, 45)} | ${padString(recStr, 20)} | ${locStr}`);
    });

    outputLines.push('');
    outputLines.push('');

    // Detailed breakdown for each package
    outputLines.push('================================================================================');
    outputLines.push('DETAILED PACKAGE INFORMATION');
    outputLines.push('================================================================================');
    outputLines.push('');

    sortedGrouped.forEach(([packageName, results]) => {
      const firstResult = results[0];
      const allLocations = [];
      results.forEach(r => {
        const locations = packageVersionMap.get(`${r.name}@${r.versionSpec}`) || [r.context];
        allLocations.push(...locations);
      });
      const uniqueLocations = [...new Set(allLocations)];

      outputLines.push(`Package: ${packageName}@${firstResult.currentVersion}`);
      outputLines.push(`  Published: ${firstResult.publishDateShort}`);
      if (firstResult.isFutureDate) {
        outputLines.push(`  ⚠️  CRITICAL: FUTURE DATE - Possible registry compromise!`);
      }
      outputLines.push(`  Used in: ${uniqueLocations.join(', ')}`);
      if (firstResult.safeAlternatives.length > 0) {
        outputLines.push(`  Safe alternatives:`);
        firstResult.safeAlternatives.forEach(alt => {
          outputLines.push(`    - ${alt.version} (${alt.date})`);
        });
      }
      outputLines.push('');
    });

    outputLines.push('');
    outputLines.push('================================================================================');
    outputLines.push('BULK REMEDIATION COMMANDS');
    outputLines.push('================================================================================');
    outputLines.push('');
    outputLines.push('Update these packages to safe versions:');
    outputLines.push('');

    sortedGrouped.forEach(([packageName, results]) => {
      const firstResult = results[0];
      if (firstResult.safeAlternatives.length > 0) {
        const recommended = firstResult.safeAlternatives[0];
        outputLines.push(`pnpm add ${packageName}@${recommended.version}`);
      }
    });
  } else {
    outputLines.push('================================================================================');
    outputLines.push('ALL PACKAGES ARE SAFE');
    outputLines.push('================================================================================');
    outputLines.push('');
    outputLines.push('No packages were found that were published after the cutoff date.');
  }

  outputLines.push('');
  outputLines.push('================================================================================');
  outputLines.push('COMPLETE PACKAGE LIST (sorted by publish date, newest first)');
  outputLines.push('================================================================================');
  outputLines.push('');

  // Group all results by package name
  const allGrouped = new Map();
  allResults.forEach(r => {
    if (!allGrouped.has(r.name)) {
      allGrouped.set(r.name, []);
    }
    allGrouped.get(r.name).push(r);
  });

  // Sort all packages by publish date descending
  const sortedAllGrouped = [...allGrouped.entries()].sort((a, b) => {
    const resultA = a[1][0];
    const resultB = b[1][0];

    if (resultA.error && !resultB.error) return 1;
    if (!resultA.error && resultB.error) return -1;
    if (resultA.error && resultB.error) return a[0].localeCompare(b[0]);

    const dateA = resultA.publishDate ? new Date(resultA.publishDate) : new Date(0);
    const dateB = resultB.publishDate ? new Date(resultB.publishDate) : new Date(0);
    return dateB - dateA;
  });

  // Table header for complete list
  const fullTableHeader = `| ${'Status'.padEnd(8)} | ${'Date'.padEnd(12)} | ${'Package'.padEnd(45)} | Used In`;
  const fullTableSeparator = `|${'-'.repeat(10)}|${'-'.repeat(14)}|${'-'.repeat(47)}|${'-'.repeat(50)}`;

  outputLines.push(fullTableHeader);
  outputLines.push(fullTableSeparator);

  sortedAllGrouped.forEach(([packageName, results]) => {
    const firstResult = results[0];
    const allLocations = [];
    results.forEach(r => {
      const locations = packageVersionMap.get(`${r.name}@${r.versionSpec}`) || [r.context];
      allLocations.push(...locations);
    });
    const uniqueLocations = [...new Set(allLocations)];

    let status, dateStr;
    if (firstResult.error) {
      status = 'ERROR';
      dateStr = 'N/A';
    } else if (firstResult.isAfterCutoff) {
      status = 'REVIEW';
      dateStr = firstResult.publishDateShort;
    } else {
      status = 'SAFE';
      dateStr = firstResult.publishDateShort;
    }

    const pkgStr = `${packageName}@${firstResult.currentVersion || firstResult.versionSpec}`;
    const locStr = uniqueLocations.slice(0, 2).join(', ') + (uniqueLocations.length > 2 ? '...' : '');

    outputLines.push(`| ${padString(status, 8)} | ${padString(dateStr, 12)} | ${padString(pkgStr, 45)} | ${locStr}`);
  });

  if (errors.length > 0) {
    outputLines.push('');
    outputLines.push('================================================================================');
    outputLines.push('PACKAGES WITH ERRORS');
    outputLines.push('================================================================================');
    outputLines.push('');
    outputLines.push('These packages could not be verified. Manual review recommended:');
    outputLines.push('');

    errors.forEach(r => {
      const locations = packageVersionMap.get(`${r.name}@${r.versionSpec}`) || [r.context];
      outputLines.push(`${r.name}@${r.versionSpec}`);
      outputLines.push(`  Error: ${r.error}`);
      outputLines.push(`  Used in: ${locations.join(', ')}`);
      outputLines.push('');
    });
  }

  if (skippedPackages.length > 0) {
    outputLines.push('');
    outputLines.push('================================================================================');
    outputLines.push('SKIPPED PACKAGES (Local/Workspace Dependencies)');
    outputLines.push('================================================================================');
    outputLines.push('');

    const skippedByReason = new Map();
    skippedPackages.forEach(r => {
      if (!skippedByReason.has(r.skipReason)) {
        skippedByReason.set(r.skipReason, []);
      }
      skippedByReason.get(r.skipReason).push(r);
    });

    skippedByReason.forEach((packages, reason) => {
      outputLines.push(`${reason}:`);
      packages.forEach(r => {
        outputLines.push(`  - ${r.name}@${r.versionSpec}`);
      });
      outputLines.push('');
    });
  }

  outputLines.push('');
  outputLines.push('================================================================================');
  outputLines.push('END OF REPORT');
  outputLines.push('================================================================================');

  // Write to file and console
  const reportContent = outputLines.join('\n');
  const reportFile = path.join(ROOT_DIR, 'SECURITY-AUDIT-REPORT.txt');
  fs.writeFileSync(reportFile, reportContent);

  console.log(reportContent);
  console.log('');
  console.log(`Report saved to: ${reportFile}`);
}

main().catch(console.error);
