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

import {afterEach, beforeEach, describe, expect, it, vi, Mock} from 'vitest';
import {
  BRANDING_PREFERENCE_CACHE_TTL_MS,
  clearBrandingPreferenceCache,
  withBrandingPreferenceCache,
} from '../brandingPreferenceCache';

describe('withBrandingPreferenceCache', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-06T00:00:00Z'));
    clearBrandingPreferenceCache();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads once per key within the TTL and shares the in-flight request', async () => {
    const load: Mock = vi.fn().mockResolvedValue({theme: 'light'});

    const [first, second] = await Promise.all([
      withBrandingPreferenceCache('acme|APP|app-1|en-US', load),
      withBrandingPreferenceCache('acme|APP|app-1|en-US', load),
    ]);
    const third: unknown = await withBrandingPreferenceCache('acme|APP|app-1|en-US', load);

    expect(load).toHaveBeenCalledTimes(1);
    expect(first).toEqual({theme: 'light'});
    expect(second).toBe(first);
    expect(third).toBe(first);
  });

  it('loads again once the TTL has elapsed', async () => {
    const load: Mock = vi.fn().mockResolvedValue({theme: 'light'});

    await withBrandingPreferenceCache('key', load);
    vi.advanceTimersByTime(BRANDING_PREFERENCE_CACHE_TTL_MS + 1);
    await withBrandingPreferenceCache('key', load);

    expect(load).toHaveBeenCalledTimes(2);
  });

  it('keeps different keys apart', async () => {
    const load: Mock = vi.fn().mockResolvedValue({theme: 'light'});

    await withBrandingPreferenceCache('acme|APP|app-1|en-US', load);
    await withBrandingPreferenceCache('acme|APP|app-1|fr-FR', load);

    expect(load).toHaveBeenCalledTimes(2);
  });

  it('does not cache a failed load', async () => {
    const load: Mock = vi.fn().mockRejectedValueOnce(new Error('unavailable')).mockResolvedValue({theme: 'light'});

    await expect(withBrandingPreferenceCache('key', load)).rejects.toThrow('unavailable');
    await expect(withBrandingPreferenceCache('key', load)).resolves.toEqual({theme: 'light'});

    expect(load).toHaveBeenCalledTimes(2);
  });
});
