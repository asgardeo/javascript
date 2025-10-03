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

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { ReactElement, useCallback, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context";
import StorageConstants from "../../constants/storage";
import { AccountInterface } from "../../models/storage";
import AsyncStorageService from "../../utils/async-storage-service";
import AccountListItem from "./account-list-item";
import { ThemeConfigs } from "../../models/ui";
import { getThemeConfigs } from "../../utils/ui-utils";

const theme: ThemeConfigs = getThemeConfigs();

const AccountList = (): ReactElement => {
  const insets: EdgeInsets = useSafeAreaInsets();

  const [loading, setLoading] = useState<boolean>(true);
  const [accountList, setAccountList] = useState<AccountInterface[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

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

  /**
   * Filter accounts based on search query.
   */
  const filteredAccountList: AccountInterface[] = useMemo(() => {
    return accountList.filter((account: AccountInterface) =>
      account.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.displayName.toLowerCase().includes(searchQuery.toLowerCase()
      ));
  }, [accountList, searchQuery]);

  if (loading) {
    return (
      <View style={[localStyles.loadingContainer]}>
        <ActivityIndicator
          size="large"
          color={theme.colors.typography.primary}
        />
        <Text style={[localStyles.loadingText]}>
          Loading accounts...
        </Text>
      </View>
    );
  }

  if (accountList.length === 0) {
    return (
      <View style={[localStyles.emptyContainer]}>
        <Text style={[localStyles.emptyText]}>
          No accounts found. Add an account to get started.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[
      localStyles.container,
      { marginBottom: insets.bottom }
    ]}>
      <View style={[localStyles.listContainer]}>
        <View style={[localStyles.searchBoxContainer]}>
          <Ionicons style={localStyles.searchIcon} name="search" size={20} />
          <TextInput
            style={[localStyles.searchBox]}
            placeholder="Search accounts..."
            returnKeyType="search"
            placeholderTextColor={theme.colors.typography.primary}
            value={searchQuery}
            onChangeText={(text: string) => setSearchQuery(text)}
          />
        </View>
        {filteredAccountList.map((account) => (
          <AccountListItem key={account.id} {...account} />
        ))}
      </View>
    </ScrollView>
  );
};

const localStyles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    backgroundColor: theme.colors.screen.background
  },
  listContainer: {
    padding: 24,
    gap: 8
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: theme.colors.screen.background
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: theme.colors.typography.secondary
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: theme.colors.screen.background
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    textAlign: 'center',
    opacity: 0.7,
    color: theme.colors.typography.secondary
  },
  searchBoxContainer: {
    backgroundColor: theme.colors.card.background,
    borderWidth: 1,
    borderColor: theme.colors.card.border,
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16
  },
  searchIcon: {
    color: theme.colors.typography.primary
  },
  searchBox: {
    flex: 1,
    color: theme.colors.typography.primary,
    padding: 0
  }
});

export default AccountList;
