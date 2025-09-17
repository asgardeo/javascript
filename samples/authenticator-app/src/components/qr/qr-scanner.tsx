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
import { FunctionComponent, ReactElement, useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import validateQRData from "../../../src/utils/validate-qr-data";
import useTheme from "../../contexts/theme/useTheme";
import { usePushAuthRegistration } from "../../hooks/use-push-auth-registration";
import { QRDataType, QRDataValidationResponseInterface } from "../../models/core";
import { TOTPQRDataInterface } from "../../models/totp";
import Alert, { AlertType } from "../Alert";

/**
 * Props for the QRScanner component.
 */
interface QRScannerProps {
  /**
   * Callback function to handle successful TOTP QR code scans.
   *
   * @param data - The scanned TOTP QR code data.
   */
  onTOTPQRScanSuccess: (data: TOTPQRDataInterface) => void;
}

/**
 * QR Scanner Component.
 *
 * @param param0 - Props for the QRScanner component.
 * @returns QR Scanner Component.
 */
const QRScanner: FunctionComponent<QRScannerProps> = ({
  onTOTPQRScanSuccess
}: QRScannerProps): ReactElement => {
  const { styles } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const { registerPushDevice } = usePushAuthRegistration();
  const [scanned, setScanned] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState<AlertType>(AlertType.SUCCESS);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (type: AlertType, title: string, message: string) => {
    setAlertType(type);
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  /**
   * Handle the primary button press in the alert.
   */
  const handleAlertPrimaryAction = useCallback(() => {
    setAlertVisible(false);
    if (alertType === AlertType.SUCCESS) {
      router.back();
    } else {
      setScanned(false);
    }
  }, [alertType]);

  /**
   * Handle the barcode scanned event.
   *
   * @param param0 - The scanned barcode data.
   */
  const handleBarCodeScanned = async ({ data }: BarcodeScanningResult) => {
    if (scanned) return;

    const qrData: QRDataValidationResponseInterface = validateQRData(data);

    if (qrData.isValid) {
      setScanned(true);

      if (qrData.type === QRDataType.TOTP) {
        onTOTPQRScanSuccess(qrData.totpData!);
        showAlert(AlertType.SUCCESS, 'QR Code Scanned Successfully!', 'TOTP account registration data has been read successfully.');
      } else if (qrData.type === QRDataType.PUSH_NOTIFICATION) {
        await registerPushDevice(qrData.pushNotificationData!);
        showAlert(AlertType.SUCCESS, 'QR Code Scanned Successfully!', 'Push notification device registration completed successfully.');
      }
    } else {
      showAlert(AlertType.ERROR, 'Invalid QR Code', 'The QR code you scanned is not valid. Please try scanning a valid QR code.');
    }
  };

  /**
   * Handle the go back action.
   */
  const handleGoBack = useCallback(() => {
    router.back();
  }, []);

  if (!permission) {
    return (
      <View style={[qrScannerStyles.container, styles.colors.backgroundBody]}>
        <Text style={styles.typography.body1}>Loading camera permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[qrScannerStyles.container, styles.colors.backgroundBody]}>
        <Text style={[styles.typography.h3, qrScannerStyles.permissionText]}>
          Camera permission required
        </Text>
        <Text style={[styles.typography.body1, qrScannerStyles.permissionText]}>
          We need camera access to scan QR codes
        </Text>
        <TouchableOpacity
          style={[styles.buttons.primaryButton, qrScannerStyles.permissionButton]}
          onPress={requestPermission}
        >
          <Text style={styles.buttons.primaryButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.buttons.secondaryButton, qrScannerStyles.permissionButton]}
          onPress={handleGoBack}
        >
          <Text style={styles.buttons.secondaryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <CameraView
        style={qrScannerStyles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />
      <View style={qrScannerStyles.overlay}>
          <View style={qrScannerStyles.scanFrame} />
          <Text style={qrScannerStyles.instructionText}>
            Point your camera at a QR code
          </Text>

          <TouchableOpacity
            style={qrScannerStyles.backButton}
            onPress={handleGoBack}
          >
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
      </View>

      <Alert
        visible={alertVisible}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        primaryButtonText={alertType === AlertType.ERROR ? "Scan Again" : undefined}
        secondaryButtonText={alertType === AlertType.ERROR ? "Go Back" : undefined}
        onPrimaryPress={handleAlertPrimaryAction}
        onSecondaryPress={alertType === AlertType.ERROR ? handleGoBack : undefined}
        autoDismissTimeout={alertType === AlertType.SUCCESS ? 2000 : undefined}
      />
    </>
  );
};

/**
 * Styles for the QR scanner component.
 */
const qrScannerStyles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    backgroundColor: "transparent"
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
    backgroundColor: "transparent"
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "white",
    borderRadius: 20,
    backgroundColor: "transparent",
  },
  instructionText: {
    color: "white",
    fontSize: 16,
    marginTop: 20,
    textAlign: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 10,
    borderRadius: 5,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 10
  },
  permissionText: {
    alignSelf: "center",
    textAlign: "center",
    marginBottom: 20
  },
  permissionButton: {
    marginBottom: 10,
    width: "80%",
    alignSelf: "center",
  },
});

export default QRScanner;
