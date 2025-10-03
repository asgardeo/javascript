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

import ScopeConstants from '../constants/ScopeConstants';
import OIDCRequestConstants from '../constants/OIDCRequestConstants';
import generateStateParamForRequestCorrelation from './generateStateParamForRequestCorrelation';
import {ExtendedAuthorizeRequestUrlParams} from '../models/oauth-request';
import AsgardeoRuntimeError from '../errors/AsgardeoRuntimeError';

/**
 * Generates a map of authorization request URL parameters for OIDC authorization requests.
 *
 * This utility ensures the `openid` scope is always included, handles both string and array forms of the `scope` parameter,
 * and supports PKCE and custom parameters. Throws if a code challenge is provided without a code challenge method.
 *
 * @param options - The main options for the authorization request, including redirectUri, clientId, scope, responseMode, codeChallenge, codeChallengeMethod, and prompt.
 * @param pkceOptions - PKCE options, including the PKCE key for state correlation.
 * @param customParams - Optional custom parameters to include in the request (excluding the `state` param, which is handled separately).
 * @returns A Map of key-value pairs representing the authorization request URL parameters.
 *
 * @throws {AsgardeoRuntimeError} If a code challenge is provided without a code challenge method.
 *
 * @example
 * const params = getAuthorizeRequestUrlParams({
 *   options: {
 *     redirectUri: 'https://app/callback',
 *     clientId: 'client123',
 *     scope: ['openid', 'profile'],
 *     responseMode: 'query',
 *     codeChallenge: 'abc',
 *     codeChallengeMethod: 'S256',
 *     prompt: 'login'
 *   },
 *   pkceOptions: { key: 'pkce_code_verifier_1' },
 *   customParams: { foo: 'bar' }
 * });
 * // Returns a Map with all required OIDC params, PKCE, and custom params.
 */
const getAuthorizeRequestUrlParams = (
  options: {
    redirectUri: string;
    clientId: string;
    scopes?: string;
    responseMode?: string;
    codeChallenge?: string;
    codeChallengeMethod?: string;
    prompt?: string;
  } & ExtendedAuthorizeRequestUrlParams,
  pkceOptions: {key: string},
  customParams: Record<string, string | number | boolean>,
): Map<string, string> => {
  const {redirectUri, clientId, clientSecret, scopes, responseMode, codeChallenge, codeChallengeMethod, prompt} =
    options;
  const authorizeRequestParams: Map<string, string> = new Map<string, string>();

  authorizeRequestParams.set('response_type', 'code');
  authorizeRequestParams.set('client_id', clientId as string);

  authorizeRequestParams.set('scope', scopes ?? ScopeConstants.OPENID);
  authorizeRequestParams.set('redirect_uri', redirectUri as string);

  if (responseMode) {
    authorizeRequestParams.set('response_mode', responseMode as string);
  }

  const pkceKey: string = pkceOptions?.key;

  if (codeChallenge) {
    authorizeRequestParams.set('code_challenge', codeChallenge as string);

    if (codeChallengeMethod) {
      authorizeRequestParams.set('code_challenge_method', codeChallengeMethod as string);
    } else {
      throw new AsgardeoRuntimeError(
        'Code challenge method is required when code challenge is provided.',
        'getAuthorizeRequestUrlParams-ValidationError-001',
        'javascript',
        'When PKCE is enabled, the code challenge method must be provided along with the code challenge.',
      );
    }
  }

  if (prompt) {
    authorizeRequestParams.set('prompt', prompt as string);
  }

  if (customParams) {
    for (const [key, value] of Object.entries(customParams)) {
      if (key !== '' && value !== '' && key !== OIDCRequestConstants.Params.STATE) {
        authorizeRequestParams.set(key, value.toString());
      }
    }
  }

  authorizeRequestParams.set(
    OIDCRequestConstants.Params.STATE,
    generateStateParamForRequestCorrelation(
      pkceKey,
      customParams ? customParams[OIDCRequestConstants.Params.STATE]?.toString() : '',
    ),
  );

  return authorizeRequestParams;
};

export default getAuthorizeRequestUrlParams;
