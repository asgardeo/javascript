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
import PasswordField from './PasswordField';

const meta: Meta<typeof PasswordField> = {
  title: 'Components/Primitives/PasswordField',
  component: PasswordField,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text to display above the input',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the input',
    },
    error: {
      control: 'text',
      description: 'Error message to display below the input',
    },
    helperText: {
      control: 'text',
      description: 'Helper text to display below the input',
    },
    required: {
      control: 'boolean',
      description: 'Whether the field is required',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the field is disabled',
    },
    onChange: {
      action: 'changed',
      description: 'Callback function when the field value changes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter your password',
    onChange: (value: string) => console.log('Password changed:', value),
  },
};

export const WithLabel: Story = {
  args: {
    label: 'New Password',
    placeholder: 'Enter your new password',
    onChange: (value: string) => console.log('Password changed:', value),
  },
};

export const Required: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter your password',
    required: true,
    onChange: (value: string) => console.log('Password changed:', value),
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter your password',
    helperText: 'Password must be at least 8 characters long',
    onChange: (value: string) => console.log('Password changed:', value),
  },
};

export const WithError: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter your password',
    error: 'Password must be at least 8 characters long',
    required: true,
    onChange: (value: string) => console.log('Password changed:', value),
  },
};

export const Disabled: Story = {
  args: {
    label: 'Password',
    placeholder: 'Password field is disabled',
    disabled: true,
    onChange: (value: string) => console.log('Password changed:', value),
  },
};

export const ConfirmPassword: Story = {
  args: {
    label: 'Confirm Password',
    placeholder: 'Confirm your password',
    helperText: 'Re-enter your password to confirm',
    onChange: (value: string) => console.log('Confirm password changed:', value),
  },
};

export const CurrentPassword: Story = {
  args: {
    label: 'Current Password',
    placeholder: 'Enter your current password',
    helperText: 'Enter your current password to verify your identity',
    onChange: (value: string) => console.log('Current password changed:', value),
  },
};

export const WithoutLabel: Story = {
  args: {
    placeholder: 'Enter password',
    onChange: (value: string) => console.log('Password changed:', value),
  },
};

export const LoginForm: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '300px',
        padding: '20px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
      }}
    >
      <h3 style={{margin: '0 0 16px 0'}}>Sign In</h3>
      <PasswordField
        label="Password"
        placeholder="Enter your password"
        required
        onChange={(value: string) => console.log('Password changed:', value)}
      />
    </div>
  ),
};

export const RegistrationForm: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '300px',
        padding: '20px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
      }}
    >
      <h3 style={{margin: '0 0 16px 0'}}>Create Account</h3>
      <PasswordField
        label="Password"
        placeholder="Create a password"
        required
        helperText="Must be at least 8 characters with uppercase, lowercase, and number"
        onChange={(value: string) => console.log('Password changed:', value)}
      />
      <PasswordField
        label="Confirm Password"
        placeholder="Confirm your password"
        required
        helperText="Re-enter your password to confirm"
        onChange={(value: string) => console.log('Confirm password changed:', value)}
      />
    </div>
  ),
};

export const PasswordChangeForm: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '300px',
        padding: '20px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
      }}
    >
      <h3 style={{margin: '0 0 16px 0'}}>Change Password</h3>
      <PasswordField
        label="Current Password"
        placeholder="Enter current password"
        required
        onChange={(value: string) => console.log('Current password changed:', value)}
      />
      <PasswordField
        label="New Password"
        placeholder="Enter new password"
        required
        helperText="Must be different from your current password"
        onChange={(value: string) => console.log('New password changed:', value)}
      />
      <PasswordField
        label="Confirm New Password"
        placeholder="Confirm new password"
        required
        onChange={(value: string) => console.log('Confirm new password changed:', value)}
      />
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '16px', width: '300px'}}>
      <PasswordField
        label="Default"
        placeholder="Default password field"
        onChange={(value: string) => console.log('Default changed:', value)}
      />
      <PasswordField
        label="Required"
        placeholder="Required password field"
        required
        onChange={(value: string) => console.log('Required changed:', value)}
      />
      <PasswordField
        label="With Helper Text"
        placeholder="Password with helper text"
        helperText="This is helper text"
        onChange={(value: string) => console.log('Helper text changed:', value)}
      />
      <PasswordField
        label="With Error"
        placeholder="Password with error"
        error="This field has an error"
        onChange={(value: string) => console.log('Error changed:', value)}
      />
      <PasswordField
        label="Disabled"
        placeholder="Disabled password field"
        disabled
        onChange={(value: string) => console.log('Disabled changed:', value)}
      />
    </div>
  ),
};
