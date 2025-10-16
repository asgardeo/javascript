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
import SignInButton from './SignInButton';
import useI18n from '../../../contexts/I18n/useI18n';

const meta: Meta<typeof SignInButton> = {
  title: 'Components/Actions/SignInButton',
  component: SignInButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description:
        'Custom text to display on the button. If not provided, uses translation key "elements.buttons.signIn"',
    },
    onClick: {
      action: 'clicked',
      description: 'Callback function called after successful sign in',
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
    signInOptions: {
      control: 'object',
      description: 'Additional parameters to pass to the authorize request',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default SignInButton with automatic translation support.
 * The button text will change based on the locale selected in the Storybook toolbar.
 */
export const Default: Story = {
  render: args => {
    const {t} = useI18n();
    const signInText = t('elements.buttons.signIn');

    return <SignInButton {...args}>{signInText}</SignInButton>;
  },
  args: {},
};

/**
 * SignInButton with custom text that overrides the translation system.
 * This demonstrates how to provide custom text regardless of the current locale.
 */
export const WithCustomText: Story = {
  args: {
    children: 'Sign In',
  },
};

/**
 * SignInButton using the render props pattern.
 * This demonstrates advanced usage where you can access the signIn function and loading state.
 */
export const WithRenderProps: Story = {
  render: args => {
    const {t} = useI18n();
    const signInText = t('elements.buttons.signIn');
    const loadingText = t('messages.loading');

    return (
      <SignInButton
        {...args}
        children={({signIn, isLoading}) => (
          <button
            onClick={signIn}
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
            {isLoading ? loadingText : signInText}
          </button>
        )}
      />
    );
  },
  args: {},
};

/**
 * SignInButton with custom styling applied via className and inline styles.
 * This demonstrates how to customize the button's appearance.
 */
export const WithCustomStyling: Story = {
  render: args => {
    const {t} = useI18n();
    const signInText = t('elements.buttons.signIn');

    return (
      <SignInButton
        {...args}
        className="custom-sign-in-button"
        style={{
          backgroundColor: '#28a745',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '6px',
          border: 'none',
          fontSize: '16px',
          fontWeight: 'bold',
        }}
      >
        {signInText}
      </SignInButton>
    );
  },
  args: {},
};

/**
 * SignInButton in a disabled state.
 * This demonstrates the button's disabled appearance and behavior.
 */
export const Disabled: Story = {
  render: args => {
    const {t} = useI18n();
    const signInText = t('elements.buttons.signIn');

    return (
      <SignInButton {...args} disabled>
        {signInText}
      </SignInButton>
    );
  },
  args: {},
};

/**
 * SignInButton with a custom onClick handler.
 * This demonstrates how to handle the click event and perform additional actions after sign in.
 */
export const WithOnClickHandler: Story = {
  render: args => {
    const {t} = useI18n();
    const signInText = t('elements.buttons.signIn');

    return (
      <SignInButton
        {...args}
        onClick={event => {
          console.log('Sign in completed!', event);
          alert('You have been signed in successfully!');
        }}
      >
        {signInText}
      </SignInButton>
    );
  },
  args: {},
};

/**
 * SignInButton with custom sign-in options.
 * This demonstrates how to pass additional parameters to the authorize request.
 */
export const WithSignInOptions: Story = {
  render: args => {
    const {t} = useI18n();
    const signInText = t('elements.buttons.signIn');

    return (
      <SignInButton
        {...args}
        signInOptions={{
          prompt: 'login',
          scope: 'openid profile email',
        }}
      >
        {signInText}
      </SignInButton>
    );
  },
  args: {},
};

/**
 * SignInButton with component-level i18n preferences.
 * This demonstrates how to override translations at the component level.
 */
export const WithCustomTranslations: Story = {
  render: args => {
    return (
      <SignInButton
        {...args}
        preferences={{
          i18n: {
            bundles: {
              'en-US': {
                metadata: {
                  localeCode: 'en-US',
                  countryCode: 'US',
                  languageCode: 'en',
                  displayName: 'English (United States)',
                  direction: 'ltr',
                },
                translations: {
                  'elements.buttons.signIn': 'Custom Sign In Text',
                } as any, // Type assertion to avoid requiring all translation keys
              },
            },
          },
        }}
      />
    );
  },
  args: {},
};
