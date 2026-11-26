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

import {afterEach, describe, expect, it, vi} from 'vitest';
import {ref} from 'vue';
import type {AsgardeoContext} from '../../models/contexts';
import {registerAsgardeoContext} from '../../router/contextRegistry';
import {createAsgardeoGuard} from '../../router/guard';

const createContext = (isInitialized: boolean, isSignedIn: boolean): AsgardeoContext =>
  ({isInitialized: ref(isInitialized), isSignedIn: ref(isSignedIn)}) as unknown as AsgardeoContext;

const route: {fullPath: string; path: string; query: Record<string, never>} = {fullPath: '/', path: '/', query: {}};

describe('createAsgardeoGuard', () => {
  let unregister: (() => void) | undefined;

  afterEach(() => {
    unregister?.();
    unregister = undefined;
  });

  it('allows navigation for a signed-in user of the mounted provider', async () => {
    unregister = registerAsgardeoContext(createContext(true, true));
    const next: ReturnType<typeof vi.fn> = vi.fn();

    await createAsgardeoGuard({redirectTo: '/login'})(route, route, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('redirects a signed-out user', async () => {
    unregister = registerAsgardeoContext(createContext(true, false));
    const next: ReturnType<typeof vi.fn> = vi.fn();

    await createAsgardeoGuard({redirectTo: '/login'})(route, route, next);

    expect(next).toHaveBeenCalledWith({path: '/login'});
  });

  it('waits for the provider to mount and initialize', async () => {
    const context: AsgardeoContext = createContext(false, true);
    const next: ReturnType<typeof vi.fn> = vi.fn();
    const navigation: Promise<void> = createAsgardeoGuard({initTimeout: 2000})(route, route, next) as Promise<void>;

    setTimeout(() => {
      unregister = registerAsgardeoContext(context);
    }, 20);
    setTimeout(() => {
      (context.isInitialized as unknown as {value: boolean}).value = true;
    }, 40);

    await navigation;

    expect(next).toHaveBeenCalledWith();
  });

  it('redirects when no provider mounts before the timeout', async () => {
    const next: ReturnType<typeof vi.fn> = vi.fn();

    await createAsgardeoGuard({initTimeout: 50, redirectTo: '/login'})(route, route, next);

    expect(next).toHaveBeenCalledWith({path: '/login'});
  });
});
