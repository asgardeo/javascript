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
import { NativeStackHeaderRightProps } from "@react-navigation/native-stack";
import { TouchableOpacity } from "react-native";

/**
 * HeaderSettings component for the settings icon in the header.
 *
 * @param _props - Props for the header right component.
 * @returns A view containing the settings icon.
 */
const HeaderSettings = (_props: NativeStackHeaderRightProps) => {
  return (
    <TouchableOpacity>
      <Ionicons name="settings-outline" size={24}/>
    </TouchableOpacity>
  )
}

export default HeaderSettings;
