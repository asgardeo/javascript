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

import { DEFAULT_THEME, ThemeMode } from "@asgardeo/javascript";
import getActiveTheme from "../getActiveTheme";

describe("getActiveTheme", () => {
    const originalMatchMedia = window.matchMedia;

    beforeEach(() => {
        // Mock matchMedia
        window.matchMedia = vi.fn().mockImplementation((query) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn()
        }));
    });

    afterEach(() => {
        // Restore original matchMedia
        window.matchMedia = originalMatchMedia;
        vi.clearAllMocks();
    });

    describe("explicit theme modes", () => {
        it("should return 'dark' when mode is 'dark'", () => {
            expect(getActiveTheme("dark")).toBe("dark");
        });

        it("should return 'light' when mode is 'light'", () => {
            expect(getActiveTheme("light")).toBe("light");
        });

        it("should return default theme for unknown mode", () => {
            expect(getActiveTheme("unknown" as ThemeMode)).toBe(DEFAULT_THEME);
        });
    });

    describe("system theme mode", () => {
        it("should detect dark system theme", () => {
            window.matchMedia = vi.fn().mockImplementation((query) => ({
                matches: query === "(prefers-color-scheme: dark)",
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn()
            }));

            expect(getActiveTheme("system")).toBe("dark");
        });

        it("should detect light system theme", () => {
            window.matchMedia = vi.fn().mockImplementation((query) => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn()
            }));

            expect(getActiveTheme("system")).toBe("light");
        });

        it("should return default theme when matchMedia is not available", () => {
            delete (window as any).matchMedia;
            expect(getActiveTheme("system")).toBe(DEFAULT_THEME);
        });
    });

    describe("class-based theme mode", () => {
        it("should handle class-based theme detection", () => {
            const config = {
                darkClass: "dark-mode",
                element: document.body
            };

            document.body.classList.add("dark-mode");
            expect(getActiveTheme("class", config)).toBe("dark");
            document.body.classList.remove("dark-mode");
        });

        it("should default to light theme when no dark class is present", () => {
            const config = {
                darkClass: "dark-mode",
                element: document.body
            };

            expect(getActiveTheme("class", config)).toBe("light");
        });
    });

    describe("edge cases", () => {
        it("should handle undefined config for class mode", () => {
            expect(getActiveTheme("class")).toBe(DEFAULT_THEME);
        });

        it("should handle null values gracefully", () => {
            expect(getActiveTheme(null as unknown as ThemeMode)).toBe(DEFAULT_THEME);
        });

        it("should handle empty string mode", () => {
            expect(getActiveTheme("" as ThemeMode)).toBe(DEFAULT_THEME);
        });
    });
});