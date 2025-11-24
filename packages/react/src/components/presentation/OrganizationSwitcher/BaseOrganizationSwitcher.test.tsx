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

import {render, screen, waitFor, cleanup} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {BaseOrganizationSwitcher, Organization} from './BaseOrganizationSwitcher';
import React from 'react';

// Mock the dependencies
vi.mock('../../../contexts/Theme/useTheme', () => ({
  default: () => ({
    theme: {
      colors: {
        text: {primary: '#1a1a1a', secondary: '#666666'},
        background: {surface: '#ffffff'},
        border: '#e0e0e0',
        action: {
          hover: 'rgba(0, 0, 0, 0.04)',
          selected: 'rgba(0, 0, 0, 0.08)',
          focus: 'rgba(0, 0, 0, 0.12)',
        },
        primary: {
          main: '#1a73e8',
          contrastText: '#ffffff',
          dark: '#174ea6',
        },
        secondary: {
          main: '#424242',
          contrastText: '#ffffff',
          dark: '#212121',
        },
        error: {
          main: '#d32f2f',
          contrastText: '#d52828',
          dark: '#b71c1c',
        },
      },
      spacing: {unit: 8},
      vars: {
        colors: {
          text: {primary: '#1a1a1a', secondary: '#666666'},
          background: {surface: '#ffffff'},
          border: '#e0e0e0',
          action: {
            hover: 'rgba(0, 0, 0, 0.04)',
            selected: 'rgba(0, 0, 0, 0.08)',
            focus: 'rgba(0, 0, 0, 0.12)',
          },
          primary: {
            main: '#1a73e8',
            contrastText: '#ffffff',
            dark: '#174ea6',
          },
          secondary: {
            main: '#424242',
            contrastText: '#ffffff',
            dark: '#212121',
          },
        },
        spacing: {unit: '8px'},
        borderRadius: {small: '4px', medium: '8px', large: '16px'},
        shadows: {medium: '0 4px 16px rgba(0, 0, 0, 0.15)'},
        typography: {
          fontSizes: {
            xs: '0.75rem',
            sm: '0.875rem',
            md: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
          },
        },
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

const mockOrganizations: Organization[] = [
  {
    id: '1',
    name: 'Organization 1',
    avatar: 'https://example.com/avatar1.jpg',
    memberCount: 10,
    role: 'admin',
  },
  {
    id: '2',
    name: 'Organization 2',
    avatar: 'https://example.com/avatar2.jpg',
    memberCount: 5,
    role: 'member',
  },
];

describe('BaseOrganizationSwitcher RTL Support', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('dir');
  });

  afterEach(() => {
    document.documentElement.removeAttribute('dir');
    cleanup();
  });

  it('should render correctly in LTR mode', () => {
    document.documentElement.setAttribute('dir', 'ltr');
    const handleSwitch = vi.fn();

    render(
      <BaseOrganizationSwitcher
        organizations={mockOrganizations}
        currentOrganization={mockOrganizations[0]}
        onOrganizationSwitch={handleSwitch}
      />,
    );

    expect(screen.getByText('Organization 1')).toBeTruthy();
  });

  it('should render correctly in RTL mode', () => {
    document.documentElement.setAttribute('dir', 'rtl');
    const handleSwitch = vi.fn();

    const {container} = render(
      <BaseOrganizationSwitcher
        organizations={mockOrganizations}
        currentOrganization={mockOrganizations[0]}
        onOrganizationSwitch={handleSwitch}
      />,
    );

    // Check that the component rendered by finding it in the container
    const organizationText = container.querySelector('p');
    expect(organizationText?.textContent).toBe('Organization 1');
  });

  it('should flip chevron icon in RTL mode', async () => {
    document.documentElement.setAttribute('dir', 'rtl');
    const handleSwitch = vi.fn();

    const {container} = render(
      <BaseOrganizationSwitcher
        organizations={mockOrganizations}
        currentOrganization={mockOrganizations[0]}
        onOrganizationSwitch={handleSwitch}
      />,
    );

    await waitFor(() => {
      const chevronIcon = container.querySelector('svg');
      expect(chevronIcon).toBeTruthy();
      if (chevronIcon) {
        const parentSpan = chevronIcon.parentElement;
        // In RTL mode, the transform should be scaleX(-1)
        expect(parentSpan?.style.transform).toContain('scaleX(-1)');
      }
    });
  });

  it('should not flip chevron icon in LTR mode', async () => {
    document.documentElement.setAttribute('dir', 'ltr');
    const handleSwitch = vi.fn();

    const {container} = render(
      <BaseOrganizationSwitcher
        organizations={mockOrganizations}
        currentOrganization={mockOrganizations[0]}
        onOrganizationSwitch={handleSwitch}
      />,
    );

    await waitFor(() => {
      const chevronIcon = container.querySelector('svg');
      expect(chevronIcon).toBeTruthy();
      if (chevronIcon) {
        const parentSpan = chevronIcon.parentElement;
        // In LTR mode, the transform should be none
        expect(parentSpan?.style.transform).toBe('none');
      }
    });
  });

  it('should update icon flip when direction changes', async () => {
    document.documentElement.setAttribute('dir', 'ltr');
    const handleSwitch = vi.fn();

    const {container, rerender} = render(
      <BaseOrganizationSwitcher
        organizations={mockOrganizations}
        currentOrganization={mockOrganizations[0]}
        onOrganizationSwitch={handleSwitch}
      />,
    );

    // Initially LTR
    let chevronIcon = container.querySelector('svg');
    let parentSpan = chevronIcon?.parentElement;
    expect(parentSpan?.style.transform).toBe('none');

    // Change to RTL
    document.documentElement.setAttribute('dir', 'rtl');

    // Force re-render
    rerender(
      <BaseOrganizationSwitcher
        organizations={mockOrganizations}
        currentOrganization={mockOrganizations[0]}
        onOrganizationSwitch={handleSwitch}
      />,
    );

    await waitFor(() => {
      chevronIcon = container.querySelector('svg');
      parentSpan = chevronIcon?.parentElement;
      expect(parentSpan?.style.transform).toContain('scaleX(-1)');
    });
  });
});
