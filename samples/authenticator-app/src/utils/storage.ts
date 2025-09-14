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

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AccountDetails, generateStorageKey } from '../models/storage';

/**
 * Regular storage utility for non-sensitive data like account details
 */
export class Storage {
  /**
   * Store account details
   */
  static async storeAccountDetails(accountDetails: AccountDetails): Promise<void> {
    try {
      const existingAccounts = await this.getAllAccountDetails();
      const updatedAccounts = existingAccounts.filter(account => account.id !== accountDetails.id);
      updatedAccounts.push({
        ...accountDetails,
        lastLoginAt: accountDetails.lastLoginAt?.toISOString(),
        registeredAt: accountDetails.registeredAt.toISOString(),
      } as any);

      const key = generateStorageKey.accountDetails();
      await AsyncStorage.setItem(key, JSON.stringify(updatedAccounts));
    } catch (error) {
      throw new Error(`Failed to store account details: ${error}`);
    }
  }

  /**
   * Get account details by ID
   */
  static async getAccountDetails(accountId: string): Promise<AccountDetails | null> {
    try {
      const allAccounts = await this.getAllAccountDetails();
      return allAccounts.find(account => account.id === accountId) || null;
    } catch (error) {
      throw new Error(`Failed to retrieve account details: ${error}`);
    }
  }

  /**
   * Get all stored account details
   */
  static async getAllAccountDetails(): Promise<AccountDetails[]> {
    try {
      const key = generateStorageKey.accountDetails();
      const data = await AsyncStorage.getItem(key);

      if (!data) {
        return [];
      }

      const parsed = JSON.parse(data);
      return parsed.map((account: any) => ({
        ...account,
        lastLoginAt: account.lastLoginAt ? new Date(account.lastLoginAt) : undefined,
        registeredAt: new Date(account.registeredAt),
      }));
    } catch (error) {
      throw new Error(`Failed to retrieve all account details: ${error}`);
    }
  }

  /**
   * Get account details by issuer and username combination
   */
  static async getAccountByCredentials(issuer: string, username: string): Promise<AccountDetails | null> {
    try {
      const allAccounts = await this.getAllAccountDetails();
      return allAccounts.find(account =>
        account.issuer === issuer && account.username === username
      ) || null;
    } catch (error) {
      throw new Error(`Failed to retrieve account by credentials: ${error}`);
    }
  }

  /**
   * Get account details by organization
   */
  static async getAccountsByOrganization(organization: string): Promise<AccountDetails[]> {
    try {
      const allAccounts = await this.getAllAccountDetails();
      return allAccounts.filter(account => account.organization === organization);
    } catch (error) {
      throw new Error(`Failed to retrieve accounts by organization: ${error}`);
    }
  }

  /**
   * Get active account details
   */
  static async getActiveAccounts(): Promise<AccountDetails[]> {
    try {
      const allAccounts = await this.getAllAccountDetails();
      return allAccounts.filter(account => account.isActive);
    } catch (error) {
      throw new Error(`Failed to retrieve active accounts: ${error}`);
    }
  }

  /**
   * Get accounts by type (push, totp, or both)
   */
  static async getAccountsByType(accountType: 'push' | 'totp' | 'both'): Promise<AccountDetails[]> {
    try {
      const allAccounts = await this.getAllAccountDetails();
      return allAccounts.filter(account => account.accountType === accountType);
    } catch (error) {
      throw new Error(`Failed to retrieve accounts by type: ${error}`);
    }
  }

  /**
   * Update last login time for an account
   */
  static async updateLastLogin(accountId: string): Promise<void> {
    try {
      const account = await this.getAccountDetails(accountId);
      if (!account) {
        throw new Error('Account not found');
      }

      account.lastLoginAt = new Date();
      await this.storeAccountDetails(account);
    } catch (error) {
      throw new Error(`Failed to update last login: ${error}`);
    }
  }

  /**
   * Update account active status
   */
  static async updateAccountStatus(accountId: string, isActive: boolean): Promise<void> {
    try {
      const account = await this.getAccountDetails(accountId);
      if (!account) {
        throw new Error('Account not found');
      }

      account.isActive = isActive;
      await this.storeAccountDetails(account);
    } catch (error) {
      throw new Error(`Failed to update account status: ${error}`);
    }
  }

  /**
   * Remove account details by ID
   */
  static async removeAccountDetails(accountId: string): Promise<void> {
    try {
      const existingAccounts = await this.getAllAccountDetails();
      const updatedAccounts = existingAccounts.filter(account => account.id !== accountId);

      const key = generateStorageKey.accountDetails();
      await AsyncStorage.setItem(key, JSON.stringify(updatedAccounts.map(account => ({
        ...account,
        lastLoginAt: account.lastLoginAt?.toISOString(),
        registeredAt: account.registeredAt.toISOString(),
      }))));
    } catch (error) {
      throw new Error(`Failed to remove account details: ${error}`);
    }
  }

  /**
   * Check if an account exists by ID
   */
  static async hasAccount(accountId: string): Promise<boolean> {
    try {
      const account = await this.getAccountDetails(accountId);
      return account !== null;
    } catch {
      return false;
    }
  }

  /**
   * Check if an account exists by credentials
   */
  static async hasAccountByCredentials(issuer: string, username: string): Promise<boolean> {
    try {
      const account = await this.getAccountByCredentials(issuer, username);
      return account !== null;
    } catch {
      return false;
    }
  }

  /**
   * Get account count
   */
  static async getAccountCount(): Promise<number> {
    try {
      const allAccounts = await this.getAllAccountDetails();
      return allAccounts.length;
    } catch (error) {
      throw new Error(`Failed to get account count: ${error}`);
    }
  }

  /**
   * Clear all account details (use with caution)
   */
  static async clearAllAccountDetails(): Promise<void> {
    try {
      const key = generateStorageKey.accountDetails();
      await AsyncStorage.removeItem(key);
    } catch (error) {
      throw new Error(`Failed to clear all account details: ${error}`);
    }
  }

  /**
   * Generic storage methods for other data
   */

  /**
   * Store generic data
   */
  static async setItem(key: string, value: any): Promise<void> {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, stringValue);
    } catch (error) {
      throw new Error(`Failed to store item: ${error}`);
    }
  }

  /**
   * Retrieve generic data
   */
  static async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      throw new Error(`Failed to retrieve item: ${error}`);
    }
  }

  /**
   * Remove generic data
   */
  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      throw new Error(`Failed to remove item: ${error}`);
    }
  }

  /**
   * Clear all storage (use with extreme caution)
   */
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      throw new Error(`Failed to clear all storage: ${error}`);
    }
  }
}
