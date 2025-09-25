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
import useTheme from "../../contexts/theme/useTheme";
import { AccountInterface } from "../../models/storage";
import Avatar from "../common/avatar";

const AccountListItem: FunctionComponent<AccountInterface> = ({
  id,
  displayName,
  username
}: AccountInterface): ReactElement => {
  const { styles } = useTheme();
  const router = useRouter();

  const handleAccountPress = () => {
    router.push(`/account?id=${id}`);
  };

  return (
    <TouchableOpacity
      style={[
        localStyles.container
      ]}
      onPress={handleAccountPress}
      activeOpacity={0.7}
    >
      <Avatar name={username || displayName} style={localStyles.iconContainer} />

      <View style={localStyles.contentContainer}>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[localStyles.usernameText]}
        >
          {username}
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
          color={styles.colors.textSecondary.color}
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
    backgroundColor: '#f5f6f9ff',
    borderWidth: 1,
    borderColor: '#d1d9e6'
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
    color: '#56585eff'
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
    color: '#868c99ff'
  },
  arrowContainer: {
    marginLeft: 24,
  }
});

export default AccountListItem;
