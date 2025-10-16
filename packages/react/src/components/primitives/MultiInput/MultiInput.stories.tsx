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
import MultiInput from './MultiInput';
import {User} from '../Icons';

const meta: Meta<typeof MultiInput> = {
  title: 'Components/Primitives/MultiInput',
  component: MultiInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text to display above the inputs',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for input fields',
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'tel', 'url', 'password', 'date', 'boolean'],
      description: 'Input type',
    },
    fieldType: {
      control: 'select',
      options: ['STRING', 'DATE_TIME', 'BOOLEAN'],
      description: 'Field type for different input components',
    },
    minFields: {
      control: 'number',
      description: 'Minimum number of fields to show',
    },
    maxFields: {
      control: 'number',
      description: 'Maximum number of fields to allow',
    },
    error: {
      control: 'text',
      description: 'Error message to display below the inputs',
    },
    helperText: {
      control: 'text',
      description: 'Helper text to display below the inputs',
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
      description: 'Callback when values change',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Add Items',
    values: [],
    onChange: (values: string[]) => console.log('Values changed:', values),
  },
};

export const WithInitialValues: Story = {
  args: {
    label: 'Tags',
    values: ['React', 'TypeScript', 'Storybook'],
    onChange: (values: string[]) => console.log('Values changed:', values),
  },
};

export const EmailType: Story = {
  args: {
    label: 'Email Addresses',
    type: 'email',
    placeholder: 'Enter email address',
    values: [],
    onChange: (values: string[]) => console.log('Emails changed:', values),
  },
};

export const Required: Story = {
  args: {
    label: 'Required Fields',
    required: true,
    values: [],
    onChange: (values: string[]) => console.log('Values changed:', values),
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Skills',
    helperText: 'Add your technical skills',
    values: [],
    onChange: (values: string[]) => console.log('Skills changed:', values),
  },
};

export const WithError: Story = {
  args: {
    label: 'Items',
    error: 'At least one item is required',
    values: [],
    onChange: (values: string[]) => console.log('Values changed:', values),
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Items',
    disabled: true,
    values: ['Item 1', 'Item 2'],
    onChange: (values: string[]) => console.log('Values changed:', values),
  },
};

export const WithMinFields: Story = {
  args: {
    label: 'Minimum 2 Items',
    minFields: 2,
    values: ['Item 1'],
    onChange: (values: string[]) => console.log('Values changed:', values),
  },
};

export const WithMaxFields: Story = {
  args: {
    label: 'Maximum 3 Items',
    maxFields: 3,
    values: ['Item 1', 'Item 2'],
    onChange: (values: string[]) => console.log('Values changed:', values),
  },
};

export const WithStartIcon: Story = {
  args: {
    label: 'Usernames',
    startIcon: <User width={16} height={16} />,
    values: [],
    onChange: (values: string[]) => console.log('Usernames changed:', values),
  },
};

export const WithEndIcon: Story = {
  args: {
    label: 'Email Addresses',
    endIcon: <User width={16} height={16} />,
    type: 'email',
    values: [],
    onChange: (values: string[]) => console.log('Emails changed:', values),
  },
};

export const DateType: Story = {
  args: {
    label: 'Important Dates',
    fieldType: 'DATE_TIME',
    values: [],
    onChange: (values: string[]) => console.log('Dates changed:', values),
  },
};

export const BooleanType: Story = {
  args: {
    label: 'Checklist Items',
    fieldType: 'BOOLEAN',
    values: ['true', 'false'],
    onChange: (values: string[]) => console.log('Checklist changed:', values),
  },
};

export const AllTypes: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>Text</h4>
        <MultiInput
          label="Text Items"
          type="text"
          values={[]}
          onChange={(values: string[]) => console.log('Text items:', values)}
        />
      </div>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>Email</h4>
        <MultiInput
          label="Email Addresses"
          type="email"
          values={[]}
          onChange={(values: string[]) => console.log('Email addresses:', values)}
        />
      </div>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>URL</h4>
        <MultiInput
          label="Website URLs"
          type="url"
          values={[]}
          onChange={(values: string[]) => console.log('URLs:', values)}
        />
      </div>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>Date</h4>
        <MultiInput
          label="Important Dates"
          fieldType="DATE_TIME"
          values={[]}
          onChange={(values: string[]) => console.log('Dates:', values)}
        />
      </div>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>Boolean</h4>
        <MultiInput
          label="Checklist Items"
          fieldType="BOOLEAN"
          values={[]}
          onChange={(values: string[]) => console.log('Checklist:', values)}
        />
      </div>
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>Default</h4>
        <MultiInput
          label="Default Items"
          values={[]}
          onChange={(values: string[]) => console.log('Default:', values)}
        />
      </div>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>Required</h4>
        <MultiInput
          label="Required Items"
          required
          values={[]}
          onChange={(values: string[]) => console.log('Required:', values)}
        />
      </div>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>With Helper Text</h4>
        <MultiInput
          label="Items with Helper"
          helperText="Add multiple items"
          values={[]}
          onChange={(values: string[]) => console.log('Helper text:', values)}
        />
      </div>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>With Error</h4>
        <MultiInput
          label="Items with Error"
          error="This field has an error"
          values={[]}
          onChange={(values: string[]) => console.log('Error:', values)}
        />
      </div>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>Disabled</h4>
        <MultiInput
          label="Disabled Items"
          disabled
          values={['Item 1', 'Item 2']}
          onChange={(values: string[]) => console.log('Disabled:', values)}
        />
      </div>
    </div>
  ),
};

export const WithConstraints: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>Minimum 2, Maximum 5</h4>
        <MultiInput
          label="Constrained Items"
          minFields={2}
          maxFields={5}
          values={['Item 1']}
          helperText="Add between 2 and 5 items"
          onChange={(values: string[]) => console.log('Constrained:', values)}
        />
      </div>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>Maximum 3 Items</h4>
        <MultiInput
          label="Limited Items"
          maxFields={3}
          values={['Item 1', 'Item 2']}
          helperText="Maximum 3 items allowed"
          onChange={(values: string[]) => console.log('Limited:', values)}
        />
      </div>
    </div>
  ),
};

export const ContactForm: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '400px',
        padding: '20px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
      }}
    >
      <h3 style={{margin: '0 0 16px 0'}}>Contact Information</h3>
      <MultiInput
        label="Phone Numbers"
        type="tel"
        placeholder="Enter phone number"
        helperText="Add multiple phone numbers"
        values={[]}
        onChange={(values: string[]) => console.log('Phone numbers:', values)}
      />
      <MultiInput
        label="Email Addresses"
        type="email"
        placeholder="Enter email address"
        helperText="Add multiple email addresses"
        values={[]}
        onChange={(values: string[]) => console.log('Email addresses:', values)}
      />
      <MultiInput
        label="Social Media Links"
        type="url"
        placeholder="Enter social media URL"
        helperText="Add your social media profiles"
        values={[]}
        onChange={(values: string[]) => console.log('Social links:', values)}
      />
    </div>
  ),
};

export const SkillsForm: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '400px',
        padding: '20px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
      }}
    >
      <h3 style={{margin: '0 0 16px 0'}}>Professional Skills</h3>
      <MultiInput
        label="Technical Skills"
        placeholder="Enter technical skill"
        helperText="Add your technical skills"
        values={['JavaScript', 'React', 'TypeScript']}
        onChange={(values: string[]) => console.log('Technical skills:', values)}
      />
      <MultiInput
        label="Soft Skills"
        placeholder="Enter soft skill"
        helperText="Add your soft skills"
        values={['Communication', 'Leadership']}
        onChange={(values: string[]) => console.log('Soft skills:', values)}
      />
      <MultiInput
        label="Languages"
        placeholder="Enter language"
        helperText="Add languages you speak"
        values={['English', 'Spanish']}
        onChange={(values: string[]) => console.log('Languages:', values)}
      />
    </div>
  ),
};
