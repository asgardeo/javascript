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

import {NextRequest, NextResponse} from 'next/server';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import asgardeoMiddleware, {AsgardeoMiddlewareContext} from '../asgardeoMiddleware';

describe('asgardeoMiddleware protectRoute', () => {
  const originalSignInUrl: string | undefined = process.env['NEXT_PUBLIC_ASGARDEO_SIGN_IN_URL'];

  const protect = async (
    url: string,
    options: {headers?: Record<string, string>; redirect?: string; signInUrl?: string} = {},
  ): Promise<NextResponse> => {
    const middleware: (request: NextRequest) => Promise<NextResponse> = asgardeoMiddleware(
      async (asgardeo: AsgardeoMiddlewareContext): Promise<NextResponse | void> =>
        asgardeo.protectRoute(options.redirect ? {redirect: options.redirect} : undefined),
      options.signInUrl ? {signInUrl: options.signInUrl} : {},
    );

    return middleware(new NextRequest(url, {headers: options.headers}));
  };

  beforeEach(() => {
    // Unauthenticated requests (no session cookie); no sign-in URL unless a test sets one.
    delete process.env['NEXT_PUBLIC_ASGARDEO_SIGN_IN_URL'];
  });

  afterEach(() => {
    if (originalSignInUrl === undefined) {
      delete process.env['NEXT_PUBLIC_ASGARDEO_SIGN_IN_URL'];
    } else {
      process.env['NEXT_PUBLIC_ASGARDEO_SIGN_IN_URL'] = originalSignInUrl;
    }
  });

  it('redirects an unauthenticated request to the configured sign-in URL', async () => {
    const response: NextResponse = await protect('http://localhost:3000/dashboard', {signInUrl: '/signin'});

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/signin');
  });

  it('prefers the redirect given to protectRoute', async () => {
    const response: NextResponse = await protect('http://localhost:3000/dashboard', {
      redirect: '/login',
      signInUrl: '/signin',
    });

    expect(response.headers.get('location')).toBe('http://localhost:3000/login');
  });

  it('falls back to a same-origin referer that is a different page', async () => {
    const response: NextResponse = await protect('http://localhost:3000/dashboard', {
      headers: {referer: 'http://localhost:3000/pricing?plan=team'},
    });

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/pricing?plan=team');
  });

  it('ignores a referer from another origin', async () => {
    const response: NextResponse = await protect('http://localhost:3000/dashboard', {
      headers: {referer: 'https://evil.example.com/phish'},
    });

    expect(response.headers.get('location')).toBe('http://localhost:3000/');
  });

  it('does not redirect to a referer that is the protected page itself', async () => {
    // The browser keeps the referer of the page that started the navigation across the redirect chain,
    // so this used to bounce between /dashboard/a and itself until ERR_TOO_MANY_REDIRECTS.
    const response: NextResponse = await protect('http://localhost:3000/dashboard/a?tab=1', {
      headers: {referer: 'http://localhost:3000/dashboard/a'},
    });

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/');
  });

  it('answers 401 instead of redirecting when the sign-in target is the protected route itself', async () => {
    const response: NextResponse = await protect('http://localhost:3000/signin', {signInUrl: '/signin'});

    expect(response.status).toBe(401);
    expect(response.headers.get('location')).toBeNull();
    expect(await response.text()).toMatch(/signInUrl/);
  });

  it('answers 401 when the root is protected and nothing else can be redirected to', async () => {
    const response: NextResponse = await protect('http://localhost:3000/');

    expect(response.status).toBe(401);
  });
});
