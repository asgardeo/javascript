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
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { FunctionComponent, ReactElement, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import useTheme from "../../contexts/theme/useTheme";

interface QRScannerProps {
  onScanSuccess?: (data: any) => void;
}

const QRScanner: FunctionComponent<QRScannerProps> = ({
  onScanSuccess
}): ReactElement => {
  const { styles } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;

    setScanned(true);

    try {
      // Try to parse the QR data as JSON
      const parsedData = JSON.parse(data);

      if (onScanSuccess) {
        onScanSuccess(parsedData);
      } else {
        // Default behavior - show the scanned data
        Alert.alert(
          "QR Code Scanned",
          `Data: ${JSON.stringify(parsedData, null, 2)}`,
          [
            {
              text: "Scan Again",
              onPress: () => setScanned(false),
            },
            {
              text: "Close",
              onPress: () => router.back(),
            },
          ]
        );
      }
    } catch (error) {
      // If it's not valid JSON, show as plain text
      Alert.alert(
        "QR Code Scanned",
        `Invalid JSON data: ${data}`,
        [
          {
            text: "Scan Again",
            onPress: () => setScanned(false),
          },
          {
            text: "Close",
            onPress: () => router.back(),
          },
        ]
      );
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  if (!permission) {
    // Camera permissions are still loading
    return (
      <View style={qrScannerStyles.container}>
        <Text style={styles.typography.body1}>Loading camera permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={qrScannerStyles.container}>
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
    <View style={qrScannerStyles.container}>
      <CameraView
        style={qrScannerStyles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      >
        {/* Overlay with scanning frame */}
        <View style={qrScannerStyles.overlay}>
          <View style={qrScannerStyles.scanFrame} />
          <Text style={qrScannerStyles.instructionText}>
            Point your camera at a QR code
          </Text>
        </View>

        {/* Back button */}
        <TouchableOpacity
          style={qrScannerStyles.backButton}
          onPress={handleGoBack}
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        {/* Rescan button if already scanned */}
        {scanned && (
          <TouchableOpacity
            style={qrScannerStyles.rescanButton}
            onPress={() => setScanned(false)}
          >
            <Text style={qrScannerStyles.rescanButtonText}>Tap to scan again</Text>
          </TouchableOpacity>
        )}
      </CameraView>
    </View>
  );
};

/**
 * Styles for the QR scanner component.
 */
const qrScannerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
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
    padding: 10,
    zIndex: 1000,
  },
  rescanButton: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 15,
    borderRadius: 10,
  },
  rescanButtonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
  permissionText: {
    textAlign: "center",
    marginBottom: 20,
    color: "white",
  },
  permissionButton: {
    marginBottom: 10,
    width: "80%",
    alignSelf: "center",
  },
});

export default QRScanner;
