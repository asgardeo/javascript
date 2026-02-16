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

import {NextRequest, NextResponse} from 'next/server';
import {AsgardeoNextConfig} from '../../models/config';
import SessionManager, {SessionTokenPayload} from '../../utils/SessionManager';
import {
  hasValidSession as hasValidJWTSession,
  getSessionFromRequest,
  getSessionIdFromRequest,
} from '../../utils/sessionUtils';

export type AsgardeoMiddlewareOptions = Partial<AsgardeoNextConfig>;

export type AsgardeoMiddlewareContext = {
  /** Get the session payload from JWT session if available */
  getSession: () => Promise<SessionTokenPayload | undefined>;
  /** Get the session ID from the current request */
  getSessionId: () => string | undefined;
  /** Check if the current request has a valid Asgardeo session */
  isSignedIn: () => boolean;
  /**
   * Protect a route by redirecting unauthenticated users.
   * Redirect URL fallback order:
   * 1. options.redirect
   * 2. resolvedOptions.signInUrl
   * 3. resolvedOptions.defaultRedirect
   * 4. referer (if from same origin)
   * If none are available, throws an error.
   */
  protectRoute: (routeOptions?: {redirect?: string}) => Promise<NextResponse | void>;
};

type AsgardeoMiddlewareHandler = (
  asgardeo: AsgardeoMiddlewareContext,
  req: NextRequest,
) => Promise<NextResponse | void> | NextResponse | void;

/**
 * Enhanced session validation that checks both JWT and legacy sessions
 *
 * @param request - The Next.js request object
 * @returns True if a valid session exists, false otherwise
 */
const hasValidSession = async (request: NextRequest): Promise<boolean> => {
  try {
    return await hasValidJWTSession(request);
  } catch {
    return Promise.resolve(false);
  }
};

/**
 * Gets the session ID from the request cookies.
 * Supports both JWT and legacy session formats.
 *
 * @param request - The Next.js request object
 * @returns The session ID if it exists, undefined otherwise
 */
const getSessionIdFromRequestMiddleware = async (request: NextRequest): Promise<string | undefined> =>
  getSessionIdFromRequest(request);

/**
 * Asgardeo middleware that integrates authentication into your Next.js application.
 * Similar to Clerk's clerkMiddleware pattern.
 *
 * @param handler - Optional handler function to customize middleware behavior
 * @param options - Configuration options for the middleware
 * @returns Next.js middleware function
 *
 * @example
 * ```typescript
 * // middleware.ts - Basic usage
 * import { asgardeoMiddleware } from '@asgardeo/nextjs';
 *
 * export default asgardeoMiddleware();
 * ```
 *
 * @example
 * ```typescript
 * // With route protection
 * import { asgardeoMiddleware, createRouteMatcher } from '@asgardeo/nextjs';
 *
 * const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);
 *
 * export default asgardeoMiddleware(async (asgardeo, req) => {
 *   if (isProtectedRoute(req)) {
 *     await asgardeo.protectRoute();
 *   }
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Advanced usage with custom logic
 * import { asgardeoMiddleware, createRouteMatcher } from '@asgardeo/nextjs';
 *
 * const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);
 * const isAuthRoute = createRouteMatcher(['/sign-in', '/sign-up']);
 *
 * export default asgardeoMiddleware(async (asgardeo, req) => {
 *   // Skip protection for auth routes
 *   if (isAuthRoute(req)) return;
 *
 *   // Protect specified routes
 *   if (isProtectedRoute(req)) {
 *     await asgardeo.protectRoute({ redirect: '/sign-in' });
 *   }
 *
 *   // Check authentication status
 *   if (asgardeo.isSignedIn()) {
 *     console.log('User is authenticated with session:', asgardeo.getSessionId());
 *   }
 * }, {
 *   defaultRedirect: '/sign-in'
 * });
 * ```
 */
const asgardeoMiddleware =
  (
    handler?: AsgardeoMiddlewareHandler,
    options?: AsgardeoMiddlewareOptions | ((req: NextRequest) => AsgardeoMiddlewareOptions),
  ): ((request: NextRequest) => Promise<NextResponse>) =>
  async (request: NextRequest): Promise<NextResponse> => {
    const resolvedOptions: AsgardeoMiddlewareOptions = typeof options === 'function' ? options(request) : options || {};

    const url: URL = new URL(request.url);
    const hasCallbackParams: boolean = url.searchParams.has('code') && url.searchParams.has('state');

    let isValidOAuthCallback: boolean = false;
    if (hasCallbackParams) {
      // OAuth callbacks should not contain error parameters that indicate failed auth
      const hasError: boolean = url.searchParams.has('error');

      if (!hasError) {
        // Validate that there's a temporary session that initiated this OAuth flow
        const tempSessionToken: string | undefined = request.cookies.get(
          SessionManager.getTempSessionCookieName(),
        )?.value;
        if (tempSessionToken) {
          try {
            // Verify the temporary session exists and is valid
            await SessionManager.verifyTempSession(tempSessionToken);
            isValidOAuthCallback = true;
          } catch {
            // Invalid temp session - this is not a legitimate OAuth callback
            isValidOAuthCallback = false;
          }
        }
      }
    }

    const sessionId: string | undefined = await getSessionIdFromRequestMiddleware(request);
    const isAuthenticated: boolean = await hasValidSession(request);

    const asgardeo: AsgardeoMiddlewareContext = {
      getSession: async (): Promise<SessionTokenPayload | undefined> => {
        try {
          return await getSessionFromRequest(request);
        } catch {
          return undefined;
        }
      },
      getSessionId: (): string | undefined => sessionId,
      isSignedIn: (): boolean => isAuthenticated,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      protectRoute: async (routeOptions?: {redirect?: string}): Promise<NextResponse | void> => {
        // Skip protection if this is a validated OAuth callback - let the callback handler process it first
        // This prevents race conditions where middleware redirects before OAuth callback completes
        if (isValidOAuthCallback) {
          return undefined;
        }

        if (!isAuthenticated) {
          const referer: string | null = request.headers.get('referer');
          // TODO: Make this configurable or call the signIn() from here.
          let fallbackRedirect: string = '/';

          // If referer exists and is from the same origin, use it as fallback
          if (referer) {
            try {
              const refererUrl: URL = new URL(referer);
              const requestUrl: URL = new URL(request.url);

              if (refererUrl.origin === requestUrl.origin) {
                fallbackRedirect = refererUrl.pathname + refererUrl.search;
              }
            } catch (error) {
              // Invalid referer URL, ignore it
            }
          }

          // Fallback chain: options.redirect -> resolvedOptions.signInUrl -> resolvedOptions.defaultRedirect -> referer (same origin only)
          const redirectUrl: string = (resolvedOptions?.signInUrl as string) || fallbackRedirect;

          const signInUrl: URL = new URL(redirectUrl, request.url);

          return NextResponse.redirect(signInUrl);
        }

        return undefined;
      },
    };

    if (handler) {
      const result: NextResponse | void = await handler(asgardeo, request);
      if (result) {
        return result;
      }
    }

    return NextResponse.next();
  };

export default asgardeoMiddleware;
