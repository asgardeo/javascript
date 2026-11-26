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

import {
  ApplicationNativeAuthenticationConstants,
  EmbeddedSignInFlowAuthenticatorPromptType,
  EmbeddedSignInFlowStatus,
  EmbeddedSignInFlowStepType,
  handleWebAuthnAuthentication,
} from '@asgardeo/browser';
import {cleanup, render, screen, waitFor} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import BaseSignIn from './BaseSignIn';

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

const mockTheme = {
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
  vars: {
    colors: {
      ...mockColors,
      action: {
        ...mockColors.action,
        hoverOpacity: '0.08',
        selectedOpacity: '0.12',
        disabledOpacity: '0.38',
        focusOpacity: '0.12',
        activatedOpacity: '0.12',
      },
    },
    spacing: {unit: '8px'},
    borderRadius: {small: '2px', medium: '4px', large: '8px'},
    shadows: {
      small: '0 1px 2px rgba(0,0,0,0.1)',
      medium: '0 2px 4px rgba(0,0,0,0.1)',
      large: '0 4px 8px rgba(0,0,0,0.1)',
    },
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

vi.mock('@asgardeo/browser', async importOriginal => ({
  ...(await importOriginal<typeof import('@asgardeo/browser')>()),
  handleWebAuthnAuthentication: vi.fn(),
}));

const passkeyAuthenticator = {
  authenticator: 'Passkey',
  authenticatorId: ApplicationNativeAuthenticationConstants.SupportedAuthenticators.Passkey,
  idp: 'LOCAL',
  metadata: {
    additionalData: {challengeData: 'challenge-data'},
    i18nKey: 'authenticator.passkey',
    promptType: EmbeddedSignInFlowAuthenticatorPromptType.InternalPrompt,
  },
  requiredParams: ['tokenResponse'],
};

const passkeyStep = (): any => ({
  flowId: 'flow-1',
  flowStatus: EmbeddedSignInFlowStatus.Incomplete,
  flowType: 'AUTHENTICATION',
  links: [{href: 'https://localhost:9443/oauth2/authn', method: 'POST', name: 'authentication'}],
  nextStep: {
    authenticators: [passkeyAuthenticator],
    stepType: EmbeddedSignInFlowStepType.AuthenticatorPrompt,
  },
});

describe('BaseSignIn (v1) passkey step', () => {
  beforeEach(() => {
    vi.mocked(handleWebAuthnAuthentication).mockResolvedValue('token-response' as any);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('triggers passkey authentication once without breaking the hook order', async () => {
    const onSubmit = vi.fn().mockResolvedValue({flowStatus: EmbeddedSignInFlowStatus.SuccessCompleted, authData: {}});
    const onSuccess = vi.fn();

    render(
      <BaseSignIn onInitialize={vi.fn().mockResolvedValue(passkeyStep())} onSubmit={onSubmit} onSuccess={onSuccess} />,
    );

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));

    expect(handleWebAuthnAuthentication).toHaveBeenCalledTimes(1);
    expect(handleWebAuthnAuthentication).toHaveBeenCalledWith('challenge-data');
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toEqual({
      flowId: 'flow-1',
      selectedAuthenticator: {
        authenticatorId: passkeyAuthenticator.authenticatorId,
        params: {tokenResponse: 'token-response'},
      },
    });
  });

  it('does not prompt again after a failed passkey attempt', async () => {
    const onSubmit = vi.fn().mockResolvedValue({flowStatus: EmbeddedSignInFlowStatus.FailIncomplete});

    render(<BaseSignIn onInitialize={vi.fn().mockResolvedValue(passkeyStep())} onSubmit={onSubmit} />);

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    await screen.findByText('passkey.authenticating');

    expect(handleWebAuthnAuthentication).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
