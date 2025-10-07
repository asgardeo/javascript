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
import { BarcodeScanningResult, CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { FunctionComponent, ReactElement, RefObject, useCallback, useEffect, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import validateQRData from "../../../src/utils/validate-qr-data";
import { QRDataType, QRDataValidationResponseInterface } from "../../models/core";
import { AlertType } from "../common/alert";
import useTOTP from "../../contexts/totp/use-totp";
import useAsgardeo from "../../contexts/asgardeo/use-asgardeo";
import AppPaths from "../../constants/paths";
import { ThemeConfigs } from "../../models/ui";
import { getThemeConfigs } from "../../utils/ui-utils";
import usePushAuth from "../../contexts/push-auth/use-push-auth";

const theme: ThemeConfigs = getThemeConfigs();

/**
 * QR Scanner Component.
 *
 * @param props - Props for the QRScanner component.
 * @returns QR Scanner Component.
 */
const QRScanner: FunctionComponent = (): ReactElement => {
  const { registerTOTP } = useTOTP();
  const { showAlert, hideAlert } = useAsgardeo();
  const [permission, requestPermission] = useCameraPermissions();
  const { registerPushDevice } = usePushAuth();
  const scanned: RefObject<boolean> = useRef<boolean>(false);

  /**
   * Handle the account page redirection.
   *
   * @param accountId - The account ID to redirect to.
   */
  const redirectToAccountPage = useCallback((accountId: string) => {
    if (!accountId) {
      router.back();
      return;
    }

    router.replace({
      pathname: `/${AppPaths.ACCOUNT}`,
      params: { id: accountId }
    });
  }, []);

  /**
   * Handle the barcode scanned event.
   *
   * @param params - The scanned barcode data.
   */
  const handleBarCodeScanned = async ({ data }: BarcodeScanningResult) => {
    if (scanned.current) return;

    const qrData: QRDataValidationResponseInterface = validateQRData(data);

    if (qrData.isValid) {
      scanned.current = true;

      if (qrData.type === QRDataType.TOTP) {
        showAlert({
          type: AlertType.LOADING,
          title: 'Registering TOTP...',
          message: 'Please wait while we register your TOTP account.'
        });

        try {
          const accountId: string = await registerTOTP(qrData.totpData!);

          showAlert({
            type: AlertType.SUCCESS,
            title: 'QR Code Scanned Successfully!',
            message: 'TOTP registration completed successfully.',
            autoDismissTimeout: 3000,
            onPrimaryPress: () => {
              hideAlert();
              redirectToAccountPage(accountId);
            }
          });
        } catch {
          showAlert({
            type: AlertType.ERROR,
            title: 'Registration Failed',
            message: 'Failed to register the TOTP account. Please try again.',
            primaryButtonText: 'Scan Again',
            secondaryButtonText: 'Go Back',
            onPrimaryPress: () => {
              hideAlert();
              scanned.current = false;
            },
            onSecondaryPress: () => {
              hideAlert();
              router.back();
            }
          });
        }
      } else if (qrData.type === QRDataType.PUSH_NOTIFICATION) {
        showAlert({
          type: AlertType.LOADING,
          title: 'Registering Device...',
          message: 'Please wait while we register your device for push notifications.'
        });
        try {
          const accountId: string = await registerPushDevice(qrData.pushNotificationData!);

          showAlert({
            type: AlertType.SUCCESS,
            title: 'QR Code Scanned Successfully!',
            message: 'Push notification device registration completed successfully.',
            autoDismissTimeout: 3000,
            onPrimaryPress: () => {
              hideAlert();
              redirectToAccountPage(accountId);
            }
          });
        } catch {
          showAlert({
            type: AlertType.ERROR,
            title: 'Registration Failed',
            message: 'Failed to register the push notification device. Please try again.',
            primaryButtonText: 'Scan Again',
            secondaryButtonText: 'Go Back',
            onPrimaryPress: () => {
              hideAlert();
              scanned.current = false;
            },
            onSecondaryPress: () => {
              hideAlert();
              router.back();
            }
          });
        }
      }
    } else {
      showAlert({
        type: AlertType.ERROR,
        title: 'Invalid QR Code',
        message: 'The QR code you scanned is not valid. Please try scanning a valid QR code.',
        primaryButtonText: 'Scan Again',
        secondaryButtonText: 'Go Back',
        onPrimaryPress: () => {
          hideAlert();
          scanned.current = false;
        },
        onSecondaryPress: () => {
          hideAlert();
          router.back();
        }
      });
    }
  };

  /**
   * Handle camera permission request.
   */
  useEffect(() => {
    if (!permission) {
      return;
    }

    if (!permission?.granted) {
      showAlert({
        type: AlertType.WARNING,
        title: "Camera Permission Required",
        message: "Camera access is required to scan QR codes. Please grant camera permission.",
        primaryButtonText: "Grant Permission",
        secondaryButtonText: "Go Back",
        onPrimaryPress: () => {
          hideAlert();
          requestPermission();
        },
        onSecondaryPress: () => {
          hideAlert();
          router.back();
        }
      })
    }
  }, [permission, requestPermission, showAlert, hideAlert]);

  if (!permission || !permission.granted) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          Loading camera...
        </Text>
      </View>
    );
  }

  return (
    <>
      <CameraView
        style={styles.camera}
        onBarcodeScanned={handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />
      <View style={styles.overlay}>
        <View style={styles.scanFrame} />
        <Text style={styles.instructionText}>
          Point your camera at a QR code
        </Text>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.overlay.text} />
        </TouchableOpacity>
      </View>
    </>
  );
};

/**
 * Styles for the QR scanner component.
 */
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.screen.background,
    justifyContent: "center",
    alignItems: "center"
  },
  loadingText: {
    color: theme.colors.typography.primary,
    fontSize: 18
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.overlay.background
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: theme.colors.overlay.text,
    borderRadius: 20,
    backgroundColor: "transparent",
  },
  instructionText: {
    color: theme.colors.overlay.text,
    fontSize: 16,
    marginTop: 20,
    textAlign: "center",
    padding: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.overlay.background
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    borderRadius: 20,
    padding: 10,
    backgroundColor: theme.colors.overlay.background
  }
});

export default QRScanner;
