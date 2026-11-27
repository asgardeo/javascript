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

import {hasInjectionContext, inject} from 'vue';
import {getRegisteredAsgardeoContext} from './contextRegistry';
import {ASGARDEO_KEY} from '../keys';
import type {AsgardeoContext} from '../models/contexts';
import {createVueLogger} from '../utils/logger';

const logger: ReturnType<typeof createVueLogger> = createVueLogger('Guard');

/**
 * Options for the Asgardeo navigation guard.
 */
export interface GuardOptions {
  /**
   * Maximum time (in ms) to wait for SDK initialization before redirecting.
   * Only applicable when `waitForInit` is `true`.
   * @default 10000
   */
  initTimeout?: number;

  /**
   * The path to redirect unauthenticated users to.
   * @default '/'
   */
  redirectTo?: string;

  /**
   * If `true`, the guard will wait for the SDK to finish initializing before
   * evaluating the authentication state. If `false`, the guard will reject
   * immediately when the SDK is not yet initialized.
   * @default true
   */
  waitForInit?: boolean;
}

/**
 * A minimal navigation guard type compatible with Vue Router's `NavigationGuard`.
 *
 * This avoids a hard dependency on `vue-router` while remaining structurally compatible.
 * When consumers pass this to `beforeEnter` or `router.beforeEach`, Vue Router will
 * accept it because it satisfies the shape of `NavigationGuard`.
 */
export type NavigationGuardReturn = boolean | string | {path: string} | {name: string} | undefined;
export type AsgardeoNavigationGuard = (
  to: {fullPath: string; path: string; query: Record<string, string | (string | null)[] | null | undefined>},
  from: {fullPath: string; path: string},
  next: (target?: NavigationGuardReturn) => void,
) => void | Promise<void>;

/**
 * Creates a Vue Router navigation guard that protects routes by requiring authentication.
 *
 * The guard reads the Asgardeo context of the mounted `<AsgardeoProvider>` to check the `isSignedIn` state.
 * If the user is not authenticated, they are redirected to `redirectTo`.
 *
 * **Requires `vue-router` as a peer dependency.**
 *
 * @param options - Guard configuration options.
 * @returns A navigation guard function compatible with Vue Router's `beforeEnter` or `router.beforeEach`.
 *
 * @example
 * ```typescript
 * import { createRouter, createWebHistory } from 'vue-router';
 * import { createAsgardeoGuard } from '@asgardeo/vue';
 *
 * const router = createRouter({
 *   history: createWebHistory(),
 *   routes: [
 *     {
 *       path: '/dashboard',
 *       component: Dashboard,
 *       beforeEnter: createAsgardeoGuard({ redirectTo: '/login' }),
 *     },
 *   ],
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Global guard on all routes
 * router.beforeEach(createAsgardeoGuard({ redirectTo: '/' }));
 * ```
 */
/**
 * Resolves the Asgardeo context: from the app's injection context when the host provides it with \`app.provide()\`
 * (for example, the Nuxt module), otherwise from the mounted \`<AsgardeoProvider>\`.
 */
const resolveContext = (): AsgardeoContext | null => {
  const injected: AsgardeoContext | undefined = hasInjectionContext() ? inject(ASGARDEO_KEY, undefined) : undefined;

  return injected ?? getRegisteredAsgardeoContext();
};

/**
 * Waits until \`isReady\` returns true, checking on every animation frame (or every 16 ms outside a browser).
 *
 * @returns \`true\` when ready, \`false\` when the timeout passed first.
 */
const waitUntil = (isReady: () => boolean, timeout: number): Promise<boolean> =>
  new Promise<boolean>((resolve: (ready: boolean) => void) => {
    const deadline: number = Date.now() + timeout;

    const check = (): void => {
      if (isReady()) {
        resolve(true);
      } else if (Date.now() >= deadline) {
        resolve(false);
      } else if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(check);
      } else {
        setTimeout(check, 16);
      }
    };

    check();
  });

export const createAsgardeoGuard = (options: GuardOptions = {}): AsgardeoNavigationGuard => {
  const {redirectTo = '/', waitForInit = true, initTimeout = 10000} = options;

  return async (_to: unknown, _from: unknown, next: (target?: {path: string}) => void): Promise<void> => {
    let ctx: AsgardeoContext | null = resolveContext();

    if (!ctx?.isInitialized.value) {
      if (!waitForInit) {
        if (!ctx) {
          logger.error(
            'createAsgardeoGuard: Asgardeo context not found. ' +
              'Ensure <AsgardeoProvider> is mounted before navigating to a guarded route.',
          );
        }

        next({path: redirectTo});

        return;
      }

      // The router's first navigation can run before <AsgardeoProvider> mounts, so wait for the context to appear
      // and for the SDK to finish initializing.
      const isReady: boolean = await waitUntil(() => {
        ctx = resolveContext();

        return Boolean(ctx?.isInitialized.value);
      }, initTimeout);

      if (!isReady) {
        logger.warn(
          ctx
            ? 'createAsgardeoGuard: Asgardeo SDK initialization timed out.'
            : 'createAsgardeoGuard: Asgardeo context not found. Ensure <AsgardeoProvider> is mounted.',
        );
        next({path: redirectTo});

        return;
      }
    }

    if (ctx?.isSignedIn.value) {
      next();
    } else {
      next({path: redirectTo});
    }
  };
};

export default createAsgardeoGuard;
