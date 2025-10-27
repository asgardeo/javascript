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

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {transformBrandingPreferenceToTheme} from '../transformBrandingPreferenceToTheme';
import type {BrandingPreference, ThemeVariant} from '../../models/branding-preference';

vi.mock('../../theme/createTheme', () => ({
  default: vi.fn((config: any, isDark: boolean) => ({__config: config, __isDark: isDark})),
}));

import createTheme from '../../theme/createTheme';

const lightVariant = (overrides?: Partial<ThemeVariant>): ThemeVariant =>
  ({
    colors: {
      primary: {main: '#FF7300', contrastText: '#fff'},
      secondary: {main: '#E0E1E2', contrastText: '#000'},
      background: {
        surface: {main: '#ffffff'},
        body: {main: '#fbfbfb'},
      },
      text: {primary: '#000000de', secondary: '#00000066'},
    },
    buttons: undefined,
    inputs: undefined,
    images: undefined,
    ...(overrides || {}),
  } as any);

const darkVariant = (overrides?: Partial<ThemeVariant>): ThemeVariant =>
  ({
    colors: {
      primary: {main: '#111111', dark: '#222222', contrastText: '#fff'},
      background: {
        surface: {main: '#242627'},
        body: {main: '#17191a'},
      },
      text: {primary: '#EBEBEF', secondary: '#B9B9C6'},
    },
    ...(overrides || {}),
  } as any);

const basePref = (pref: Partial<BrandingPreference['preference']>): BrandingPreference => ({
  type: 'ORG',
  name: 'dxlab',
  locale: 'en-US',
  preference: pref as any,
});

describe('transformBrandingPreferenceToTheme', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return default light theme when theme config is missing', () => {
    const bp = basePref({} as any);

    const out = transformBrandingPreferenceToTheme(bp);

    expect(createTheme).toHaveBeenCalledWith({}, false);
    expect(out).toEqual({__config: {}, __isDark: false});
  });

  it('should use activeTheme from branding preference when forceTheme is not provided', () => {
    const bp = basePref({
      theme: {
        activeTheme: 'LIGHT',
        LIGHT: lightVariant(),
        DARK: darkVariant(),
      },
    });

    const out = transformBrandingPreferenceToTheme(bp);

    expect((createTheme as any).mock.calls[0][1]).toBe(false);

    const cfg = (out as any).__config;
    expect(cfg.colors.primary.main).toBe('#FF7300');
    expect(cfg.colors.secondary.main).toBe('#E0E1E2');
    expect(cfg.colors.background.surface).toBe('#ffffff');
    expect(cfg.colors.background.body.main).toBe('#fbfbfb');
  });

  it('should respect forceTheme=dark and passes isDark=true', () => {
    const bp = basePref({
      theme: {
        activeTheme: 'LIGHT',
        LIGHT: lightVariant(),
        DARK: darkVariant(),
      },
    });

    const out = transformBrandingPreferenceToTheme(bp, 'dark');

    expect((createTheme as any).mock.calls[0][1]).toBe(true);

    const cfg = (out as any).__config;

    expect(cfg.colors.primary.main).toBe('#222222');
    expect(cfg.colors.background.surface).toBe('#242627');
  });

  it('should fall back to LIGHT config when requested variant missing, but preserves isDark from activeTheme', () => {
    const bp = basePref({
      theme: {
        activeTheme: 'DARK',
        LIGHT: lightVariant(),
      } as any,
    });

    const out = transformBrandingPreferenceToTheme(bp);

    expect((createTheme as any).mock.calls[0][1]).toBe(true);

    const cfg = (out as any).__config;

    expect(cfg.colors.primary.main).toBe('#FF7300');
  });

  it('should return default light theme when no variants exist', () => {
    const bp = basePref({
      theme: {} as any,
    });

    const out = transformBrandingPreferenceToTheme(bp);

    expect(createTheme).toHaveBeenCalledWith({}, false);
    expect(out).toEqual({__config: {}, __isDark: false});
  });

  it('should map images (logo & favicon) into config correctly', () => {
    const bp = basePref({
      theme: {
        activeTheme: 'LIGHT',
        LIGHT: lightVariant({
          images: {
            favicon: {
              imgURL: 'https://example.com/favicon.ico',
              title: 'My App Favicon',
              altText: 'App Icon',
            },
            logo: {
              imgURL: 'https://example.com/logo.png',
              title: 'Company Logo',
              altText: 'Company Brand Logo',
            },
          },
        }),
      },
    });

    const out = transformBrandingPreferenceToTheme(bp);
    const cfg = (out as any).__config;

    expect(cfg.images.favicon).toEqual({
      url: 'https://example.com/favicon.ico',
      title: 'My App Favicon',
      alt: 'App Icon',
    });

    expect(cfg.images.logo).toEqual({
      url: 'https://example.com/logo.png',
      title: 'Company Logo',
      alt: 'Company Brand Logo',
    });
  });

  it('should apply component borderRadius overrides for Button and Field when present', () => {
    const bp = basePref({
      theme: {
        activeTheme: 'LIGHT',
        LIGHT: lightVariant({
          buttons: {
            primary: {
              base: {
                border: {borderRadius: 12},
              },
            },
          } as any,
          inputs: {
            base: {
              border: {borderRadius: 6},
            },
          } as any,
        }),
      },
    });

    const out = transformBrandingPreferenceToTheme(bp);
    const cfg = (out as any).__config;

    expect(cfg.components.Button.styleOverrides.root.borderRadius).toBe(12);
    expect(cfg.components.Field.styleOverrides.root.borderRadius).toBe(6);
  });

  it('should omit components section when no button/field borderRadius provided', () => {
    const bp = basePref({
      theme: {
        activeTheme: 'LIGHT',
        LIGHT: lightVariant(),
      },
    });

    const out = transformBrandingPreferenceToTheme(bp);
    const cfg = (out as any).__config;

    expect(cfg.components).toBeUndefined();
  });

  it('should resolve dark color selection correctly for primary when both main and dark are provided', () => {
    const bp = basePref({
      theme: {
        activeTheme: 'DARK',
        DARK: darkVariant({
          colors: {
            primary: {main: '#999999', dark: '#010101', contrastText: '#fff'},
            background: {
              surface: {main: '#222'},
              body: {main: '#111'},
            },
            text: {primary: '#eee', secondary: '#aaa'},
          } as any,
        }),
      },
    });

    const out = transformBrandingPreferenceToTheme(bp);
    const cfg = (out as any).__config;

    expect(cfg.colors.primary.main).toBe('#010101');
    expect(cfg.colors.primary.dark).toBe('#010101');
    expect((createTheme as any).mock.calls[0][1]).toBe(true);
  });

  it('should use contrastText if provided on color variants', () => {
    const bp = basePref({
      theme: {
        activeTheme: 'LIGHT',
        LIGHT: lightVariant({
          colors: {
            primary: {main: '#123456', contrastText: '#abcdef'},
            secondary: {main: '#222222', contrastText: '#fefefe'},
            alerts: {
              error: {main: '#ff0000', contrastText: '#fff'},
              info: {main: '#0000ff', contrastText: '#111'},
              neutral: {main: '#00ff00', contrastText: '#222'},
              warning: {main: '#ffff00', contrastText: '#333'},
            } as any,
          } as any,
        }),
      },
    });

    const out = transformBrandingPreferenceToTheme(bp);
    const cfg = (out as any).__config;

    expect(cfg.colors.primary.contrastText).toBe('#abcdef');
    expect(cfg.colors.secondary.contrastText).toBe('#fefefe');
    expect(cfg.colors.error.contrastText).toBe('#fff');
    expect(cfg.colors.info.contrastText).toBe('#111');
    expect(cfg.colors.success.contrastText).toBe('#222');
    expect(cfg.colors.warning.contrastText).toBe('#333');
  });
});
