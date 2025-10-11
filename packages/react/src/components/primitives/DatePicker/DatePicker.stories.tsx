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
import DatePicker from './DatePicker';

const meta: Meta<typeof DatePicker> = {
  title: 'Components/Primitives/DatePicker',
  component: DatePicker,
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
    value: {
      control: 'text',
      description: 'The value of the input',
    },
    min: {
      control: 'text',
      description: 'Minimum date allowed',
    },
    max: {
      control: 'text',
      description: 'Maximum date allowed',
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
    dateFormat: {
      control: 'text',
      description: 'Custom date format for the regex pattern',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithLabel: Story = {
  args: {
    label: 'Select Date',
  },
};

export const Required: Story = {
  args: {
    label: 'Birth Date',
    required: true,
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Event Date',
    helperText: 'Select the date for your event',
  },
};

export const WithError: Story = {
  args: {
    label: 'Due Date',
    error: 'Please select a valid date',
    required: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Date',
    disabled: true,
  },
};

export const WithMinDate: Story = {
  args: {
    label: 'Future Date',
    min: '2024-01-01',
    helperText: 'Select a date from 2024 onwards',
  },
};

export const WithMaxDate: Story = {
  args: {
    label: 'Past Date',
    max: '2023-12-31',
    helperText: 'Select a date before 2024',
  },
};

export const WithDateRange: Story = {
  args: {
    label: 'Date Range',
    min: '2024-01-01',
    max: '2024-12-31',
    helperText: 'Select a date within 2024',
  },
};

export const WithDefaultValue: Story = {
  args: {
    label: 'Default Date',
    defaultValue: '2024-06-15',
  },
};

export const CustomDateFormat: Story = {
  args: {
    label: 'Custom Format',
    dateFormat: 'dd/MM/yyyy',
    helperText: 'Date format: dd/MM/yyyy',
  },
};

export const AllStates: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '16px', width: '300px'}}>
      <DatePicker label="Default" />
      <DatePicker label="Required" required />
      <DatePicker label="With Helper Text" helperText="This is helper text" />
      <DatePicker label="With Error" error="This field has an error" />
      <DatePicker label="Disabled" disabled />
    </div>
  ),
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
      <h3 style={{margin: '0 0 16px 0'}}>Event Registration</h3>
      <DatePicker label="Event Date" required min="2024-01-01" helperText="Select the date for your event" />
      <DatePicker label="Registration Deadline" required helperText="Last date to register" />
      <DatePicker label="Birth Date" max="2010-12-31" helperText="Must be 14 years or older" />
    </div>
  ),
};

export const BookingForm: Story = {
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
      <h3 style={{margin: '0 0 16px 0'}}>Hotel Booking</h3>
      <DatePicker label="Check-in Date" required min="2024-01-01" helperText="Select your check-in date" />
      <DatePicker label="Check-out Date" required min="2024-01-02" helperText="Select your check-out date" />
      <DatePicker label="Special Occasion" helperText="Optional: Select if celebrating a special occasion" />
    </div>
  ),
};

export const DateConstraints: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '16px', width: '300px'}}>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>Future Dates Only</h4>
        <DatePicker label="Future Date" min="2024-01-01" helperText="Select a date from 2024 onwards" />
      </div>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>Past Dates Only</h4>
        <DatePicker label="Past Date" max="2023-12-31" helperText="Select a date before 2024" />
      </div>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>Date Range</h4>
        <DatePicker label="Date Range" min="2024-01-01" max="2024-12-31" helperText="Select a date within 2024" />
      </div>
    </div>
  ),
};
