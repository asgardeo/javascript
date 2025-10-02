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

import { PushAuthenticationDataInterface, PushAuthResponseStatus } from "../../models/push-notification";
import { FunctionComponent, ReactElement, useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import usePushAuth from "../../contexts/push-auth/use-push-auth";
import { getTimeFromNow } from "../../utils/ui-utils";
import { authenticateAsync, LocalAuthenticationResult } from "expo-local-authentication";

/**
 * Generates three random numbers including the legitimate one
 */
const generateThreeNumbers = (numberChallenge: number): number[] => {
  const numbers = [numberChallenge];

  while (numbers.length < 3) {
    const randomNum = Math.floor(Math.random() * 90) + 10; // 2-digit numbers
    if (!numbers.includes(randomNum)) {
      numbers.push(randomNum);
    }
  }

  // Shuffle the array to randomize position of legitimate number
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }

  return numbers;
};

/**
 * App Notification Component
 *
 * @param props - The component props
 * @returns Push authentication in app notification component.
 */
const AppNotification: FunctionComponent<PushAuthenticationDataInterface> = ({
  pushId,
  tenantDomain,
  organizationName,
  username,
  applicationName,
  numberChallenge,
  ipAddress,
  browser,
  deviceOS,
  sentTime
}): ReactElement => {
  const { sentPushAuthResponse } = usePushAuth();

  const threeNumbers = useMemo(() => {
    return numberChallenge ? generateThreeNumbers(parseInt(numberChallenge)) : [];
  }, [numberChallenge]);

  /**
   * Handles user response to the push authentication request.
   *
   * @param status - Push authentication response status.
   */
  const handleUserResponse = (status: PushAuthResponseStatus) => {
    authenticateAsync()
      .then((authStatus: LocalAuthenticationResult) => {
        if (authStatus.success) {
          sentPushAuthResponse(pushId, status);
        }
      });
  }

  return (
    <View style={[styles.container]}>
      <View style={[styles.header]}>
        <Text style={styles.title}>Login Request</Text>
        <Text style={styles.subtitle}>
          Verify this login attempt to continue
        </Text>
        <Text style={styles.timeText}>Received {getTimeFromNow(sentTime)}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Application Details</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Organization:</Text>
          <Text style={styles.infoValue}>{organizationName ?? tenantDomain}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Application:</Text>
          <Text style={styles.infoValue}>{applicationName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Username:</Text>
          <Text style={styles.infoValue}>{username}</Text>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Device Details</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>IP Address:</Text>
          <Text style={styles.infoValue}>{ipAddress}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Browser:</Text>
          <Text style={styles.infoValue}>{browser}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>OS:</Text>
          <Text style={styles.infoValue}>{deviceOS}</Text>
        </View>
      </View>
      <View style={[styles.section, styles.securitySection]}>
        <Text style={styles.sectionTitle}>Security Verification</Text>
        <View style={styles.securityMsg}>
          {numberChallenge ? (
            <Text style={styles.securityText}>
              If this login attempt is legitimate, tap the number displayed on your login screen to approve.
            </Text>
          ) : (
            <Text style={styles.securityText}>
              If this login attempt is legitimate, tap the approve button below.
            </Text>
          )}
        </View>
      </View>
      <View style={styles.buttonContainer}>
        {!numberChallenge && (
          <TouchableOpacity
            style={styles.approveButton}
            onPress={() => handleUserResponse(PushAuthResponseStatus.APPROVED)}
          >
            <Text style={styles.approveButtonText}>Approve</Text>
          </TouchableOpacity>
        )}
        {numberChallenge && threeNumbers?.map((number, index) => (
          <TouchableOpacity
            key={index}
            style={styles.numberBox}
            onPress={
              number === parseInt(numberChallenge)
                ? () => handleUserResponse(PushAuthResponseStatus.APPROVED)
                : () => handleUserResponse(PushAuthResponseStatus.DENIED)
            }
          >
            <Text style={styles.numberText}>
              {
                number === parseInt(numberChallenge) && numberChallenge.length === 1
                  ? `0${number}`
                  : number
              }
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={numberChallenge ? [styles.denyButton, styles.smallDenyButton] : [styles.denyButton, styles.largeDenyButton]}
          onPress={() => handleUserResponse(PushAuthResponseStatus.DENIED)}
        >
          <Text style={styles.denyButtonText}>Deny</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f6f9ff',
    borderColor: '#d1d9e6',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    gap: 16
  },
  header: {
    gap: 2,
    paddingBottom: 12,
    borderBottomColor: '#d1d9e6',
    borderBottomWidth: 1
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#56585eff'
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#868c99ff'
  },
  timeText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#868c99ff'
  },
  section: {
    gap: 4
  },
  securitySection: {
    paddingTop: 12,
    borderTopColor: '#d1d9e6',
    borderTopWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#56585eff',
    marginBottom: 8
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  infoLabel: {
    fontSize: 13,
    color: '#868c99ff'
  },
  infoValue: {
    fontSize: 13,
    color: '#56585eff'
  },
  securityMsg: {
    padding: 8,
    backgroundColor: '#fcf4d5ff',
    borderRadius: 8,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  securityText: {
    fontSize: 13,
    color: '#856404ff',
    textAlign: 'center'
  },
  numberBox: {
    flex: 1,
    backgroundColor: '#3ae734ff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8
  },
  numberText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center'
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8
  },
  approveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center'
  },
  denyButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8
  },
  largeDenyButton: {
    flex: 1
  },
  smallDenyButton: {
    flexShrink: 1
  },
  denyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center'
  }
})

export default AppNotification;
