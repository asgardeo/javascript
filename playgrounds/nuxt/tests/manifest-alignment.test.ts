/**
 * Manifest alignment test.
 *
 * Asserts that every export name referenced in sdk-manifest.ts is actually
 * exported by the corresponding @asgardeo/nuxt subpath. This prevents the
 * playground from documenting APIs that don't exist in the public surface.
 *
 * Run with: pnpm vitest tests/manifest-alignment.test.ts
 */
import {describe, it, expect} from 'vitest';
import * as rootExports from '@asgardeo/nuxt';
import * as serverExports from '@asgardeo/nuxt/server';
import * as errorExports from '@asgardeo/nuxt/errors';
import * as utilsExports from '@asgardeo/nuxt/utils';

import {
  composables,
  middleware,
  serverUtilities,
  referenceErrors,
} from '../utils/sdk-manifest';

// ── Root exports (@asgardeo/nuxt) ─────────────────────────────────────────

const ROOT_EXPECTED = [
  // Composables (auto-imported so they're also exported from root)
  ...composables.map((c) => c.name),
  // Middleware factory
  'defineAsgardeoMiddleware',
  // Module default
  'default',
] as const;

describe('@asgardeo/nuxt root exports', () => {
  for (const name of ROOT_EXPECTED) {
    it(`exports "${name}"`, () => {
      expect(rootExports).toHaveProperty(name);
    });
  }
});

// ── Server exports (@asgardeo/nuxt/server) ────────────────────────────────

// Map manifest names to their actual export identifiers
const SERVER_EXPORT_MAP: Record<string, string> = {
  useServerSession:     'useServerSession',
  requireServerSession: 'requireServerSession',
  getValidAccessToken:  'getValidAccessToken',
  getAsgardeoContext:   'getAsgardeoContext',
};

describe('@asgardeo/nuxt/server exports', () => {
  for (const entry of serverUtilities) {
    const exportName = SERVER_EXPORT_MAP[entry.name] ?? entry.name;
    it(`exports "${exportName}" (from manifest entry "${entry.name}")`, () => {
      expect(serverExports).toHaveProperty(exportName);
    });
  }
});

// ── Errors exports (@asgardeo/nuxt/errors) ────────────────────────────────

describe('@asgardeo/nuxt/errors exports', () => {
  for (const entry of referenceErrors) {
    it(`exports "${entry.name}"`, () => {
      expect(errorExports).toHaveProperty(entry.name);
    });
  }
});

// ── Utils exports (@asgardeo/nuxt/utils) ─────────────────────────────────

describe('@asgardeo/nuxt/utils exports', () => {
  it('exports "createRouteMatcher"', () => {
    expect(utilsExports).toHaveProperty('createRouteMatcher');
  });
});

// ── Middleware: named 'auth' is registered, factory is callable ──────────

describe('middleware surface', () => {
  it('defineAsgardeoMiddleware is a function exported from @asgardeo/nuxt', () => {
    expect(typeof rootExports.defineAsgardeoMiddleware).toBe('function');
  });
});
