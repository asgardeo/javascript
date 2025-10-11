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
import Alert from './Alert';

const meta: Meta<typeof Alert> = {
  title: 'Components/Primitives/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['success', 'error', 'warning', 'info'],
      description: 'The visual variant of the alert that determines color scheme and icon',
    },
    showIcon: {
      control: 'boolean',
      description: 'Whether to show the default icon for the variant',
    },
    children: {
      control: 'text',
      description: 'Alert content',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'This is a default info alert.',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Your changes have been saved successfully!',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    children: 'Something went wrong. Please try again.',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Please review your information before proceeding.',
  },
};

export const Info: Story = {
  args: {
    variant: 'info',
    children: 'Here is some helpful information for you.',
  },
};

export const WithoutIcon: Story = {
  args: {
    variant: 'success',
    showIcon: false,
    children: 'Success message without icon.',
  },
};

export const WithTitle: Story = {
  args: {
    variant: 'success',
    children: (
      <>
        <Alert.Title>Success!</Alert.Title>
        Your changes have been saved successfully.
      </>
    ),
  },
};

export const WithDescription: Story = {
  args: {
    variant: 'info',
    children: (
      <>
        <Alert.Title>Information</Alert.Title>
        <Alert.Description>
          This is additional information that provides more context about the alert.
        </Alert.Description>
      </>
    ),
  },
};

export const ComplexContent: Story = {
  args: {
    variant: 'warning',
    children: (
      <>
        <Alert.Title>Account Verification Required</Alert.Title>
        <Alert.Description>
          Please verify your email address to continue using your account. Check your inbox for a verification link.
        </Alert.Description>
      </>
    ),
  },
};

export const LongContent: Story = {
  args: {
    variant: 'error',
    children: (
      <>
        <Alert.Title>Multiple Errors Detected</Alert.Title>
        <Alert.Description>
          The following errors were found in your submission:
          <ul style={{marginTop: '8px', paddingLeft: '20px'}}>
            <li>Email address is required</li>
            <li>Password must be at least 8 characters</li>
            <li>Phone number format is invalid</li>
          </ul>
          Please correct these errors and try again.
        </Alert.Description>
      </>
    ),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '16px', width: '400px'}}>
      <Alert variant="success">
        <Alert.Title>Success</Alert.Title>
        <Alert.Description>Operation completed successfully.</Alert.Description>
      </Alert>
      <Alert variant="error">
        <Alert.Title>Error</Alert.Title>
        <Alert.Description>An error occurred during the operation.</Alert.Description>
      </Alert>
      <Alert variant="warning">
        <Alert.Title>Warning</Alert.Title>
        <Alert.Description>Please review before proceeding.</Alert.Description>
      </Alert>
      <Alert variant="info">
        <Alert.Title>Information</Alert.Title>
        <Alert.Description>Here is some helpful information.</Alert.Description>
      </Alert>
    </div>
  ),
};

export const WithoutIcons: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '16px', width: '400px'}}>
      <Alert variant="success" showIcon={false}>
        <Alert.Title>Success</Alert.Title>
        <Alert.Description>Operation completed successfully.</Alert.Description>
      </Alert>
      <Alert variant="error" showIcon={false}>
        <Alert.Title>Error</Alert.Title>
        <Alert.Description>An error occurred during the operation.</Alert.Description>
      </Alert>
      <Alert variant="warning" showIcon={false}>
        <Alert.Title>Warning</Alert.Title>
        <Alert.Description>Please review before proceeding.</Alert.Description>
      </Alert>
      <Alert variant="info" showIcon={false}>
        <Alert.Title>Information</Alert.Title>
        <Alert.Description>Here is some helpful information.</Alert.Description>
      </Alert>
    </div>
  ),
};

export const SimpleTextOnly: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '16px', width: '400px'}}>
      <Alert variant="success">Simple success message</Alert>
      <Alert variant="error">Simple error message</Alert>
      <Alert variant="warning">Simple warning message</Alert>
      <Alert variant="info">Simple info message</Alert>
    </div>
  ),
};
