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
import { FunctionComponent, ReactElement, useEffect } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import useTheme from "../contexts/theme/useTheme";

/**
 * Alert types for different notification states.
 */
export enum AlertType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
};

/**
 * Props for the Alert component.
 */
interface AlertProps {
  /**
   * Whether the alert is visible.
   */
  visible: boolean;
  /**
   * Type of alert (success or error).
   */
  type: AlertType;
  /**
   * Title text for the alert.
   */
  title: string;
  /**
   * Message text for the alert.
   */
  message: string;
  /**
   * Text for the primary button.
   */
  primaryButtonText?: string;
  /**
   * Text for the secondary button (optional).
   */
  secondaryButtonText?: string;
  /**
   * Callback function when primary button is pressed.
   */
  onPrimaryPress: () => void;
  /**
   * Callback function when secondary button is pressed (optional).
   */
  onSecondaryPress?: () => void;
  /**
   * Auto dismiss timeout in milliseconds (optional).
   */
  autoDismissTimeout?: number;
}

/**
 * Configuration for alert icons and colors.
 */
interface AlertConfig {
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
  background: {
    backgroundColor: string;
  };
}

/**
 * Alert Component with themed styles and icons.
 *
 * @param props - Props for the Alert component.
 * @returns Alert Component.
 */
const Alert: FunctionComponent<AlertProps> = ({
  visible,
  type,
  title,
  message,
  primaryButtonText,
  secondaryButtonText,
  onPrimaryPress,
  onSecondaryPress,
  autoDismissTimeout,
}: AlertProps): ReactElement => {
  const { styles } = useTheme();

  /**
   * Get icon and color based on alert type.
   *
   * @returns Icon name and color based on alert type.
   */
  const getAlertConfig = (): AlertConfig => {
    switch (type) {
      case AlertType.SUCCESS:
        return {
          icon: 'check-circle' as const,
          iconColor: '#4CAF50',
          background: styles.colors.backgroundNeutral,
        };
      case AlertType.ERROR:
        return {
          icon: 'error' as const,
          iconColor: '#F44336',
          background: styles.colors.backgroundError,
        };
      case AlertType.INFO:
        return {
          icon: 'info' as const,
          iconColor: '#2196F3',
          background: styles.colors.backgroundInfo,
        }
      default:
        return {
          icon: 'info' as const,
          iconColor: '#2196F3',
          background: styles.colors.backgroundInfo,
        };
    }
  };

  const alertConfig: AlertConfig = getAlertConfig();

  /**
   * Auto dismiss the alert after the specified timeout.
   */
  useEffect(() => {
    if (autoDismissTimeout && visible) {
      const id: number = setTimeout(() => {
        onPrimaryPress();
      }, autoDismissTimeout);

      return () => clearTimeout(id);
    }
  }, [autoDismissTimeout, visible, onPrimaryPress])

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={alertStyles.overlay}>
        <View style={[alertStyles.container, alertConfig.background]}>
          <View style={alertStyles.iconContainer}>
            <MaterialIcons
              name={alertConfig.icon}
              size={48}
              color={alertConfig.iconColor}
            />
          </View>

          <Text style={[styles.typography.h3, alertStyles.title]}>
            {title}
          </Text>

          <Text style={[styles.typography.body2, alertStyles.message]}>
            {message}
          </Text>

          {autoDismissTimeout && (
            <Text style={[styles.typography.body3]}>
              Redirecting...
            </Text>
          )}

          {(primaryButtonText || secondaryButtonText) && (
            <View style={alertStyles.buttonContainer}>
              {secondaryButtonText && onSecondaryPress && (
                <TouchableOpacity
                  style={[styles.buttons.secondaryButton]}
                  onPress={onSecondaryPress}
                >
                  <Text style={styles.buttons.secondaryButtonText}>
                    {secondaryButtonText}
                  </Text>
                </TouchableOpacity>
              )}

              {primaryButtonText && onPrimaryPress && (
                <TouchableOpacity
                  style={[styles.buttons.primaryButton]}
                  onPress={onPrimaryPress}
                >
                  <Text style={styles.buttons.primaryButtonText}>
                    {primaryButtonText}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

/**
 * Styles for the Alert component.
 */
const alertStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 280,
    maxWidth: 340,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginBottom: 24
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12
  }
});

export default Alert;
