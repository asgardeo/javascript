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

import {describe, expect, it} from 'vitest';
import extractUserClaimsFromIdToken from '../extractUserClaimsFromIdToken';
import {IdToken} from '../../models/id-token';

describe('extractUserClaimsFromIdToken', (): void => {
  it('should remove protocol claims and keep user claims with original attribute names', (): void => {
    const payload: IdToken = {
      iss: 'https://example.com',
      aud: 'client_id',
      exp: 1712345678,
      iat: 1712345670,
      email: 'user@example.com',
      given_name: 'John',
      family_name: 'Doe',
    };

    const expected: {
      email: string;
      given_name: string;
      family_name: string;
    } = {
      email: 'user@example.com',
      given_name: 'John',
      family_name: 'Doe',
    };

    expect(extractUserClaimsFromIdToken(payload)).toEqual(expected);
  });

  it('should handle empty payload', (): void => {
    const payload = {} as IdToken;

    expect(extractUserClaimsFromIdToken(payload)).toEqual({});
  });

  it('should preserve original attribute names without transformation', (): void => {
    const payload: IdToken = {
      phone_number: '+1234567890',
      custom_claim_value: 'test',
      normalClaim: 'value',
    } as IdToken;

    const expected: {
      phone_number: string;
      custom_claim_value: string;
      normalClaim: string;
    } = {
      phone_number: '+1234567890',
      custom_claim_value: 'test',
      normalClaim: 'value',
    };

    expect(extractUserClaimsFromIdToken(payload)).toEqual(expected);
  });

  it('should remove all protocol claims', (): void => {
    const payload: IdToken = {
      iss: 'https://example.com',
      aud: 'client_id',
      exp: 1712345678,
      iat: 1712345670,
      acr: '1',
      amr: ['pwd'],
      azp: 'client_1',
      auth_time: 1712345670,
      nonce: 'abc123',
      c_hash: 'hash1',
      at_hash: 'hash2',
      nbf: 1712345670,
      isk: 'key1',
      sid: 'session1',
      custom_claim: 'value',
    } as IdToken;

    expect(extractUserClaimsFromIdToken(payload)).toEqual({
      custom_claim: 'value',
    });
  });

  it('should preserve non-string claim values such as objects and arrays', () => {
    const payload = {
      roles: ['admin', 'editor'],
      metadata_info: {active: true, level: 2},
    } as IdToken;

    expect(extractUserClaimsFromIdToken(payload)).toEqual({
      roles: ['admin', 'editor'],
      metadata_info: {active: true, level: 2},
    });
  });

  it('should retain null and undefined claim values', () => {
    const payload = {
      nickname: null,
      preferred_username: undefined,
    } as IdToken;

    expect(extractUserClaimsFromIdToken(payload)).toEqual({
      nickname: null,
      preferred_username: undefined,
    });
  });
});
