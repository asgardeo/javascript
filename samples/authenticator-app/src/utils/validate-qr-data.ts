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

import { QRDataType, QRDataValidationResponseInterface } from "../models/core";
import { PushNotificationQRDataInterface } from "../models/push-notification";

const validateQRData = (data: string): QRDataValidationResponseInterface => {
  try {
    const totpResult: QRDataValidationResponseInterface = validateTOTPFormat(data);
    if (totpResult.isValid) {
      return totpResult;
    }

    const pushResult: QRDataValidationResponseInterface = validatePushNotificationFormat(data);
    if (pushResult.isValid) {
      return pushResult;
    }

    return {
      isValid: false,
      type: QRDataType.UNKNOWN
    };
  } catch {
    return {
      isValid: false,
      type: QRDataType.UNKNOWN
    };
  }
};

/**
 * Validates TOTP QR code format.
 * Expected format: otpauth://totp/issuer:username?secret=SECRET&issuer=ISSUER&period=PERIOD.
 *
 * @param data - The scanned QR code data as a string.
 */
const validateTOTPFormat = (data: string): QRDataValidationResponseInterface => {
  const response: QRDataValidationResponseInterface = { isValid: false, type: QRDataType.TOTP };

  try {
    if (!data.startsWith('otpauth://totp/')) {
      return response;
    }

    const url = new URL(data);
    const pathParts = url.pathname.slice(1).split(':');

    const secret = url.searchParams.get('secret');
    const issuer = url.searchParams.get('issuer');
    const period = url.searchParams.get('period');
    const algorithm = url.searchParams.get('algorithm');
    const digits = url.searchParams.get('digits');

    if (!secret || !issuer) {
      return response;
    }

    let username = '';
    if (pathParts.length === 2) {
      username = decodeURIComponent(pathParts[1]);
    } else if (pathParts.length === 1) {
      username = decodeURIComponent(pathParts[0]);
    }

    response.totpData = {
      issuer: decodeURIComponent(issuer),
      username: username,
      secret: secret,
      period: period ? parseInt(period, 10) : 30,
      algorithm: algorithm ? algorithm : 'SHA1',
      digits: digits ? parseInt(digits, 10) : 6
    };
    response.isValid = true;

    return response;
  } catch {
    return response;
  }
};

/**
 * Validates Push Notification QR code format.
 * Expected format: JSON string containing required push notification fields.
 *
 * @param data - The scanned QR code data as a string.
 */
const validatePushNotificationFormat = (data: string): QRDataValidationResponseInterface => {
  const response: QRDataValidationResponseInterface = { isValid: false, type: QRDataType.PUSH_NOTIFICATION };

  try {
    const parsedData = JSON.parse(data);

    const requiredFields = ['deviceId', 'username', 'host', 'tenantDomain', 'challenge'];
    const hasAllRequiredFields = requiredFields.every(field => !!parsedData[field]);

    if (!hasAllRequiredFields) {
      return response;
    }

    response.isValid = true;
    return { ...response, pushNotificationData: parsedData as PushNotificationQRDataInterface };
  } catch {
    return response;
  }
};

export default validateQRData;
