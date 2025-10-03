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

import AccountList from "../src/components/home/account-list";
import { MaterialIcons } from "@expo/vector-icons";
import { Router, useRouter } from "expo-router";
import { FunctionComponent, ReactElement, use, useEffect } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import useTheme from "../src/contexts/theme/useTheme";
import AsyncStorageService from "@/src/utils/async-storage-service";
import StorageConstants from "@/src/constants/storage";
import { authenticateAsync, LocalAuthenticationResult } from "expo-local-authentication";
import { ThemeConfigs } from "../src/models/ui";
import { getThemeConfigs } from "../src/utils/ui-utils";

const theme: ThemeConfigs = getThemeConfigs();

const Home: FunctionComponent = (): ReactElement => {
  const { styles } = useTheme();
  const router: Router = useRouter();

  const handleAddPress = () => {
    authenticateAsync()
      .then((status: LocalAuthenticationResult) => {
        if (status.success) {
          router.push("/qr-scanner");
        }
      });
  };

  // useEffect(() => {
  //   AsyncStorageService.removeItem(StorageConstants.ACCOUNTS_DATA);
  // }, []);

  return (
    <View style={[homeStyles.container]}>
      <AccountList />
      <TouchableOpacity
        style={[homeStyles.floatingAddButton]}
        onPress={handleAddPress}
      >
        <MaterialIcons
          name="add"
          size={30}
          color={styles.buttons.primaryButtonText.color}
        />
      </TouchableOpacity>
    </View>
  );
};

/**
 * Styles for the home component.
 */
const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.screen.background
  },
  floatingAddButton: {
    backgroundColor: theme.colors.button.primary.background,
    color: theme.colors.button.primary.text,
    position: 'absolute',
    bottom: 30,
    right: 30,
    borderRadius: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'auto',
    height: 'auto',
    paddingVertical: 12,
    paddingHorizontal: 12
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1000,
  },
});

export default Home;
