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

/**
 * Maps the short endpoint names accepted in the `endpoints` config (for example `authorization` or `jwks`) to the
 * OIDC discovery metadata keys the client reads them from.
 */
const ENDPOINT_METADATA_KEYS: Readonly<Record<string, string>> = {
  authorization: 'authorization_endpoint',
  checkSession: 'check_session_iframe',
  endSession: 'end_session_endpoint',
  introspection: 'introspection_endpoint',
  issuer: 'issuer',
  jwks: 'jwks_uri',
  registration: 'registration_endpoint',
  revocation: 'revocation_endpoint',
  token: 'token_endpoint',
  userInfo: 'userinfo_endpoint',
  userinfo: 'userinfo_endpoint',
};

/**
 * Endpoint names that configure discovery instead of an OIDC endpoint, so they are not copied into the metadata.
 */
const NON_METADATA_KEYS: ReadonlySet<string> = new Set(['discovery', 'wellKnown']);

/**
 * Converts the `endpoints` config into OIDC discovery metadata overrides.
 *
 * Both the short names (`authorization`, `token`, `endSession`, `jwks`, `userInfo`, ...) and the legacy names
 * (`authorizationEndpoint`, `tokenEndpoint`, `jwksUri`, ...) are supported. Legacy names are converted from camel
 * case to snake case (`tokenEndpoint` becomes `token_endpoint`).
 *
 * @param endpoints - The `endpoints` object from the client config.
 * @returns The metadata overrides, keyed by OIDC discovery metadata name. Empty values are skipped.
 */
const resolveEndpointOverrides = (endpoints?: Record<string, unknown>): Record<string, string> => {
  const overrides: Record<string, string> = {};

  if (!endpoints) {
    return overrides;
  }

  Object.entries(endpoints).forEach(([name, value]: [string, unknown]) => {
    if (typeof value !== 'string' || value.length === 0 || NON_METADATA_KEYS.has(name)) {
      return;
    }

    const metadataKey: string =
      ENDPOINT_METADATA_KEYS[name] ?? name.replace(/[A-Z]/g, (letter: string) => `_${letter.toLowerCase()}`);

    overrides[metadataKey] = value;
  });

  return overrides;
};

export default resolveEndpointOverrides;
