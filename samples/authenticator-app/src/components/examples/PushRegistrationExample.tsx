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

import React, { useState } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import { usePushAuthRegistration } from '../hooks/use-push-auth-registration';
import { PushNotificationQRDataInterface } from '../models/push-notification';

/**
 * Example component demonstrating how to use the push device registration hook
 */
export const PushRegistrationExample: React.FC = () => {
  const { registerPushDevice, isRegistering, registrationError, clearError } = usePushAuthRegistration();
  const [registrationResult, setRegistrationResult] = useState<string | null>(null);

  /**
   * Example QR code data that would normally be scanned from WSO2 IS
   * Replace with actual data from QR code scanner
   */
  const exampleQRData: PushNotificationQRDataInterface = {
    deviceId: 'device_' + Date.now(),
    username: 'john.doe@example.com',
    host: 'https://localhost:9443',
    tenantDomain: 'carbon.super', // For tenant users
    // organizationId: 'org_123', // For organization users (uncomment and comment tenantDomain)
    // organizationName: 'Example Org',
    challenge: 'challenge_' + Math.random().toString(36).substring(7),
  };

  /**
   * Handle device registration
   */
  const handleRegisterDevice = async () => {
    try {
      clearError();
      setRegistrationResult(null);

      console.log('Starting device registration with QR data:', exampleQRData);

      const result = await registerPushDevice(exampleQRData);

      if (result.success) {
        setRegistrationResult('Device registered successfully!');
        Alert.alert(
          'Registration Successful',
          'Your device has been registered for push notifications.',
          [{ text: 'OK' }]
        );
      } else {
        setRegistrationResult(`Registration failed: ${result.message}`);
        Alert.alert(
          'Registration Failed',
          result.message || 'Unknown error occurred',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setRegistrationResult(`Error: ${errorMessage}`);
      Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Push Device Registration</Text>
      
      <Text style={styles.description}>
        This example demonstrates how to register a device for push notifications with WSO2 Identity Server.
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>QR Code Data:</Text>
        <Text style={styles.dataText}>Device ID: {exampleQRData.deviceId}</Text>
        <Text style={styles.dataText}>Username: {exampleQRData.username}</Text>
        <Text style={styles.dataText}>Host: {exampleQRData.host}</Text>
        <Text style={styles.dataText}>
          {exampleQRData.tenantDomain 
            ? `Tenant: ${exampleQRData.tenantDomain}`
            : `Organization: ${exampleQRData.organizationId}`
          }
        </Text>
        <Text style={styles.dataText}>Challenge: {exampleQRData.challenge}</Text>
      </View>

      <Button
        title={isRegistering ? "Registering..." : "Register Device"}
        onPress={handleRegisterDevice}
        disabled={isRegistering}
      />

      {registrationError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error:</Text>
          <Text style={styles.errorText}>{registrationError.message}</Text>
          <Text style={styles.errorCode}>Code: {registrationError.code}</Text>
        </View>
      )}

      {registrationResult && (
        <View style={[
          styles.resultContainer,
          { backgroundColor: registrationResult.includes('successfully') ? '#d4edda' : '#f8d7da' }
        ]}>
          <Text style={[
            styles.resultText,
            { color: registrationResult.includes('successfully') ? '#155724' : '#721c24' }
          ]}>
            {registrationResult}
          </Text>
        </View>
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>How it works:</Text>
        <Text style={styles.infoText}>
          1. Scan QR code from WSO2 IS (or use example data above){'\n'}
          2. Generate FCM device token for push notifications{'\n'}
          3. Create RSA 2048-bit key pair for cryptographic operations{'\n'}
          4. Sign challenge.deviceToken with private key{'\n'}
          5. Send registration request to WSO2 IS API{'\n'}
          6. Store registration data securely on device
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dataText: {
    fontSize: 14,
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#f5c6cb',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#721c24',
    marginBottom: 5,
  },
  errorText: {
    fontSize: 14,
    color: '#721c24',
    marginBottom: 5,
  },
  errorCode: {
    fontSize: 12,
    color: '#721c24',
    fontFamily: 'monospace',
  },
  resultContainer: {
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    borderWidth: 1,
  },
  resultText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: '#e9ecef',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});