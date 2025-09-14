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

import * as Device from 'expo-device';
import * as Application from 'expo-application';
import { Platform } from 'react-native';

/**
 * Interface for device information used in push notification registration
 */
export interface DeviceInfo {
  name: string;
  model: string;
  platform: string;
  osVersion: string;
  appVersion: string;
  deviceType: string;
}

/**
 * Utility class for gathering device information required for push notification registration
 */
export class DeviceUtils {
  /**
   * Get comprehensive device information for registration with WSO2 Identity Server
   * 
   * @returns Promise<DeviceInfo> - Complete device information
   */
  static async getDeviceInfo(): Promise<DeviceInfo> {
    try {
      // Get device name
      const deviceName = Device.deviceName || `${Platform.OS} Device`;
      
      // Get device model
      const deviceModel = Device.modelName || Device.modelId || Platform.OS === 'ios' ? 'iPhone' : 'Android Device';
      
      // Get platform and OS version
      const platform = Platform.OS;
      const osVersion = Device.osVersion || Platform.Version.toString();
      
      // Get app version
      const appVersion = Application.nativeApplicationVersion || '1.0.0';
      
      // Get device type
      const deviceType = Device.deviceType ? Device.DeviceType[Device.deviceType] : 'UNKNOWN';

      return {
        name: deviceName,
        model: deviceModel,
        platform: platform,
        osVersion: osVersion,
        appVersion: appVersion,
        deviceType: deviceType,
      };
    } catch (error) {
      // Fallback to basic information if device APIs fail
      console.warn('Failed to get detailed device info, using fallback:', error);
      
      return {
        name: `${Platform.OS} Device`,
        model: Platform.OS === 'ios' ? 'iPhone' : 'Android Device',
        platform: Platform.OS,
        osVersion: Platform.Version.toString(),
        appVersion: '1.0.0',
        deviceType: 'UNKNOWN',
      };
    }
  }

  /**
   * Get a user-friendly device name for display purposes
   * 
   * @returns Promise<string> - Human-readable device name
   */
  static async getDisplayName(): Promise<string> {
    try {
      const deviceInfo = await this.getDeviceInfo();
      return `${deviceInfo.name} (${deviceInfo.model})`;
    } catch (error) {
      return `${Platform.OS} Device`;
    }
  }

  /**
   * Get device model information suitable for WSO2 IS registration
   * 
   * @returns Promise<string> - Device model string
   */
  static async getModelInfo(): Promise<string> {
    try {
      const deviceInfo = await this.getDeviceInfo();
      return deviceInfo.model;
    } catch (error) {
      return Platform.OS === 'ios' ? 'iPhone' : 'Android Device';
    }
  }

  /**
   * Check if the device supports push notifications
   * 
   * @returns boolean - True if device supports push notifications
   */
  static supportsPushNotifications(): boolean {
    // Both iOS and Android support push notifications through FCM/APNs
    return Platform.OS === 'ios' || Platform.OS === 'android';
  }

  /**
   * Get device unique identifier (if available and permitted)
   * Note: This should be used carefully and only with user consent
   * 
   * @returns Promise<string | null> - Device identifier or null if not available
   */
  static async getDeviceIdentifier(): Promise<string | null> {
    try {
      // For iOS, use identifierForVendor if available
      if (Platform.OS === 'ios') {
        return Application.getIosIdForVendorAsync();
      }
      
      // For Android, we'll generate a consistent identifier
      // In a real app, you might want to use a more sophisticated approach
      const installId = Application.applicationId;
      return installId || null;
    } catch (error) {
      console.warn('Failed to get device identifier:', error);
      return null;
    }
  }

  /**
   * Generate a device fingerprint for additional security
   * This combines various device characteristics into a unique string
   * 
   * @returns Promise<string> - Device fingerprint
   */
  static async generateDeviceFingerprint(): Promise<string> {
    try {
      const deviceInfo = await this.getDeviceInfo();
      const identifier = await this.getDeviceIdentifier();
      
      const fingerprintData = [
        deviceInfo.platform,
        deviceInfo.model,
        deviceInfo.osVersion,
        deviceInfo.appVersion,
        identifier || 'unknown',
      ].join('|');
      
      // Create a simple hash of the fingerprint data
      // In production, you might want to use a proper hashing function
      let hash = 0;
      for (let i = 0; i < fingerprintData.length; i++) {
        const char = fingerprintData.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      
      return Math.abs(hash).toString(16);
    } catch (error) {
      // Fallback fingerprint based on timestamp and random data
      return Date.now().toString(16) + Math.random().toString(16).substr(2, 8);
    }
  }
}