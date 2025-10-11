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
import InputLabel from './InputLabel';

const meta: Meta<typeof InputLabel> = {
  title: 'Components/Primitives/InputLabel',
  component: InputLabel,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description: 'Label text or content',
    },
    required: {
      control: 'boolean',
      description: 'Whether the field is required',
    },
    error: {
      control: 'boolean',
      description: "Whether there's an error state",
    },
    variant: {
      control: 'select',
      options: ['block', 'inline'],
      description: 'Display type for label positioning',
    },
    marginBottom: {
      control: 'text',
      description: 'Custom margin bottom',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Label Text',
  },
};

export const Required: Story = {
  args: {
    children: 'Required Field',
    required: true,
  },
};

export const WithError: Story = {
  args: {
    children: 'Field with Error',
    error: true,
  },
};

export const RequiredWithError: Story = {
  args: {
    children: 'Required Field with Error',
    required: true,
    error: true,
  },
};

export const BlockVariant: Story = {
  args: {
    children: 'Block Label',
    variant: 'block',
  },
};

export const InlineVariant: Story = {
  args: {
    children: 'Inline Label',
    variant: 'inline',
  },
};

export const CustomMargin: Story = {
  args: {
    children: 'Label with Custom Margin',
    marginBottom: '16px',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '16px', width: '300px'}}>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>Block Variant</h4>
        <InputLabel variant="block">Block Label</InputLabel>
        <input
          type="text"
          placeholder="Input field"
          style={{padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginTop: '4px', width: '100%'}}
        />
      </div>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>Inline Variant</h4>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <InputLabel variant="inline">Inline Label:</InputLabel>
          <input
            type="text"
            placeholder="Input field"
            style={{padding: '8px', border: '1px solid #ccc', borderRadius: '4px', flex: 1}}
          />
        </div>
      </div>
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '16px', width: '300px'}}>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>Default</h4>
        <InputLabel>Default Label</InputLabel>
        <input
          type="text"
          placeholder="Input field"
          style={{padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginTop: '4px', width: '100%'}}
        />
      </div>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>Required</h4>
        <InputLabel required>Required Label</InputLabel>
        <input
          type="text"
          placeholder="Input field"
          style={{padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginTop: '4px', width: '100%'}}
        />
      </div>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>Error State</h4>
        <InputLabel error>Error Label</InputLabel>
        <input
          type="text"
          placeholder="Input field"
          style={{padding: '8px', border: '1px solid #dc3545', borderRadius: '4px', marginTop: '4px', width: '100%'}}
        />
      </div>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>Required with Error</h4>
        <InputLabel required error>
          Required Error Label
        </InputLabel>
        <input
          type="text"
          placeholder="Input field"
          style={{padding: '8px', border: '1px solid #dc3545', borderRadius: '4px', marginTop: '4px', width: '100%'}}
        />
      </div>
    </div>
  ),
};

export const FormExamples: Story = {
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
      <h3 style={{margin: '0 0 16px 0'}}>Form Examples</h3>

      <div>
        <InputLabel required>Full Name</InputLabel>
        <input
          type="text"
          placeholder="Enter your full name"
          style={{padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginTop: '4px', width: '100%'}}
        />
      </div>

      <div>
        <InputLabel required error>
          Email Address
        </InputLabel>
        <input
          type="email"
          placeholder="Enter your email"
          style={{padding: '8px', border: '1px solid #dc3545', borderRadius: '4px', marginTop: '4px', width: '100%'}}
        />
        <div style={{color: '#dc3545', fontSize: '12px', marginTop: '4px'}}>Please enter a valid email address</div>
      </div>

      <div>
        <InputLabel>Phone Number</InputLabel>
        <input
          type="tel"
          placeholder="Enter your phone number"
          style={{padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginTop: '4px', width: '100%'}}
        />
      </div>

      <div>
        <InputLabel>Country</InputLabel>
        <select
          style={{padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginTop: '4px', width: '100%'}}
        >
          <option value="">Select a country</option>
          <option value="us">United States</option>
          <option value="ca">Canada</option>
          <option value="uk">United Kingdom</option>
        </select>
      </div>

      <div>
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
      </div>

      <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
        <InputLabel variant="inline">Newsletter:</InputLabel>
        <input type="checkbox" />
        <span>Subscribe to newsletter</span>
      </div>
    </div>
  ),
};

export const CheckboxExample: Story = {
  args: {
    children: 'I agree to the terms and conditions',
    variant: 'inline',
  },
  render: args => (
    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
      <input type="checkbox" />
      <InputLabel {...args} />
    </div>
  ),
};

export const RadioGroupExample: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
      <InputLabel>Select an option:</InputLabel>
      <div style={{display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '16px'}}>
        <label style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <input type="radio" name="option" />
          <InputLabel variant="inline">Option 1</InputLabel>
        </label>
        <label style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <input type="radio" name="option" />
          <InputLabel variant="inline">Option 2</InputLabel>
        </label>
        <label style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <input type="radio" name="option" />
          <InputLabel variant="inline">Option 3</InputLabel>
        </label>
      </div>
    </div>
  ),
};

export const CustomStyling: Story = {
  args: {
    children: 'Custom Styled Label',
    style: {color: '#007bff', fontWeight: 'bold'},
  },
};

export const LongLabel: Story = {
  args: {
    children: 'This is a very long label that might wrap to multiple lines and should still look good',
    required: true,
  },
  render: args => (
    <div style={{width: '200px'}}>
      <InputLabel {...args} />
      <input
        type="text"
        placeholder="Input field"
        style={{padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginTop: '4px', width: '100%'}}
      />
    </div>
  ),
};
