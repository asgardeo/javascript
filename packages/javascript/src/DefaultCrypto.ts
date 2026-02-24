/**
 * Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com).
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

import * as jose from "jose";
import { JWKInterface } from "./models/crypto";

interface CryptoInterface<T> {
    base64URLEncode(value: T): string;
    base64URLDecode(value: string): string;
    hashSha256(data: string): Promise<Uint8Array>; // Changed to Promise to match implementation
    generateRandomBytes(length: number): Uint8Array;
    verifyJwt(
        idToken: string,
        jwk: Partial<any>,
        algorithms: string[],
        clientId: string,
        issuer: string,
        subject: string,
        clockTolerance?: number,
    ): Promise<boolean>;
}

export class DefaultCrypto implements CryptoInterface<Uint8Array | string> {

    constructor() {}

    /**
     * Cross-platform Base64URL encoding using 'jose' utilities
     */
    public base64URLEncode(value: Uint8Array | string): string {
        const uint8Array = typeof value === "string" 
            ? new TextEncoder().encode(value) 
            : value;
        
        return jose.base64url.encode(uint8Array);
    }

    /**
     * Cross-platform Base64URL decoding
     */
    public base64URLDecode(value: string): string {
        const decodedArray = jose.base64url.decode(value);
        return new TextDecoder().decode(decodedArray);
    }

    public async hashSha256(data: string): Promise<Uint8Array> {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);

        // Using native web crypto (available in modern Node and Browsers)
        const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
        return new Uint8Array(hashBuffer);
    }

    public generateRandomBytes(length: number): Uint8Array {
        // globalThis.crypto works in Browsers and Node.js 19+
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return array;
    }

    public async verifyJwt(
        idToken: string,
        jwk: Partial<JWKInterface>,
        algorithms: string[],
        clientId: string,
        issuer: string,
        subject: string,
        clockTolerance?: number,
    ): Promise<boolean> {

        const key = await jose.importJWK(jwk as any);

        await jose.jwtVerify(idToken, key, {
            algorithms,
            audience: clientId,
            issuer,
            subject,
            clockTolerance,
        });

        return true;
    }
}
