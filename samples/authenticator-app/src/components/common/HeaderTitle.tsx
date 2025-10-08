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

import Theme from "../../utils/Theme";
import { ThemeConfigs } from "../../models/ui";
import { HeaderTitleProps } from "@react-navigation/elements";
import { ReactElement } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

const theme: ThemeConfigs = Theme.getInstance().getConfigs();

/**
 * Header title component for the app.
 *
 * @param _props - Props for the header title component.
 * @returns Header title component.
 */
const HeaderTitle = (_props: HeaderTitleProps): ReactElement => {
  return (
    <View style={[styles.appTitleContainer]}>
      <Image
        source={require('../../../assets/images/logo.png')}
        style={styles.appLogo}
      />
      <Text style={[styles.appName]}>Authenticator</Text>
    </View>
  );
};

/**
 * Styles for the header title component.
 */
const styles = StyleSheet.create({
  appTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8
  },
  appLogo: {
    width: 30,
    height: 30,
    resizeMode: 'contain'
  },
  appName: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.colors.header.text
  }
});

export default HeaderTitle;
