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

import { router } from "expo-router";
import { FunctionComponent, ReactElement } from "react";
import { Alert } from "react-native";
import QRScanner from "../src/components/qr/QRScanner";

const QRScannerScreen: FunctionComponent = (): ReactElement => {
  const handleScanSuccess = (data: any) => {
    console.log("QR Code scanned successfully:", data);

    // Handle the scanned JSON data
    try {
      // You can customize this logic based on your needs
      const dataString = JSON.stringify(data, null, 2);

      Alert.alert(
        "QR Code Scanned Successfully",
        `Scanned Data:\n\n${dataString}`,
        [
          {
            text: "Scan Another",
            style: "default",
            onPress: () => {
              // Stay on the scanner screen to scan another QR code
            },
          },
          {
            text: "Save & Go Back",
            style: "default",
            onPress: () => {
              // Here you can add logic to save the data
              // For example, save to AsyncStorage, send to API, etc.
              console.log("Saving data:", data);
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error processing scanned data:", error);
      Alert.alert(
        "Error",
        "Failed to process the scanned data. Please try again.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    }
  };

  return (
    <QRScanner onScanSuccess={handleScanSuccess} />
  );
};

export default QRScannerScreen;