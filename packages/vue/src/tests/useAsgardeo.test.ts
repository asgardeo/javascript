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

import {
  AsgardeoAuthException,
  BasicUserInfo,
  IdToken,
  HttpClientInstance,
  HttpResponse,
  OIDCEndpoints,
} from '@asgardeo/auth-spa';
import {describe, it, expect, beforeEach, Mock, vi} from 'vitest';
import {useAsgardeo} from '../composables/useAsgardeo';
import {useAsgardeoContext} from '../composables/useAsgardeoContext';
import {AuthContextInterface} from '../types';

vi.mock('../composables/useAsgardeoContext', () => ({
  useAsgardeoContext: vi.fn(),
}));

describe('useAsgardeo', () => {
  const mockAuthContext: AuthContextInterface = {
    disableHttpHandler: vi.fn().mockResolvedValue(true),
    enableHttpHandler: vi.fn().mockResolvedValue(true),
    error: new AsgardeoAuthException('Some error', 'Error message', 'error'),
    exchangeToken: vi.fn(),
    getAccessToken: vi.fn().mockResolvedValue('token'),
    getDecodedIdToken: vi.fn().mockResolvedValue({} as IdToken),
    getHttpClient: vi.fn().mockResolvedValue({} as HttpClientInstance),
    getIdToken: vi.fn().mockResolvedValue('id_token'),
    getOpenIDProviderEndpoints: vi.fn().mockResolvedValue({} as OIDCEndpoints),
    getUser: vi.fn().mockResolvedValue({} as BasicUserInfo),
    httpRequest: vi.fn().mockResolvedValue({} as HttpResponse<any>),
    httpRequestAll: vi.fn().mockResolvedValue([{} as HttpResponse<any>]),
    isSignedIn: vi.fn().mockResolvedValue(true),
    on: vi.fn(),
    reInitialize: vi.fn().mockResolvedValue(undefined),
    refreshAccessToken: vi.fn().mockResolvedValue({} as BasicUserInfo),
    revokeAccessToken: vi.fn().mockResolvedValue(true),
    signIn: vi.fn().mockResolvedValue({} as BasicUserInfo),
    signInSilently: vi.fn().mockResolvedValue(true),
    signOut: vi.fn().mockResolvedValue(true),
    state: {
      allowedScopes: '',
      isLoading: false,
      isSignedIn: true,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return the auth context from useAsgardeoContext', () => {
    (useAsgardeoContext as Mock).mockReturnValue(mockAuthContext);

    const result: AuthContextInterface = useAsgardeo();

    expect(useAsgardeoContext).toHaveBeenCalled();
    expect(result).toBe(mockAuthContext);
  });

  it('should propagate errors from useAsgardeoContext', () => {
    const errorMessage: string = 'This can be only used when vue plugin is installed';
    (useAsgardeoContext as Mock).mockImplementation(() => {
      throw new Error(errorMessage);
    });

    expect(() => useAsgardeo()).toThrow(errorMessage);
    expect(useAsgardeoContext).toHaveBeenCalled();
  });
});
