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

import type {User} from '@asgardeo/node';
import type {Ref} from 'vue';
import {computed} from 'vue';
import {useState, navigateTo} from '#app';
import type {AsgardeoAuthState} from '../types';

export interface UseAsgardeoReturn {
  /** Whether the user is signed in */
  isSignedIn: Ref<boolean>;
  /** Whether auth state is loading */
  isLoading: Ref<boolean>;
  /** The current user (null if not signed in) */
  user: Ref<User | null>;
  /** Initiate sign-in by redirecting to Asgardeo */
  signIn: (returnTo?: string) => Promise<void>;
  /** Sign out and redirect */
  signOut: () => Promise<void>;
  /** Get the current access token from the server */
  getAccessToken: () => Promise<string | null>;
  /** Refresh user info from the server */
  refreshUser: () => Promise<void>;
}

/**
 * Primary composable for Asgardeo authentication.
 *
 * Auth state is SSR-hydrated (no loading flash) and reactive.
 *
 * @example
 * ```vue
 * <script setup>
 * const { isSignedIn, user, signIn, signOut } = useAsgardeo();
 * </script>
 * ```
 */
export function useAsgardeo(): UseAsgardeoReturn {
  const authState = useState<AsgardeoAuthState>('asgardeo:auth', () => ({
    isSignedIn: false,
    user: null,
    isLoading: true,
  }));

  const isSignedIn = computed(() => authState.value.isSignedIn);
  const isLoading = computed(() => authState.value.isLoading);
  const user = computed(() => authState.value.user);

  /**
   * Redirect to Asgardeo for sign-in.
   */
  const signIn = async (returnTo?: string): Promise<void> => {
    const query: Record<string, string> = {};
    if (returnTo) {
      query['returnTo'] = returnTo;
    }
    await navigateTo('/api/auth/signin', {external: true});
  };

  /**
   * Sign out and redirect to Asgardeo's logout endpoint.
   */
  const signOut = async (): Promise<void> => {
    await navigateTo('/api/auth/signout', {external: true});
  };

  /**
   * Get the current access token from the server.
   */
  const getAccessToken = async (): Promise<string | null> => {
    try {
      const response = await $fetch<{accessToken: string}>('/api/auth/token', {
        method: 'GET',
      });
      return response.accessToken || null;
    } catch {
      return null;
    }
  };

  /**
   * Refresh user info from the server and update reactive state.
   */
  const refreshUser = async (): Promise<void> => {
    try {
      const session = await $fetch<AsgardeoAuthState>('/api/auth/session', {
        method: 'GET',
      });
      authState.value = session;
    } catch {
      authState.value = {isSignedIn: false, user: null, isLoading: false};
    }
  };

  return {
    isSignedIn,
    isLoading,
    user,
    signIn,
    signOut,
    getAccessToken,
    refreshUser,
  };
}
