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

import {AuthClientConfig, SessionData, TokenResponse} from '@asgardeo/javascript';
import {describe, expect, it, vi} from 'vitest';
import {AsgardeoNodeCore} from '../authentication';

const config: AuthClientConfig = {
  afterSignInUrl: 'http://localhost:3000/callback',
  afterSignOutUrl: 'http://localhost:3000',
  baseUrl: 'https://api.asgardeo.io/t/example',
  clientId: 'client-id',
  clientSecret: 'client-secret',
};

const createCore = async (): Promise<AsgardeoNodeCore<AuthClientConfig>> => {
  const core: AsgardeoNodeCore<AuthClientConfig> = new AsgardeoNodeCore<AuthClientConfig>(config);
  await core.waitForInitialization();

  return core;
};

const storeSession = async (
  core: AsgardeoNodeCore<AuthClientConfig>,
  userId: string,
  session: Partial<SessionData>,
): Promise<void> => {
  await core.getStorageManager().setSessionData(session as SessionData, userId);
};

describe('AsgardeoNodeCore', () => {
  describe('isSignOutSuccessful / didSignOutFail', () => {
    it('detects a successful sign-out without recursing', () => {
      expect(AsgardeoNodeCore.isSignOutSuccessful('http://localhost:3000/?state=sign_out_success')).toBe(true);
      expect(AsgardeoNodeCore.didSignOutFail('http://localhost:3000/?state=sign_out_success')).toBe(false);
    });

    it('detects a failed sign-out', () => {
      const url: string = 'http://localhost:3000/?state=sign_out_success&error=access_denied';

      expect(AsgardeoNodeCore.isSignOutSuccessful(url)).toBe(false);
      expect(AsgardeoNodeCore.didSignOutFail(url)).toBe(true);
    });
  });

  describe('isSignedIn', () => {
    it('returns false when there is no session', async () => {
      const core: AsgardeoNodeCore<AuthClientConfig> = await createCore();

      expect(await core.isSignedIn('no-session')).toBe(false);
    });

    it('returns true for an unexpired access token', async () => {
      const core: AsgardeoNodeCore<AuthClientConfig> = await createCore();
      await storeSession(core, 'user', {access_token: 'at', created_at: Date.now(), expires_in: '3600'});

      expect(await core.isSignedIn('user')).toBe(true);
    });

    it('treats expires_in as seconds', async () => {
      const core: AsgardeoNodeCore<AuthClientConfig> = await createCore();
      // Issued two minutes ago with a 60-second lifetime: expired. Read as minutes, it would still look valid.
      await storeSession(core, 'user', {access_token: 'at', created_at: Date.now() - 120_000, expires_in: '60'});

      expect(await core.isSignedIn('user')).toBe(false);
    });

    it('refreshes an expired access token when a refresh token is available', async () => {
      const core: AsgardeoNodeCore<AuthClientConfig> = await createCore();
      await storeSession(core, 'user', {
        access_token: 'at',
        created_at: Date.now() - 120_000,
        expires_in: '60',
        refresh_token: 'rt',
      });
      const refresh: ReturnType<typeof vi.spyOn> = vi
        .spyOn(core, 'refreshAccessToken')
        .mockResolvedValue({accessToken: 'new-at'} as TokenResponse);

      expect(await core.isSignedIn('user')).toBe(true);
      expect(refresh).toHaveBeenCalledWith('user');
    });

    it('clears the session when the refresh fails', async () => {
      const core: AsgardeoNodeCore<AuthClientConfig> = await createCore();
      await storeSession(core, 'user', {
        access_token: 'at',
        created_at: Date.now() - 120_000,
        expires_in: '60',
        refresh_token: 'rt',
      });
      vi.spyOn(core, 'refreshAccessToken').mockRejectedValue(new Error('invalid_grant'));

      expect(await core.isSignedIn('user')).toBe(false);
      expect((await core.getStorageManager().getSessionData('user')).access_token).toBeUndefined();
    });
  });

  describe('signOut', () => {
    it('returns the sign-out URL and removes the stored tokens', async () => {
      const core: AsgardeoNodeCore<AuthClientConfig> = await createCore();
      await storeSession(core, 'user', {
        access_token: 'at',
        created_at: Date.now(),
        expires_in: '3600',
        id_token: 'it',
      });

      const url: string = await core.signOut('user');

      expect(url).toContain('/oidc/logout');
      expect((await core.getStorageManager().getSessionData('user')).access_token).toBeUndefined();
    });
  });
});
