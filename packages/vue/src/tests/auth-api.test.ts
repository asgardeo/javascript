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
  type AsgardeoSPAClient,
  type AuthClientConfig,
  type BasicUserInfo,
  type Config,
  type IdToken,
  Hooks,
  type HttpRequestConfig,
  type HttpResponse,
  type SPACustomGrantConfig,
  type SignInConfig,
} from '@asgardeo/auth-spa';
import {describe, it, expect, beforeEach, vi, Mock} from 'vitest';
import {MockAsgardeoAuthException, asgardeoAuthSPAMock} from './mocks/mocks';
import AuthAPI from '../auth-api';
import {type AuthStateInterface, type AuthVueConfig} from '../types';

vi.doMock('@asgardeo/auth-spa', () => asgardeoAuthSPAMock);

describe('AuthAPI', () => {
  let authApi: AuthAPI;
  let mockClient: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockClient = asgardeoAuthSPAMock.AsgardeoSPAClient.getInstance();
    authApi = new AuthAPI(mockClient);
  });

  describe('constructor', () => {
    it('should initialize with the default state', () => {
      expect(authApi.getState()).toEqual({
        allowedScopes: '',
        displayName: '',
        email: '',
        isLoading: true,
        isSignedIn: false,
        sub: '',
        username: '',
      });
    });

    it('should use the provided SPA client if passed', () => {
      const customClient: AsgardeoSPAClient = {} as AsgardeoSPAClient;
      const customAuthApi: AuthAPI = new AuthAPI(customClient);
      expect(customAuthApi).toBeDefined();
    });
  });

  describe('init', () => {
    it('should call initialize on the client with the provided config', async () => {
      const config: AuthVueConfig = {
        afterSignInUrl: 'http://localhost:5173/',
        afterSignOutUrl: 'http://localhost:5173/',
        baseUrl: 'https://api.asgardeo.io/t/mock-tenant',
        clientId: 'mock-client-id',
      };

      await authApi.init(config);

      expect(mockClient.initialize).toHaveBeenCalledWith(config);
    });
  });

  describe('signIn', () => {
    it('should call signIn on the client and update state on success', async () => {
      const config: Partial<SignInConfig> = {some: 'config'};
      const authCode: string = 'auth-code';
      const sessionState: string = 'session-state';
      const authState: string = 'auth-state';
      const callback: Mock = vi.fn();
      const tokenConfig: {params: Record<string, unknown>} = {params: {scope: 'openid'}};

      const response: boolean | BasicUserInfo = await authApi.signIn(
        config as any,
        authCode,
        sessionState,
        authState,
        callback,
        tokenConfig,
      );

      expect(mockClient.signIn).toHaveBeenCalledWith(config, authCode, sessionState, authState, tokenConfig);

      expect(mockClient.isSignedIn).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(response);

      expect(authApi.getState()).toMatchObject({
        allowedScopes: 'openid profile',
        displayName: 'Test User',
        email: 'test@example.com',
        isLoading: false,
        isSignedIn: true,
        isSigningOut: false,
        sub: 'user-id-123',
        username: 'testUser',
      });
    });

    it('should handle errors during sign in', async () => {
      const error: Error = new Error('Sign in failed');
      mockClient.signIn.mockRejectedValueOnce(error);

      await expect(authApi.signIn()).rejects.toThrow('Sign in failed');
    });

    it('should handle null response', async () => {
      mockClient.signIn.mockResolvedValueOnce(null);
      const result: BasicUserInfo = await authApi.signIn();
      expect(result).toBeNull();

      expect(authApi.getState().isSignedIn).toBe(false);
    });

    it('should handle unauthenticated scenarios', async () => {
      mockClient.isSignedIn.mockResolvedValueOnce(false);
      const response: boolean | BasicUserInfo = await authApi.signIn();

      // Response should be returned, but state shouldn't be updated
      expect(response).toBeDefined();
      expect(authApi.getState().isSignedIn).toBe(false);
    });
  });

  describe('signOut', () => {
    it('should call signOut on the client', async () => {
      const callback: Mock = vi.fn();

      await authApi.signOut(callback);

      expect(mockClient.signOut).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(true);
    });

    it('should handle errors during sign out', async () => {
      const error: MockAsgardeoAuthException = new asgardeoAuthSPAMock.AsgardeoAuthException(
        'AUTH001',
        'AsgardeoAuthException',
        'Sign out failed',
      );

      mockClient.signOut.mockRejectedValueOnce(error);

      await expect(authApi.signOut()).rejects.toThrow('Sign out failed');
    });
  });

  describe('updateState', () => {
    it('should update the auth state', () => {
      const newState: AuthStateInterface = {
        allowedScopes: 'read write',
        isLoading: false,
        isSignedIn: true,
        username: 'newUser',
      };

      authApi.updateState(newState);

      expect(authApi.getState()).toMatchObject({
        ...AuthAPI.DEFAULT_STATE,
        ...newState,
      });
    });
  });

  describe('getUser', () => {
    it('should call getUser on the client', async () => {
      const result: BasicUserInfo = await authApi.getUser();

      expect(mockClient.getBasicUserInfo).toHaveBeenCalled();
      expect(result).toEqual({
        allowedScopes: 'openid profile',
        displayName: 'Test User',
        email: 'test@example.com',
        sub: 'user-id-123',
        username: 'testUser',
      });
    });
  });

  describe('httpRequest', () => {
    it('should call httpRequest on the client', async () => {
      const config: HttpRequestConfig = {url: 'https://api.example.com/data'};
      const result: HttpResponse<any> = await authApi.httpRequest(config);

      expect(mockClient.httpRequest).toHaveBeenCalledWith(config);
      expect(result).toEqual({data: {}, status: 200});
    });
  });

  describe('httpRequestAll', () => {
    it('should call httpRequestAll on the client', async () => {
      const configs: HttpRequestConfig[] = [
        {url: 'https://api.example.com/data1'},
        {url: 'https://api.example.com/data2'},
      ];

      const result: HttpResponse<any>[] = await authApi.httpRequestAll(configs);

      expect(mockClient.httpRequestAll).toHaveBeenCalledWith(configs);
      expect(result).toEqual([{data: {}, status: 200}]);
    });
  });

  describe('exchangeToken', () => {
    it('should call exchangeToken on the client', async () => {
      const config: SPACustomGrantConfig = {
        attachToken: false,
        data: {key: 'value'},
        id: 'custom-grant-id',
        returnsSession: true,
        signInRequired: true,
      };
      const callback: Mock = vi.fn();

      const result: BasicUserInfo | Response = await authApi.exchangeToken(config, callback);

      expect(mockClient.exchangeToken).toHaveBeenCalledWith(config);
      expect(callback).toHaveBeenCalledWith(result);

      // Check state updates for returnsSession = true
      expect(authApi.getState()).toMatchObject({
        displayName: 'Test User',
        email: 'test@example.com',
        isLoading: false,
        isSignedIn: true,
        username: 'testUser',
      });
    });

    it('should not update state when returnsSession is false', async () => {
      const config: SPACustomGrantConfig = {
        attachToken: false,
        data: {key: 'value'},
        id: 'custom-grant-id',
        returnsSession: false,
        signInRequired: true,
      };

      await authApi.exchangeToken(config);

      // State should not be updated for session properties
      expect(authApi.getState().username).toBe('');
      expect(authApi.getState().isSignedIn).toBe(false);
    });

    it('should handle null response', async () => {
      mockClient.exchangeToken.mockResolvedValueOnce(null);
      const config: SPACustomGrantConfig = {
        attachToken: false,
        data: {key: 'value'},
        id: 'custom-grant-id',
        returnsSession: true,
        signInRequired: true,
      };

      const result: BasicUserInfo | Response = await authApi.exchangeToken(config);
      expect(result).toBeNull();
    });

    it('should handle errors', async () => {
      const error: MockAsgardeoAuthException = new asgardeoAuthSPAMock.AsgardeoAuthException(
        'AUTH002',
        'AsgardeoAuthException',
        'Custom grant failed',
      );

      mockClient.exchangeToken.mockRejectedValueOnce(error);

      const config: SPACustomGrantConfig = {
        attachToken: false,
        data: {key: 'value'},
        id: 'custom-grant-id',
        returnsSession: true,
        signInRequired: true,
      };

      await expect(authApi.exchangeToken(config)).rejects.toThrow('Custom grant failed');
    });
  });

  describe('revokeAccessToken', () => {
    it('should call revokeAccessToken on the client and reset state', async () => {
      authApi.updateState({
        allowedScopes: 'read write',
        email: 'test@example.com',
        isLoading: false,
        isSignedIn: true,
        username: 'testUser',
      });

      const result: boolean = await authApi.revokeAccessToken();

      expect(mockClient.revokeAccessToken).toHaveBeenCalled();
      expect(result).toBe(true);

      // State should be reset to default with isLoading false
      expect(authApi.getState()).toEqual({
        ...AuthAPI.DEFAULT_STATE,
        isLoading: false,
      });
    });

    it('should handle errors', async () => {
      const error: MockAsgardeoAuthException = new asgardeoAuthSPAMock.AsgardeoAuthException(
        'AUTH003',
        'AsgardeoAuthException',
        'Token revocation failed',
      );

      mockClient.revokeAccessToken.mockRejectedValueOnce(error);

      await expect(authApi.revokeAccessToken()).rejects.toThrow('Token revocation failed');
    });
  });

  describe('getOpenIDProviderEndpoints', () => {
    it('should call getOpenIDProviderEndpoints on the client', async () => {
      await authApi.getOpenIDProviderEndpoints();
      expect(mockClient.getOpenIDProviderEndpoints).toHaveBeenCalled();
    });
  });

  describe('getHttpClient', () => {
    it('should call getHttpClient on the client', async () => {
      await authApi.getHttpClient();
      expect(mockClient.getHttpClient).toHaveBeenCalled();
    });
  });

  describe('token related methods', () => {
    it('should call getDecodedIdToken on the client', async () => {
      const result: IdToken = await authApi.getDecodedIdToken();
      expect(mockClient.getDecodedIdToken).toHaveBeenCalled();
      expect(result).toEqual({sub: 'user-id-123'});
    });

    it('should call getDecodedIDPIDToken on the client', async () => {
      const result: IdToken = await authApi.getDecodedIDPIDToken();
      expect(mockClient.getDecodedIdToken).toHaveBeenCalled();
      expect(result).toEqual({sub: 'user-id-123'});
    });

    it('should call getIdToken on the client', async () => {
      const result: string = await authApi.getIdToken();
      expect(mockClient.getIdToken).toHaveBeenCalled();
      expect(result).toBe('mock-id-token');
    });

    it('should call getAccessToken on the client', async () => {
      const result: string = await authApi.getAccessToken();
      expect(mockClient.getAccessToken).toHaveBeenCalled();
      expect(result).toBe('mock-access-token');
    });

    it('should call getIDPAccessToken on the client', async () => {
      const result: string = await authApi.getIDPAccessToken();
      expect(mockClient.getIDPAccessToken).toHaveBeenCalled();
      expect(result).toBe('mock-idp-access-token');
    });

    it('should call refreshAccessToken on the client', async () => {
      const result: BasicUserInfo = await authApi.refreshAccessToken();
      expect(mockClient.refreshAccessToken).toHaveBeenCalled();
      expect(result).toEqual({
        displayName: 'Test User',
        email: 'test@example.com',
        username: 'testUser',
      });
    });
  });

  describe('authentication status methods', () => {
    it('should call isSignedIn on the client', async () => {
      const result: boolean = await authApi.isSignedIn();
      expect(mockClient.isSignedIn).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should call isSessionActive on the client', async () => {
      const result: boolean = await authApi.isSessionActive();
      expect(mockClient.isSessionActive).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('HTTP handler methods', () => {
    it('should call enableHttpHandler on the client', async () => {
      const result: boolean = await authApi.enableHttpHandler();
      expect(mockClient.enableHttpHandler).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should call disableHttpHandler on the client', async () => {
      const result: boolean = await authApi.disableHttpHandler();
      expect(mockClient.disableHttpHandler).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('reInitialize', () => {
    it('should call reInitialize on the client', async () => {
      const config: Partial<AuthClientConfig<Config>> = {clientId: 'new-client-id'};
      await authApi.reInitialize(config);
      expect(mockClient.reInitialize).toHaveBeenCalledWith(config);
    });
  });

  describe('on', () => {
    it('should register regular event hooks', async () => {
      const hook: Hooks = Hooks.SignIn;
      const callback: Mock = vi.fn();

      await authApi.on(hook, callback);

      expect(mockClient.on).toHaveBeenCalledWith(hook, callback);
    });

    it('should register custom grant hooks with id', async () => {
      const hook: Hooks = Hooks.CustomGrant;
      const callback: Mock = vi.fn();
      const id: string = 'custom-grant-id';

      await authApi.on(hook, callback, id);

      expect(mockClient.on).toHaveBeenCalledWith(hook, callback, id);
    });
  });

  describe('signInSilently', () => {
    it('should call signInSilently on the client and update state on success', async () => {
      const additionalParams: Record<string, string | boolean> = {prompt: 'none'};
      const tokenRequestConfig: {params: Record<string, unknown>} = {params: {scope: 'openid profile'}};

      const result: boolean | BasicUserInfo = await authApi.signInSilently(additionalParams, tokenRequestConfig);

      expect(mockClient.signInSilently).toHaveBeenCalledWith(additionalParams, tokenRequestConfig);
      expect(authApi.getState()).toMatchObject({
        allowedScopes: 'openid profile',
        displayName: 'Test User',
        email: 'test@example.com',
        isLoading: false,
        isSignedIn: true,
        sub: 'user-id-123',
        username: 'testUser',
      });
      expect(result).toEqual({
        allowedScopes: 'openid profile',
        displayName: 'Test User',
        email: 'test@example.com',
        sub: 'user-id-123',
        username: 'testUser',
      });
    });

    it('should handle false response from signInSilently', async () => {
      mockClient.signInSilently.mockResolvedValueOnce(false);
      mockClient.isSignedIn.mockResolvedValueOnce(false);

      const result: boolean | BasicUserInfo = await authApi.signInSilently();

      expect(result).toBe(false);
      expect(authApi.getState().isLoading).toBe(false);
      expect(authApi.getState().isSignedIn).toBe(false);
    });

    it('should handle errors', async () => {
      const error: MockAsgardeoAuthException = new asgardeoAuthSPAMock.AsgardeoAuthException(
        'AUTH004',
        'AsgardeoAuthException',
        'Custom grant failed',
      );

      mockClient.exchangeToken.mockRejectedValueOnce(error);

      const config: SPACustomGrantConfig = {
        attachToken: false,
        data: {key: 'value'},
        id: 'custom-grant-id',
        returnsSession: true,
        signInRequired: true,
      };

      await expect(authApi.exchangeToken(config)).rejects.toThrow('Custom grant failed');
    });
  });
});
