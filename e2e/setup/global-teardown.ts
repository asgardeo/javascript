/**
 * Playwright global teardown.
 *
 * Docker container lifecycle is managed externally via `pnpm e2e:docker:down`.
 */

export default async function globalTeardown(): Promise<void> {
  console.log('[E2E Global Teardown] Complete.');
}
