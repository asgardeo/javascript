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

import { Ionicons, Octicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { FunctionComponent, ReactElement } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AccountInterface } from "../../models/storage";
import Avatar from "../common/avatar";
import { authenticateAsync, LocalAuthenticationResult } from "expo-local-authentication";
import { getThemeConfigs, getUsername } from "../../utils/ui-utils";
import { ThemeConfigs } from "../../models/ui";

const theme: ThemeConfigs = getThemeConfigs();

const AccountListItem: FunctionComponent<AccountInterface> = ({
  id,
  displayName,
  username
}: AccountInterface): ReactElement => {
  const router = useRouter();

  const handleAccountPress = () => {
    authenticateAsync()
      .then((status: LocalAuthenticationResult) => {
        if (status.success) {
          router.push(`/account?id=${id}`);
        }
      });
  };

  return (
    <TouchableOpacity
      style={[
        localStyles.container
      ]}
      onPress={handleAccountPress}
      activeOpacity={0.7}
    >
      <Avatar name={getUsername(username) || displayName} style={localStyles.iconContainer} />

      <View style={localStyles.contentContainer}>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[localStyles.usernameText]}
        >
          {getUsername(username)}
        </Text>
        <View style={[localStyles.organizationContainer]}>
          <Octicons
            style={[localStyles.organizationText]}
            name="organization"
            size={14}
          />
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[localStyles.organizationText]}
          >
            {displayName}
          </Text>
        </View>
      </View>

      <View style={localStyles.arrowContainer}>
        <Ionicons
          name="chevron-forward"
          size={26}
          color={theme.colors.typography.secondary}
        />
      </View>
    </TouchableOpacity>
  );
};

const localStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.card.background,
    borderWidth: 1,
    borderColor: theme.colors.card.border
  },
  iconContainer: {
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 2
  },
  usernameText: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.colors.typography.primary
  },
  organizationContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'baseline',
    gap: 5
  },
  organizationText: {
    fontSize: 14,
    fontWeight: '400',
    color: theme.colors.typography.secondary
  },
  arrowContainer: {
    marginLeft: 24,
  }
});

export default AccountListItem;
