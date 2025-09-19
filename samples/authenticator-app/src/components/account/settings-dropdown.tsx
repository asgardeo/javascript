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
import { FunctionComponent, ReactElement, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import useTheme from "../../contexts/theme/useTheme";

/**
 * Props for the SettingsDropdown component.
 */
export interface SettingsDropdownProps {
  /**
   * Callback function to be called when the delete action is triggered.
   */
  onDelete: () => void;
}

/**
 * Settings Dropdown Component with delete action.
 *
 * @param onDelete Function to call when delete is pressed.
 * @returns A React element representing the settings dropdown component.
 */
const SettingsDropdown: FunctionComponent<SettingsDropdownProps> = ({ onDelete }: SettingsDropdownProps): ReactElement => {
  const { styles } = useTheme();
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const handleDelete = async () => {
    setIsVisible(false);
    onDelete();
  };

  const toggleDropdown = () => {
    setIsVisible(!isVisible);
  };

  return (
    <View style={localStyles.container}>
      <TouchableOpacity
        style={localStyles.triggerButton}
        onPress={toggleDropdown}
        activeOpacity={0.7}
      >
        <Ionicons
          name="ellipsis-vertical"
          size={24}
          color={styles.colors.textPrimary.color}
        />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <TouchableOpacity
          style={localStyles.overlay}
          activeOpacity={1}
          onPress={() => setIsVisible(false)}
        >
          <View style={localStyles.dropdownContainer}>
            <View style={[
              localStyles.dropdown,
              styles.colors.backgroundSurface,
              {
                shadowColor: styles.colors.textPrimary.color,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 8
              }
            ]}>
              <TouchableOpacity
                style={[
                  localStyles.dropdownItem,
                  { borderBottomColor: styles.colors.backgroundSurfaceLight.backgroundColor }
                ]}
                onPress={handleDelete}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color="#ef4444"
                />
                <Text style={[
                  localStyles.dropdownItemText,
                  styles.typography.body2,
                  { color: "#ef4444" }
                ]}>
                  Delete Account
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// Local styles for component-specific styling
const localStyles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  triggerButton: {
    padding: 8,
    borderRadius: 20,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 80, // Account for header height
    paddingRight: 16,
  },
  dropdownContainer: {
    position: 'relative',
  },
  dropdown: {
    minWidth: 180,
    borderRadius: 8,
    paddingVertical: 8,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownItemText: {
    marginLeft: 12,
    fontWeight: '500',
  },
});

export default SettingsDropdown;
