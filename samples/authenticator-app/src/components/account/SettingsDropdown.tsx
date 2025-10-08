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
import { FunctionComponent, ReactElement, useMemo, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ThemeConfigs } from "../../models/ui";
import { AccountInterface } from "../../models/storage";
import useAccount from "../../contexts/account/useAccount";
import useAsgardeo from "../../contexts/asgardeo/useAsgardeo";
import { AlertType } from "../common/AlertWidget";
import verifyLocalAuthentication from "../../utils/verifyLocalAuthentication";
import useTOTP from "../../contexts/totp/useTOTP";
import { Router, useRouter } from "expo-router";
import AppPaths from "../../constants/AppPaths";
import usePushAuth from "../../contexts/push-auth/usePushAuth";
import Theme from "../../utils/Theme";

const theme: ThemeConfigs = Theme.getInstance().getConfigs();

/**
 * Props for the SettingsDropdown component.
 */
export interface SettingsDropdownProps {
  /**
   * Account id of the current account.
   */
  accountId?: string;
}

/**
 * Settings Dropdown Component with delete action.
 *
 * @param onDelete Function to call when delete is pressed.
 * @returns A React element representing the settings dropdown component.
 */
const SettingsDropdown: FunctionComponent<SettingsDropdownProps> = ({
  accountId
}: SettingsDropdownProps): ReactElement => {
  const { accounts } = useAccount();
  const { showAlert, hideAlert } = useAsgardeo();
  const { unregisterTOTP } = useTOTP();
  const { unregisterPushDevice } = usePushAuth();
  const router: Router = useRouter();
  const [isVisible, setIsVisible] = useState<boolean>(false);

  /**
   * Get the account data for the given account ID.
   */
  const accountData: AccountInterface | null = useMemo(() => {
    if (!accountId) {
      return null;
    }

    return accounts.find(account => account.id === accountId) ?? null;
  }, [accountId, accounts]);

  /**
   * Handle the TOTP account deletion.
   */
  const handleTOTPDelete = () => {
    verifyLocalAuthentication()
      .then((verified: boolean) => {
        if (verified) {
          showAlert({
            type: AlertType.LOADING,
            title: "Deleting TOTP Account",
            message: "Please wait while we delete the TOTP account."
          })
          unregisterTOTP(accountId!)
            .then(() => {
              showAlert({
                type: AlertType.SUCCESS,
                title: "TOTP Account Deleted",
                message: "The TOTP account has been deleted successfully.",
                onPrimaryPress: () => {
                  hideAlert();
                  router.replace(`/${AppPaths.HOME}`);
                },
                autoDismissTimeout: 3000
              });
            })
            .catch(() => {
              showAlert({
                type: AlertType.ERROR,
                title: "Error Deleting TOTP Account",
                message: "An error occurred while deleting the TOTP account. Please try again.",
                primaryButtonText: "OK",
                onPrimaryPress: () => { hideAlert(); }
              });
            });
        }
      })
  }

  /**
   * Handle the Push account deletion.
   */
  const handlePushDelete = () => {
    verifyLocalAuthentication()
      .then((verified: boolean) => {
        if (verified) {
          showAlert({
            type: AlertType.LOADING,
            title: "Deleting Push Account",
            message: "Please wait while we delete the push account."
          })
          unregisterPushDevice(accountId!)
            .then(() => {
              showAlert({
                type: AlertType.SUCCESS,
                title: "Push Account Deleted",
                message: "The push account has been deleted successfully.",
                onPrimaryPress: () => {
                  hideAlert();
                  router.replace(`/${AppPaths.HOME}`);
                },
                autoDismissTimeout: 3000
              });
            })
            .catch(() => {
              showAlert({
                type: AlertType.ERROR,
                title: "Error Deleting Push Account",
                message: "An error occurred while deleting the push account. Please try again.",
                primaryButtonText: "OK",
                onPrimaryPress: () => { hideAlert(); }
              });
            });
        }
      })
  }

  /**
   * Show confirmation alert before deleting the account.
   *
   * @param isTOTP - Flag to indicate if the deleting account is a TOTP account.
   */
  const showConfirmationAlert = (isTOTP: boolean) => {
    setIsVisible(false);
    if (isTOTP) {
      showAlert({
        type: AlertType.WARNING,
        title: "Delete Local TOTP Account",
        message: "Are you sure you want to delete local TOTP account? This action cannot be undone. " +
          "This will not delete the account from the server.",
        primaryButtonText: "Confirm",
        secondaryButtonText: "Cancel",
        onPrimaryPress: handleTOTPDelete,
        onSecondaryPress: () => hideAlert()
      });
    } else {
      showAlert({
        type: AlertType.WARNING,
        title: "Delete Push Account",
        message: "Are you sure you want to delete the push account? This action cannot be undone.",
        primaryButtonText: "Confirm",
        secondaryButtonText: "Cancel",
        onPrimaryPress: handlePushDelete,
        onSecondaryPress: () => hideAlert()
      });
    }
  };

  /**
   * Toggle the visibility of the dropdown menu.
   */
  const toggleDropdown = () => {
    setIsVisible(!isVisible);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={toggleDropdown}
        activeOpacity={0.7}
        style={[styles.button]}
      >
        <Ionicons
          name="ellipsis-vertical"
          size={24}
          color={theme.colors.header.text}
        />
      </TouchableOpacity>
      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setIsVisible(false)}
        >
          <View style={[styles.dropdown]}>
            {accountData?.deviceId && (
              <TouchableOpacity
                style={[styles.dropdownItem]}
                onPress={() => showConfirmationAlert(false)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={theme.colors.alert.error.text}
                />
                <Text style={[styles.dropdownItemText]}>
                  Delete Push Account
                </Text>
              </TouchableOpacity>
            )}
            {accountData?.issuer && (
              <TouchableOpacity
                style={[styles.dropdownItem]}
                onPress={() => showConfirmationAlert(true)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={theme.colors.alert.error.text}
                />
                <Text style={[styles.dropdownItemText]}>
                  Delete TOTP Account
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// Styles for the component.
const styles = StyleSheet.create({
  button: {
    padding: 8
  },
  container: {
    position: 'relative'
  },
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay.background,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 65,
    paddingRight: 16
  },
  dropdown: {
    minWidth: 180,
    borderRadius: 8,
    paddingVertical: 8,
    backgroundColor: theme.colors.header.dropdown.background
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  dropdownItemText: {
    marginLeft: 12,
    fontWeight: '500',
    fontSize: 16,
    color: theme.colors.alert.error.text
  },
});

export default SettingsDropdown;
