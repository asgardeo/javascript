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

vi.mock('../../server/actions/signInAction', () => ({default: vi.fn()}));

const {extractSignUpCredentials} = await import('../autoSignInAfterSignUp');

describe('extractSignUpCredentials', () => {
  it('returns undefined without inputs', () => {
    expect(extractSignUpCredentials(undefined)).toBeUndefined();
    expect(extractSignUpCredentials({})).toBeUndefined();
  });

  it('reads the WSO2 claim URIs used by the registration flow', () => {
    expect(
      extractSignUpCredentials({
        'http://wso2.org/claims/emailaddress': 'jane@example.com',
        'http://wso2.org/claims/username': 'jane',
        password: 'Secret@123',
      }),
    ).toEqual({password: 'Secret@123', username: 'jane'});
  });

  it('falls back to the email address when there is no username input', () => {
    expect(
      extractSignUpCredentials({'http://wso2.org/claims/emailaddress': 'jane@example.com', password: 'Secret@123'}),
    ).toEqual({password: 'Secret@123', username: 'jane@example.com'});
  });

  it('requires both a username and a password', () => {
    expect(extractSignUpCredentials({'http://wso2.org/claims/username': 'jane'})).toBeUndefined();
    expect(extractSignUpCredentials({password: 'Secret@123'})).toBeUndefined();
    expect(extractSignUpCredentials({'http://wso2.org/claims/username': '', password: 'Secret@123'})).toBeUndefined();
  });
});
