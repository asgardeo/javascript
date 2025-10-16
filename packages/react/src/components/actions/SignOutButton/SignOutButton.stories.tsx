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

import type {Meta, StoryObj} from '@storybook/react';
import SignOutButton from './SignOutButton';
import useI18n from '../../../contexts/I18n/useI18n';

const meta: Meta<typeof SignOutButton> = {
  title: 'Components/Actions/SignOutButton',
  component: SignOutButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description:
        'Custom text to display on the button. If not provided, uses translation key "elements.buttons.signOut"',
    },
    onClick: {
      action: 'clicked',
      description: 'Callback function called after successful sign out',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply to the button',
    },
    style: {
      control: 'object',
      description: 'Inline styles to apply to the button',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    preferences: {
      control: 'object',
      description: 'Component-level preferences including i18n bundles for custom translations',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default SignOutButton with automatic translation support.
 * The button text will change based on the locale selected in the Storybook toolbar.
 */
export const Default: Story = {
  render: args => {
    const {t} = useI18n();
    const signOutText = t('elements.buttons.signOut');

    return <SignOutButton {...args}>{signOutText}</SignOutButton>;
  },
  args: {},
};

/**
 * SignOutButton with custom text that overrides the translation system.
 * This demonstrates how to provide custom text regardless of the current locale.
 */
export const WithCustomText: Story = {
  args: {
    children: 'Sign Out',
  },
};

/**
 * SignOutButton using the render props pattern.
 * This demonstrates advanced usage where you can access the signOut function and loading state.
 */
export const WithRenderProps: Story = {
  render: args => {
    const {t} = useI18n();
    const signOutText = t('elements.buttons.signOut');
    const loadingText = t('messages.loading');

    return (
      <SignOutButton
        {...args}
        children={({signOut, isLoading}) => (
          <button
            onClick={signOut}
            disabled={isLoading}
            style={{
              padding: '12px 24px',
              backgroundColor: isLoading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? loadingText : signOutText}
          </button>
        )}
      />
    );
  },
  args: {},
};

/**
 * SignOutButton with custom styling applied via className and inline styles.
 * This demonstrates how to customize the button's appearance.
 */
export const WithCustomStyling: Story = {
  render: args => {
    const {t} = useI18n();
    const signOutText = t('elements.buttons.signOut');

    return (
      <SignOutButton
        {...args}
        className="custom-sign-out-button"
        style={{
          backgroundColor: '#dc3545',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '6px',
          border: 'none',
          fontSize: '16px',
          fontWeight: 'bold',
        }}
      >
        {signOutText}
      </SignOutButton>
    );
  },
  args: {},
};

/**
 * SignOutButton in a disabled state.
 * This demonstrates the button's disabled appearance and behavior.
 */
export const Disabled: Story = {
  render: args => {
    const {t} = useI18n();
    const signOutText = t('elements.buttons.signOut');

    return (
      <SignOutButton {...args} disabled>
        {signOutText}
      </SignOutButton>
    );
  },
  args: {},
};

/**
 * SignOutButton with a custom onClick handler.
 * This demonstrates how to handle the click event and perform additional actions after sign out.
 */
export const WithOnClickHandler: Story = {
  render: args => {
    const {t} = useI18n();
    const signOutText = t('elements.buttons.signOut');

    return (
      <SignOutButton
        {...args}
        onClick={event => {
          console.log('Sign out completed!', event);
          alert('You have been signed out successfully!');
        }}
      >
        {signOutText}
      </SignOutButton>
    );
  },
  args: {},
};
