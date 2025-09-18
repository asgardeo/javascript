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

import { PushAuthenticationDataInterface, PushAuthResponseStatus } from "@/src/models/push-notification";
import { FunctionComponent, ReactElement } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import usePushAuth from "../../contexts/push-auth/use-push-auth";
import useTheme from "../../contexts/theme/useTheme";

/**
 * Estimates location from IP address (simplified geolocation)
 * In a real app, this would use a geolocation API
 */
const estimateLocationFromIP = (ipAddress: string): string => {
  // Simple mapping for demo purposes - in production use a geolocation service
  const locationMap: { [key: string]: string } = {
    '192.168.': 'Local Network',
    '10.': 'Private Network',
    '172.': 'Private Network',
    '127.': 'Localhost',
  };

  for (const prefix in locationMap) {
    if (ipAddress.startsWith(prefix)) {
      return locationMap[prefix];
    }
  }

  // For demo purposes, generate a random location
  const cities = ['New York, US', 'London, UK', 'Tokyo, JP', 'Sydney, AU', 'Toronto, CA', 'Mumbai, IN'];
  return cities[Math.floor(Math.random() * cities.length)];
};

/**
 * Formats the received time as "Just now" or formatted date/time
 */
const formatsentTime = (sentTime: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - sentTime.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    return sentTime.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
};

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
  const { styles } = useTheme();
  const location = estimateLocationFromIP(ipAddress);
  const timeString = formatsentTime(new Date(sentTime));
  const threeNumbers = numberChallenge ? generateThreeNumbers(parseInt(numberChallenge)) : [];
  const { sentPushAuthResponse } = usePushAuth();

  const notificationStyles = StyleSheet.create({
    container: {
      backgroundColor: styles.colors.backgroundSurface.backgroundColor,
      borderRadius: 16,
      padding: 20,
      margin: 16,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    header: {
      marginBottom: 16,
    },
    title: {
      ...styles.typography.h5,
      marginBottom: 4,
    },
    subtitle: {
      ...styles.typography.body2,
      color: styles.colors.textSecondary.color,
    },
    section: {
      marginBottom: 16,
    },
    sectionTitle: {
      ...styles.typography.h6,
      marginBottom: 8,
      fontSize: 14,
      fontWeight: '600',
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 4,
    },
    infoLabel: {
      ...styles.typography.body2,
      color: styles.colors.textSecondary.color,
      flex: 1,
    },
    infoValue: {
      ...styles.typography.body2,
      flex: 2,
      textAlign: 'right',
      fontWeight: '500',
    },
    numbersContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginVertical: 16,
      padding: 16,
      backgroundColor: styles.colors.backgroundSurfaceLight.backgroundColor,
      borderRadius: 12,
    },
    numberBox: {
      alignItems: 'center',
      padding: 12,
      backgroundColor: styles.colors.backgroundSurface.backgroundColor,
      borderRadius: 8,
      minWidth: 60,
      borderWidth: 1,
      borderColor: styles.colors.borderDefault.borderColor,
    },
    numberText: {
      ...styles.typography.h5,
      fontWeight: '700',
      color: styles.colors.textPrimary.color,
      marginBottom: 0
    },
    numberLabel: {
      ...styles.typography.body3,
      marginTop: 4,
      color: styles.colors.textSecondary.color,
    },
    securitySection: {
      backgroundColor: styles.colors.backgroundInfo.backgroundColor,
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
    },
    securityText: {
      ...styles.typography.body2,
      color: styles.colors.textPrimary.color,
      textAlign: 'center',
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    approveButton: {
      ...styles.buttons.primaryButton,
      flex: 1,
      backgroundColor: '#28a745'
    },
    denyButton: {
      ...styles.buttons.secondaryButton,
      flex: 1,
      backgroundColor: '#dc3545',
      borderColor: '#dc3545',
    },
    approveButtonText: {
      ...styles.buttons.primaryButtonText,
      color: '#ffffff',
    },
    denyButtonText: {
      ...styles.buttons.secondaryButtonText,
      color: '#ffffff',
    },
    timeContainer: {
      alignItems: 'center',
      marginBottom: 16,
    },
    timeText: {
      ...styles.typography.body3,
      color: styles.colors.textSecondary.color,
      fontStyle: 'italic',
    },
  });

  return (
    <View style={notificationStyles.container}>
      {/* Header Section */}
      <View style={notificationStyles.header}>
        <Text style={notificationStyles.title}>Login Request</Text>
        <Text style={notificationStyles.subtitle}>
          Verify this login attempt to continue
        </Text>
      </View>

      {/* Time Section */}
      <View style={notificationStyles.timeContainer}>
        <Text style={notificationStyles.timeText}>Received {timeString}</Text>
      </View>

      {/* Application Info Section */}
      <View style={notificationStyles.section}>
        <Text style={notificationStyles.sectionTitle}>Application Details</Text>
        <View style={notificationStyles.infoRow}>
          <Text style={notificationStyles.infoLabel}>Organization:</Text>
          <Text style={notificationStyles.infoValue}>{organizationName ?? tenantDomain}</Text>
        </View>
        <View style={notificationStyles.infoRow}>
          <Text style={notificationStyles.infoLabel}>Application:</Text>
          <Text style={notificationStyles.infoValue}>{applicationName}</Text>
        </View>
        <View style={notificationStyles.infoRow}>
          <Text style={notificationStyles.infoLabel}>Username:</Text>
          <Text style={notificationStyles.infoValue}>{username}</Text>
        </View>
      </View>

      {/* Device Info Section */}
      <View style={notificationStyles.section}>
        <Text style={notificationStyles.sectionTitle}>Device & Location</Text>
        <View style={notificationStyles.infoRow}>
          <Text style={notificationStyles.infoLabel}>IP Address:</Text>
          <Text style={notificationStyles.infoValue}>{ipAddress}</Text>
        </View>
        <View style={notificationStyles.infoRow}>
          <Text style={notificationStyles.infoLabel}>Location:</Text>
          <Text style={notificationStyles.infoValue}>{location}</Text>
        </View>
        <View style={notificationStyles.infoRow}>
          <Text style={notificationStyles.infoLabel}>Browser:</Text>
          <Text style={notificationStyles.infoValue}>{browser}</Text>
        </View>
        <View style={notificationStyles.infoRow}>
          <Text style={notificationStyles.infoLabel}>OS:</Text>
          <Text style={notificationStyles.infoValue}>{deviceOS}</Text>
        </View>
      </View>

      {/* Security Numbers Section */}
      <View style={notificationStyles.section}>
        <Text style={notificationStyles.sectionTitle}>Security Verification</Text>
        <View style={notificationStyles.securitySection}>
          {numberChallenge ? (
            <Text style={notificationStyles.securityText}>
              If this login attempt is legitimate, tap the number displayed on your login screen to approve.
            </Text>
          ) : (
            <Text style={notificationStyles.securityText}>
              If this login attempt is legitimate, tap the approve button below.
            </Text>
          )}
        </View>
        {numberChallenge && (
          <View style={notificationStyles.numbersContainer}>
            {threeNumbers?.map((number, index) => (
              <TouchableOpacity
                key={index}
                style={notificationStyles.numberBox}
                onPress={
                  number === parseInt(numberChallenge)
                  ? () => sentPushAuthResponse(pushId, PushAuthResponseStatus.APPROVED)
                  : () => sentPushAuthResponse(pushId, PushAuthResponseStatus.DENIED)
                }
              >
                <Text style={notificationStyles.numberText}>{number}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={notificationStyles.buttonContainer}>
        { !numberChallenge && (
          <TouchableOpacity
            style={notificationStyles.approveButton}
            onPress={() => sentPushAuthResponse(pushId, PushAuthResponseStatus.APPROVED)}
            accessibilityLabel="Approve login request"
            accessibilityRole="button"
          >
            <Text style={notificationStyles.approveButtonText}>Approve</Text>
          </TouchableOpacity>
        ) }
        <TouchableOpacity
          style={notificationStyles.denyButton}
          onPress={() => sentPushAuthResponse(pushId, PushAuthResponseStatus.DENIED)}
          accessibilityLabel="Deny login request"
          accessibilityRole="button"
        >
          <Text style={notificationStyles.denyButtonText}>Deny</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default AppNotification;
