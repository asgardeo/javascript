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

import { AvatarColorPair } from "@/src/models/ui";
import { FunctionComponent, ReactElement, useMemo } from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import getInitials from "../../utils/getInitials";
import getAvatarColors from "../../utils/getAvatarColors";

/**
 * Avatar component props.
 */
export interface AvatarProps {
  name?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Avatar component to display user initials with a colored background.
 *
 * @param props - Props for the Avatar component.
 * @returns Avatar component.
 */
const AvatarWidget: FunctionComponent<AvatarProps> = ({
  name,
  style
}: AvatarProps): ReactElement => {
  /**
   * Get the initials from the name.
   */
  const initials: string = useMemo(() => {
    if (!name) return '';

    return getInitials(name);
  }, [name]);

  /**
   * Get avatar colors based on the name.
   */
  const avatarColors: AvatarColorPair = useMemo(() => {
    if (!name) return { bg: '', text: '' };

    return getAvatarColors(name);
  }, [name]);

  return (
    <View style={style}>
      <View style={[
        styles.iconWrapper,
        { backgroundColor: avatarColors.bg }
      ]}>
        <Text style={[
          styles.initialText,
          { color: avatarColors.text }
        ]}>
          {initials}
        </Text>
      </View>
    </View>
  )
};

/**
 * Styles for the component.
 */
const styles = StyleSheet.create({
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  initialText: {
    fontSize: 24
  }
});

export default AvatarWidget;
