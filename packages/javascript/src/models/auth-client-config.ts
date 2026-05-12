/**
 * Copyright (c) 2020, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
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

import {OAuthResponseMode} from './oauth-response';
import {OIDCEndpoints} from './oidc-endpoints';
import {Platform} from './platforms';

export interface DefaultAuthClientConfig {
  afterSignInUrl: string;
  afterSignOutUrl?: string;
  applicationId?: string;
  clientHost?: string;
  clientId?: string;
  clientSecret?: string;
  enablePKCE?: boolean;
  organizationChain?: {
    sourceInstanceId?: number;
    targetOrganizationId?: string;
  };
  platform?: keyof typeof Platform;
  prompt?: string;
  responseMode?: OAuthResponseMode;
  scopes?: string | string[] | undefined;
  sendCookiesInRequests?: boolean;
  sendIdTokenInLogoutRequest?: boolean;
  tokenValidation?: {
    idToken?: {
      clockTolerance?: number;
      validate?: boolean;
      validateIssuer?: boolean;
    };
  };
}

export interface WellKnownAuthClientConfig extends DefaultAuthClientConfig {
  baseUrl?: string;
  endpoints?: Partial<OIDCEndpoints>;
  wellKnownEndpoint: string;
}

export interface BaseURLAuthClientConfig extends DefaultAuthClientConfig {
  baseUrl: string;
  endpoints?: Partial<OIDCEndpoints>;
  wellKnownEndpoint?: string;
}

export interface ExplicitAuthClientConfig extends DefaultAuthClientConfig {
  baseUrl?: string;
  endpoints: OIDCEndpoints;
  wellKnownEndpoint?: string;
}

export type StrictAuthClientConfig = WellKnownAuthClientConfig | BaseURLAuthClientConfig | ExplicitAuthClientConfig;

export type AuthClientConfig<T = unknown> = StrictAuthClientConfig & T;
