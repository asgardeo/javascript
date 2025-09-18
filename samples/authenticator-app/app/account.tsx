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

import { useLocalSearchParams } from "expo-router";
import { FunctionComponent, ReactElement } from "react";
import { Text, View } from "react-native";

/**
 * Push Authentication Screen
 *
 * @returns Push authentication screen component.
 */
const PushAuthScreen: FunctionComponent = (): ReactElement | null => {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View>
      <Text>Account Screen: {id}</Text>
    </View>
  );
}

export default PushAuthScreen;
