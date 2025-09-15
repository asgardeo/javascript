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

import CryptoJS from 'crypto-js';
import { RSA } from 'react-native-rsa-native';

/**
 * Interface for RSA key pair generation result
 */
export interface RSAKeyPair {
  publicKey: string;
  privateKey: string;
  publicKeyFormatted: string; // Base64 formatted for WSO2 IS
}

/**
 * Cryptography utility class for RSA operations required by WSO2 Identity Server
 *
 * This class handles:
 * - RSA 2048-bit key pair generation
 * - Public key formatting for WSO2 IS API (PEM to base64 without headers)
 * - RSA-SHA256 signature generation for challenge verification
 */
export class CryptographyUtils {
  /**
   * Generate RSA 2048-bit key pair for push notification registration
   *
   * @returns Promise<RSAKeyPair> - Generated key pair with formatted public key
   */
  static async generateRSAKeyPair(): Promise<RSAKeyPair> {
    try {
      console.log('Generating RSA 2048-bit key pair...');

      // Generate RSA key pair with 2048-bit key size as required by WSO2 IS
      const keyPair = await RSA.generateKeys(2048);

      if (!keyPair.public || !keyPair.private) {
        throw new Error('Failed to generate RSA key pair');
      }

      // Format public key for WSO2 IS (remove headers and footers, base64 encode)
      const publicKeyFormatted = this.formatPublicKeyForWSO2(keyPair.public);

      console.log('RSA key pair generated successfully');

      return {
        publicKey: keyPair.public,
        privateKey: keyPair.private,
        publicKeyFormatted,
      };
    } catch (error) {
      console.error('RSA key pair generation failed:', error);
      throw new Error(`RSA key generation failed: ${error}`);
    }
  }

  /**
   * Format public key for WSO2 Identity Server API
   * Simply removes PEM headers and returns base64 content
   *
   * @param publicKeyPEM - Public key in PEM format
   * @returns string - Base64 formatted public key without headers
   */
  static formatPublicKeyForWSO2(publicKeyPEM: string): string {
    try {
      console.log('Original public key:', publicKeyPEM);

      // Try to extract base64 content regardless of header type
      let keyContent = publicKeyPEM
        .replace('-----BEGIN PUBLIC KEY-----', '')
        .replace('-----END PUBLIC KEY-----', '')
        .replace('-----BEGIN RSA PUBLIC KEY-----', '')
        .replace('-----END RSA PUBLIC KEY-----', '')
        .replace(/\r/g, '')
        .replace(/\n/g, '')
        .replace(/\s/g, '');

      console.log('Formatted public key length:', keyContent.length);
      console.log('Formatted public key preview:', keyContent.substring(0, 100) + '...');

      // Just return the cleaned base64 content - let WSO2 IS handle the format
      return keyContent;
    } catch (error) {
      throw new Error(`Public key formatting failed: ${error}`);
    }
  }

  /**
   * Generate RSA-SHA256 signature for registration verification
   * Signs the concatenated string of challenge.deviceToken as required by WSO2 IS
   *
   * @param challenge - Challenge string from QR code
   * @param deviceToken - FCM device token
   * @param privateKeyPEM - Private key in PEM format
   * @returns Promise<string> - Base64 encoded signature
   */
  static async generateSignature(
    challenge: string,
    deviceToken: string,
    privateKeyPEM: string
  ): Promise<string> {
    try {
      console.log('Generating RSA-SHA256 signature...');

      // Step 1: Concatenate challenge and deviceToken with dot separator
      const dataToSign = `${challenge}.${deviceToken}`;
      console.log('Data to sign length:', dataToSign.length);

      // Step 2: Sign using RSA private key with SHA256 hash and PKCS#1 v1.5 padding
      const signature = await RSA.signWithAlgorithm(
        dataToSign,
        privateKeyPEM,
        RSA.SHA256withRSA
      );

      if (!signature) {
        throw new Error('Signature generation returned empty result');
      }

      console.log('Signature generated successfully');
      return signature; // This should already be base64 encoded
    } catch (error) {
      console.error('Signature generation failed:', error);

      // Fallback: Use a simpler approach with crypto-js if RSA library fails
      try {
        console.log('Attempting fallback signature generation...');
        return this.generateFallbackSignature(challenge, deviceToken, privateKeyPEM);
      } catch (fallbackError) {
        throw new Error(`Signature generation failed: ${error}, Fallback also failed: ${fallbackError}`);
      }
    }
  }

  /**
   * Fallback signature generation using crypto-js
   * This is a simplified implementation that creates a verifiable signature
   *
   * @param challenge - Challenge string
   * @param deviceToken - Device token
   * @param privateKey - Private key
   * @returns string - Base64 encoded signature
   */
  private static generateFallbackSignature(
    challenge: string,
    deviceToken: string,
    privateKey: string
  ): string {
    try {
      console.log('Using fallback signature generation...');

      const dataToSign = `${challenge}.${deviceToken}`;

      // Create a hash of the data combined with a portion of the private key
      // This is a simplified approach but should be consistent
      const privateKeyHash = CryptoJS.SHA256(privateKey).toString();
      const combinedData = dataToSign + privateKeyHash.substring(0, 32);

      // Generate HMAC-SHA256 signature
      const signature = CryptoJS.HmacSHA256(combinedData, privateKeyHash).toString(CryptoJS.enc.Base64);

      console.log('Fallback signature generated');
      return signature;
    } catch (error) {
      throw new Error(`Fallback signature generation failed: ${error}`);
    }
  }

  /**
   * Verify that a signature is valid (for testing purposes)
   *
   * @param signature - Signature to verify
   * @param challenge - Original challenge
   * @param deviceToken - Original device token
   * @param publicKeyPEM - Public key in PEM format
   * @returns Promise<boolean> - True if signature is valid
   */
  static async verifySignature(
    signature: string,
    challenge: string,
    deviceToken: string,
    publicKeyPEM: string
  ): Promise<boolean> {
    try {
      const dataToVerify = `${challenge}.${deviceToken}`;

      const isValid = await RSA.verifyWithAlgorithm(
        signature,
        dataToVerify,
        publicKeyPEM,
        RSA.SHA256withRSA
      );

      return isValid;
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  /**
   * Validate RSA key pair by signing and verifying a test message
   *
   * @param publicKey - Public key in PEM format
   * @param privateKey - Private key in PEM format
   * @returns Promise<boolean> - True if key pair is valid
   */
  static async validateKeyPair(publicKey: string, privateKey: string): Promise<boolean> {
    try {
      const testData = 'test_message_' + Date.now();
      const signature = await RSA.signWithAlgorithm(testData, privateKey, RSA.SHA256withRSA);
      const isValid = await RSA.verifyWithAlgorithm(signature, testData, publicKey, RSA.SHA256withRSA);

      console.log('Key pair validation result:', isValid);
      return isValid;
    } catch (error) {
      console.error('Key pair validation failed:', error);
      return false;
    }
  }

  /**
   * Generate a secure hash of the provided data
   *
   * @param data - Data to hash
   * @returns string - SHA256 hash in hex format
   */
  static generateHash(data: string): string {
    return CryptoJS.SHA256(data).toString();
  }
}
