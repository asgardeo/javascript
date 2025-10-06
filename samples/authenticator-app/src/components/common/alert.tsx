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

import { ThemeConfigs } from "../../models/ui";
import { getThemeConfigs } from "../../utils/ui-utils";
import { MaterialIcons } from "@expo/vector-icons";
import { FunctionComponent, ReactElement, useEffect } from "react";
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const theme: ThemeConfigs = getThemeConfigs();

/**
 * Alert types for different notification states.
 */
export enum AlertType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
  LOADING = 'loading',
};

/**
 * Props for the Alert component.
 */
export interface AlertProps {
  /**
   * Whether the alert is visible.
   */
  visible: boolean;
  /**
   * Type of alert (success, error, info, or loading).
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
  onPrimaryPress?: () => void;
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
  icon?: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
  showLoader?: boolean;
  background: string;
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
          iconColor: theme.colors.alert.success.text,
          background: theme.colors.alert.success.background
        };
      case AlertType.ERROR:
        return {
          icon: 'error' as const,
          iconColor: theme.colors.alert.error.text,
          background: theme.colors.alert.error.background
        };
      case AlertType.INFO:
        return {
          icon: 'info' as const,
          iconColor: theme.colors.alert.info.text,
          background: theme.colors.alert.info.background
        };
      case AlertType.LOADING:
        return {
          showLoader: true,
          iconColor: theme.colors.alert.loading.text,
          background: theme.colors.alert.loading.background
        };
      default:
        return {
          icon: 'info' as const,
          iconColor: theme.colors.alert.info.text,
          background: theme.colors.alert.info.background
        };
    }
  };

  /**
   * Alert configuration based on the type.
   */
  const alertConfig: AlertConfig = getAlertConfig();

  /**
   * Auto dismiss the alert after the specified timeout.
   */
  useEffect(() => {
    if (autoDismissTimeout && visible && onPrimaryPress) {
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
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: alertConfig.background }]}>
          <View style={styles.iconContainer}>
            {alertConfig.showLoader ? (
              <ActivityIndicator
                size="large"
                color={alertConfig.iconColor}
                style={styles.loader}
              />
            ) : (
              <MaterialIcons
                name={alertConfig.icon!}
                size={48}
                color={alertConfig.iconColor}
              />
            )}
          </View>

          <Text style={[styles.title]}>
            {title}
          </Text>

          <Text style={[styles.message]}>
            {message}
          </Text>

          {autoDismissTimeout && (
            <Text style={[styles.redirectText]}>
              Redirecting...
            </Text>
          )}

          {(primaryButtonText || secondaryButtonText) && (
            <View style={styles.buttonContainer}>
              {secondaryButtonText && onSecondaryPress && (
                <TouchableOpacity
                  style={[styles.secondaryButton]}
                  onPress={onSecondaryPress}
                >
                  <Text style={[styles.secondaryButtonText]}>
                    {secondaryButtonText}
                  </Text>
                </TouchableOpacity>
              )}

              {primaryButtonText && onPrimaryPress && (
                <TouchableOpacity
                  style={[styles.primaryButton]}
                  onPress={onPrimaryPress}
                >
                  <Text style={[styles.primaryButtonText]}>
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
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.screen.overlay
  },
  container: {
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 280,
    maxWidth: 340
  },
  iconContainer: {
    marginBottom: 16
  },
  loader: {
    marginVertical: 8
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: theme.colors.typography.primary,
    textAlign: 'center'
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
    color: theme.colors.typography.secondary,
    fontSize: 16
  },
  redirectText: {
    marginBottom: 16,
    color: theme.colors.typography.primary,
    fontSize: 14
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: theme.colors.button.secondary.background
  },
  secondaryButtonText: {
    color: theme.colors.button.secondary.text,
    fontSize: 16
  },
  primaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: theme.colors.button.primary.background
  },
  primaryButtonText: {
    color: theme.colors.button.primary.text,
    fontSize: 16
  }
});

export default Alert;
