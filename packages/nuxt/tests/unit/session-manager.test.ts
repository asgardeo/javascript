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

import {describe, it, expect} from 'vitest';
import {
  createSessionToken,
  verifySessionToken,
  createTempSessionToken,
  verifyTempSessionToken,
} from '../../src/runtime/server/utils/session';

const TEST_SECRET = 'test-secret-at-least-32-characters-long!!';

describe('createSessionToken / verifySessionToken', () => {
  it('round-trips a minimal session payload', async () => {
    const token = await createSessionToken(
      {
        accessToken: 'at_test',
        userId: 'user-123',
        sessionId: 'sess-abc',
        scopes: 'openid profile',
      },
      TEST_SECRET,
    );

    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // valid JWT

    const payload = await verifySessionToken(token, TEST_SECRET);
    expect(payload.sub).toBe('user-123');
    expect(payload.sessionId).toBe('sess-abc');
    expect(payload.accessToken).toBe('at_test');
    expect(payload.scopes).toBe('openid profile');
  });

  it('includes organizationId when provided', async () => {
    const token = await createSessionToken(
      {
        accessToken: 'at_org',
        userId: 'user-456',
        sessionId: 'sess-org',
        scopes: 'openid',
        organizationId: 'org-789',
      },
      TEST_SECRET,
    );

    const payload = await verifySessionToken(token, TEST_SECRET);
    expect(payload.organizationId).toBe('org-789');
  });

  it('rejects a token signed with a different secret', async () => {
    const token = await createSessionToken(
      {accessToken: 'at', userId: 'u', sessionId: 's', scopes: 'openid'},
      TEST_SECRET,
    );

    await expect(verifySessionToken(token, 'a-completely-different-secret-value!!')).rejects.toThrow();
  });

  it('rejects a tampered token', async () => {
    const token = await createSessionToken(
      {accessToken: 'at', userId: 'u', sessionId: 's', scopes: 'openid'},
      TEST_SECRET,
    );

    // Flip the last character of the signature (third segment)
    const parts = token.split('.');
    parts[2] = parts[2].slice(0, -1) + (parts[2].endsWith('a') ? 'b' : 'a');
    const tampered = parts.join('.');

    await expect(verifySessionToken(tampered, TEST_SECRET)).rejects.toThrow();
  });

  it('uses the default expiry of ~3600 seconds', async () => {
    const before = Math.floor(Date.now() / 1000);
    const token = await createSessionToken(
      {accessToken: 'at', userId: 'u', sessionId: 's', scopes: 'openid'},
      TEST_SECRET,
    );
    const after = Math.floor(Date.now() / 1000);
    const payload = await verifySessionToken(token, TEST_SECRET);

    // exp should be within [before+3600, after+3600] with a small tolerance
    expect(payload.exp).toBeGreaterThanOrEqual(before + 3590);
    expect(payload.exp).toBeLessThanOrEqual(after + 3610);
  });

  it('respects a custom expirySeconds', async () => {
    const before = Math.floor(Date.now() / 1000);
    const token = await createSessionToken(
      {accessToken: 'at', userId: 'u', sessionId: 's', scopes: 'openid', expirySeconds: 60},
      TEST_SECRET,
    );
    const after = Math.floor(Date.now() / 1000);
    const payload = await verifySessionToken(token, TEST_SECRET);

    expect(payload.exp).toBeGreaterThanOrEqual(before + 50);
    expect(payload.exp).toBeLessThanOrEqual(after + 70);
  });
});

describe('createTempSessionToken / verifyTempSessionToken', () => {
  it('round-trips a temp session', async () => {
    const token = await createTempSessionToken('temp-sess-1', TEST_SECRET, '/after-login');

    const result = await verifyTempSessionToken(token, TEST_SECRET);
    expect(result.sessionId).toBe('temp-sess-1');
    expect(result.returnTo).toBe('/after-login');
  });

  it('works without a returnTo', async () => {
    const token = await createTempSessionToken('temp-sess-2', TEST_SECRET);

    const result = await verifyTempSessionToken(token, TEST_SECRET);
    expect(result.sessionId).toBe('temp-sess-2');
    expect(result.returnTo).toBeUndefined();
  });

  it('rejects a regular session token as a temp session', async () => {
    const sessionToken = await createSessionToken(
      {accessToken: 'at', userId: 'u', sessionId: 's', scopes: 'openid'},
      TEST_SECRET,
    );

    await expect(verifyTempSessionToken(sessionToken, TEST_SECRET)).rejects.toThrow();
  });

  it('rejects a tampered temp token', async () => {
    const token = await createTempSessionToken('temp-sess-3', TEST_SECRET);
    const parts = token.split('.');
    parts[2] = parts[2].slice(0, -1) + (parts[2].endsWith('a') ? 'b' : 'a');

    await expect(verifyTempSessionToken(parts.join('.'), TEST_SECRET)).rejects.toThrow();
  });
});
