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
import { ReactElement, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context";
import { AccountInterface } from "../../models/storage";
import AccountListItem from "./AccountListItem";
import { ThemeConfigs } from "../../models/ui";
import useAccount from "../../contexts/account/useAccount";
import Theme from "../../utils/Theme";

const theme: ThemeConfigs = Theme.getInstance().getConfigs();

/**
 * Account list component.
 *
 * @returns Account list component.
 */
const AccountList = (): ReactElement => {
  const { loading, accounts } = useAccount();
  const insets: EdgeInsets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState<string>("");

  /**
   * Filter accounts based on search query.
   */
  const filteredAccountList: AccountInterface[] = useMemo(() => {
    return accounts.filter((account: AccountInterface) =>
      account.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.displayName.toLowerCase().includes(searchQuery.toLowerCase()
      ));
  }, [accounts, searchQuery]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer]}>
        <ActivityIndicator
          size="large"
          color={theme.colors.typography.primary}
        />
        <Text style={[styles.loadingText]}>
          Loading accounts...
        </Text>
      </View>
    );
  }

  if (accounts.length === 0) {
    return (
      <View style={[styles.emptyContainer]}>
        <Text style={[styles.emptyText]}>
          No accounts found. Add an account to get started.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[
      styles.container,
      { marginBottom: insets.bottom }
    ]}>
      <View style={[styles.listContainer]}>
        <View style={[styles.searchBoxContainer]}>
          <Ionicons style={styles.searchIcon} name="search" size={20} />
          <TextInput
            style={[styles.searchBox]}
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

/**
 * Styles for the component.
 */
const styles = StyleSheet.create({
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
