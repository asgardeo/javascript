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

import {describe, expect, it, vi} from 'vitest';
import {defineComponent, h, ref} from 'vue';
import {mount} from '@vue/test-utils';
import useAsgardeo from '../../composables/useAsgardeo';
import {ASGARDEO_KEY} from '../../keys';
import type {AsgardeoContext} from '../../models/contexts';

/**
 * Creates a minimal mock AsgardeoContext for testing purposes.
 */
function createMockAsgardeoContext(overrides: Partial<AsgardeoContext> = {}): AsgardeoContext {
  return {
    isSignedIn: ref(false),
    isLoading: ref(false),
    isInitialized: ref(true),
    user: ref(null),
    organization: ref(null),
    signIn: vi.fn(),
    signOut: vi.fn(),
    signUp: vi.fn(),
    signInSilently: vi.fn(),
    getAccessToken: vi.fn(),
    getDecodedIdToken: vi.fn(),
    getIdToken: vi.fn(),
    exchangeToken: vi.fn(),
    reInitialize: vi.fn(),
    clearSession: vi.fn(),
    http: {
      request: vi.fn(),
      requestAll: vi.fn(),
    },
    ...overrides,
  } as unknown as AsgardeoContext;
}

describe('useAsgardeo', () => {
  it('should return the AsgardeoContext when called inside a provider', () => {
    const mockContext = createMockAsgardeoContext();
    let result: AsgardeoContext | undefined;

    const TestChild = defineComponent({
      setup() {
        result = useAsgardeo();
        return () => h('div', 'test');
      },
    });

    mount(TestChild, {
      global: {
        provide: {
          [ASGARDEO_KEY as symbol]: mockContext,
        },
      },
    });

    expect(result).toBeDefined();
    expect(result!.isSignedIn.value).toBe(false);
    expect(result!.isLoading.value).toBe(false);
    expect(result!.isInitialized.value).toBe(true);
  });

  it('should throw an error when called outside of AsgardeoProvider', () => {
    const TestChild = defineComponent({
      setup() {
        useAsgardeo();
        return () => h('div', 'test');
      },
    });

    expect(() => {
      mount(TestChild);
    }).toThrow('[Asgardeo] useAsgardeo() was called outside of <AsgardeoProvider>');
  });

  it('should return reactive auth state', () => {
    const isSignedIn = ref(false);
    const mockContext = createMockAsgardeoContext({isSignedIn});
    let result: AsgardeoContext | undefined;

    const TestChild = defineComponent({
      setup() {
        result = useAsgardeo();
        return () => h('div', 'test');
      },
    });

    mount(TestChild, {
      global: {
        provide: {
          [ASGARDEO_KEY as symbol]: mockContext,
        },
      },
    });

    expect(result!.isSignedIn.value).toBe(false);
    isSignedIn.value = true;
    expect(result!.isSignedIn.value).toBe(true);
  });

  it('should expose signIn and signOut methods', () => {
    const mockContext = createMockAsgardeoContext();
    let result: AsgardeoContext | undefined;

    const TestChild = defineComponent({
      setup() {
        result = useAsgardeo();
        return () => h('div', 'test');
      },
    });

    mount(TestChild, {
      global: {
        provide: {
          [ASGARDEO_KEY as symbol]: mockContext,
        },
      },
    });

    expect(typeof result!.signIn).toBe('function');
    expect(typeof result!.signOut).toBe('function');
    expect(typeof result!.signUp).toBe('function');
    expect(typeof result!.getAccessToken).toBe('function');
  });
});
