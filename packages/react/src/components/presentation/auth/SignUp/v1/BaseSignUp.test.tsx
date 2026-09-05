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

/* eslint-disable sort-keys, @typescript-eslint/typedef, @typescript-eslint/explicit-function-return-type, testing-library/no-container, testing-library/no-node-access */

import {act, cleanup, fireEvent, render, waitFor} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import BaseSignUp from './BaseSignUp';

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
  fontSizes: {xs: '0.75rem', sm: '0.875rem', md: '1rem', lg: '1.125rem', xl: '1.25rem', '2xl': '1.5rem', '3xl': '1.875rem'},
  fontWeights: {normal: 400, medium: 500, semibold: 600, bold: 700},
  lineHeights: {tight: 1.25, normal: 1.5, relaxed: 1.75},
};

const mockTheme = {
  colors: mockColors,
  typography: mockTypography,
  spacing: {unit: 8},
  borderRadius: {small: '2px', medium: '4px', large: '8px'},
  shadows: {small: '0 1px 2px rgba(0,0,0,0.1)', medium: '0 2px 4px rgba(0,0,0,0.1)', large: '0 4px 8px rgba(0,0,0,0.1)'},
  cssVariables: {},
  vars: {
    colors: {
      ...mockColors,
      action: {...mockColors.action, hoverOpacity: '0.08', selectedOpacity: '0.12', disabledOpacity: '0.38', focusOpacity: '0.12', activatedOpacity: '0.12'},
    },
    spacing: {unit: '8px'},
    borderRadius: {small: '2px', medium: '4px', large: '8px'},
    shadows: {small: '0 1px 2px rgba(0,0,0,0.1)', medium: '0 2px 4px rgba(0,0,0,0.1)', large: '0 4px 8px rgba(0,0,0,0.1)'},
    typography: {
      ...mockTypography,
      fontWeights: {normal: '400', medium: '500', semibold: '600', bold: '700'},
      lineHeights: {tight: '1.25', normal: '1.5', relaxed: '1.75'},
    },
  },
};

vi.mock('../../../../../contexts/Theme/useTheme', () => ({
  default: () => ({theme: mockTheme, colorScheme: 'light', direction: 'ltr'}),
}));

vi.mock('../../../../../hooks/useTranslation', () => ({
  default: () => ({t: (key: string) => key, currentLanguage: 'en', setLanguage: vi.fn(), availableLanguages: ['en']}),
}));

vi.mock('../../../../../contexts/Asgardeo/useAsgardeo', () => ({
  default: () => ({}),
}));

/**
 * The registration step exactly as the identity server returns it: inputs are keyed by `identifier`,
 * there is no `name` in the config.
 */
const registrationStep = (additionalData?: Record<string, unknown>): any => ({
  flowId: 'flow-1',
  flowStatus: 'INCOMPLETE',
  flowType: 'REGISTRATION',
  type: 'VIEW',
  data: {
    ...(additionalData ? {additionalData} : {}),
    components: [
      {
        id: 'form_1',
        type: 'FORM',
        components: [
          {
            id: 'input_username',
            type: 'INPUT',
            variant: 'TEXT',
            config: {identifier: 'http://wso2.org/claims/username', type: 'text', label: 'Username', required: true},
          },
          {
            id: 'input_password',
            type: 'INPUT',
            variant: 'PASSWORD',
            config: {identifier: 'password', type: 'password', label: 'Password', required: true},
          },
          {id: 'button_submit', type: 'BUTTON', variant: 'PRIMARY', config: {type: 'submit', text: 'Continue'}},
        ],
      },
    ],
  },
});

const SERVER_ERROR = 'Password does not meet the required format.';

describe('BaseSignUp (v1) after a server-side validation error', () => {
  afterEach(() => cleanup());

  it('keeps the entered values and lets the user resubmit', async () => {
    const onSubmit = vi
      .fn()
      .mockResolvedValueOnce(registrationStep({error: SERVER_ERROR}))
      .mockResolvedValueOnce(registrationStep());

    const {container} = render(
      <BaseSignUp isInitialized onInitialize={vi.fn().mockResolvedValue(registrationStep())} onSubmit={onSubmit} />,
    );

    const submit = await waitFor(() => {
      const button = container.querySelector('form button[type="submit"]') as HTMLButtonElement | null;
      expect(button).not.toBeNull();
      return button as HTMLButtonElement;
    });
    const username = container.querySelector('input[name="http://wso2.org/claims/username"]') as HTMLInputElement;
    const password = container.querySelector('input[name="password"]') as HTMLInputElement;

    expect(submit.disabled).toBe(false);

    fireEvent.change(username, {target: {value: 'sdk-test@example.com'}});
    fireEvent.change(password, {target: {value: 'weak'}});
    await act(async () => {
      fireEvent.click(submit);
    });

    // The server rejected the password: the message is shown, the values stay, and the form is still usable.
    await waitFor(() => expect(container.textContent).toContain(SERVER_ERROR));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].inputs).toEqual({
      'http://wso2.org/claims/username': 'sdk-test@example.com',
      password: 'weak',
    });
    expect(username.value).toBe('sdk-test@example.com');
    expect(password.value).toBe('weak');
    expect(submit.disabled).toBe(false);

    // Correct the password and resubmit.
    fireEvent.change(password, {target: {value: 'Str0ng!Passw0rd'}});
    expect(submit.disabled).toBe(false);
    await act(async () => {
      fireEvent.click(submit);
    });

    expect(onSubmit).toHaveBeenCalledTimes(2);
    expect(onSubmit.mock.calls[1][0].inputs).toEqual({
      'http://wso2.org/claims/username': 'sdk-test@example.com',
      password: 'Str0ng!Passw0rd',
    });
  });

  it('validates the value being typed, not the previous one', async () => {
    const {container} = render(
      <BaseSignUp isInitialized onInitialize={vi.fn().mockResolvedValue(registrationStep())} onSubmit={vi.fn()} />,
    );

    const username = await waitFor(() => {
      const input = container.querySelector('input[name="http://wso2.org/claims/username"]') as HTMLInputElement | null;
      expect(input).not.toBeNull();
      return input as HTMLInputElement;
    });
    const submit = container.querySelector('form button[type="submit"]') as HTMLButtonElement;

    // Emptying a required field must disable submit immediately, and filling it must re-enable it immediately.
    fireEvent.change(username, {target: {value: 'a'}});
    fireEvent.change(username, {target: {value: ''}});
    expect(submit.disabled).toBe(true);
    expect(container.textContent).toContain('validations.required.field.error');

    fireEvent.change(username, {target: {value: 'sdk-test@example.com'}});
    expect(submit.disabled).toBe(false);
    expect(container.textContent).not.toContain('validations.required.field.error');
  });
});
