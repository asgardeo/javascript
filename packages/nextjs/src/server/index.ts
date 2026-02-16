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

export {default as asgardeoMiddleware} from './middleware/asgardeoMiddleware';
export * from './middleware/asgardeoMiddleware';

export {default as createRouteMatcher} from './middleware/createRouteMatcher';
