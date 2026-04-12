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

/* eslint-disable sort-keys, @typescript-eslint/typedef, @typescript-eslint/explicit-function-return-type */

import {LoginIdType} from '@asgardeo/browser';
import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import LoginIdInput from '../LoginIdInput';

/* ------------------------------------------------------------------ */
/* Theme mock (mirrors BaseOrganizationSwitcher.test.tsx pattern)      */
/* ------------------------------------------------------------------ */

const mockColorsVars = {
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
    hoverOpacity: '0.08',
    selectedOpacity: '0.12',
    disabledOpacity: '0.38',
    focusOpacity: '0.12',
    activatedOpacity: '0.12',
  },
  primary: {main: '#0066cc', contrastText: '#fff'},
  secondary: {main: '#666', contrastText: '#fff'},
  error: {main: '#d32f2f', contrastText: '#fff'},
  success: {main: '#2e7d32', contrastText: '#fff'},
  warning: {main: '#ed6c02', contrastText: '#fff'},
  info: {main: '#0288d1', contrastText: '#fff'},
};

vi.mock('../../../../../../contexts/Theme/useTheme', () => ({
  default: () => ({
    theme: {
      colors: mockColorsVars,
      typography: {
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
      },
      spacing: {unit: 8},
      borderRadius: {small: '2px', medium: '4px', large: '8px'},
      shadows: {
        small: '0 1px 2px rgba(0,0,0,0.1)',
        medium: '0 2px 4px rgba(0,0,0,0.1)',
        large: '0 4px 8px rgba(0,0,0,0.1)',
      },
      cssVariables: {},
      vars: {
        colors: mockColorsVars,
        spacing: {unit: '8px'},
        borderRadius: {small: '2px', medium: '4px', large: '8px'},
        shadows: {
          small: '0 1px 2px rgba(0,0,0,0.1)',
          medium: '0 2px 4px rgba(0,0,0,0.1)',
          large: '0 4px 8px rgba(0,0,0,0.1)',
        },
        typography: {
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
        },
      },
    },
    colorScheme: 'light',
    direction: 'ltr',
  }),
}));

/* ------------------------------------------------------------------ */
/* Fixtures                                                             */
/* ------------------------------------------------------------------ */

const emailType: LoginIdType = {id: 'email', label: 'Email', inputType: 'email'};
const mobileType: LoginIdType = {id: 'mobile', label: 'Mobile', inputType: 'tel'};
const usernameType: LoginIdType = {id: 'username', label: 'Username'};

/* ------------------------------------------------------------------ */
/* Tests                                                               */
/* ------------------------------------------------------------------ */

afterEach(() => {
  cleanup();
});

describe('LoginIdInput — tab grid visibility', () => {
  it('renders a tab for each type when multiple types are provided', () => {
    render(<LoginIdInput loginIdTypes={[emailType, mobileType]} onInputChange={vi.fn()} />);

    expect(screen.getByRole('tab', {name: 'Email'})).toBeDefined();
    expect(screen.getByRole('tab', {name: 'Mobile'})).toBeDefined();
  });

  it('renders the tablist when there are more than one type', () => {
    render(<LoginIdInput loginIdTypes={[emailType, mobileType, usernameType]} onInputChange={vi.fn()} />);

    expect(screen.getByRole('tablist')).toBeDefined();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });

  it('does not render a tablist when only one type is provided', () => {
    render(<LoginIdInput loginIdTypes={[emailType]} onInputChange={vi.fn()} />);

    expect(screen.queryByRole('tablist')).toBeNull();
    expect(screen.queryByRole('tab')).toBeNull();
  });

  it('renders nothing when loginIdTypes is empty', () => {
    const {container} = render(<LoginIdInput loginIdTypes={[]} onInputChange={vi.fn()} />);

    expect(container.firstChild).toBeNull();
  });
});

describe('LoginIdInput — outer label', () => {
  it('renders the outer label when provided', () => {
    render(<LoginIdInput loginIdTypes={[emailType]} outerLabel="Login identifier" onInputChange={vi.fn()} />);

    expect(screen.getByText('Login identifier')).toBeDefined();
  });

  it('does not render a label element when outerLabel is omitted', () => {
    render(<LoginIdInput loginIdTypes={[emailType]} onInputChange={vi.fn()} />);

    // The label "Email" comes from the type label (InputLabel below the grid),
    // not from outerLabel — so querying for a specific outer label text should fail.
    expect(screen.queryByText('Login identifier')).toBeNull();
  });
});

describe('LoginIdInput — input interaction', () => {
  it('calls onInputChange with the typed value', () => {
    const handleChange = vi.fn();
    render(<LoginIdInput loginIdTypes={[emailType]} onInputChange={handleChange} />);

    const input: HTMLElement = screen.getByRole('textbox');
    fireEvent.change(input, {target: {value: 'user@example.com'}});

    expect(handleChange).toHaveBeenCalledWith('user@example.com');
  });

  it('marks the first tab as selected by default', () => {
    render(<LoginIdInput loginIdTypes={[emailType, mobileType]} onInputChange={vi.fn()} />);

    const emailTab: HTMLElement = screen.getByRole('tab', {name: 'Email'});
    expect(emailTab.getAttribute('aria-selected')).toBe('true');

    const mobileTab: HTMLElement = screen.getByRole('tab', {name: 'Mobile'});
    expect(mobileTab.getAttribute('aria-selected')).toBe('false');
  });

  it('switches active tab and resets input on tab click', () => {
    const handleChange = vi.fn();
    render(<LoginIdInput loginIdTypes={[emailType, mobileType]} onInputChange={handleChange} />);

    // Type something in the email input
    const input: HTMLElement = screen.getByRole('textbox');
    fireEvent.change(input, {target: {value: 'user@example.com'}});

    // Switch to mobile tab
    fireEvent.click(screen.getByRole('tab', {name: 'Mobile'}));

    expect(screen.getByRole('tab', {name: 'Mobile'}).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('tab', {name: 'Email'}).getAttribute('aria-selected')).toBe('false');
    // Input should be cleared after type switch
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('');
  });

  it('shows an external error message', () => {
    render(<LoginIdInput loginIdTypes={[emailType]} onInputChange={vi.fn()} error="Invalid email address" />);

    expect(screen.getByText('Invalid email address')).toBeDefined();
  });
});
