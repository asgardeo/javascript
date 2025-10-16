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
import TextField from './TextField';
import {User, Eye} from '../Icons';

const meta: Meta<typeof TextField> = {
  title: 'Components/Primitives/TextField',
  component: TextField,
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
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
      description: 'The type of input',
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
    readOnly: {
      control: 'boolean',
      description: 'Whether the field is read-only',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Label',
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Full Name',
    placeholder: 'Enter your full name',
  },
};

export const Required: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email',
    required: true,
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Username',
    placeholder: 'Choose a username',
    helperText: 'Must be at least 3 characters long',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email',
    error: 'Please enter a valid email address',
    required: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Field',
    placeholder: 'This field is disabled',
    disabled: true,
  },
};

export const ReadOnly: Story = {
  args: {
    label: 'Read Only Field',
    value: 'This value cannot be changed',
    readOnly: true,
  },
};

export const Email: Story = {
  args: {
    label: 'Email',
    type: 'email',
    placeholder: 'user@example.com',
  },
};

export const Password: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password',
  },
};

export const Number: Story = {
  args: {
    label: 'Age',
    type: 'number',
    placeholder: 'Enter your age',
  },
};

export const SearchField: Story = {
  args: {
    label: 'Search',
    type: 'search',
    placeholder: 'Search...',
  },
};

export const WithStartIcon: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter username',
    startIcon: <User width={16} height={16} />,
  },
};

export const WithEndIcon: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search...',
    endIcon: <Eye width={16} height={16} />,
  },
};

export const WithBothIcons: Story = {
  args: {
    label: 'Search Users',
    placeholder: 'Search by username or email',
    startIcon: <User width={16} height={16} />,
    endIcon: <Eye width={16} height={16} />,
  },
};

export const ClickableEndIcon: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password',
    endIcon: <Eye width={16} height={16} />,
    onEndIconClick: () => alert('Toggle password visibility'),
  },
};

export const WithoutLabel: Story = {
  args: {
    placeholder: 'No label field',
  },
};

export const AllStates: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '16px', width: '300px'}}>
      <TextField label="Default" placeholder="Default state" />
      <TextField label="Required" placeholder="Required field" required />
      <TextField label="With Helper Text" placeholder="Helper text example" helperText="This is helper text" />
      <TextField label="With Error" placeholder="Error state" error="This field has an error" />
      <TextField label="Disabled" placeholder="Disabled field" disabled />
      <TextField label="Read Only" value="Read only value" readOnly />
    </div>
  ),
};

export const AllTypes: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '16px', width: '300px'}}>
      <TextField label="Text" type="text" placeholder="Text input" />
      <TextField label="Email" type="email" placeholder="Email input" />
      <TextField label="Password" type="password" placeholder="Password input" />
      <TextField label="Number" type="number" placeholder="Number input" />
      <TextField label="Tel" type="tel" placeholder="Phone number" />
      <TextField label="URL" type="url" placeholder="Website URL" />
      <TextField label="Search" type="search" placeholder="Search input" />
    </div>
  ),
};
