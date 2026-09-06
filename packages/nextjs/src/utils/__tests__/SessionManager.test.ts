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

import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import SessionManager, {SessionTokenPayload} from '../SessionManager';

describe('SessionManager', () => {
  const originalSecret: string | undefined = process.env['ASGARDEO_SECRET'];

  beforeAll(() => {
    process.env['ASGARDEO_SECRET'] = 'unit-test-secret';
  });

  afterAll(() => {
    if (originalSecret === undefined) {
      delete process.env['ASGARDEO_SECRET'];
    } else {
      process.env['ASGARDEO_SECRET'] = originalSecret;
    }
  });

  describe('toIdTokenClaims', () => {
    it('keeps the identity and organization claims and drops the transient protocol claims', () => {
      const claims: Record<string, unknown> | undefined = SessionManager.toIdTokenClaims({
        at_hash: 'hash',
        aud: 'client-id',
        c_hash: 'hash',
        email: 'jane@example.com',
        exp: 1700003600,
        iat: 1700000000,
        iss: 'https://api.asgardeo.io/t/acme/oauth2/token',
        nonce: 'nonce',
        org_handle: 'acme',
        org_id: 'org-1',
        org_name: 'Acme',
        sid: 'sid',
        sub: 'user-1',
        user_org: 'org-1',
      });

      expect(claims).toEqual({
        aud: 'client-id',
        email: 'jane@example.com',
        exp: 1700003600,
        iat: 1700000000,
        iss: 'https://api.asgardeo.io/t/acme/oauth2/token',
        org_handle: 'acme',
        org_id: 'org-1',
        org_name: 'Acme',
        sub: 'user-1',
        user_org: 'org-1',
      });
    });

    it('returns undefined when there is no ID token', () => {
      expect(SessionManager.toIdTokenClaims(undefined)).toBeUndefined();
      expect(SessionManager.toIdTokenClaims(null)).toBeUndefined();
    });
  });

  describe('createSessionToken', () => {
    const idTokenClaims: Record<string, unknown> = {org_id: 'org-1', org_name: 'Acme', sub: 'user-1'};

    it('round-trips the ID token claims through the session cookie', async () => {
      const token: string = await SessionManager.createSessionToken(
        'access-token',
        'user-1',
        'session-1',
        'openid profile',
        3600,
        'refresh-token',
        'org-1',
        idTokenClaims,
      );

      const payload: SessionTokenPayload = await SessionManager.verifySessionToken(token);

      expect(payload.sub).toBe('user-1');
      expect(payload.organizationId).toBe('org-1');
      expect(payload.idTokenClaims).toEqual(idTokenClaims);

      const payloadForRefresh: SessionTokenPayload = await SessionManager.verifySessionTokenForRefresh(token);

      expect(payloadForRefresh.idTokenClaims).toEqual(idTokenClaims);
    });

    it('omits the claims when none are given', async () => {
      const token: string = await SessionManager.createSessionToken(
        'access-token',
        'user-1',
        'session-1',
        'openid',
        3600,
        '',
      );

      const payload: SessionTokenPayload = await SessionManager.verifySessionToken(token);

      expect('idTokenClaims' in payload).toBe(false);
    });
  });
});
