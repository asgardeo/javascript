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

import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import 'react-native-get-random-values';
import { KeyPair } from '../models/crypto';
import {
  GeneratedKeyPair,
  generateStorageKey,
  KeyPairOptions,
  PrivateCert,
  TotpSecret
} from '../models/storage';

/**
 * Secure storage utility for sensitive data like private certificates and TOTP secrets
 */
export class SecureStorage {
  /**
   * Generate a new key pair and self-signed certificate
   */
  static async generateKeyPair(deviceId: string, options: KeyPairOptions = {}): Promise<GeneratedKeyPair> {
    try {
      // Set default options
      const opts = {
        keySize: options.keySize || 2048,
        algorithm: options.algorithm || 'RSA',
        commonName: options.commonName || `Authenticator-${deviceId}`,
        organization: options.organization || 'Authenticator App',
        country: options.country || 'US',
        validityDays: options.validityDays || 365,
        ...options,
      };

      // Generate a random private key (simplified version)
      // Note: This is a basic implementation. For production, use proper crypto libraries
      const keyData = await Crypto.getRandomBytesAsync(32);
      const keyHex = Array.from(keyData, byte => byte.toString(16).padStart(2, '0')).join('');

      // Create a simplified private key format
      const privateKey = `-----BEGIN PRIVATE KEY-----
${btoa(keyHex).match(/.{1,64}/g)?.join('\n') || ''}
-----END PRIVATE KEY-----`;

      // Create a simplified public key (derived from private key concept)
      const publicKeyData = keyHex.substring(0, 32);
      const publicKey = `-----BEGIN PUBLIC KEY-----
${btoa(publicKeyData).match(/.{1,64}/g)?.join('\n') || ''}
-----END PUBLIC KEY-----`;

      // Create a self-signed certificate
      const now = new Date();
      const expiry = new Date(now.getTime() + (opts.validityDays * 24 * 60 * 60 * 1000));

      const certificate = `-----BEGIN CERTIFICATE-----
${btoa(`
Subject: CN=${opts.commonName}, O=${opts.organization}, C=${opts.country}
Issuer: CN=${opts.commonName}, O=${opts.organization}, C=${opts.country}
Valid From: ${now.toISOString()}
Valid To: ${expiry.toISOString()}
Public Key: ${publicKeyData}
Serial: ${keyHex.substring(0, 16)}
`).match(/.{1,64}/g)?.join('\n') || ''}
-----END CERTIFICATE-----`;

      // Generate fingerprint
      const fingerprintData = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        certificate
      );
      const fingerprint = fingerprintData.substring(0, 32);

      const keyPair: GeneratedKeyPair = {
        certificate,
        privateKey,
        publicKey,
        fingerprint,
      };

      // Store the complete key pair
      await this.storeGeneratedKeyPair(deviceId, keyPair, opts);

      return keyPair;
    } catch (error) {
      throw new Error(`Failed to generate key pair: ${error}`);
    }
  }

  /**
   * Store a generated key pair with metadata
   */
  static async storeGeneratedKeyPair(
    deviceId: string,
    keyPair: KeyPair,
    options: KeyPairOptions
  ): Promise<void> {
    try {
      // Store private key separately
      await SecureStore.setItemAsync(
        generateStorageKey.privateKey(deviceId),
        keyPair.privateKey
      );

      // Store public key separately
      await SecureStore.setItemAsync(
        generateStorageKey.publicKey(deviceId),
        keyPair.publicKey
      );

      // Store metadata
      const metadata = {
        deviceId,
        algorithm: options.algorithm || 'RSA',
        keySize: options.keySize || 2048,
        createdAt: new Date().toISOString(),
        expiresAt: options.validityDays
          ? new Date(Date.now() + (options.validityDays * 24 * 60 * 60 * 1000)).toISOString()
          : undefined,
        generatedByApp: true,
      };

      await SecureStore.setItemAsync(
        generateStorageKey.keyPairMetadata(deviceId),
        JSON.stringify(metadata)
      );

    } catch (error) {
      throw new Error(`Failed to store generated key pair: ${error}`);
    }
  }
  /**
   * Store a private certificate securely by device ID (legacy method)
   */
  static async storePrivateCert(privateCert: PrivateCert): Promise<void> {
    try {
      // Store as complete object for backward compatibility
      const key = generateStorageKey.privateCert(privateCert.deviceId);
      const data = JSON.stringify({
        ...privateCert,
        createdAt: privateCert.createdAt.toISOString(),
        expiresAt: privateCert.expiresAt?.toISOString(),
      });

      await SecureStore.setItemAsync(key, data);

      // Also store separately for new methods
      await SecureStore.setItemAsync(
        generateStorageKey.certificate(privateCert.deviceId),
        privateCert.certificate
      );
      await SecureStore.setItemAsync(
        generateStorageKey.privateKey(privateCert.deviceId),
        privateCert.privateKey
      );
      if (privateCert.publicKey) {
        await SecureStore.setItemAsync(
          generateStorageKey.publicKey(privateCert.deviceId),
          privateCert.publicKey
        );
      }
    } catch (error) {
      throw new Error(`Failed to store private certificate: ${error}`);
    }
  }

  /**
   * Get certificate only by device ID
   */
  static async getCertificate(deviceId: string): Promise<string | null> {
    try {
      const key = generateStorageKey.certificate(deviceId);
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      throw new Error(`Failed to retrieve certificate: ${error}`);
    }
  }

  /**
   * Get private key only by device ID
   */
  static async getPrivateKey(deviceId: string): Promise<string | null> {
    try {
      const key = generateStorageKey.privateKey(deviceId);
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      throw new Error(`Failed to retrieve private key: ${error}`);
    }
  }

  /**
   * Get public key only by device ID
   */
  static async getPublicKey(deviceId: string): Promise<string | null> {
    try {
      const key = generateStorageKey.publicKey(deviceId);
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      throw new Error(`Failed to retrieve public key: ${error}`);
    }
  }

  /**
   * Get key pair metadata by device ID
   */
  static async getKeyPairMetadata(deviceId: string): Promise<any | null> {
    try {
      const key = generateStorageKey.keyPairMetadata(deviceId);
      const data = await SecureStore.getItemAsync(key);

      if (!data) {
        return null;
      }

      const parsed = JSON.parse(data);
      return {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : undefined,
      };
    } catch (error) {
      throw new Error(`Failed to retrieve key pair metadata: ${error}`);
    }
  }

  /**
   * Get complete key pair (certificate + private key + public key)
   */
  static async getCompleteKeyPair(deviceId: string): Promise<GeneratedKeyPair | null> {
    try {
      const certificate = await this.getCertificate(deviceId);
      const privateKey = await this.getPrivateKey(deviceId);
      const publicKey = await this.getPublicKey(deviceId);
      const metadata = await this.getKeyPairMetadata(deviceId);

      if (!certificate || !privateKey) {
        return null;
      }

      return {
        certificate,
        privateKey,
        publicKey: publicKey || '',
        fingerprint: metadata?.fingerprint || '',
      };
    } catch (error) {
      throw new Error(`Failed to retrieve complete key pair: ${error}`);
    }
  }

  /**
   * Retrieve a private certificate by device ID
   */
  static async getPrivateCert(deviceId: string): Promise<PrivateCert | null> {
    try {
      const key = generateStorageKey.privateCert(deviceId);
      const data = await SecureStore.getItemAsync(key);

      if (!data) {
        return null;
      }

      const parsed = JSON.parse(data);
      return {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : undefined,
      };
    } catch (error) {
      throw new Error(`Failed to retrieve private certificate: ${error}`);
    }
  }

  /**
   * Remove a private certificate by device ID (legacy method)
   */
  static async removePrivateCert(deviceId: string): Promise<void> {
    try {
      const key = generateStorageKey.privateCert(deviceId);
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      throw new Error(`Failed to remove private certificate: ${error}`);
    }
  }

  /**
   * Remove complete key pair (certificate + private key + public key + metadata)
   */
  static async removeCompleteKeyPair(deviceId: string): Promise<void> {
    try {
      const keys = [
        generateStorageKey.privateCert(deviceId), // Legacy
        generateStorageKey.certificate(deviceId),
        generateStorageKey.privateKey(deviceId),
        generateStorageKey.publicKey(deviceId),
        generateStorageKey.keyPairMetadata(deviceId),
      ];

      // Remove all related keys
      const deletePromises = keys.map(async (key) => {
        try {
          await SecureStore.deleteItemAsync(key);
        } catch {
          // Ignore if key doesn't exist
        }
      });

      await Promise.all(deletePromises);
    } catch (error) {
      throw new Error(`Failed to remove complete key pair: ${error}`);
    }
  }

  /**
   * Remove only certificate by device ID
   */
  static async removeCertificate(deviceId: string): Promise<void> {
    try {
      const key = generateStorageKey.certificate(deviceId);
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      throw new Error(`Failed to remove certificate: ${error}`);
    }
  }

  /**
   * Remove only private key by device ID
   */
  static async removePrivateKey(deviceId: string): Promise<void> {
    try {
      const key = generateStorageKey.privateKey(deviceId);
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      throw new Error(`Failed to remove private key: ${error}`);
    }
  }

  /**
   * Remove only public key by device ID
   */
  static async removePublicKey(deviceId: string): Promise<void> {
    try {
      const key = generateStorageKey.publicKey(deviceId);
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      throw new Error(`Failed to remove public key: ${error}`);
    }
  }

  /**
   * Store a TOTP secret securely by issuer and username combination
   */
  static async storeTotpSecret(totpSecret: TotpSecret): Promise<void> {
    try {
      const key = generateStorageKey.totpSecret(totpSecret.issuer, totpSecret.username);
      const data = JSON.stringify({
        ...totpSecret,
        createdAt: totpSecret.createdAt.toISOString(),
      });

      await SecureStore.setItemAsync(key, data);
    } catch (error) {
      throw new Error(`Failed to store TOTP secret: ${error}`);
    }
  }

  /**
   * Retrieve a TOTP secret by issuer and username combination
   */
  static async getTotpSecret(issuer: string, username: string): Promise<TotpSecret | null> {
    try {
      const key = generateStorageKey.totpSecret(issuer, username);
      const data = await SecureStore.getItemAsync(key);

      if (!data) {
        return null;
      }

      const parsed = JSON.parse(data);
      return {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
      };
    } catch (error) {
      throw new Error(`Failed to retrieve TOTP secret: ${error}`);
    }
  }

  /**
   * Remove a TOTP secret by issuer and username combination
   */
  static async removeTotpSecret(issuer: string, username: string): Promise<void> {
    try {
      const key = generateStorageKey.totpSecret(issuer, username);
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      throw new Error(`Failed to remove TOTP secret: ${error}`);
    }
  }

  /**
   * Get all stored TOTP secrets
   * Note: This is a workaround since SecureStore doesn't support listing keys.
   * We'll need to maintain a separate index in regular storage for this functionality.
   */
  static async getAllTotpSecrets(): Promise<TotpSecret[]> {
    // This method would require maintaining an index of keys in regular storage
    // For now, we'll throw an error to indicate this limitation
    throw new Error('Getting all TOTP secrets requires maintaining an index. Use the regular storage utility to track TOTP account details.');
  }

  /**
   * Get all stored private certificates
   * Note: Similar limitation as above
   */
  static async getAllPrivateCerts(): Promise<PrivateCert[]> {
    throw new Error('Getting all private certificates requires maintaining an index. Use the regular storage utility to track certificate metadata.');
  }

  /**
   * Check if a private certificate exists for a device ID (legacy method)
   */
  static async hasPrivateCert(deviceId: string): Promise<boolean> {
    try {
      const cert = await this.getPrivateCert(deviceId);
      return cert !== null;
    } catch {
      return false;
    }
  }

  /**
   * Check if a complete key pair exists for a device ID
   */
  static async hasCompleteKeyPair(deviceId: string): Promise<boolean> {
    try {
      const certificate = await this.getCertificate(deviceId);
      const privateKey = await this.getPrivateKey(deviceId);
      return certificate !== null && privateKey !== null;
    } catch {
      return false;
    }
  }

  /**
   * Check if certificate exists for a device ID
   */
  static async hasCertificate(deviceId: string): Promise<boolean> {
    try {
      const certificate = await this.getCertificate(deviceId);
      return certificate !== null;
    } catch {
      return false;
    }
  }

  /**
   * Check if private key exists for a device ID
   */
  static async hasPrivateKey(deviceId: string): Promise<boolean> {
    try {
      const privateKey = await this.getPrivateKey(deviceId);
      return privateKey !== null;
    } catch {
      return false;
    }
  }

  /**
   * Check if public key exists for a device ID
   */
  static async hasPublicKey(deviceId: string): Promise<boolean> {
    try {
      const publicKey = await this.getPublicKey(deviceId);
      return publicKey !== null;
    } catch {
      return false;
    }
  }

  /**
   * Check if a TOTP secret exists for issuer and username combination
   */
  static async hasTotpSecret(issuer: string, username: string): Promise<boolean> {
    try {
      const secret = await this.getTotpSecret(issuer, username);
      return secret !== null;
    } catch {
      return false;
    }
  }

  /**
   * Clear all secure storage data (use with caution)
   */
  static async clearAll(): Promise<void> {
    // Note: SecureStore doesn't provide a way to list all keys
    // This would require maintaining an index of all stored keys
    throw new Error('Clearing all secure storage requires maintaining an index of stored keys.');
  }
}
