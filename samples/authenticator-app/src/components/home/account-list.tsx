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

import { useFocusEffect } from "expo-router";
import { ReactElement, useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import StorageConstants from "../../constants/storage";
import useTheme from "../../contexts/theme/useTheme";
import { AccountInterface } from "../../models/storage";
import AsyncStorageService from "../../utils/async-storage-service";
import AccountListItem from "./account-list-item";

const AccountList = (): ReactElement => {
  const [loading, setLoading] = useState<boolean>(true);
  const [accountList, setAccountList] = useState<AccountInterface[]>([]);
  const { styles } = useTheme();

  /**
   * Fetch accounts from storage.
   */
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      AsyncStorageService.getItem(StorageConstants.ACCOUNTS_DATA)
        .then((accounts: string | null) => {
          if (accounts) {
            const parsedAccounts: AccountInterface[] = JSON.parse(accounts);
            setAccountList(parsedAccounts);
          } else {
              setAccountList([]);
            }
          })
          .catch(() => {
            setAccountList([]);
          })
          .finally(() => {
            setLoading(false);
          });
    }, [])
  );

  if (loading) {
    return (
      <View style={[
        localStyles.loadingContainer,
        styles.colors.backgroundBody
      ]}>
        <ActivityIndicator
          size="large"
          color={styles.colors.textPrimary.color}
        />
        <Text style={[
          localStyles.loadingText,
          styles.typography.body1,
          styles.colors.textSecondary
        ]}>
          Loading accounts...
        </Text>
      </View>
    );
  }

  if (accountList.length === 0) {
    return (
      <View style={[
        localStyles.emptyContainer,
        styles.colors.backgroundBody
      ]}>
        <Text style={[
          localStyles.emptyText,
          styles.typography.body1,
          styles.colors.textSecondary
        ]}>
          No accounts found. Add an account to get started.
        </Text>
      </View>
    );
  }

  return (
    <View style={[localStyles.container, styles.colors.backgroundBody]}>
      {accountList.map((account) => (
        <AccountListItem key={account.deviceId} {...account} />
      ))}
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    paddingVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default AccountList;
