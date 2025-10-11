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
import KeyValueInput from './KeyValueInput';

const meta: Meta<typeof KeyValueInput> = {
  title: 'Components/Primitives/KeyValueInput',
  component: KeyValueInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label for the component',
    },
    keyLabel: {
      control: 'text',
      description: 'Label for the key input field',
    },
    valueLabel: {
      control: 'text',
      description: 'Label for the value input field',
    },
    keyPlaceholder: {
      control: 'text',
      description: 'Placeholder text for the key input field',
    },
    valuePlaceholder: {
      control: 'text',
      description: 'Placeholder text for the value input field',
    },
    maxPairs: {
      control: 'number',
      description: 'Maximum number of key-value pairs allowed',
    },
    error: {
      control: 'text',
      description: 'Error message to display',
    },
    helperText: {
      control: 'text',
      description: 'Help text to display below the input',
    },
    required: {
      control: 'boolean',
      description: 'Whether the component is required',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    readOnly: {
      control: 'boolean',
      description: 'Whether the component is in read-only mode',
    },
    removeButtonText: {
      control: 'text',
      description: 'Text for the remove button',
    },
    onChange: {
      action: 'changed',
      description: 'Callback fired when the key-value pairs change',
    },
    onAdd: {
      action: 'added',
      description: 'Callback fired when a pair is added',
    },
    onRemove: {
      action: 'removed',
      description: 'Callback fired when a pair is removed',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Key-Value Pairs',
    onChange: pairs => console.log('Pairs changed:', pairs),
  },
};

export const WithInitialValues: Story = {
  args: {
    label: 'Organization Attributes',
    value: {
      department: 'IT',
      location: 'New York',
      team: 'Frontend',
    },
    onChange: pairs => console.log('Pairs changed:', pairs),
  },
};

export const WithArrayValue: Story = {
  args: {
    label: 'Array Values',
    value: [
      {key: 'name', value: 'John Doe'},
      {key: 'age', value: '30'},
      {key: 'city', value: 'San Francisco'},
    ],
    onChange: pairs => console.log('Pairs changed:', pairs),
  },
};

export const Required: Story = {
  args: {
    label: 'Required Attributes',
    required: true,
    onChange: pairs => console.log('Pairs changed:', pairs),
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'User Preferences',
    helperText: 'Add key-value pairs for user preferences',
    onChange: pairs => console.log('Pairs changed:', pairs),
  },
};

export const WithError: Story = {
  args: {
    label: 'Invalid Attributes',
    error: 'Please provide valid key-value pairs',
    onChange: pairs => console.log('Pairs changed:', pairs),
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Attributes',
    disabled: true,
    value: {
      readonly: 'true',
      locked: 'false',
    },
    onChange: pairs => console.log('Pairs changed:', pairs),
  },
};

export const ReadOnly: Story = {
  args: {
    label: 'Read-Only Attributes',
    readOnly: true,
    value: {
      created: '2024-01-01',
      modified: '2024-01-15',
      version: '1.0.0',
    },
    onChange: pairs => console.log('Pairs changed:', pairs),
  },
};

export const WithMaxPairs: Story = {
  args: {
    label: 'Limited Attributes',
    maxPairs: 3,
    helperText: 'Maximum 3 pairs allowed',
    onChange: pairs => console.log('Pairs changed:', pairs),
  },
};

export const CustomLabels: Story = {
  args: {
    label: 'Custom Labels',
    keyLabel: 'Property',
    valueLabel: 'Setting',
    keyPlaceholder: 'Enter property name',
    valuePlaceholder: 'Enter property value',
    onChange: pairs => console.log('Pairs changed:', pairs),
  },
};

export const CustomRemoveText: Story = {
  args: {
    label: 'Custom Remove Text',
    removeButtonText: 'Delete',
    value: {
      item1: 'value1',
      item2: 'value2',
    },
    onChange: pairs => console.log('Pairs changed:', pairs),
  },
};

export const AllStates: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>Default</h4>
        <KeyValueInput label="Default State" onChange={pairs => console.log('Default:', pairs)} />
      </div>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>Required</h4>
        <KeyValueInput label="Required State" required onChange={pairs => console.log('Required:', pairs)} />
      </div>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>With Helper Text</h4>
        <KeyValueInput
          label="Helper Text State"
          helperText="This is helper text"
          onChange={pairs => console.log('Helper text:', pairs)}
        />
      </div>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>With Error</h4>
        <KeyValueInput
          label="Error State"
          error="This field has an error"
          onChange={pairs => console.log('Error:', pairs)}
        />
      </div>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>Disabled</h4>
        <KeyValueInput
          label="Disabled State"
          disabled
          value={{disabled: 'true'}}
          onChange={pairs => console.log('Disabled:', pairs)}
        />
      </div>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>Read Only</h4>
        <KeyValueInput
          label="Read Only State"
          readOnly
          value={{readonly: 'true'}}
          onChange={pairs => console.log('Read only:', pairs)}
        />
      </div>
    </div>
  ),
};

export const WithCallbacks: Story = {
  args: {
    label: 'With Callbacks',
    value: {
      initial: 'value',
    },
    onChange: pairs => console.log('Pairs changed:', pairs),
    onAdd: pair => console.log('Pair added:', pair),
    onRemove: (pair, index) => console.log('Pair removed:', pair, 'at index:', index),
  },
};

export const ConfigurationForm: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '500px',
        padding: '20px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
      }}
    >
      <h3 style={{margin: '0 0 16px 0'}}>Application Configuration</h3>
      <KeyValueInput
        label="Environment Variables"
        keyLabel="Variable"
        valueLabel="Value"
        keyPlaceholder="e.g., API_URL"
        valuePlaceholder="e.g., https://api.example.com"
        helperText="Add environment variables for your application"
        onChange={pairs => console.log('Environment variables:', pairs)}
      />
      <KeyValueInput
        label="Feature Flags"
        keyLabel="Feature"
        valueLabel="Enabled"
        keyPlaceholder="e.g., dark_mode"
        valuePlaceholder="e.g., true"
        helperText="Configure feature flags for your application"
        onChange={pairs => console.log('Feature flags:', pairs)}
      />
      <KeyValueInput
        label="Custom Settings"
        keyLabel="Setting"
        valueLabel="Value"
        keyPlaceholder="Enter setting name"
        valuePlaceholder="Enter setting value"
        maxPairs={5}
        helperText="Add up to 5 custom settings"
        onChange={pairs => console.log('Custom settings:', pairs)}
      />
    </div>
  ),
};

export const UserProfileForm: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '500px',
        padding: '20px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
      }}
    >
      <h3 style={{margin: '0 0 16px 0'}}>User Profile</h3>
      <KeyValueInput
        label="Contact Information"
        keyLabel="Type"
        valueLabel="Contact"
        keyPlaceholder="e.g., phone, email"
        valuePlaceholder="e.g., +1234567890"
        helperText="Add multiple contact methods"
        value={{
          phone: '+1234567890',
          email: 'user@example.com',
        }}
        onChange={pairs => console.log('Contact info:', pairs)}
      />
      <KeyValueInput
        label="Social Media Links"
        keyLabel="Platform"
        valueLabel="URL"
        keyPlaceholder="e.g., LinkedIn, Twitter"
        valuePlaceholder="e.g., https://linkedin.com/in/user"
        helperText="Add your social media profiles"
        onChange={pairs => console.log('Social links:', pairs)}
      />
      <KeyValueInput
        label="Skills & Expertise"
        keyLabel="Skill"
        valueLabel="Level"
        keyPlaceholder="e.g., JavaScript, Python"
        valuePlaceholder="e.g., Expert, Intermediate"
        helperText="Add your skills and proficiency levels"
        onChange={pairs => console.log('Skills:', pairs)}
      />
    </div>
  ),
};

export const EmptyReadOnly: Story = {
  args: {
    label: 'Empty Read-Only',
    readOnly: true,
    value: {},
    onChange: pairs => console.log('Pairs changed:', pairs),
  },
};
