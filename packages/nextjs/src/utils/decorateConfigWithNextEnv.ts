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

import {AsgardeoNextConfig} from '../models/config';

const decorateConfigWithNextEnv = (config: AsgardeoNextConfig): AsgardeoNextConfig => {
  const {
    organizationHandle,
    rootOrganizationHandle,
    scopes,
    applicationId,
    baseUrl,
    clientId,
    clientSecret,
    signInUrl,
    signUpUrl,
    afterSignInUrl,
    afterSignOutUrl,
    ...rest
  } = config;

  return {
    ...rest,
    scopes: scopes || (process.env['NEXT_PUBLIC_ASGARDEO_SCOPES'] as string),
    organizationHandle: organizationHandle || (process.env['NEXT_PUBLIC_ASGARDEO_ORGANIZATION_HANDLE'] as string),
    rootOrganizationHandle: rootOrganizationHandle || (process.env['NEXT_PUBLIC_ASGARDEO_ROOT_ORGANIZATION_HANDLE'] as string),
    applicationId: applicationId || (process.env['NEXT_PUBLIC_ASGARDEO_APPLICATION_ID'] as string),
    baseUrl: baseUrl || (process.env['NEXT_PUBLIC_ASGARDEO_BASE_URL'] as string),
    clientId: clientId || (process.env['NEXT_PUBLIC_ASGARDEO_CLIENT_ID'] as string),
    clientSecret: clientSecret || (process.env['ASGARDEO_CLIENT_SECRET'] as string),
    afterSignInUrl: afterSignInUrl || (process.env['NEXT_PUBLIC_ASGARDEO_AFTER_SIGN_IN_URL'] as string),
    signInUrl: signInUrl || (process.env['NEXT_PUBLIC_ASGARDEO_SIGN_IN_URL'] as string),
    afterSignOutUrl: afterSignOutUrl || (process.env['NEXT_PUBLIC_ASGARDEO_AFTER_SIGN_OUT_URL'] as string),
    signUpUrl: signUpUrl || (process.env['NEXT_PUBLIC_ASGARDEO_SIGN_UP_URL'] as string),
  };
};

export default decorateConfigWithNextEnv;
