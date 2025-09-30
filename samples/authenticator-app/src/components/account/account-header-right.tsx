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

import CryptoService from "@/src/utils/crypto-service";
import SecureStorageService from "@/src/utils/secure-storage-service";
import TypeConvert from "@/src/utils/typer-convert";
import { NativeStackHeaderRightProps } from "@react-navigation/native-stack";
import { useRouter } from "expo-router";
import { ReactElement } from "react";
import StorageConstants from "../../constants/storage";
import { AccountInterface, StorageDataInterface } from "../../models/storage";
import AsyncStorageService from "../../utils/async-storage-service";
import SettingsDropdown from "./settings-dropdown";

export interface AccountHeaderRightProps extends NativeStackHeaderRightProps {
  /**
   * Route parameters.
   */
  params: Record<string, string>;
}

/**
 * Account Header Right component with settings dropdown.
 *
 * @returns Account Header Right component with settings dropdown.
 */
const AccountHeaderRight = ({ params }: AccountHeaderRightProps): ReactElement => {
  const router = useRouter();

  /**
   * Builds the push unregistration URL for the given account data.
   *
   * @param data Account data.
   * @returns The push unregistration URL.
   */
  const buildPushUnregistrationUrl = (data: AccountInterface): string => {
    const { tenantDomain, organizationId } = data;
    // TODO: Use the host from the QR data.
    const host = "http://10.10.16.152:8082";

    if (organizationId) {
      return `${host}/o/${organizationId}/api/users/v1/me/push/devices/${data.deviceId}/remove`;
    } else if (tenantDomain) {
      return `${host}/t/${tenantDomain}/api/users/v1/me/push/devices/${data.deviceId}/remove`;
    } else {
      throw new Error('Neither organizationId nor tenantDomain found in QR data.');
    }
  };

  /**
   * Handle the deletion of an account.
   *
   * @param id ID of the account to delete.
   */
  const handleDelete = async (id: string) => {
    try {
      const storageData: StorageDataInterface[] = await AsyncStorageService.getListItemByItemKey(
        StorageConstants.ACCOUNTS_DATA, 'id', id);
      const accountData: AccountInterface = TypeConvert.toAccountInterface(storageData[0]);

      const isPushAuthConfigured: boolean = !!accountData.deviceId;

      const result: Response | undefined = !isPushAuthConfigured ? undefined : await fetch(
        buildPushUnregistrationUrl(accountData), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: CryptoService.generatePushUnregistrationJWT(accountData.deviceId!)
        })
      });

      if (!result || result.status === 204) {
        await AsyncStorageService.removeItem(StorageConstants.replaceAccountId(
          StorageConstants.PUSH_AUTHENTICATION_DATA, accountData.id));
        SecureStorageService.removeItem(accountData.deviceId!);
        SecureStorageService.removeItem(accountData.id);
        await AsyncStorageService.removeListItemByItemKey(StorageConstants.ACCOUNTS_DATA, 'id', accountData.id);
      }
    } catch {
      // TODO: Show error to the user.
    }

    router.back();
  }

  return (
    <SettingsDropdown onDelete={() => handleDelete(params.id)} />
  )
}

export default AccountHeaderRight;
