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
import {describe, expect, it} from 'vitest';
import asgardeoMiddleware from '../asgardeoMiddleware';

const request = (path: string): NextRequest => new NextRequest(new URL(path, 'http://localhost:3000'));

describe('asgardeoMiddleware', () => {
  it('redirects a signed-out user when protectRoute() is awaited without returning its result', async () => {
    const middleware = asgardeoMiddleware(async asgardeo => {
      await asgardeo.protectRoute({redirect: '/sign-in'});
    });

    const response: NextResponse = await middleware(request('/dashboard'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/sign-in');
  });

  it('redirects a signed-out user when the protectRoute() result is returned', async () => {
    const middleware = asgardeoMiddleware(async asgardeo => asgardeo.protectRoute({redirect: '/sign-in'}));

    const response: NextResponse = await middleware(request('/dashboard'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/sign-in');
  });

  it('prefers a response returned by the handler over the protectRoute() redirect', async () => {
    const middleware = asgardeoMiddleware(async asgardeo => {
      await asgardeo.protectRoute({redirect: '/sign-in'});

      return NextResponse.redirect(new URL('/custom', 'http://localhost:3000'));
    });

    const response: NextResponse = await middleware(request('/dashboard'));

    expect(response.headers.get('location')).toBe('http://localhost:3000/custom');
  });

  it('passes the request through when protectRoute() is not called', async () => {
    const middleware = asgardeoMiddleware(() => Promise.resolve(undefined));

    const response: NextResponse = await middleware(request('/public'));

    expect(response.headers.get('location')).toBeNull();
    expect(response.headers.get('x-middleware-next')).toBe('1');
  });
});
