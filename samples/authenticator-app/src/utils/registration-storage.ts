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

import * as SecureStore from 'expo-secure-store';
import { PushNotificationQRDataInterface } from '../models/push-notification';

/**
 * Interface for stored device registration data
 */
export interface StoredRegistrationData {
  deviceId: string;
  username: string;
  host: string;
  tenantDomain?: string;
  organizationId?: string;
  organizationName?: string;
  registeredAt: string;
  deviceToken: string;
  isActive: boolean;
}

/**
 * Storage keys for push notification registration data
 */
const STORAGE_KEYS = {
  REGISTRATION_DATA_PREFIX: 'push_reg_data_',
  DEVICE_LIST: 'push_registered_devices',
  ACTIVE_DEVICE: 'push_active_device',
} as const;

/**
 * Utility class for securely storing and managing push notification device registration data
 */
export class RegistrationDataStorage {
  /**
   * Store device registration data securely
   * 
   * @param deviceId - Unique device identifier from WSO2 IS
   * @param qrData - Original QR code data
   * @param deviceToken - FCM device token
   */
  static async storeRegistrationData(
    deviceId: string,
    qrData: PushNotificationQRDataInterface,
    deviceToken: string
  ): Promise<void> {
    try {
      const registrationData: StoredRegistrationData = {
        deviceId,
        username: qrData.username,
        host: qrData.host,
        tenantDomain: qrData.tenantDomain,
        organizationId: qrData.organizationId,
        organizationName: qrData.organizationName,
        registeredAt: new Date().toISOString(),
        deviceToken,
        isActive: true,
      };

      // Store the registration data
      const storageKey = `${STORAGE_KEYS.REGISTRATION_DATA_PREFIX}${deviceId}`;
      await SecureStore.setItemAsync(storageKey, JSON.stringify(registrationData));

      // Update the list of registered devices
      await this.addToDeviceList(deviceId);

      // Set as active device if no other active device exists
      const activeDevice = await this.getActiveDevice();
      if (!activeDevice) {
        await this.setActiveDevice(deviceId);
      }

      console.log('Registration data stored successfully for device:', deviceId);
    } catch (error) {
      console.error('Failed to store registration data:', error);
      throw new Error(`Failed to store registration data: ${error}`);
    }
  }

  /**
   * Retrieve device registration data
   * 
   * @param deviceId - Device identifier
   * @returns Promise<StoredRegistrationData | null> - Registration data or null if not found
   */
  static async getRegistrationData(deviceId: string): Promise<StoredRegistrationData | null> {
    try {
      const storageKey = `${STORAGE_KEYS.REGISTRATION_DATA_PREFIX}${deviceId}`;
      const dataString = await SecureStore.getItemAsync(storageKey);
      
      if (!dataString) {
        return null;
      }

      return JSON.parse(dataString) as StoredRegistrationData;
    } catch (error) {
      console.error('Failed to retrieve registration data:', error);
      return null;
    }
  }

  /**
   * Get all registered devices
   * 
   * @returns Promise<StoredRegistrationData[]> - Array of all registered devices
   */
  static async getAllRegisteredDevices(): Promise<StoredRegistrationData[]> {
    try {
      const deviceListString = await SecureStore.getItemAsync(STORAGE_KEYS.DEVICE_LIST);
      
      if (!deviceListString) {
        return [];
      }

      const deviceIds: string[] = JSON.parse(deviceListString);
      const registrationDataPromises = deviceIds.map(deviceId => this.getRegistrationData(deviceId));
      const results = await Promise.all(registrationDataPromises);
      
      // Filter out null results and return only valid registration data
      return results.filter((data): data is StoredRegistrationData => data !== null);
    } catch (error) {
      console.error('Failed to get all registered devices:', error);
      return [];
    }
  }

  /**
   * Set a device as the active device for authentication
   * 
   * @param deviceId - Device identifier to set as active
   */
  static async setActiveDevice(deviceId: string): Promise<void> {
    try {
      // Verify the device is registered
      const registrationData = await this.getRegistrationData(deviceId);
      if (!registrationData) {
        throw new Error('Device not found in registration data');
      }

      await SecureStore.setItemAsync(STORAGE_KEYS.ACTIVE_DEVICE, deviceId);
      console.log('Active device set to:', deviceId);
    } catch (error) {
      console.error('Failed to set active device:', error);
      throw new Error(`Failed to set active device: ${error}`);
    }
  }

  /**
   * Get the currently active device
   * 
   * @returns Promise<StoredRegistrationData | null> - Active device data or null
   */
  static async getActiveDevice(): Promise<StoredRegistrationData | null> {
    try {
      const activeDeviceId = await SecureStore.getItemAsync(STORAGE_KEYS.ACTIVE_DEVICE);
      
      if (!activeDeviceId) {
        return null;
      }

      return await this.getRegistrationData(activeDeviceId);
    } catch (error) {
      console.error('Failed to get active device:', error);
      return null;
    }
  }

  /**
   * Update device token for a registered device
   * 
   * @param deviceId - Device identifier
   * @param newDeviceToken - New FCM device token
   */
  static async updateDeviceToken(deviceId: string, newDeviceToken: string): Promise<void> {
    try {
      const registrationData = await this.getRegistrationData(deviceId);
      
      if (!registrationData) {
        throw new Error('Device not found in registration data');
      }

      registrationData.deviceToken = newDeviceToken;
      
      const storageKey = `${STORAGE_KEYS.REGISTRATION_DATA_PREFIX}${deviceId}`;
      await SecureStore.setItemAsync(storageKey, JSON.stringify(registrationData));
      
      console.log('Device token updated for device:', deviceId);
    } catch (error) {
      console.error('Failed to update device token:', error);
      throw new Error(`Failed to update device token: ${error}`);
    }
  }

  /**
   * Deactivate a device (mark as inactive but keep the data)
   * 
   * @param deviceId - Device identifier to deactivate
   */
  static async deactivateDevice(deviceId: string): Promise<void> {
    try {
      const registrationData = await this.getRegistrationData(deviceId);
      
      if (!registrationData) {
        throw new Error('Device not found in registration data');
      }

      registrationData.isActive = false;
      
      const storageKey = `${STORAGE_KEYS.REGISTRATION_DATA_PREFIX}${deviceId}`;
      await SecureStore.setItemAsync(storageKey, JSON.stringify(registrationData));

      // If this was the active device, clear the active device setting
      const activeDevice = await this.getActiveDevice();
      if (activeDevice && activeDevice.deviceId === deviceId) {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.ACTIVE_DEVICE);
      }
      
      console.log('Device deactivated:', deviceId);
    } catch (error) {
      console.error('Failed to deactivate device:', error);
      throw new Error(`Failed to deactivate device: ${error}`);
    }
  }

  /**
   * Remove device registration data completely
   * 
   * @param deviceId - Device identifier to remove
   */
  static async removeDevice(deviceId: string): Promise<void> {
    try {
      // Remove from device list
      await this.removeFromDeviceList(deviceId);

      // Remove registration data
      const storageKey = `${STORAGE_KEYS.REGISTRATION_DATA_PREFIX}${deviceId}`;
      await SecureStore.deleteItemAsync(storageKey);

      // If this was the active device, clear the active device setting
      const activeDevice = await this.getActiveDevice();
      if (activeDevice && activeDevice.deviceId === deviceId) {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.ACTIVE_DEVICE);
      }
      
      console.log('Device removed:', deviceId);
    } catch (error) {
      console.error('Failed to remove device:', error);
      throw new Error(`Failed to remove device: ${error}`);
    }
  }

  /**
   * Clear all registration data (for logout or reset)
   */
  static async clearAllData(): Promise<void> {
    try {
      const devices = await this.getAllRegisteredDevices();
      
      // Remove all device data
      const removePromises = devices.map(device => this.removeDevice(device.deviceId));
      await Promise.all(removePromises);

      // Clear device list and active device
      await SecureStore.deleteItemAsync(STORAGE_KEYS.DEVICE_LIST);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.ACTIVE_DEVICE);
      
      console.log('All registration data cleared');
    } catch (error) {
      console.error('Failed to clear all data:', error);
      throw new Error(`Failed to clear all data: ${error}`);
    }
  }

  /**
   * Add device to the device list
   * 
   * @param deviceId - Device identifier to add
   */
  private static async addToDeviceList(deviceId: string): Promise<void> {
    try {
      const deviceListString = await SecureStore.getItemAsync(STORAGE_KEYS.DEVICE_LIST);
      const deviceList: string[] = deviceListString ? JSON.parse(deviceListString) : [];
      
      if (!deviceList.includes(deviceId)) {
        deviceList.push(deviceId);
        await SecureStore.setItemAsync(STORAGE_KEYS.DEVICE_LIST, JSON.stringify(deviceList));
      }
    } catch (error) {
      console.error('Failed to add device to list:', error);
      throw error;
    }
  }

  /**
   * Remove device from the device list
   * 
   * @param deviceId - Device identifier to remove
   */
  private static async removeFromDeviceList(deviceId: string): Promise<void> {
    try {
      const deviceListString = await SecureStore.getItemAsync(STORAGE_KEYS.DEVICE_LIST);
      const deviceList: string[] = deviceListString ? JSON.parse(deviceListString) : [];
      
      const filteredList = deviceList.filter(id => id !== deviceId);
      
      if (filteredList.length > 0) {
        await SecureStore.setItemAsync(STORAGE_KEYS.DEVICE_LIST, JSON.stringify(filteredList));
      } else {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.DEVICE_LIST);
      }
    } catch (error) {
      console.error('Failed to remove device from list:', error);
      throw error;
    }
  }
}