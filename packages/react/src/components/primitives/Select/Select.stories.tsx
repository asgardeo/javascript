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
import Select from './Select';

const meta: Meta<typeof Select> = {
  title: 'Components/Primitives/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text to display above the select',
    },
    error: {
      control: 'text',
      description: 'Error message to display below the select',
    },
    helperText: {
      control: 'text',
      description: 'Helper text to display below the select',
    },
    required: {
      control: 'boolean',
      description: 'Whether the field is required',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the field is disabled',
    },
    multiple: {
      control: 'boolean',
      description: 'Whether multiple options can be selected',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const basicOptions = [
  {value: 'option1', label: 'Option 1'},
  {value: 'option2', label: 'Option 2'},
  {value: 'option3', label: 'Option 3'},
  {value: 'option4', label: 'Option 4'},
];

const countryOptions = [
  {value: 'us', label: 'United States'},
  {value: 'ca', label: 'Canada'},
  {value: 'uk', label: 'United Kingdom'},
  {value: 'de', label: 'Germany'},
  {value: 'fr', label: 'France'},
  {value: 'jp', label: 'Japan'},
  {value: 'au', label: 'Australia'},
];

const priorityOptions = [
  {value: 'low', label: 'Low Priority'},
  {value: 'medium', label: 'Medium Priority'},
  {value: 'high', label: 'High Priority'},
  {value: 'urgent', label: 'Urgent'},
];

export const Default: Story = {
  args: {
    options: basicOptions,
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Choose an option',
    options: basicOptions,
  },
};

export const Required: Story = {
  args: {
    label: 'Country',
    options: countryOptions,
    required: true,
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Priority Level',
    options: priorityOptions,
    helperText: 'Select the priority level for this task',
  },
};

export const WithError: Story = {
  args: {
    label: 'Country',
    options: countryOptions,
    error: 'Please select a country',
    required: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Select',
    options: basicOptions,
    disabled: true,
  },
};

export const WithDefaultValue: Story = {
  args: {
    label: 'Country',
    options: countryOptions,
    defaultValue: 'us',
  },
};

export const Multiple: Story = {
  args: {
    label: 'Select Multiple Countries',
    options: countryOptions,
    multiple: true,
    helperText: 'Hold Ctrl/Cmd to select multiple options',
  },
};

export const WithoutLabel: Story = {
  args: {
    options: basicOptions,
  },
};

export const LongOptions: Story = {
  args: {
    label: 'Select a Long Option',
    options: [
      {value: 'option1', label: 'This is a very long option text that might wrap or be truncated'},
      {value: 'option2', label: 'Another long option with descriptive text'},
      {value: 'option3', label: 'Short option'},
      {value: 'option4', label: 'Yet another option with medium length text'},
    ],
  },
};

export const AllStates: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '16px', width: '300px'}}>
      <Select label="Default" options={basicOptions} />
      <Select label="Required" options={basicOptions} required />
      <Select label="With Helper Text" options={basicOptions} helperText="This is helper text" />
      <Select label="With Error" options={basicOptions} error="This field has an error" />
      <Select label="Disabled" options={basicOptions} disabled />
    </div>
  ),
};

export const CountrySelector: Story = {
  args: {
    label: 'Select Country',
    options: countryOptions,
    helperText: 'Choose your country of residence',
  },
};

export const PrioritySelector: Story = {
  args: {
    label: 'Task Priority',
    options: priorityOptions,
    required: true,
    helperText: 'Select the priority level for this task',
  },
};

export const FormExample: Story = {
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
      <h3 style={{margin: '0 0 16px 0'}}>User Registration</h3>
      <Select label="Country" options={countryOptions} required helperText="Select your country" />
      <Select label="Priority Level" options={priorityOptions} helperText="How urgent is this request?" />
      <Select
        label="Newsletter Subscription"
        options={[
          {value: 'daily', label: 'Daily Newsletter'},
          {value: 'weekly', label: 'Weekly Newsletter'},
          {value: 'monthly', label: 'Monthly Newsletter'},
          {value: 'none', label: 'No Newsletter'},
        ]}
        helperText="Choose your newsletter preference"
      />
    </div>
  ),
};
