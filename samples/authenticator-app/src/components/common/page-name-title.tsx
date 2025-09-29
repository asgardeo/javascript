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

import { HeaderTitleProps } from "@react-navigation/elements";
import { ReactElement } from "react";
import { StyleSheet, Text, View } from "react-native";

/**
 * Props for the header title component.
 *
 * @param props - Props for the header title component.
 * @returns A React element representing the header title.
 */
const PageNameTitle = (_props: HeaderTitleProps): ReactElement => {
  return (
    <View>
      <Text style={[styles.appName]}>Push Login History</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  appLogo: {
    width: 30,
    height: 30,
    resizeMode: 'contain'
  },
  appName: {
    fontSize: 15,
    fontWeight: '400',
    color: '#17181aff'
  }
});

export default PageNameTitle;
