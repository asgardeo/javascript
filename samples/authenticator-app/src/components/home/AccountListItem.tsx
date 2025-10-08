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
import AvatarWidget from "../common/AvatarWidget";
import { ThemeConfigs } from "../../models/ui";
import AppPaths from "../../constants/AppPaths";
import getUsername from "../../utils/getUsername";
import Theme from "../../utils/Theme";

const theme: ThemeConfigs = Theme.getInstance().getConfigs();

/**
 * Account list item component.
 *
 * @param props - Props for the AccountListItem component.
 * @returns AccountListItem component.
 */
const AccountListItem: FunctionComponent<AccountInterface> = ({
  id,
  displayName,
  username
}: AccountInterface): ReactElement => {
  const router = useRouter();

  /**
   * Handle account press event.
   */
  const handleAccountPress = () => {
    router.push(`/${AppPaths.ACCOUNT}?id=${id}`);
  };

  return (
    <TouchableOpacity
      style={[
        styles.container
      ]}
      onPress={handleAccountPress}
      activeOpacity={0.7}
    >
      <AvatarWidget name={getUsername(username) || displayName} style={styles.iconContainer} />

      <View style={styles.contentContainer}>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[styles.usernameText]}
        >
          {getUsername(username)}
        </Text>
        <View style={[styles.organizationContainer]}>
          <Octicons
            style={[styles.organizationText]}
            name="organization"
            size={14}
          />
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[styles.organizationText]}
          >
            {displayName}
          </Text>
        </View>
      </View>

      <View style={styles.arrowContainer}>
        <Ionicons
          name="chevron-forward"
          size={26}
          color={theme.colors.typography.secondary}
        />
      </View>
    </TouchableOpacity>
  );
};

/**
 * Styles for the component.
 */
const styles = StyleSheet.create({
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
