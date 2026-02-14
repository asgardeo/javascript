/**
 * Health-check polling utility that waits for an IDP to become ready.
 */

import {insecureAgent} from './http-utils';

interface WaitOptions {
  /** Maximum time to wait in milliseconds. Default: 180000 (3 minutes). */
  timeoutMs?: number;
  /** Polling interval in milliseconds. Default: 5000 (5 seconds). */
  intervalMs?: number;
}

export async function waitForIdp(healthUrl: string, options: WaitOptions = {}): Promise<void> {
  const {timeoutMs = 180_000, intervalMs = 5_000} = options;
  const start = Date.now();

  console.log(`[E2E] Waiting for IDP at ${healthUrl} (timeout: ${timeoutMs / 1000}s)...`);

  while (Date.now() - start < timeoutMs) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(healthUrl, {
        signal: controller.signal,
        // @ts-expect-error -- Node fetch supports dispatcher via undici
        dispatcher: insecureAgent,
      });

      clearTimeout(timer);

      if (response.ok || response.status === 302) {
        const elapsed = ((Date.now() - start) / 1000).toFixed(1);

        console.log(`[E2E] IDP ready at ${healthUrl} (took ${elapsed}s)`);

        return;
      }
    } catch {
      // IDP not ready yet
    }

    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  throw new Error(`[E2E] IDP at ${healthUrl} did not become healthy within ${timeoutMs / 1000}s`);
}
