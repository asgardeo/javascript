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
import FormControl from './FormControl';
import InputLabel from '../InputLabel/InputLabel';
import TextField from '../TextField/TextField';

const meta: Meta<typeof FormControl> = {
  title: 'Components/Primitives/FormControl',
  component: FormControl,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    error: {
      control: 'text',
      description: 'Error message to display below the content',
    },
    helperText: {
      control: 'text',
      description: 'Helper text to display below the content',
    },
    helperTextAlign: {
      control: 'select',
      options: ['left', 'center'],
      description: 'Custom alignment for helper text',
    },
    helperTextMarginLeft: {
      control: 'text',
      description: 'Custom margin left for helper text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <input
        type="text"
        placeholder="Enter text"
        style={{padding: '8px', border: '1px solid #ccc', borderRadius: '4px'}}
      />
    ),
  },
};

export const WithHelperText: Story = {
  args: {
    children: (
      <input
        type="text"
        placeholder="Enter text"
        style={{padding: '8px', border: '1px solid #ccc', borderRadius: '4px'}}
      />
    ),
    helperText: 'This is helper text',
  },
};

export const WithError: Story = {
  args: {
    children: (
      <input
        type="text"
        placeholder="Enter text"
        style={{padding: '8px', border: '1px solid #ccc', borderRadius: '4px'}}
      />
    ),
    error: 'This field has an error',
  },
};

export const WithLabel: Story = {
  args: {
    children: (
      <>
        <InputLabel>Field Label</InputLabel>
        <input
          type="text"
          placeholder="Enter text"
          style={{padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginTop: '4px'}}
        />
      </>
    ),
    helperText: 'This is helper text',
  },
};

export const CenterAlignedHelperText: Story = {
  args: {
    children: (
      <input
        type="text"
        placeholder="Enter text"
        style={{padding: '8px', border: '1px solid #ccc', borderRadius: '4px'}}
      />
    ),
    helperText: 'Center aligned helper text',
    helperTextAlign: 'center',
  },
};

export const WithCustomMargin: Story = {
  args: {
    children: (
      <>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <input type="checkbox" />
          <span>Checkbox option</span>
        </div>
      </>
    ),
    helperText: 'Helper text with custom margin',
    helperTextMarginLeft: '24px',
  },
};

export const TextFieldExample: Story = {
  args: {
    children: (
      <>
        <InputLabel>Email Address</InputLabel>
        <TextField placeholder="Enter your email" />
      </>
    ),
    helperText: 'We will never share your email with anyone else',
  },
};

export const ErrorState: Story = {
  args: {
    children: (
      <>
        <InputLabel error>Email Address</InputLabel>
        <TextField placeholder="Enter your email" />
      </>
    ),
    error: 'Please enter a valid email address',
  },
};

export const RequiredField: Story = {
  args: {
    children: (
      <>
        <InputLabel required>Password</InputLabel>
        <TextField type="password" placeholder="Enter your password" />
      </>
    ),
    helperText: 'Password must be at least 8 characters long',
  },
};

export const AllStates: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '24px', width: '300px'}}>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>Default</h4>
        <FormControl>
          <InputLabel>Default Field</InputLabel>
          <input
            type="text"
            placeholder="Enter text"
            style={{padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginTop: '4px', width: '100%'}}
          />
        </FormControl>
      </div>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>With Helper Text</h4>
        <FormControl helperText="This is helper text">
          <InputLabel>Field with Helper</InputLabel>
          <input
            type="text"
            placeholder="Enter text"
            style={{padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginTop: '4px', width: '100%'}}
          />
        </FormControl>
      </div>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>With Error</h4>
        <FormControl error="This field has an error">
          <InputLabel error>Field with Error</InputLabel>
          <input
            type="text"
            placeholder="Enter text"
            style={{padding: '8px', border: '1px solid #red', borderRadius: '4px', marginTop: '4px', width: '100%'}}
          />
        </FormControl>
      </div>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>Required Field</h4>
        <FormControl helperText="This field is required">
          <InputLabel required>Required Field</InputLabel>
          <input
            type="text"
            placeholder="Enter text"
            style={{padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginTop: '4px', width: '100%'}}
          />
        </FormControl>
      </div>
    </div>
  ),
};

export const CheckboxExample: Story = {
  args: {
    children: (
      <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
        <input type="checkbox" />
        <span>I agree to the terms and conditions</span>
      </div>
    ),
    helperText: 'You must agree to continue',
    helperTextMarginLeft: '24px',
  },
};

export const RadioGroupExample: Story = {
  args: {
    children: (
      <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
        <label style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <input type="radio" name="option" />
          Option 1
        </label>
        <label style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <input type="radio" name="option" />
          Option 2
        </label>
        <label style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <input type="radio" name="option" />
          Option 3
        </label>
      </div>
    ),
    helperText: 'Select one option',
  },
};

export const SelectExample: Story = {
  args: {
    children: (
      <>
        <InputLabel>Country</InputLabel>
        <select
          style={{padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginTop: '4px', width: '100%'}}
        >
          <option value="">Select a country</option>
          <option value="us">United States</option>
          <option value="ca">Canada</option>
          <option value="uk">United Kingdom</option>
        </select>
      </>
    ),
    helperText: 'Choose your country of residence',
  },
};

export const TextareaExample: Story = {
  args: {
    children: (
      <>
        <InputLabel>Message</InputLabel>
        <textarea
          placeholder="Enter your message"
          rows={4}
          style={{
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            marginTop: '4px',
            width: '100%',
            resize: 'vertical',
          }}
        />
      </>
    ),
    helperText: 'Maximum 500 characters',
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
      <h3 style={{margin: '0 0 16px 0'}}>Contact Form</h3>
      <FormControl helperText="Enter your full name">
        <InputLabel required>Full Name</InputLabel>
        <input
          type="text"
          placeholder="Enter your full name"
          style={{padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginTop: '4px', width: '100%'}}
        />
      </FormControl>
      <FormControl helperText="We will never share your email">
        <InputLabel required>Email Address</InputLabel>
        <input
          type="email"
          placeholder="Enter your email"
          style={{padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginTop: '4px', width: '100%'}}
        />
      </FormControl>
      <FormControl helperText="Select your country">
        <InputLabel>Country</InputLabel>
        <select
          style={{padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginTop: '4px', width: '100%'}}
        >
          <option value="">Select a country</option>
          <option value="us">United States</option>
          <option value="ca">Canada</option>
          <option value="uk">United Kingdom</option>
        </select>
      </FormControl>
      <FormControl helperText="Tell us about yourself">
        <InputLabel>Message</InputLabel>
        <textarea
          placeholder="Enter your message"
          rows={4}
          style={{
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            marginTop: '4px',
            width: '100%',
            resize: 'vertical',
          }}
        />
      </FormControl>
      <FormControl helperText="You must agree to continue" helperTextMarginLeft="24px">
        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <input type="checkbox" />
          <span>I agree to the terms and conditions</span>
        </div>
      </FormControl>
    </div>
  ),
};
