/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
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
import CreateOrganization from './CreateOrganization';
import {CreateOrganizationPayload} from '@asgardeo/browser';
import {BaseCreateOrganization} from './BaseCreateOrganization';

const meta: Meta<typeof BaseCreateOrganization> = {
  title: 'Components/Presentation/CreateOrganization',
  component: BaseCreateOrganization,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onSubmit: {
      action: 'organizationCreated',
      description: 'Function called when the form is submitted',
    },
    onSuccess: {
      action: 'creationSuccess',
      description: 'Callback function called after successful organization creation',
    },
    onCancel: {
      action: 'creationCancelled',
      description: 'Callback function called when organization creation is cancelled',
    },
    defaultParentId: {
      control: 'text',
      description: 'Default parent organization ID for the new organization',
    },
    mode: {
      control: 'select',
      options: ['inline', 'popup'],
      description: 'Display mode for the component',
    },
    open: {
      control: 'boolean',
      description: 'Whether the popup is open (only used in popup mode)',
    },
    onOpenChange: {
      action: 'openChanged',
      description: 'Callback fired when the popup should be closed (only used in popup mode)',
    },
    title: {
      control: 'text',
      description: 'Title for the popup dialog (only used in popup mode)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock organization creation handler
const mockCreateOrganization = async (payload: CreateOrganizationPayload): Promise<void> => {
  console.log('Mock organization creation:', payload);
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('Organization created:', {
    id: 'org-' + Date.now(),
    name: payload.name,
    description: payload.description,
    status: 'ACTIVE',
    created: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    memberCount: 1,
    role: 'OWNER',
  });
};

/**
 * Default CreateOrganization component in inline mode.
 * This story demonstrates the basic usage of the component.
 */
export const Default: Story = {
  args: {
    onSubmit: mockCreateOrganization,
    onSuccess: organization => {
      console.log('Organization created:', organization);
      alert(`Organization created successfully!`);
    },
  },
  render: args => (
    <div>
      <BaseCreateOrganization {...args} />
    </div>
  ),
};

/**
 * CreateOrganization component in popup mode.
 * This story demonstrates the component as a popup dialog.
 */
export const PopupMode: Story = {
  args: {
    mode: 'popup',
    open: true,
    title: 'Create New Organization',
    onSubmit: mockCreateOrganization,
    onSuccess: organization => {
      console.log('Organization created:', organization);
      alert(`Organization created successfully!`);
    },
  },
  render: args => (
    <div>
      <BaseCreateOrganization {...args} />
    </div>
  ),
};

/**
 * CreateOrganization component with custom fallback.
 * This story demonstrates the component with a custom fallback element.
 */
export const WithCustomFallback: Story = {
  args: {
    fallback: (
      <div style={{textAlign: 'center', padding: '20px', color: '#666'}}>
        <h3>Sign In Required</h3>
        <p>Please sign in to create an organization</p>
        <button style={{padding: '8px 16px', marginTop: '10px'}}>Sign In</button>
      </div>
    ),
  },
  render: args => (
    <div>
      <BaseCreateOrganization {...args} />
    </div>
  ),
};

/**
 * CreateOrganization component with success callback.
 * This story demonstrates the component with a success handler.
 */
export const WithSuccessCallback: Story = {
  args: {
    onSuccess: organization => {
      console.log('Organization created:', organization);
      alert(`Organization "${organization.name}" created successfully!`);
    },
  },
  render: args => (
    <div>
      <BaseCreateOrganization {...args} />
    </div>
  ),
};

/**
 * CreateOrganization component with cancel callback.
 * This story demonstrates the component with a cancel handler.
 */
export const WithCancelCallback: Story = {
  args: {
    onCancel: () => {
      console.log('Organization creation cancelled');
      alert('Organization creation was cancelled');
    },
  },
  render: args => (
    <div>
      <BaseCreateOrganization {...args} />
    </div>
  ),
};

/**
 * CreateOrganization component with custom organization creation handler.
 * This story demonstrates the component with a custom API handler.
 */
export const WithCustomHandler: Story = {
  args: {
    onCreateOrganization: async (payload: CreateOrganizationPayload) => {
      console.log('Custom organization creation:', payload);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        id: 'custom-org-123',
        name: payload.name,
        description: payload.description,
        status: 'ACTIVE',
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        memberCount: 1,
        role: 'OWNER',
      };
    },
    onSuccess: organization => {
      console.log('Custom organization created:', organization);
      alert(`Custom organization "${organization.name}" created!`);
    },
  },
  render: args => (
    <div>
      <BaseCreateOrganization {...args} />
    </div>
  ),
};

/**
 * CreateOrganization component with default parent ID.
 * This story demonstrates the component with a specific parent organization.
 */
export const WithDefaultParentId: Story = {
  args: {
    defaultParentId: 'parent-org-123',
    onSuccess: organization => {
      console.log('Organization created with parent:', organization);
      alert(`Organization created under parent organization!`);
    },
  },
  render: args => (
    <div>
      <BaseCreateOrganization {...args} />
    </div>
  ),
};

/**
 * CreateOrganization component with custom styling.
 * This story demonstrates how to apply custom styling to the component.
 */
export const WithCustomStyling: Story = {
  args: {
    className: 'custom-create-organization',
  },
  render: args => (
    <div>
      <style>
        {`
          .custom-create-organization {
            border: 2px solid #20c997;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(32, 201, 151, 0.15);
          }
        `}
      </style>
      <BaseCreateOrganization {...args} />
    </div>
  ),
};

/**
 * CreateOrganization component with form validation demonstration.
 * This story demonstrates the component's form validation features.
 */
export const WithFormValidation: Story = {
  args: {
    onSuccess: organization => {
      console.log('Organization created with validation:', organization);
      alert('Organization created successfully with proper validation!');
    },
  },
  render: args => (
    <div>
      <div
        style={{
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#e7f3ff',
          borderRadius: '8px',
          border: '1px solid #b3d9ff',
        }}
      >
        <h4 style={{margin: '0 0 10px 0', color: '#0066cc'}}>Form Validation</h4>
        <p style={{margin: '0', fontSize: '14px', color: '#0066cc'}}>
          This form includes validation for required fields, email format, and organization name uniqueness.
        </p>
      </div>
      <BaseCreateOrganization {...args} />
    </div>
  ),
};
