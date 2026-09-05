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
import navigateTo, {isCrossOriginUrl} from '../navigateTo';

describe('navigateTo', () => {
  let assign: Mock;
  let push: Mock;

  beforeEach(() => {
    assign = vi.fn();
    push = vi.fn();
    vi.stubGlobal('window', {location: {assign, origin: 'http://localhost:3000'}});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uses the app router for relative and same-origin URLs', () => {
    navigateTo({push}, '/dashboard');
    navigateTo({push}, 'http://localhost:3000/profile');

    expect(push).toHaveBeenCalledTimes(2);
    expect(push).toHaveBeenNthCalledWith(1, '/dashboard');
    expect(push).toHaveBeenNthCalledWith(2, 'http://localhost:3000/profile');
    expect(assign).not.toHaveBeenCalled();
  });

  it('uses a full browser navigation for cross-origin URLs such as the hosted logout endpoint', () => {
    const logoutUrl: string =
      'https://api.asgardeo.io/t/acme/oidc/logout?post_logout_redirect_uri=http%3A%2F%2Flocalhost%3A3000&state=sign_out_success';

    navigateTo({push}, logoutUrl);

    expect(assign).toHaveBeenCalledWith(logoutUrl);
    expect(push).not.toHaveBeenCalled();
  });

  it('treats a different port on the same host as cross-origin', () => {
    expect(isCrossOriginUrl('http://localhost:3001/callback')).toBe(true);
  });

  it('falls back to the router for unparsable values', () => {
    navigateTo({push}, 'http://[invalid');

    expect(push).toHaveBeenCalledWith('http://[invalid');
    expect(assign).not.toHaveBeenCalled();
  });
});
