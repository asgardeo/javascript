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

import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { FunctionComponent, ReactElement } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import useTheme from "../src/contexts/theme/useTheme";

const Home: FunctionComponent = (): ReactElement => {
  const { styles } = useTheme();

  const handleAddPress = () => {
    router.push("/qr-scanner");
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={styles.typography.h2}>Welcome to the Home Screen!</Text>

      <TouchableOpacity
        style={[
          styles.buttons.primaryButton,
          homeStyles.floatingAddButton
        ]}
        onPress={handleAddPress}
      >
        <MaterialIcons
          name="add"
          size={30}
          color={ styles.buttons.primaryButtonText.color }
        />
      </TouchableOpacity>
    </View>
  );
};

/**
 * Styles for the home component.
 */
const homeStyles = StyleSheet.create({
  floatingAddButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    borderRadius: '50%',
    minHeight: 0,
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
