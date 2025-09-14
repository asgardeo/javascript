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

import messaging from '@react-native-firebase/messaging';
import { Alert, Platform } from 'react-native';
import { initializeFirebase, isFirebaseInitialized } from '../config/firebase-config';

/**
 * Firebase Cloud Messaging utility for push notification device registration
 *
 * This module handles:
 * - FCM token generation for device identification
 * - Permission requests for push notifications
 * - Token refresh handling
 * - Background/foreground message handling setup
 */
export class FirebaseMessagingUtils {
  private static fcmToken: string | null = null;
  private static permissionGranted: boolean = false;

  /**
   * Initialize Firebase Cloud Messaging
   * This should be called during app startup
   */
  static async initialize(): Promise<void> {
    try {
      // Initialize Firebase app first
      if (!isFirebaseInitialized()) {
        await initializeFirebase();
      }

      // Now that Firebase is initialized, set up FCM
      // Check if device is registered for remote messages
      const isRegistered = await messaging().isDeviceRegisteredForRemoteMessages;
      if (!isRegistered) {
        await messaging().registerDeviceForRemoteMessages();
      }

      // Set up message handlers for app states
      this.setupMessageHandlers();

      console.log('Firebase Cloud Messaging initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Firebase Cloud Messaging:', error);
      throw new Error(`FCM initialization failed: ${error}`);
    }
  }

  /**
   * Request permission for push notifications
   *
   * @returns Promise<boolean> - True if permission granted
   */
  static async requestPermission(): Promise<boolean> {
    try {
      const authStatus = await messaging().requestPermission();

      this.permissionGranted =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (this.permissionGranted) {
        console.log('Push notification permission granted');
      } else {
        console.log('Push notification permission denied');
      }

      return this.permissionGranted;
    } catch (error) {
      console.error('Error requesting push notification permission:', error);
      return false;
    }
  }

  /**
   * Get the FCM registration token for this device
   * This token uniquely identifies the app installation and is used by WSO2 IS to send push notifications
   *
   * @returns Promise<string> - FCM registration token
   */
  static async getDeviceToken(): Promise<string> {
    try {
      // First ensure we have permission
      if (!this.permissionGranted) {
        const hasPermission = await this.requestPermission();
        if (!hasPermission) {
          throw new Error('Push notification permission required for device registration');
        }
      }

      // Get the FCM token
      const token = await messaging().getToken();

      if (!token) {
        throw new Error('Failed to retrieve FCM token');
      }

      this.fcmToken = token;
      console.log('FCM Device Token retrieved:', token.substring(0, 20) + '...');

      return token;
    } catch (error) {
      console.error('Error getting FCM device token:', error);
      throw new Error(`Failed to get FCM token: ${error}`);
    }
  }

  /**
   * Check if push notifications are supported on this device
   *
   * @returns boolean - True if supported
   */
  static isSupported(): boolean {
    // FCM is supported on both iOS and Android
    return Platform.OS === 'ios' || Platform.OS === 'android';
  }

  /**
   * Check if push notification permission is already granted
   *
   * @returns Promise<boolean> - True if permission already granted
   */
  static async hasPermission(): Promise<boolean> {
    try {
      const authStatus = await messaging().hasPermission();
      return authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
             authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    } catch (error) {
      console.error('Error checking push notification permission:', error);
      return false;
    }
  }

  /**
   * Set up message handlers for different app states
   * This is important for receiving push notifications properly
   */
  private static setupMessageHandlers(): void {
    // Handle background messages
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Message handled in the background!', remoteMessage);
      // You can process the message here for WSO2 IS authentication requests
    });

    // Handle foreground messages
    messaging().onMessage(async (remoteMessage) => {
      console.log('Message received in foreground!', remoteMessage);

      // Show an alert or handle the authentication request
      if (remoteMessage.notification) {
        Alert.alert(
          remoteMessage.notification.title || 'Authentication Request',
          remoteMessage.notification.body || 'You have a new authentication request'
        );
      }
    });

    // Handle token refresh
    messaging().onTokenRefresh((token) => {
      console.log('FCM Token refreshed:', token.substring(0, 20) + '...');
      this.fcmToken = token;
      // You might want to update the token on your server here
    });
  }

  /**
   * Get the current cached FCM token if available
   *
   * @returns string | null - Cached FCM token or null
   */
  static getCachedToken(): string | null {
    return this.fcmToken;
  }

  /**
   * Clear cached token and permission status
   * Useful for logout or reset scenarios
   */
  static clearCache(): void {
    this.fcmToken = null;
    this.permissionGranted = false;
  }

  /**
   * Check device registration status with Firebase
   *
   * @returns Promise<boolean> - True if device is registered
   */
  static async isDeviceRegistered(): Promise<boolean> {
    try {
      return await messaging().isDeviceRegisteredForRemoteMessages;
    } catch (error) {
      console.error('Error checking device registration status:', error);
      return false;
    }
  }

  /**
   * Unregister device from remote messages
   * This should be called during app uninstall or user logout
   */
  static async unregisterDevice(): Promise<void> {
    try {
      if (await this.isDeviceRegistered()) {
        await messaging().unregisterDeviceForRemoteMessages();
        console.log('Device unregistered from remote messages');
      }
      this.clearCache();
    } catch (error) {
      console.error('Error unregistering device:', error);
    }
  }
}
