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
import resolveEndpointOverrides from '../resolveEndpointOverrides';

describe('resolveEndpointOverrides', () => {
  it('maps the short endpoint names to OIDC metadata keys', () => {
    expect(
      resolveEndpointOverrides({
        authorization: 'a',
        endSession: 'e',
        introspection: 'i',
        jwks: 'j',
        revocation: 'r',
        token: 't',
        userInfo: 'u',
      }),
    ).toEqual({
      authorization_endpoint: 'a',
      end_session_endpoint: 'e',
      introspection_endpoint: 'i',
      jwks_uri: 'j',
      revocation_endpoint: 'r',
      token_endpoint: 't',
      userinfo_endpoint: 'u',
    });
  });

  it('still accepts the legacy names', () => {
    expect(resolveEndpointOverrides({jwksUri: 'j', tokenEndpoint: 't'})).toEqual({jwks_uri: 'j', token_endpoint: 't'});
  });

  it('skips discovery settings and empty values', () => {
    expect(resolveEndpointOverrides({authorization: '', wellKnown: '/.well-known/openid-configuration'})).toEqual({});
    expect(resolveEndpointOverrides(undefined)).toEqual({});
  });
});
