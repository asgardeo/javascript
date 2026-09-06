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
 * How long a branding preference is served from memory before it is fetched again.
 */
export const BRANDING_PREFERENCE_CACHE_TTL_MS: number = 5 * 60 * 1000;

interface CacheEntry<T> {
  expiresAt: number;
  value: Promise<T>;
}

const cache: Map<string, CacheEntry<unknown>> = new Map();

/**
 * Serves `load()` from an in-memory cache for `ttlMs`. Concurrent callers share the same in-flight request,
 * and a failed load is not cached so the next caller retries.
 *
 * The server provider needs the branding preference on every render, and it changes rarely, so fetching it
 * from the identity server on every request is wasted latency.
 */
export const withBrandingPreferenceCache = async <T>(
  key: string,
  load: () => Promise<T>,
  ttlMs: number = BRANDING_PREFERENCE_CACHE_TTL_MS,
): Promise<T> => {
  const now: number = Date.now();
  const existing: CacheEntry<T> | undefined = cache.get(key) as CacheEntry<T> | undefined;

  if (existing && existing.expiresAt > now) {
    return existing.value;
  }

  const value: Promise<T> = load().catch((error: unknown) => {
    cache.delete(key);

    throw error;
  });

  cache.set(key, {expiresAt: now + ttlMs, value});

  return value;
};

/**
 * Empties the cache (used by tests and after configuration changes).
 */
export const clearBrandingPreferenceCache = (): void => {
  cache.clear();
};
