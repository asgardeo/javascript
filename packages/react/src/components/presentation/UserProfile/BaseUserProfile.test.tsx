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

/* eslint-disable sort-keys, @typescript-eslint/typedef, @typescript-eslint/explicit-function-return-type, testing-library/no-container, testing-library/no-node-access */

import {cleanup, render} from '@testing-library/react';
import {describe, it, expect, vi, afterEach} from 'vitest';
import BaseUserProfile from './BaseUserProfile';

// Mock theme data
const mockColors = {
  text: {primary: '#000', secondary: '#666'},
  background: {surface: '#fff', disabled: '#eee', body: {main: '#fff'}},
  border: '#ccc',
  action: {
    hover: '#f0f0f0',
    active: '#e0e0e0',
    selected: '#d0d0d0',
    disabled: '#bbb',
    disabledBackground: '#f5f5f5',
    focus: '#0066cc',
    hoverOpacity: 0.08,
    selectedOpacity: 0.12,
    disabledOpacity: 0.38,
    focusOpacity: 0.12,
    activatedOpacity: 0.12,
  },
  primary: {main: '#0066cc', contrastText: '#fff'},
  secondary: {main: '#666', contrastText: '#fff'},
  error: {main: '#d32f2f', contrastText: '#fff'},
  success: {main: '#2e7d32', contrastText: '#fff'},
  warning: {main: '#ed6c02', contrastText: '#fff'},
  info: {main: '#0288d1', contrastText: '#fff'},
};

const mockTypography = {
  fontFamily: 'Arial, sans-serif',
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
  },
  fontWeights: {normal: 400, medium: 500, semibold: 600, bold: 700},
  lineHeights: {tight: 1.25, normal: 1.5, relaxed: 1.75},
};

const mockTypographyVars = {
  fontFamily: 'Arial, sans-serif',
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
  },
  fontWeights: {normal: '400', medium: '500', semibold: '600', bold: '700'},
  lineHeights: {tight: '1.25', normal: '1.5', relaxed: '1.75'},
};

const mockColorsVars = {
  ...mockColors,
  action: {
    hover: '#f0f0f0',
    active: '#e0e0e0',
    selected: '#d0d0d0',
    disabled: '#bbb',
    disabledBackground: '#f5f5f5',
    focus: '#0066cc',
    hoverOpacity: '0.08',
    selectedOpacity: '0.12',
    disabledOpacity: '0.38',
    focusOpacity: '0.12',
    activatedOpacity: '0.12',
  },
};

// Mock the dependencies
vi.mock('../../../contexts/Theme/useTheme', () => ({
  default: () => ({
    theme: {
      // ThemeConfig properties (direct access)
      colors: mockColors,
      typography: mockTypography,
      spacing: {unit: 8},
      borderRadius: {small: '2px', medium: '4px', large: '8px'},
      shadows: {
        small: '0 1px 2px rgba(0,0,0,0.1)',
        medium: '0 2px 4px rgba(0,0,0,0.1)',
        large: '0 4px 8px rgba(0,0,0,0.1)',
      },
      cssVariables: {},
      // ThemeVars (CSS variable references)
      vars: {
        colors: mockColorsVars,
        spacing: {unit: '8px'},
        borderRadius: {small: '2px', medium: '4px', large: '8px'},
        shadows: {
          small: '0 1px 2px rgba(0,0,0,0.1)',
          medium: '0 2px 4px rgba(0,0,0,0.1)',
          large: '0 4px 8px rgba(0,0,0,0.1)',
        },
        typography: mockTypographyVars,
      },
    },
    colorScheme: 'light',
    direction: (document.documentElement.getAttribute('dir') as 'ltr' | 'rtl') || 'ltr',
  }),
}));

vi.mock('../../../hooks/useTranslation', () => ({
  default: () => ({
    t: (key: string) => key,
    currentLanguage: 'en',
    setLanguage: vi.fn(),
    availableLanguages: ['en'],
  }),
}));

const schemas: any[] = [
  {name: 'userName', displayName: 'Username', type: 'STRING', mutability: 'readOnly', schemaId: 'core'},
  {name: 'name.givenName', displayName: 'First Name', type: 'STRING', mutability: 'readWrite', schemaId: 'core'},
  {name: 'name.familyName', displayName: 'Last Name', type: 'STRING', mutability: 'readWrite', schemaId: 'core'},
  {name: 'emails', displayName: 'Email', type: 'STRING', mutability: 'readWrite', multiValued: true, schemaId: 'core'},
];
const flattenedProfile: any = {userName: 'omal@example.com', 'name.givenName': 'Omal', emails: ['omal@example.com']};
const profile: any = {userName: 'omal@example.com', name: {givenName: 'Omal'}, emails: ['omal@example.com']};

describe('BaseUserProfile with SCIM2 schemas', () => {
  afterEach(() => cleanup());

  it('treats camelCase SCIM mutability values like the upper-case ones', () => {
    const {container} = render(
      <BaseUserProfile
        profile={profile}
        flattenedProfile={flattenedProfile}
        schemas={schemas}
        editable
        onUpdate={vi.fn()}
      />,
    );
    const text: string = container.textContent || '';

    // Fields with values are editable (username is always read-only).
    expect(container.querySelectorAll('button[title="Edit"]').length).toBe(2);
    // An empty readWrite field is still offered so the user can fill it in.
    expect(text).toContain('Last Name');
    expect(container.querySelector('button[title="Click to edit"]')).toBeTruthy();
  });

  it('hides empty fields when not editable', () => {
    const {container} = render(
      <BaseUserProfile profile={profile} flattenedProfile={flattenedProfile} schemas={schemas} editable={false} />,
    );
    const text: string = container.textContent || '';

    expect(text).not.toContain('Last Name');
    expect(container.querySelectorAll('button[title="Edit"]').length).toBe(0);
  });
});
