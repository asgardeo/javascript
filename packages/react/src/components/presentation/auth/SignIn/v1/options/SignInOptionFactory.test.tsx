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

import {ApplicationNativeAuthenticationConstants} from '@asgardeo/browser';
import {cleanup, render} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi, Mock} from 'vitest';
import {createSignInOptionFromAuthenticator} from './SignInOptionFactory';
import {createSignUpComponent} from '../../../SignUp/v1/SignUpOptionFactory';

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
vi.mock('../../../../../../contexts/Theme/useTheme', () => ({
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

vi.mock('../../../../../../hooks/useTranslation', () => ({
  default: () => ({
    t: (key: string) => key,
    currentLanguage: 'en',
    setLanguage: vi.fn(),
    availableLanguages: ['en'],
  }),
}));

const googleAuthenticator: any = {
  authenticator: 'Google',
  authenticatorId: ApplicationNativeAuthenticationConstants.SupportedAuthenticators.Google,
  idp: 'Google',
  metadata: {i18nKey: 'authenticator.google', promptType: 'REDIRECTION_PROMPT'},
  requiredParams: [],
};

describe('createSignInOptionFromAuthenticator', () => {
  let consoleError: Mock;

  beforeEach(() => {
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {}) as unknown as Mock;
  });

  afterEach(() => {
    consoleError.mockRestore();
    cleanup();
  });

  it('does not leak form-state props onto the social button DOM element', () => {
    const {container} = render(
      createSignInOptionFromAuthenticator(googleAuthenticator, {}, {}, false, vi.fn(), vi.fn(), {
        buttonClassName: 'btn',
        inputClassName: 'input',
      }),
    );

    const button = container.querySelector('button');

    expect(button).not.toBeNull();
    expect(button?.getAttribute('formvalues')).toBeNull();
    expect(button?.getAttribute('touchedfields')).toBeNull();
    expect(button?.getAttribute('inputclassname')).toBeNull();

    const domWarnings = consoleError.mock.calls
      .map((call: unknown[]) => String(call[0]))
      .filter((message: string) => /does not recognize|Unknown event handler/.test(message));

    expect(domWarnings).toEqual([]);
  });

  it('does not leak form-state props onto a social button rendered by the sign-up factory', () => {
    const googleSignUpButton: any = {
      components: [],
      config: {text: 'Continue with Google', type: 'button'},
      id: 'button_google',
      type: 'BUTTON',
      variant: 'SOCIAL',
    };

    const {container} = render(
      createSignUpComponent({
        buttonClassName: 'btn',
        component: googleSignUpButton,
        formErrors: {},
        formValues: {},
        inputClassName: 'input',
        isFormValid: true,
        isLoading: false,
        onInputChange: vi.fn(),
        onSubmit: vi.fn(),
        touchedFields: {},
      }),
    );

    const button = container.querySelector('button');

    expect(button).not.toBeNull();
    for (const attr of ['formvalues', 'formerrors', 'touchedfields', 'isformvalid', 'inputclassname']) {
      expect(button?.getAttribute(attr)).toBeNull();
    }

    const domWarnings = consoleError.mock.calls
      .map((call: unknown[]) => String(call[0]))
      .filter((message: string) => /does not recognize|Unknown event handler/.test(message));

    expect(domWarnings).toEqual([]);
  });
});
