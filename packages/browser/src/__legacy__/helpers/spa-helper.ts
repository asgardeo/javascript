/**
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
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

import {AsgardeoAuthClient, StorageManager, TokenConstants} from '@asgardeo/javascript';

import {AuthenticationHelper} from '../helpers/authentication-helper';
import {MainThreadClientConfig, WebWorkerClientConfig} from '../models/client-config';

export class SPAHelper<T extends MainThreadClientConfig | WebWorkerClientConfig> {
  private _authenticationClient: AsgardeoAuthClient<T>;
  private _storageManager: StorageManager<T>;

  public constructor(authClient: AsgardeoAuthClient<T>) {
    this._authenticationClient = authClient;
    this._storageManager = this._authenticationClient.getStorageManager();
  }

  public async refreshAccessTokenAutomatically(
    authenticationHelper: AuthenticationHelper<MainThreadClientConfig | WebWorkerClientConfig>,
  ): Promise<void> {
    const shouldRefreshAutomatically: boolean =
      (await this._storageManager.getConfigData())?.periodicTokenRefresh ?? false;

    if (!shouldRefreshAutomatically) {
      return;
    }

    const sessionData = await this._storageManager.getSessionData();
    if (sessionData.refresh_token) {
      if (sessionData.created_at == null || sessionData.expires_in == null) {
        return;
      }
      
      const TOKEN_REFRESH_BUFFER_MS = 10_000;
      const expiryTime = Number(sessionData.expires_in) * 1000;
      const absoluteExpiryTime: number = sessionData.created_at + expiryTime;
      const timeUntilRefresh = absoluteExpiryTime - Date.now() - TOKEN_REFRESH_BUFFER_MS;

      if (timeUntilRefresh <= 0) {
        await authenticationHelper.refreshAccessToken();
        return;
      }

      const timer = setTimeout(async () => {
        await authenticationHelper.refreshAccessToken();
      }, timeUntilRefresh);

      await this._storageManager.setTemporaryDataParameter(
        TokenConstants.Storage.StorageKeys.REFRESH_TOKEN_TIMER,
        JSON.stringify(timer),
      );
    }
  }

  public async getRefreshTimeoutTimer(): Promise<number> {
    if (await this._storageManager.getTemporaryDataParameter(TokenConstants.Storage.StorageKeys.REFRESH_TOKEN_TIMER)) {
      return JSON.parse(
        (await this._storageManager.getTemporaryDataParameter(
          TokenConstants.Storage.StorageKeys.REFRESH_TOKEN_TIMER,
        )) as string,
      );
    }

    return -1;
  }

  public async clearRefreshTokenTimeout(timer?: number): Promise<void> {
    if (timer) {
      clearTimeout(timer);

      return;
    }

    const refreshTimer: number = await this.getRefreshTimeoutTimer();

    if (refreshTimer !== -1) {
      clearTimeout(refreshTimer);
    }
  }
}
