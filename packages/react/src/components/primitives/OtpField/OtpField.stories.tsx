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
import OtpField from './OtpField';

const meta: Meta<typeof OtpField> = {
  title: 'Components/Primitives/OtpField',
  component: OtpField,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text to display above the OTP input',
    },
    length: {
      control: 'number',
      description: 'Number of OTP input fields',
    },
    type: {
      control: 'select',
      options: ['text', 'number', 'password'],
      description: 'Type of input (text, number, password)',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder character for each input field',
    },
    error: {
      control: 'text',
      description: 'Error message to display below the OTP input',
    },
    helperText: {
      control: 'text',
      description: 'Helper text to display below the OTP input',
    },
    required: {
      control: 'boolean',
      description: 'Whether the field is required',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the field is disabled',
    },
    autoFocus: {
      control: 'boolean',
      description: 'Auto focus the first input on mount',
    },
    onChange: {
      action: 'changed',
      description: 'Callback function called when OTP value changes',
    },
    onComplete: {
      action: 'completed',
      description: 'Callback function called when OTP input is complete',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Enter OTP',
    onChange: (event: {target: {value: string}}) => console.log('OTP changed:', event.target.value),
    onComplete: (value: string) => console.log('OTP completed:', value),
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Verification Code',
    onChange: (event: {target: {value: string}}) => console.log('OTP changed:', event.target.value),
    onComplete: (value: string) => console.log('OTP completed:', value),
  },
};

export const Required: Story = {
  args: {
    label: 'Enter OTP',
    required: true,
    onChange: (event: {target: {value: string}}) => console.log('OTP changed:', event.target.value),
    onComplete: (value: string) => console.log('OTP completed:', value),
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Verification Code',
    helperText: 'Enter the 6-digit code sent to your phone',
    onChange: (event: {target: {value: string}}) => console.log('OTP changed:', event.target.value),
    onComplete: (value: string) => console.log('OTP completed:', value),
  },
};

export const WithError: Story = {
  args: {
    label: 'Verification Code',
    error: 'Invalid verification code',
    onChange: (event: {target: {value: string}}) => console.log('OTP changed:', event.target.value),
    onComplete: (value: string) => console.log('OTP completed:', value),
  },
};

export const Disabled: Story = {
  args: {
    label: 'Verification Code',
    disabled: true,
    onChange: (event: {target: {value: string}}) => console.log('OTP changed:', event.target.value),
    onComplete: (value: string) => console.log('OTP completed:', value),
  },
};

export const NumberType: Story = {
  args: {
    label: 'Enter PIN',
    type: 'number',
    onChange: (event: {target: {value: string}}) => console.log('PIN changed:', event.target.value),
    onComplete: (value: string) => console.log('PIN completed:', value),
  },
};

export const PasswordType: Story = {
  args: {
    label: 'Enter Secret Code',
    type: 'password',
    onChange: (event: {target: {value: string}}) => console.log('Secret code changed:', event.target.value),
    onComplete: (value: string) => console.log('Secret code completed:', value),
  },
};

export const FourDigits: Story = {
  args: {
    label: '4-Digit PIN',
    length: 4,
    type: 'number',
    onChange: (event: {target: {value: string}}) => console.log('PIN changed:', event.target.value),
    onComplete: (value: string) => console.log('PIN completed:', value),
  },
};

export const EightDigits: Story = {
  args: {
    label: '8-Digit Code',
    length: 8,
    onChange: (event: {target: {value: string}}) => console.log('Code changed:', event.target.value),
    onComplete: (value: string) => console.log('Code completed:', value),
  },
};

export const WithPlaceholder: Story = {
  args: {
    label: 'Enter Code',
    placeholder: '•',
    onChange: (event: {target: {value: string}}) => console.log('Code changed:', event.target.value),
    onComplete: (value: string) => console.log('Code completed:', value),
  },
};

export const AutoFocus: Story = {
  args: {
    label: 'Auto Focus OTP',
    autoFocus: true,
    onChange: (event: {target: {value: string}}) => console.log('OTP changed:', event.target.value),
    onComplete: (value: string) => console.log('OTP completed:', value),
  },
};

export const WithPattern: Story = {
  args: {
    label: 'Alphanumeric Code',
    pattern: '[A-Za-z0-9]',
    onChange: (event: {target: {value: string}}) => console.log('Code changed:', event.target.value),
    onComplete: (value: string) => console.log('Code completed:', value),
  },
};

export const AllLengths: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>4 Digits</h4>
        <OtpField
          label="4-Digit PIN"
          length={4}
          type="number"
          onChange={(event: {target: {value: string}}) => console.log('4-digit PIN:', event.target.value)}
        />
      </div>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>6 Digits (Default)</h4>
        <OtpField
          label="6-Digit Code"
          onChange={(event: {target: {value: string}}) => console.log('6-digit code:', event.target.value)}
        />
      </div>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>8 Digits</h4>
        <OtpField
          label="8-Digit Code"
          length={8}
          onChange={(event: {target: {value: string}}) => console.log('8-digit code:', event.target.value)}
        />
      </div>
    </div>
  ),
};

export const AllTypes: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>Text</h4>
        <OtpField
          label="Text OTP"
          type="text"
          onChange={(event: {target: {value: string}}) => console.log('Text OTP:', event.target.value)}
        />
      </div>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>Number</h4>
        <OtpField
          label="Number OTP"
          type="number"
          onChange={(event: {target: {value: string}}) => console.log('Number OTP:', event.target.value)}
        />
      </div>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>Password</h4>
        <OtpField
          label="Password OTP"
          type="password"
          onChange={(event: {target: {value: string}}) => console.log('Password OTP:', event.target.value)}
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
        <OtpField
          label="Default OTP"
          onChange={(event: {target: {value: string}}) => console.log('Default:', event.target.value)}
        />
      </div>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>Required</h4>
        <OtpField
          label="Required OTP"
          required
          onChange={(event: {target: {value: string}}) => console.log('Required:', event.target.value)}
        />
      </div>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>With Helper Text</h4>
        <OtpField
          label="Helper Text OTP"
          helperText="Enter the code sent to your device"
          onChange={(event: {target: {value: string}}) => console.log('Helper text:', event.target.value)}
        />
      </div>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>With Error</h4>
        <OtpField
          label="Error OTP"
          error="Invalid code entered"
          onChange={(event: {target: {value: string}}) => console.log('Error:', event.target.value)}
        />
      </div>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>Disabled</h4>
        <OtpField
          label="Disabled OTP"
          disabled
          onChange={(event: {target: {value: string}}) => console.log('Disabled:', event.target.value)}
        />
      </div>
    </div>
  ),
};

export const VerificationForm: Story = {
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
      <h3 style={{margin: '0 0 16px 0', textAlign: 'center'}}>Verify Your Account</h3>
      <p style={{margin: '0 0 16px 0', textAlign: 'center', color: '#666'}}>
        We've sent a verification code to your registered phone number.
      </p>
      <OtpField
        label="Verification Code"
        helperText="Enter the 6-digit code"
        required
        autoFocus
        onChange={(event: {target: {value: string}}) => console.log('Verification code:', event.target.value)}
        onComplete={(value: string) => {
          console.log('Verification completed:', value);
          alert(`Verification code ${value} entered successfully!`);
        }}
      />
      <button
        style={{
          padding: '12px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          marginTop: '16px',
        }}
      >
        Verify Account
      </button>
      <button
        style={{
          padding: '8px',
          backgroundColor: 'transparent',
          color: '#007bff',
          border: 'none',
          textDecoration: 'underline',
        }}
      >
        Resend Code
      </button>
    </div>
  ),
};
