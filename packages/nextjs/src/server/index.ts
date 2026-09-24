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

// @asgardeo/nextjs/server exports.

export {default as asgardeo} from './asgardeo';

export {default as AsgardeoProvider} from './AsgardeoProvider.js';
export * from './AsgardeoProvider.js';

// Server actions, for use in Server Components, Route Handlers and other Server Actions.
export {default as clearSession} from './actions/clearSession';
export {default as createOrganization} from './actions/createOrganization';
export {default as getAccessToken} from './actions/getAccessToken';
export {default as getAllOrganizations} from './actions/getAllOrganizations';
export {default as getMyOrganizations} from './actions/getMyOrganizations';
export {default as getOrganization} from './actions/getOrganizationAction';
export {default as getSessionId} from './actions/getSessionId';
export {default as getSessionPayload} from './actions/getSessionPayload';
export {default as getUser} from './actions/getUserAction';
export {default as getUserProfile} from './actions/getUserProfileAction';
export {default as httpRequest} from './actions/httpRequestAction';
export type {HttpRequestActionResult} from './actions/httpRequestAction';
export {default as isSignedIn} from './actions/isSignedIn';
export {default as refreshToken} from './actions/refreshToken';
export type {RefreshResult} from './actions/refreshToken';
export {default as signOut} from './actions/signOutAction';
export {default as switchOrganization} from './actions/switchOrganization';
export {default as updateUserProfile} from './actions/updateUserProfileAction';
export type {SessionTokenPayload} from '../utils/SessionManager';
