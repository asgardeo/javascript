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

import { TOTP } from 'otpauth';
import QuickCrypto from 'react-native-quick-crypto';
import { KeyPair } from '../models/crypto';
import { PushAuthJWTBodyInterface, PushAuthJWTHeaderInterface } from '../models/push-notification';
import SecureStorageService from './secure-storage-service';

// Node buffer polyfill for React Native environment.
import { Buffer } from 'buffer';
global.Buffer = Buffer;

/**
 * Cryptography service for handling cryptographic operations.
 */
class CryptoService {
  private static currentTOTP: { [key: string]: TOTP } = {};

  /**
   * Generates a new RSA key pair.
   * Private Key Type: PKCS#8 PEM.
   * Public Key Type: SPKI PEM.
   *
   * @returns Generated RSA key pair in PEM format.
   */
  static generateKeyPair(): KeyPair {
    const { publicKey, privateKey } = QuickCrypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    return {
      publicKey: publicKey?.toString() ?? '',
      privateKey: privateKey?.toString() ?? ''
    }
  }

  /**
   * Generates a challenge signature using the provided parameters.
   *
   * @param challenge - The challenge string.
   * @param deviceToken - The device token string.
   * @param privateKey - The private key in PEM type for signing.
   * @returns The generated challenge signature.
   */
  static generateChallengeSignature(challenge: string, deviceToken: string, privateKey: string): string {
    const dataToSign = `${challenge}.${deviceToken}`;

    const sign = QuickCrypto.createSign('SHA256');
    sign.update(dataToSign, 'utf8');

    const signature = sign.sign({
      key: privateKey,
      format: 'pem',
      type: 'pkcs8',
      padding: QuickCrypto.constants.RSA_PKCS1_PADDING
    }, 'base64');

    return signature as string;
  }

  /**
   * Extracts the base64 encoded text from a PEM formatted key.
   *
   * @param pemKey - PEM formatted key.
   * @returns Base64 encoded text.
   */
  static getBase64Text(pemKey: string): string {
    return pemKey.replace(/-----BEGIN [\w\s]+-----/, '')
      .replace(/-----END [\w\s]+-----/, '')
      .replace(/\s+/g, '');
  }

  /**
   * Generates a random key (UUID).
   *
   * @returns A randomly generated key (UUID).
   */
  static generateRandomKey(): string {
    return QuickCrypto.randomUUID();
  }

  /**
   * Encodes a string to Base64 URL format.
   *
   * @param input - The input string to be encoded.
   * @returns The Base64 URL encoded string.
   */
  private static encodeBase64Url(input: string | Buffer<ArrayBuffer>): string {
    return Buffer.from(input)
      .toString('base64')
      .replace(/=/g, '') // Remove padding
      .replace(/\+/g, '-') // Replace '+' with '-'
      .replace(/\//g, '_'); // Replace '/' with '_'
  }

  /**
   * Generates a push response JWT.
   *
   * @param header - The JWT header.
   * @param body - The JWT body.
   * @returns The generated JWT.
   */
  static generatePushResponseJWT(header: PushAuthJWTHeaderInterface, body: PushAuthJWTBodyInterface): string {
    const encodedHeader = this.encodeBase64Url(JSON.stringify(header));
    const encodedBody = this.encodeBase64Url(JSON.stringify(body));
    const dataToSign = `${encodedHeader}.${encodedBody}`;

    const sign = QuickCrypto.createSign('SHA256');
    sign.update(dataToSign, 'utf8');

    const signature = sign.sign({
      key: SecureStorageService.getItem(header.deviceId),
      format: 'pem',
      type: 'pkcs8',
      padding: QuickCrypto.constants.RSA_PKCS1_PADDING
    });

    return `${dataToSign}.${this.encodeBase64Url(signature)}`;
  }

  /**
   * Retrieves the TOTP instance for the given identifier.
   *
   * @param id - Identifier for which the TOTP instance has to be retrieved.
   * @param period - The time period in seconds for which the TOTP is valid.
   * @returns The TOTP instance.
   */
  private static getTOTPInstance(id: string, period: number): TOTP {
    const secret: string | null = SecureStorageService.getItem(id);


    if (!secret) {
      throw new Error('No secret found for the given ID.');
    }

    const totp: TOTP = new TOTP({
      secret,
      period
    });

    this.currentTOTP[id] = totp;

    return totp;
  }

  /**
   * Generates a TOTP (Time-based One-Time Password) for the given identifier.
   *
   * @param id - Identifier for which the TOTP has to be generated.
   * @param period - The time period in seconds for which the TOTP is valid.
   * @returns The generated TOTP.
   */
  static generateTOTP(id: string, period: number): string {
    const totp: TOTP = this.getTOTPInstance(id, period);

    return totp.generate();
  }

  /**
   * Gets the remaining seconds for the current TOTP validity period.
   *
   * @returns The remaining seconds for the current TOTP validity period.
   */
  static getTOTPRemainingSeconds(id: string): number {
    const time: number = this.currentTOTP[id]?.remaining() ?? 0;

    return parseInt((time / 1000).toFixed(0));
  }
}

export default CryptoService;
