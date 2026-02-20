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

import OIDCDiscoveryConstants from '../../constants/OIDCDiscoveryConstants';
import TokenExchangeConstants from '../../constants/TokenExchangeConstants';
import {AsgardeoAuthException} from '../../errors/exception';
import {IsomorphicCrypto} from '../../IsomorphicCrypto';
import {Config} from '../../models/config';
import {JWKInterface} from '../../models/crypto';
import {OIDCDiscoveryEndpointsApiResponse, OIDCDiscoveryApiResponse} from '../../models/oidc-discovery';
import {Platform} from '../../models/platforms';
import {SessionData} from '../../models/session';
import {IdToken, TokenResponse, AccessTokenApiResponse} from '../../models/token';
import {User} from '../../models/user';
import StorageManager from '../../StorageManager';
import extractUserClaimsFromIdToken from '../../utils/extractUserClaimsFromIdToken';
import processOpenIDScopes from '../../utils/processOpenIDScopes';
import {AuthClientConfig, StrictAuthClientConfig} from '../models';

export class AuthenticationHelper<T> {
  private storageManager: StorageManager<T>;

  private config: () => Promise<AuthClientConfig>;

  private oidcProviderMetaData: () => Promise<OIDCDiscoveryApiResponse>;

  private cryptoHelper: IsomorphicCrypto;

  public constructor(storageManagerInstance: StorageManager<T>, cryptoHelperInstance: IsomorphicCrypto) {
    this.storageManager = storageManagerInstance;
    this.config = async (): Promise<AuthClientConfig> => this.storageManager.getConfigData();
    this.oidcProviderMetaData = async (): Promise<OIDCDiscoveryApiResponse> =>
      this.storageManager.loadOpenIDProviderConfiguration();
    this.cryptoHelper = cryptoHelperInstance;
  }

  public async resolveEndpoints(response: OIDCDiscoveryApiResponse): Promise<OIDCDiscoveryApiResponse> {
    const oidcProviderMetaData: OIDCDiscoveryApiResponse = {};
    const configData: StrictAuthClientConfig = await this.config();

    if (configData.endpoints) {
      Object.keys(configData.endpoints).forEach((endpointName: string) => {
        const snakeCasedName: string = endpointName.replace(/[A-Z]/g, (letter: string) => `_${letter.toLowerCase()}`);

        oidcProviderMetaData[snakeCasedName] = configData?.endpoints ? configData.endpoints[endpointName] : '';
      });
    }

    return {...response, ...oidcProviderMetaData};
  }

  public async resolveEndpointsExplicitly(): Promise<OIDCDiscoveryEndpointsApiResponse> {
    const oidcProviderMetaData: OIDCDiscoveryApiResponse = {};
    const configData: StrictAuthClientConfig = await this.config();

    const requiredEndpoints: string[] = [
      OIDCDiscoveryConstants.Storage.StorageKeys.Endpoints.AUTHORIZATION,
      OIDCDiscoveryConstants.Storage.StorageKeys.Endpoints.END_SESSION,
      OIDCDiscoveryConstants.Storage.StorageKeys.Endpoints.JWKS,
      OIDCDiscoveryConstants.Storage.StorageKeys.Endpoints.SESSION_IFRAME,
      OIDCDiscoveryConstants.Storage.StorageKeys.Endpoints.REVOCATION,
      OIDCDiscoveryConstants.Storage.StorageKeys.Endpoints.TOKEN,
      OIDCDiscoveryConstants.Storage.StorageKeys.Endpoints.ISSUER,
      OIDCDiscoveryConstants.Storage.StorageKeys.Endpoints.USERINFO,
    ];

    const isRequiredEndpointsContains: boolean = configData.endpoints
      ? requiredEndpoints.every((reqEndpointName: string) =>
          configData.endpoints
            ? Object.keys(configData.endpoints).some((endpointName: string) => {
                const snakeCasedName: string = endpointName.replace(
                  /[A-Z]/g,
                  (letter: string) => `_${letter.toLowerCase()}`,
                );

                return snakeCasedName === reqEndpointName;
              })
            : false,
        )
      : false;

    if (!isRequiredEndpointsContains) {
      throw new AsgardeoAuthException(
        'JS-AUTH_HELPER-REE-NF01',
        'Required endpoints missing',
        'Some or all of the required endpoints are missing in the object passed to the `endpoints` ' +
          'attribute of the`AuthConfig` object.',
      );
    }

    if (configData.endpoints) {
      Object.keys(configData.endpoints).forEach((endpointName: string) => {
        const snakeCasedName: string = endpointName.replace(/[A-Z]/g, (letter: string) => `_${letter.toLowerCase()}`);

        oidcProviderMetaData[snakeCasedName] = configData?.endpoints ? configData.endpoints[endpointName] : '';
      });
    }

    return {...oidcProviderMetaData};
  }

  public async resolveEndpointsByBaseURL(): Promise<OIDCDiscoveryEndpointsApiResponse> {
    const oidcProviderMetaData: OIDCDiscoveryEndpointsApiResponse = {};
    const configData: StrictAuthClientConfig = await this.config();

    const {baseUrl} = configData as any;

    if (!baseUrl) {
      throw new AsgardeoAuthException(
        'JS-AUTH_HELPER_REBO-NF01',
        'Base URL not defined.',
        'Base URL is not defined in AuthClient config.',
      );
    }

    if (configData.endpoints) {
      Object.keys(configData.endpoints).forEach((endpointName: string) => {
        const snakeCasedName: string = endpointName.replace(/[A-Z]/g, (letter: string) => `_${letter.toLowerCase()}`);

        oidcProviderMetaData[snakeCasedName] = configData?.endpoints ? configData.endpoints[endpointName] : '';
      });
    }

    const endpointKeys: typeof OIDCDiscoveryConstants.Storage.StorageKeys.Endpoints =
      OIDCDiscoveryConstants.Storage.StorageKeys.Endpoints;
    const endpointPaths: typeof OIDCDiscoveryConstants.Endpoints = OIDCDiscoveryConstants.Endpoints;

    const defaultEndpoints: OIDCDiscoveryApiResponse = {
      [endpointKeys.AUTHORIZATION]: `${baseUrl}${endpointPaths.AUTHORIZATION}`,
      [endpointKeys.END_SESSION]: `${baseUrl}${endpointPaths.END_SESSION}`,
      [endpointKeys.ISSUER]: `${baseUrl}${endpointPaths.ISSUER}`,
      [endpointKeys.JWKS]: `${baseUrl}${endpointPaths.JWKS}`,
      [endpointKeys.SESSION_IFRAME]: `${baseUrl}${endpointPaths.SESSION_IFRAME}`,
      [endpointKeys.REVOCATION]: `${baseUrl}${endpointPaths.REVOCATION}`,
      [endpointKeys.TOKEN]: `${baseUrl}${endpointPaths.TOKEN}`,
      [endpointKeys.USERINFO]: `${baseUrl}${endpointPaths.USERINFO}`,
    };

    // For AsgardeoV2 (Thunder), the issuer must be the base URL (e.g., https://localhost:8090)
    // to comply with RFC 8414 (Section 2 & 3) and OpenID Connect Discovery specs.
    // The issuer should be a URL using "https" scheme with no query or fragment components.
    // The well-known metadata endpoint is derived by inserting "/.well-known/oauth-authorization-server"
    // between the host and path components of the issuer identifier.
    // Reference: https://datatracker.ietf.org/doc/html/rfc8414#section-2
    // Trackers:
    //     - https://github.com/asgardeo/thunder/issues/815
    //     - https://github.com/asgardeo/javascript/issues/322
    if ((configData as Config).platform === Platform.AsgardeoV2) {
      defaultEndpoints[OIDCDiscoveryConstants.Storage.StorageKeys.Endpoints.ISSUER] = `${baseUrl}`;
    }

    return {...defaultEndpoints, ...oidcProviderMetaData};
  }

  public async validateIdToken(idToken: string): Promise<boolean> {
    const jwksEndpoint: string | undefined = (await this.storageManager.loadOpenIDProviderConfiguration()).jwks_uri;
    const configData: StrictAuthClientConfig = await this.config();

    if (!jwksEndpoint || jwksEndpoint.trim().length === 0) {
      throw new AsgardeoAuthException(
        'JS_AUTH_HELPER-VIT-NF01',
        'JWKS endpoint not found.',
        'No JWKS endpoint was found in the OIDC provider meta data returned by the well-known endpoint ' +
          'or the JWKS endpoint passed to the SDK is empty.',
      );
    }

    let response: Response;

    try {
      response = await fetch(jwksEndpoint, {
        credentials: configData.sendCookiesInRequests ? 'include' : 'same-origin',
      });
    } catch (error: any) {
      throw new AsgardeoAuthException(
        'JS-AUTH_HELPER-VIT-NE02',
        'Request to jwks endpoint failed.',
        error ?? 'The request sent to get the jwks from the server failed.',
      );
    }

    if (response.status !== 200 || !response.ok) {
      throw new AsgardeoAuthException(
        'JS-AUTH_HELPER-VIT-HE03',
        `Invalid response status received for jwks request (${response.statusText}).`,
        (await response.json()) as string,
      );
    }

    const {issuer} = await this.oidcProviderMetaData();

    const {keys}: {keys: JWKInterface[]} = (await response.json()) as {
      keys: JWKInterface[];
    };

    const jwk: any = await this.cryptoHelper.getJWKForTheIdToken(idToken.split('.')[0], keys);

    return this.cryptoHelper.isValidIdToken(
      idToken,
      jwk,
      (await this.config()).clientId,
      issuer ?? '',
      this.cryptoHelper.decodeJwtToken<IdToken>(idToken).sub,
      (await this.config()).tokenValidation?.idToken?.clockTolerance,
      (await this.config()).tokenValidation?.idToken?.validateIssuer ?? true,
    );
  }

  public getAuthenticatedUserInfo(idToken: string): User {
    const payload: IdToken = this.cryptoHelper.decodeJwtToken<IdToken>(idToken);
    const username: string = payload?.['username'] ?? '';
    const givenName: string = payload?.['given_name'] ?? '';
    const familyName: string = payload?.['family_name'] ?? '';
    const fullName: string = givenName && familyName ? `${givenName} ${familyName}` : givenName || familyName || '';
    const displayName: string = payload.preferred_username ?? fullName;

    return {
      displayName,
      username,
      ...extractUserClaimsFromIdToken(payload),
    };
  }

  public async replaceCustomGrantTemplateTags(text: string, userId?: string): Promise<string> {
    const configData: StrictAuthClientConfig = await this.config();

    const sourceInstanceId: string | number | null = configData.organizationChain?.sourceInstanceId ?? null;

    let sessionData: SessionData;

    if (sourceInstanceId) {
      const {clientId} = configData;
      let instanceKey: string;
      if (clientId) {
        instanceKey = `instance_${sourceInstanceId}-${clientId}`;
      } else {
        instanceKey = `instance_${sourceInstanceId}`;
      }
      sessionData = await this.storageManager.getSessionData(userId, instanceKey);

      if (!sessionData.access_token) {
        throw new AsgardeoAuthException(
          'JS-AUTH_HELPER-RCGTT-NE01',
          'No session data found for source instance.',
          'Failed to retrieve session data from the source organization context.',
        );
      }
    } else {
      sessionData = await this.storageManager.getSessionData(userId);
    }

    const scope: string = processOpenIDScopes(configData.scopes);

    if (typeof text !== 'string') {
      return text;
    }

    return text
      .replace(TokenExchangeConstants.Placeholders.ACCESS_TOKEN, sessionData.access_token)
      .replace(
        TokenExchangeConstants.Placeholders.USERNAME,
        this.getAuthenticatedUserInfo(sessionData.id_token).username,
      )
      .replace(TokenExchangeConstants.Placeholders.SCOPES, scope)
      .replace(TokenExchangeConstants.Placeholders.CLIENT_ID, configData.clientId)
      .replace(TokenExchangeConstants.Placeholders.CLIENT_SECRET, configData.clientSecret ?? '');
  }

  public async clearSession(userId?: string): Promise<void> {
    await this.storageManager.removeTemporaryData(userId);
    await this.storageManager.removeSessionData(userId);
  }

  public async handleTokenResponse(response: Response, userId?: string): Promise<TokenResponse> {
    if (response.status !== 200 || !response.ok) {
      throw new AsgardeoAuthException(
        'JS-AUTH_HELPER-HTR-NE01',
        `Invalid response status received for token request (${response.statusText}).`,
        (await response.json()) as string,
      );
    }

    // Get the response in JSON
    const parsedResponse: AccessTokenApiResponse = (await response.json()) as AccessTokenApiResponse;

    parsedResponse.created_at = new Date().getTime();

    const shouldValidateIdToken: boolean | undefined = (await this.config()).tokenValidation?.idToken?.validate;

    if (shouldValidateIdToken) {
      return this.validateIdToken(parsedResponse.id_token).then(async () => {
        await this.storageManager.setSessionData(parsedResponse, userId);

        const tokenResponse: TokenResponse = {
          accessToken: parsedResponse.access_token,
          createdAt: parsedResponse.created_at,
          expiresIn: parsedResponse.expires_in,
          idToken: parsedResponse.id_token,
          refreshToken: parsedResponse.refresh_token,
          scope: parsedResponse.scope,
          tokenType: parsedResponse.token_type,
        };

        return Promise.resolve(tokenResponse);
      });
    }
    const tokenResponse: TokenResponse = {
      accessToken: parsedResponse.access_token,
      createdAt: parsedResponse.created_at,
      expiresIn: parsedResponse.expires_in,
      idToken: parsedResponse.id_token,
      refreshToken: parsedResponse.refresh_token,
      scope: parsedResponse.scope,
      tokenType: parsedResponse.token_type,
    };

    await this.storageManager.setSessionData(parsedResponse, userId);

    return Promise.resolve(tokenResponse);
  }
}
