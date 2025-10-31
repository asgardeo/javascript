/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the \"License\"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * \"AS IS\" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import type { MockedFunction } from 'vitest';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { detectThemeMode, createClassObserver, createMediaQueryListener, BrowserThemeDetection } from '../themeDetection';

describe('themeDetection', () => {
    let originalMatchMedia: typeof window.matchMedia;
    let originalDocument: Document;

    beforeEach(() => {
        // Mock matchMedia
        originalMatchMedia = window.matchMedia;
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

        // Mock document
        originalDocument = global.document;
        global.document = {
            documentElement: {
                classList: {
                    contains: vi.fn().mockReturnValue(false),
                    add: vi.fn(),
                    remove: vi.fn()
                }
            } as any
        } as any;
    });

    afterEach(() => {
        window.matchMedia = originalMatchMedia;
        global.document = originalDocument;
        vi.clearAllMocks();
    });

    describe('detectThemeMode', () => {
        describe('explicit modes', () => {
            it('should return light for light mode', () => {
                expect(detectThemeMode('light')).toBe('light');
            });

            it('should return dark for dark mode', () => {
                expect(detectThemeMode('dark')).toBe('dark');
            });
        });

        describe('system mode', () => {
            it('should return dark when system prefers dark', () => {
                window.matchMedia = vi.fn().mockImplementation((query) => ({
                    matches: query === '(prefers-color-scheme: dark)',
                    media: query,
                    onchange: null,
                    addListener: vi.fn(),
                    removeListener: vi.fn(),
                    addEventListener: vi.fn(),
                    removeEventListener: vi.fn(),
                    dispatchEvent: vi.fn()
                }));

                expect(detectThemeMode('system')).toBe('dark');
            });

            it('should return light when system prefers light', () => {
                expect(detectThemeMode('system')).toBe('light');
            });

            it('should return light when matchMedia is not available', () => {
                delete (window as any).matchMedia;
                expect(detectThemeMode('system')).toBe('light');
            });
        });

        describe('class mode', () => {
            let element: HTMLElement;

            beforeEach(() => {
                element = {
                    classList: {
                        contains: vi.fn()
                    }
                } as any;
            });

            it('should return dark when dark class is present', () => {
                element.classList.contains = vi.fn().mockImplementation((className) => className === 'dark');
                const config: BrowserThemeDetection = { targetElement: element };

                expect(detectThemeMode('class', config)).toBe('dark');
            });

            it('should return light when light class is present', () => {
                element.classList.contains = vi.fn().mockImplementation((className) => className === 'light');
                const config: BrowserThemeDetection = { targetElement: element };

                expect(detectThemeMode('class', config)).toBe('light');
            });

            it('should return light when neither class is present', () => {
                element.classList.contains = vi.fn().mockReturnValue(false);
                const config: BrowserThemeDetection = { targetElement: element };

                expect(detectThemeMode('class', config)).toBe('light');
            });

            it('should return light when targetElement is not provided', () => {
                const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
                expect(detectThemeMode('class')).toBe('light');
                expect(consoleSpy).toHaveBeenCalledWith(
                    'ThemeDetection: targetElement is required for class-based detection, falling back to light mode'
                );
                consoleSpy.mockRestore();
            });

            it('should use custom class names', () => {
                element.classList.contains = vi.fn().mockImplementation((className) => className === 'custom-dark');
                const config: BrowserThemeDetection = {
                    targetElement: element,
                    darkClass: 'custom-dark',
                    lightClass: 'custom-light'
                };

                expect(detectThemeMode('class', config)).toBe('dark');
            });

            it('should use document.documentElement as default targetElement', () => {
                const mockElement = global.document.documentElement;
                mockElement.classList.contains = vi.fn().mockImplementation((className) => className === 'dark');

                expect(detectThemeMode('class')).toBe('dark');
            });
        });

        describe('default behavior', () => {
            it('should return light for unknown mode', () => {
                expect(detectThemeMode('unknown' as any)).toBe('light');
            });
        });
    });

    describe('createClassObserver', () => {
        let element: HTMLElement;
        let callback: MockedFunction<(isDark: boolean) => void>;

        beforeEach(() => {
            element = {
                classList: {
                    contains: vi.fn()
                }
            } as any;
            callback = vi.fn();
        });

        it('should create a MutationObserver', () => {
            const observer = createClassObserver(element, callback);
            expect(observer).toBeInstanceOf(MutationObserver);
        });

        it('should call callback with true when dark class is added', () => {
            element.classList.contains = vi.fn().mockImplementation((className) => className === 'dark');
            const observer = createClassObserver(element, callback);

            // Simulate mutation
            const mockMutation = {
                type: 'attributes',
                attributeName: 'class'
            } as MutationRecord;

            observer.observe(element, { attributes: true, attributeFilter: ['class'] });

            // Trigger the mutation callback manually for testing
            const mutations = [mockMutation];
            (observer as any)._callback(mutations);

            expect(callback).toHaveBeenCalledWith(true);
        });

        it('should call callback with false when light class is added', () => {
            element.classList.contains = vi.fn().mockImplementation((className) => className === 'light');
            const observer = createClassObserver(element, callback);

            const mockMutation = {
                type: 'attributes',
                attributeName: 'class'
            } as MutationRecord;

            (observer as any)._callback([mockMutation]);

            expect(callback).toHaveBeenCalledWith(false);
        });

        it('should not call callback when neither class is present', () => {
            element.classList.contains = vi.fn().mockReturnValue(false);
            const observer = createClassObserver(element, callback);

            const mockMutation = {
                type: 'attributes',
                attributeName: 'class'
            } as MutationRecord;

            (observer as any)._callback([mockMutation]);

            expect(callback).not.toHaveBeenCalled();
        });

        it('should use custom class names', () => {
            element.classList.contains = vi.fn().mockImplementation((className) => className === 'custom-dark');
            const config: BrowserThemeDetection = {
                darkClass: 'custom-dark',
                lightClass: 'custom-light'
            };
            const observer = createClassObserver(element, callback, config);

            const mockMutation = {
                type: 'attributes',
                attributeName: 'class'
            } as MutationRecord;

            (observer as any)._callback([mockMutation]);

            expect(callback).toHaveBeenCalledWith(true);
        });

        it('should observe only class attribute', () => {
            const observer = createClassObserver(element, callback);
            const observeSpy = vi.spyOn(observer, 'observe');

            // The observer.observe should be called with correct options
            expect(observeSpy).toHaveBeenCalledWith(element, {
                attributes: true,
                attributeFilter: ['class']
            });
        });
    });

    describe('createMediaQueryListener', () => {
        let callback: MockedFunction<(isDark: boolean) => void>;

        beforeEach(() => {
            callback = vi.fn();
        });

        it('should return null when window is undefined', () => {
            const originalWindow = global.window;
            delete (global as any).window;

            expect(createMediaQueryListener(callback)).toBeNull();

            global.window = originalWindow;
        });

        it('should return null when matchMedia is not available', () => {
            delete (window as any).matchMedia;
            expect(createMediaQueryListener(callback)).toBeNull();
        });

        it('should create a MediaQueryList with modern event listener', () => {
            const mockMediaQuery = {
                matches: false,
                addEventListener: vi.fn(),
                removeEventListener: vi.fn()
            };

            window.matchMedia = vi.fn().mockReturnValue(mockMediaQuery);

            const result = createMediaQueryListener(callback);

            expect(result).toBe(mockMediaQuery);
            expect(mockMediaQuery.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
        });

        it('should use legacy addListener for older browsers', () => {
            const mockMediaQuery = {
                matches: false,
                addListener: vi.fn(),
                removeListener: vi.fn()
            };

            // Remove addEventListener to force legacy path
            delete (mockMediaQuery as any).addEventListener;

            window.matchMedia = vi.fn().mockReturnValue(mockMediaQuery);

            const result = createMediaQueryListener(callback);

            expect(result).toBe(mockMediaQuery);
            expect(mockMediaQuery.addListener).toHaveBeenCalledWith(expect.any(Function));
        });

        it('should call callback with correct value on change event', () => {
            const mockMediaQuery = {
                matches: false,
                addEventListener: vi.fn((event, handler) => {
                    // Simulate event firing
                    const mockEvent = { matches: true };
                    handler(mockEvent);
                }),
                removeEventListener: vi.fn()
            };

            window.matchMedia = vi.fn().mockReturnValue(mockMediaQuery);

            createMediaQueryListener(callback);

            expect(callback).toHaveBeenCalledWith(true);
        });
    });
});
