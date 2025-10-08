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
import { FunctionComponent, ReactElement } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemeConfigs } from "../src/models/ui";
import { getThemeConfigs } from "../src/utils/ui-utils";
import verifyLocalAuthentication from "../src/utils/verifyLocalAuthentication";
import AppPaths from "../src/constants/paths";

const theme: ThemeConfigs = getThemeConfigs();

/**
 * Home screen component.
 *
 * @returns Home screen component.
 */
const Home: FunctionComponent = (): ReactElement => {
  const router: Router = useRouter();

  /**
   * Handles the add button press event.
   */
  const handleAddPress = () => {
    verifyLocalAuthentication()
      .then((verified: boolean) => {
        if (verified) {
          router.push(`/${AppPaths.QR_SCANNER}`);
        }
      });
  };

  return (
    <View style={[styles.container]}>
      <AccountList />
      <TouchableOpacity
        style={[styles.floatingAddButton]}
        onPress={handleAddPress}
      >
        <MaterialIcons
          name="add"
          size={30}
          color={theme.colors.button.primary.text}
        />
      </TouchableOpacity>
    </View>
  );
};

/**
 * Styles for the home component.
 */
const styles = StyleSheet.create({
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
  }
});

export default Home;
