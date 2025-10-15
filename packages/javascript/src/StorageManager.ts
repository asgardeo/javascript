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

import {Stores} from './models/store';
import {Storage} from './models/store';
import {AuthClientConfig} from './__legacy__/models';
import {SessionData} from './models/session';
import {TemporaryStore, TemporaryStoreValue} from './models/store';
import {OIDCDiscoveryApiResponse} from './models/oidc-discovery';

type PartialData<T> = Partial<AuthClientConfig<T> | OIDCDiscoveryApiResponse | SessionData | TemporaryStore>;

export const ASGARDEO_SESSION_ACTIVE: string = 'asgardeo-session-active';

class StorageManager<T> {
  protected _id: string;
  protected _store: Storage;
  public constructor(instanceID: string, store: Storage) {
    this._id = instanceID;
    this._store = store;
  }

  protected async setDataInBulk(key: string, data: PartialData<T>): Promise<void> {
    const existingDataJSON: string = (await this._store.getData(key)) ?? null;
    const existingData: PartialData<T> = existingDataJSON && JSON.parse(existingDataJSON);

    const dataToBeSaved: PartialData<T> = {...existingData, ...data};
    const dataToBeSavedJSON: string = JSON.stringify(dataToBeSaved);

    await this._store.setData(key, dataToBeSavedJSON);
  }

  protected async setValue(
    key: string,
    attribute: keyof AuthClientConfig<T> | keyof OIDCDiscoveryApiResponse | keyof SessionData | keyof TemporaryStore,
    value: TemporaryStoreValue,
  ): Promise<void> {
    const existingDataJSON: string = (await this._store.getData(key)) ?? null;
    const existingData: PartialData<T> = existingDataJSON && JSON.parse(existingDataJSON);

    const dataToBeSaved: PartialData<T> = {...existingData, [attribute]: value};
    const dataToBeSavedJSON: string = JSON.stringify(dataToBeSaved);

    await this._store.setData(key, dataToBeSavedJSON);
  }

  protected async removeValue(
    key: string,
    attribute: keyof AuthClientConfig<T> | keyof OIDCDiscoveryApiResponse | keyof SessionData | keyof TemporaryStore,
  ): Promise<void> {
    const existingDataJSON: string = (await this._store.getData(key)) ?? null;
    const existingData: PartialData<T> = existingDataJSON && JSON.parse(existingDataJSON);

    const dataToBeSaved: PartialData<T> = {...existingData};

    Reflect.deleteProperty(dataToBeSaved, attribute as string);

    const dataToBeSavedJSON: string = JSON.stringify(dataToBeSaved);

    await this._store.setData(key, dataToBeSavedJSON);
  }

  protected _resolveKey(store: Stores | string, userId?: string): string {
    return userId ? `${store}-${this._id}-${userId}` : `${store}-${this._id}`;
  }

  protected isLocalStorageAvailable(): boolean {
    try {
      const testValue: string = '__ASGARDEO_AUTH_CORE_LOCAL_STORAGE_TEST__';

      localStorage.setItem(testValue, testValue);
      localStorage.removeItem(testValue);

      return true;
    } catch (error) {
      return false;
    }
  }

  public async setConfigData(config: Partial<AuthClientConfig<T>>): Promise<void> {
    await this.setDataInBulk(this._resolveKey(Stores.ConfigData), config);
  }

  public async setOIDCProviderMetaData(oidcProviderMetaData: Partial<OIDCDiscoveryApiResponse>): Promise<void> {
    this.setDataInBulk(this._resolveKey(Stores.OIDCProviderMetaData), oidcProviderMetaData);
  }

  public async setTemporaryData(temporaryData: Partial<TemporaryStore>, userId?: string): Promise<void> {
    this.setDataInBulk(this._resolveKey(Stores.TemporaryData, userId), temporaryData);
  }

  public async setSessionData(sessionData: Partial<SessionData>, userId?: string): Promise<void> {
    this.setDataInBulk(this._resolveKey(Stores.SessionData, userId), sessionData);
  }

  public async setCustomData<K>(key: string, customData: Partial<K>, userId?: string): Promise<void> {
    this.setDataInBulk(this._resolveKey(key, userId), customData);
  }

  public async getConfigData(userId?: string): Promise<AuthClientConfig<T>> {
        return JSON.parse((await this._store.getData(this._resolveKey(Stores.ConfigData, userId))) ?? null);
  }

  public async loadOpenIDProviderConfiguration(): Promise<OIDCDiscoveryApiResponse> {
    return JSON.parse((await this._store.getData(this._resolveKey(Stores.OIDCProviderMetaData))) ?? null);
  }

  public async getTemporaryData(userId?: string): Promise<TemporaryStore> {
    return JSON.parse((await this._store.getData(this._resolveKey(Stores.TemporaryData, userId))) ?? null);
  }

  public async getSessionData(userId?: string): Promise<SessionData> {
    return JSON.parse((await this._store.getData(this._resolveKey(Stores.SessionData, userId))) ?? null);
  }

  public async getCustomData<K>(key: string, userId?: string): Promise<K> {
    return JSON.parse((await this._store.getData(this._resolveKey(key, userId))) ?? null);
  }

  public setSessionStatus(status: string): void {
    // Using local storage to store the session status as it is required to be available across tabs.
    this.isLocalStorageAvailable() && localStorage.setItem(`${ASGARDEO_SESSION_ACTIVE}`, status);
  }

  public getSessionStatus(): string {
    return this.isLocalStorageAvailable() ? localStorage.getItem(`${ASGARDEO_SESSION_ACTIVE}`) ?? '' : '';
  }

  public removeSessionStatus(): void {
    this.isLocalStorageAvailable() && localStorage.removeItem(`${ASGARDEO_SESSION_ACTIVE}`);
  }

  public async removeConfigData(): Promise<void> {
    await this._store.removeData(this._resolveKey(Stores.ConfigData));
  }

  public async removeOIDCProviderMetaData(): Promise<void> {
    await this._store.removeData(this._resolveKey(Stores.OIDCProviderMetaData));
  }

  public async removeTemporaryData(userId?: string): Promise<void> {
    await this._store.removeData(this._resolveKey(Stores.TemporaryData, userId));
  }

  public async removeSessionData(userId?: string): Promise<void> {
    await this._store.removeData(this._resolveKey(Stores.SessionData, userId));
  }

  public async getConfigDataParameter(key: keyof AuthClientConfig<T>): Promise<TemporaryStoreValue> {
    const data: string = await this._store.getData(this._resolveKey(Stores.ConfigData));

    return data && JSON.parse(data)[key];
  }

  public async getOIDCProviderMetaDataParameter(key: keyof OIDCDiscoveryApiResponse): Promise<TemporaryStoreValue> {
    const data: string = await this._store.getData(this._resolveKey(Stores.OIDCProviderMetaData));

    return data && JSON.parse(data)[key];
  }

  public async getTemporaryDataParameter(key: keyof TemporaryStore, userId?: string): Promise<TemporaryStoreValue> {
    const data: string = await this._store.getData(this._resolveKey(Stores.TemporaryData, userId));

    return data && JSON.parse(data)[key];
  }

  public async getSessionDataParameter(key: keyof SessionData, userId?: string): Promise<TemporaryStoreValue> {
    const data: string = await this._store.getData(this._resolveKey(Stores.SessionData, userId));

    return data && JSON.parse(data)[key];
  }

  public async setConfigDataParameter(key: keyof AuthClientConfig<T>, value: TemporaryStoreValue): Promise<void> {
    await this.setValue(this._resolveKey(Stores.ConfigData), key, value);
  }

  public async setOIDCProviderMetaDataParameter(
    key: keyof OIDCDiscoveryApiResponse,
    value: TemporaryStoreValue,
  ): Promise<void> {
    await this.setValue(this._resolveKey(Stores.OIDCProviderMetaData), key, value);
  }

  public async setTemporaryDataParameter(
    key: keyof TemporaryStore,
    value: TemporaryStoreValue,
    userId?: string,
  ): Promise<void> {
    await this.setValue(this._resolveKey(Stores.TemporaryData, userId), key, value);
  }

  public async setSessionDataParameter(
    key: keyof SessionData,
    value: TemporaryStoreValue,
    userId?: string,
  ): Promise<void> {
    await this.setValue(this._resolveKey(Stores.SessionData, userId), key, value);
  }

  public async removeConfigDataParameter(key: keyof AuthClientConfig<T>): Promise<void> {
    await this.removeValue(this._resolveKey(Stores.ConfigData), key);
  }

  public async removeOIDCProviderMetaDataParameter(key: keyof OIDCDiscoveryApiResponse): Promise<void> {
    await this.removeValue(this._resolveKey(Stores.OIDCProviderMetaData), key);
  }

  public async removeTemporaryDataParameter(key: keyof TemporaryStore, userId?: string): Promise<void> {
    await this.removeValue(this._resolveKey(Stores.TemporaryData, userId), key);
  }

  public async removeSessionDataParameter(key: keyof SessionData, userId?: string): Promise<void> {
    await this.removeValue(this._resolveKey(Stores.SessionData, userId), key);
  }
}

export default StorageManager;
