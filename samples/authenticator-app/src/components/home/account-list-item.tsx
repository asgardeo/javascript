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
import { useRouter } from "expo-router";
import { FunctionComponent, ReactElement } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import useTheme from "../../contexts/theme/useTheme";
import { AccountInterface } from "../../models/storage";

const AccountListItem: FunctionComponent<AccountInterface> = ({
  deviceId,
  organization,
  username
}: AccountInterface): ReactElement => {
  const { styles } = useTheme();
  const router = useRouter();

  const handleAccountPress = () => {
    router.push(`/account?id=${deviceId}`);
  };

  return (
    <TouchableOpacity
      style={[
        localStyles.container,
        styles.colors.backgroundSurface,
        styles.colors.borderDefault,
        { borderWidth: 1 }
      ]}
      onPress={handleAccountPress}
      activeOpacity={0.7}
    >
      <View style={localStyles.iconContainer}>
        <View style={[
          localStyles.iconWrapper,
          styles.colors.backgroundPrimaryLight
        ]}>
          <Ionicons
            name="person-circle-outline"
            size={32}
            color={styles.colors.textPrimary.color}
          />
        </View>
      </View>

      <View style={localStyles.contentContainer}>
        <Text style={[
          localStyles.usernameText,
          styles.typography.h6,
          styles.colors.textPrimary
        ]}>
          {username}
        </Text>
        <Text style={[
          localStyles.organizationText,
          styles.typography.body2,
          styles.colors.textSecondary
        ]}>
          {organization}
        </Text>
      </View>

      <View style={localStyles.arrowContainer}>
        <Ionicons
          name="chevron-forward"
          size={20}
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
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5
  },
  iconContainer: {
    marginRight: 16,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  usernameText: {
    marginBottom: 4,
  },
  organizationText: {
    marginBottom: 2,
  },
  deviceIdText: {
    opacity: 0.7,
  },
  arrowContainer: {
    marginLeft: 8,
  },
});

export default AccountListItem;
