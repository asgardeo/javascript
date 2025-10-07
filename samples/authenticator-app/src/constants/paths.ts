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
 * Class containing application path constants.
 */
class AppPaths {
  /**
   * Path to the root screen.
   */
  static readonly ROOT = 'index';

  /**
   * Path to the home screen.
   */
  static readonly HOME = 'home';

  /**
   * Path to the account screen.
   */
  static readonly ACCOUNT = 'account';

  /**
   * Path to the QR scanner screen.
   */
  static readonly QR_SCANNER = 'qr-scanner';

  /**
   * Path to the push authentication screen.
   */
  static readonly PUSH_AUTH = 'push-auth';

  /**
   * Path to the push authentication history screen.
   */
  static readonly PUSH_AUTH_HISTORY = 'push-auth-history';

  /**
   * Path to the push authentication registration API endpoint.
   */
  static readonly PUSH_AUTH_REGISTRATION_SERVER: string = '/api/users/v1/me/push/devices';

  /**
   * Organization path segment.
   */
  static readonly ORGANIZATION_PATH: string = '/o/';

  /**
   * Tenant path segment.
   */
  static readonly TENANT_PATH: string = '/t/';
}

export default AppPaths;
