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

import {describe, expect, it, vi} from 'vitest';
import * as clientExports from '../client';
import * as serverExports from '../server';

vi.mock('next/headers', () => ({cookies: vi.fn(), headers: vi.fn()}));
vi.mock('next/navigation', () => ({useRouter: vi.fn(), useSearchParams: vi.fn()}));

describe('package entry points', () => {
  it('exports every client component and the hooks of the React SDK', () => {
    const expected: string[] = [
      'CreateOrganization',
      'Loading',
      'Organization',
      'OrganizationList',
      'OrganizationProfile',
      'OrganizationSwitcher',
      'SignIn',
      'SignInButton',
      'SignOutButton',
      'SignUp',
      'SignUpButton',
      'SignedIn',
      'SignedOut',
      'User',
      'UserDropdown',
      'UserProfile',
      'useAsgardeo',
      'useBranding',
      'useBrandingContext',
      'useFlow',
      'useForm',
      'useI18n',
      'useOrganization',
      'useTheme',
      'useTranslation',
      'useUser',
    ];

    expected.forEach((name: string) => {
      expect(typeof (clientExports as Record<string, unknown>)[name], name).toMatch(/function|object/);
    });
  });

  it('exports the server helper, the provider and the server actions', () => {
    const expected: string[] = [
      'AsgardeoProvider',
      'asgardeo',
      'clearSession',
      'createOrganization',
      'getAccessToken',
      'getAllOrganizations',
      'getMyOrganizations',
      'getOrganization',
      'getSessionId',
      'getSessionPayload',
      'getUser',
      'getUserProfile',
      'httpRequest',
      'isSignedIn',
      'refreshToken',
      'signOut',
      'switchOrganization',
      'updateUserProfile',
    ];

    expected.forEach((name: string) => {
      expect(typeof (serverExports as Record<string, unknown>)[name], name).toBe('function');
    });
  });
});
