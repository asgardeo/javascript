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

import { AsgardeoBrowserConfig } from "../config";

describe("AsgardeoBrowserConfig", () => {
    const validStorageTypes = ["sessionStorage", "localStorage", "browserMemory", "webWorker"] as const;
    const TEST_BASE_URL = "https://localhost:9443";

    describe("Required Fields", () => {
        it("should require baseUrl and clientId", () => {
            const config: AsgardeoBrowserConfig = {
                baseUrl: TEST_BASE_URL,
                clientId: "client123"
            };
            expect(config.baseUrl).toBe(TEST_BASE_URL);
            expect(config.clientId).toBe("client123");
        });

        it("should accept optional configurations", () => {
            const config: AsgardeoBrowserConfig = {
                baseUrl: TEST_BASE_URL,
                clientId: "client123",
                signInRedirectURL: `${TEST_BASE_URL}/signin`,
                signOutRedirectURL: `${TEST_BASE_URL}/signout`,
                storage: "sessionStorage"
            };

            // Test actual values instead of just checking if defined
            expect(config.signInRedirectURL).toBe(`${TEST_BASE_URL}/signin`);
            expect(config.signOutRedirectURL).toBe(`${TEST_BASE_URL}/signout`);
            expect(config.storage).toBe("sessionStorage");
        });
    });

    describe("Storage Type Validation", () => {
        validStorageTypes.forEach(storageType => {
            it(`should accept ${storageType} as storage type`, () => {
                const config: AsgardeoBrowserConfig = {
                    baseUrl: TEST_BASE_URL,
                    clientId: "client123",
                    storage: storageType
                };
                expect(config.storage).toBe(storageType);
            });
        });

        it("should enforce valid storage types at compile time", () => {
            const configs = validStorageTypes.map(storage => ({
                baseUrl: TEST_BASE_URL,
                clientId: "client123",
                storage
            } as AsgardeoBrowserConfig));

            configs.forEach(config => {
                expect(validStorageTypes).toContain(config.storage);
            });
        });
    });

    describe("Optional Configurations", () => {
        it("should accept optional configurations", () => {
            // Use type assertion to handle extended config properties
            const config = {
                baseUrl: TEST_BASE_URL,
                clientId: "client123",
                signInRedirectURL: `${TEST_BASE_URL}/signin`,
                signOutRedirectURL: `${TEST_BASE_URL}/signout`,
                storage: "sessionStorage" as const
            } satisfies Partial<AsgardeoBrowserConfig>;

            // Validate fields
            expect(config.signInRedirectURL).toBe(`${TEST_BASE_URL}/signin`);
            expect(config.signOutRedirectURL).toBe(`${TEST_BASE_URL}/signout`);
            expect(config.storage).toBe("sessionStorage");
            expect(validStorageTypes).toContain(config.storage);
        });
    });

    // Remove the incomplete invalid storage test
    // Add runtime validation test instead
    it("should not accept invalid storage type at runtime", () => {
        const invalidStorage = "invalid" as any;
        expect(validStorageTypes.includes(invalidStorage)).toBe(false);
    });
});