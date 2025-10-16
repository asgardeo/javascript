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
import Spinner from './Spinner';

const meta: Meta<typeof Spinner> = {
  title: 'Components/Primitives/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Size of the spinner',
    },
    color: {
      control: 'color',
      description: 'Custom color for the spinner',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Small: Story = {
  args: {
    size: 'small',
  },
};

export const Medium: Story = {
  args: {
    size: 'medium',
  },
};

export const Large: Story = {
  args: {
    size: 'large',
  },
};

export const CustomColor: Story = {
  args: {
    color: '#3b82f6',
  },
};

export const PrimaryColor: Story = {
  args: {
    color: '#007bff',
  },
};

export const SuccessColor: Story = {
  args: {
    color: '#28a745',
  },
};

export const WarningColor: Story = {
  args: {
    color: '#ffc107',
  },
};

export const ErrorColor: Story = {
  args: {
    color: '#dc3545',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '24px', alignItems: 'center'}}>
      <div style={{textAlign: 'center'}}>
        <Spinner size="small" />
        <div style={{marginTop: '8px', fontSize: '12px'}}>Small</div>
      </div>
      <div style={{textAlign: 'center'}}>
        <Spinner size="medium" />
        <div style={{marginTop: '8px', fontSize: '12px'}}>Medium</div>
      </div>
      <div style={{textAlign: 'center'}}>
        <Spinner size="large" />
        <div style={{marginTop: '8px', fontSize: '12px'}}>Large</div>
      </div>
    </div>
  ),
};

export const AllColors: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '24px', alignItems: 'center'}}>
      <div style={{textAlign: 'center'}}>
        <Spinner color="#007bff" />
        <div style={{marginTop: '8px', fontSize: '12px'}}>Primary</div>
      </div>
      <div style={{textAlign: 'center'}}>
        <Spinner color="#28a745" />
        <div style={{marginTop: '8px', fontSize: '12px'}}>Success</div>
      </div>
      <div style={{textAlign: 'center'}}>
        <Spinner color="#ffc107" />
        <div style={{marginTop: '8px', fontSize: '12px'}}>Warning</div>
      </div>
      <div style={{textAlign: 'center'}}>
        <Spinner color="#dc3545" />
        <div style={{marginTop: '8px', fontSize: '12px'}}>Error</div>
      </div>
      <div style={{textAlign: 'center'}}>
        <Spinner color="#6c757d" />
        <div style={{marginTop: '8px', fontSize: '12px'}}>Gray</div>
      </div>
    </div>
  ),
};

export const InContext: Story = {
  render: () => (
    <div style={{padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', width: '300px'}}>
      <div style={{marginBottom: '16px'}}>
        <h3 style={{margin: '0 0 8px 0'}}>Loading Content</h3>
        <p style={{margin: '0 0 16px 0', color: '#666'}}>Please wait while we load your data...</p>
      </div>
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60px'}}>
        <Spinner size="medium" />
      </div>
    </div>
  ),
};

export const WithText: Story = {
  render: () => (
    <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
      <Spinner size="small" />
      <span>Loading...</span>
    </div>
  ),
};

export const ButtonLoading: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
      <button style={{padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
        <Spinner size="small" color="white" />
        Saving...
      </button>
      <button style={{padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px'}}>
        <Spinner size="medium" color="white" />
        Processing...
      </button>
    </div>
  ),
};
