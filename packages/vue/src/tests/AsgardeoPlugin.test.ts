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
  AuthClientConfig,
  BasicUserInfo,
  Config,
  IdToken,
  Hooks,
  HttpClientInstance,
  SPACustomGrantConfig,
} from '@asgardeo/auth-spa';
import {describe, it, expect, beforeEach, vi, Mock} from 'vitest';
import {createApp} from 'vue';
import {mockAuthAPI, mockState, mockConfig} from './mocks/mocks';
import AuthAPI from '../auth-api';
import {asgardeoPlugin, ASGARDEO_INJECTION_KEY} from '../plugins/AsgardeoPlugin';
import {AuthContextInterface, AuthStateInterface} from '../types';

vi.mock('../auth-api');
vi.mock('@asgardeo/auth-spa');

vi.mocked(AuthAPI).mockImplementation(() => mockAuthAPI as unknown as AuthAPI);

describe('asgardeoPlugin', () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset the state
    Object.assign(mockState, {
      allowedScopes: '',
      displayName: '',
      email: '',
      isLoading: true,
      isSignedIn: false,
      sub: '',
      username: '',
    });

    app = createApp({});

    app.use(asgardeoPlugin, mockConfig);
  });

  it('should provide the authentication context', () => {
    const authContext: AuthContextInterface = app._context.provides[ASGARDEO_INJECTION_KEY];
    expect(authContext).toBeDefined();
    expect(authContext.state.isSignedIn).toBe(false);
  });

  it('should call AuthAPI init on install', async () => {
    expect(mockAuthAPI.init).toHaveBeenCalledWith(
      expect.objectContaining({
        afterSignInUrl: 'http://localhost:5173/',
        afterSignOutUrl: 'http://localhost:5173/',
        baseUrl: 'https://api.asgardeo.io/t/mock-tenant',
        clientId: 'mock-client-id',
        disableAutoSignIn: true,
        disableTrySignInSilently: true,
      }),
    );
  });

  it('should sign in a user and sync state', async () => {
    const authContext: AuthContextInterface = app._context.provides[ASGARDEO_INJECTION_KEY];
    const authenticatedState: AuthStateInterface = {
      allowedScopes: 'openid profile',
      displayName: 'Test User',
      email: 'test@example.com',
      isLoading: false,
      isSignedIn: true,
      sub: 'user-id-123',
      username: 'testUser',
    };

    mockAuthAPI.getState.mockReturnValue(authenticatedState);

    await authContext.signIn();

    expect(mockAuthAPI.signIn).toHaveBeenCalled();

    expect(authContext.state).toMatchObject(authenticatedState);
  });

  it('should sign out a user and sync state', async () => {
    const authContext: AuthContextInterface = app._context.provides[ASGARDEO_INJECTION_KEY];

    const unauthenticatedState: AuthStateInterface = {
      allowedScopes: '',
      displayName: '',
      email: '',
      isLoading: false,
      isSignedIn: false,
      sub: '',
      username: '',
    };

    mockAuthAPI.getState.mockReturnValue(unauthenticatedState);

    await authContext.signOut();

    expect(mockAuthAPI.signOut).toHaveBeenCalled();

    expect(authContext.state).toMatchObject(unauthenticatedState);
  });

  it('should handle errors in withStateSync', async () => {
    const authContext: AuthContextInterface = app._context.provides[ASGARDEO_INJECTION_KEY];

    const testError: Error = new Error('Test error');
    mockAuthAPI.getAccessToken.mockRejectedValueOnce(testError);

    mockAuthAPI.getState.mockReturnValue(mockState);

    await expect(authContext.getAccessToken()).rejects.toThrow('Test error');

    expect(mockAuthAPI.getState).toHaveBeenCalled();
  });

  it('should retrieve basic user info and sync state', async () => {
    const authContext: AuthContextInterface = app._context.provides[ASGARDEO_INJECTION_KEY];

    const userInfoState: AuthStateInterface = {
      ...mockState,
      displayName: 'Test User',
      email: 'test@example.com',
      username: 'testUser',
    };

    mockAuthAPI.getState.mockReturnValueOnce(userInfoState);

    await authContext.getUser();

    expect(mockAuthAPI.getUser).toHaveBeenCalled();
    expect(authContext.state).toMatchObject(userInfoState);
  });

  it('should try sign in silently and sync state', async () => {
    const authContext: AuthContextInterface = app._context.provides[ASGARDEO_INJECTION_KEY];

    const additionalParams: Record<string, string | boolean> = {prompt: 'none'};
    const tokenRequestConfig: {params: Record<string, unknown>} = {params: {scope: 'openid profile'}};

    const silentSignInState: AuthStateInterface = {
      ...mockState,
      isSignedIn: true,
      username: 'testUser',
    };

    mockAuthAPI.getState.mockReturnValueOnce(silentSignInState);

    await authContext.signInSilently(additionalParams, tokenRequestConfig);

    expect(mockAuthAPI.signInSilently).toHaveBeenCalledWith(additionalParams, tokenRequestConfig);
    expect(authContext.state).toMatchObject(silentSignInState);
  });

  it('should update config and sync state', async () => {
    const authContext: AuthContextInterface = app._context.provides[ASGARDEO_INJECTION_KEY];

    const newConfig: Partial<AuthClientConfig<Config>> = {clientId: 'new-client-id'};

    const updatedState: AuthStateInterface = {
      ...mockState,
      isLoading: false,
    };

    mockAuthAPI.getState.mockReturnValueOnce(updatedState);

    await authContext.reInitialize(newConfig);

    expect(mockAuthAPI.reInitialize).toHaveBeenCalledWith(newConfig);

    expect(mockAuthAPI.getState).toHaveBeenCalled();

    expect(authContext.state).toMatchObject(updatedState);
  });

  it('should handle token operations correctly', async () => {
    const authContext: AuthContextInterface = app._context.provides[ASGARDEO_INJECTION_KEY];

    const refreshedState: AuthStateInterface = {
      ...mockState,
      isSignedIn: true,
      username: 'testUser',
    };
    mockAuthAPI.getState.mockReturnValueOnce(refreshedState);
    await authContext.refreshAccessToken();
    expect(mockAuthAPI.refreshAccessToken).toHaveBeenCalled();
    expect(authContext.state).toMatchObject(refreshedState);

    const accessToken: string = 'mock-access-token';
    mockAuthAPI.getAccessToken.mockResolvedValueOnce(accessToken);
    const accessTokenValue: string = await authContext.getAccessToken();
    expect(mockAuthAPI.getAccessToken).toHaveBeenCalled();
    expect(accessTokenValue).toBe(accessToken);

    const decodedIDToken: IdToken = {aud: 'client-id', iss: 'https://test.com', sub: 'user-id-123'};
    mockAuthAPI.getDecodedIdToken.mockResolvedValueOnce(decodedIDToken);
    const idToken: IdToken = await authContext.getDecodedIdToken();
    expect(mockAuthAPI.getDecodedIdToken).toHaveBeenCalled();
    expect(idToken).toMatchObject(decodedIDToken);
  });

  it('should handle HTTP operations correctly', async () => {
    const authContext: AuthContextInterface = app._context.provides[ASGARDEO_INJECTION_KEY];

    await authContext.enableHttpHandler();
    expect(mockAuthAPI.enableHttpHandler).toHaveBeenCalled();

    await authContext.disableHttpHandler();
    expect(mockAuthAPI.disableHttpHandler).toHaveBeenCalled();

    const mockHttpClient: Partial<HttpClientInstance> = {};
    mockAuthAPI.getHttpClient.mockResolvedValueOnce(mockHttpClient);
    const httpClient: HttpClientInstance = await authContext.getHttpClient();
    expect(mockAuthAPI.getHttpClient).toHaveBeenCalled();
    expect(httpClient).toBe(mockHttpClient);
    expect(httpClient).toBe(mockHttpClient);
  });

  it('should handle custom grant request', async () => {
    const authContext: AuthContextInterface = app._context.provides[ASGARDEO_INJECTION_KEY];

    const customGrantConfig: SPACustomGrantConfig = {
      attachToken: true,
      data: {},
      id: '1',
      returnsSession: true,
      signInRequired: true,
    };

    const customGrantResponse: BasicUserInfo | Response = {
      allowedScopes: 'openid',
      sessionState: 'test',
    };

    mockAuthAPI.exchangeToken.mockResolvedValueOnce(customGrantResponse);

    authContext.exchangeToken(customGrantConfig);

    expect(mockAuthAPI.exchangeToken).toHaveBeenCalledWith(customGrantConfig);
  });

  it('should properly register event handlers with the on method', async () => {
    const authContext: AuthContextInterface = app._context.provides[ASGARDEO_INJECTION_KEY];

    const regularHook: Hooks = Hooks.SignIn;
    const regularCallback: Mock = vi.fn();

    const customGrantHook: Hooks = Hooks.CustomGrant;
    const customGrantCallback: Mock = vi.fn();
    const customGrantId: string = 'custom-grant-id';

    authContext.on(regularHook, regularCallback);
    authContext.on(customGrantHook, customGrantCallback, customGrantId);

    expect(mockAuthAPI.on).toHaveBeenCalledTimes(2);

    expect(mockAuthAPI.on.mock.calls[0][0]).toBe(regularHook);
    expect(mockAuthAPI.on.mock.calls[0][1]).toBe(regularCallback);

    expect(mockAuthAPI.on.mock.calls[1][0]).toBe(customGrantHook);
    expect(mockAuthAPI.on.mock.calls[1][1]).toBe(customGrantCallback);
    expect(mockAuthAPI.on.mock.calls[1][2]).toBe(customGrantId);
  });
});
