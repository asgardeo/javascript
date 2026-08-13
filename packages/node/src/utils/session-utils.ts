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

import {SessionData} from '@asgardeo/javascript';
import {validate as uuidValidate, version as uuidVersion, v4 as uuidv4} from 'uuid';
// eslint-disable-next-line import/no-cycle
import {Logger} from '.';
import {UUID_VERSION} from '../constants';

export class SessionUtils {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static createUUID(): string {
    const generatedUuid: string = uuidv4();
    return generatedUuid;
  }

  public static validateUUID(uuid: string): Promise<boolean> {
    if (uuidValidate(uuid) && uuidVersion(uuid) === UUID_VERSION) {
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }

  public static validateSession(sessionData: SessionData): Promise<boolean> {
    const currentTime: number = Date.now();
    const expiryTimeStamp: number = sessionData.created_at + parseInt(sessionData.expires_in, 10) * 60 * 1000;
    // If the expiry time is greater than the current time, then the cookie is still valid
    if (currentTime < expiryTimeStamp) {
      return Promise.resolve(true);
    }
    Logger.warn('Expired Session');

    return Promise.resolve(false);
  }
}
