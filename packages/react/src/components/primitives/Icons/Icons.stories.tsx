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
import {
  Building as BuildingIcon,
  BuildingAlt as BuildingAltIcon,
  Check as CheckIcon,
  ChevronDown as ChevronDownIcon,
  CircleAlert as CircleAlertIcon,
  CircleCheck as CircleCheckIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Info as InfoIcon,
  LogOut as LogOutIcon,
  Plus as PlusIcon,
  Settings as SettingsIcon,
  TriangleAlert as TriangleAlertIcon,
  User as UserIcon,
  X as XIcon,
} from './index';

const meta: Meta = {
  title: 'Components/Primitives/Icons',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    width: {
      control: 'number',
      description: 'Width of the icon',
    },
    height: {
      control: 'number',
      description: 'Height of the icon',
    },
    color: {
      control: 'color',
      description: 'Color of the icon',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const CheckIconStory: Story = {
  render: args => <CheckIcon {...args} />,
  args: {
    width: 24,
    height: 24,
  },
};

export const X: Story = {
  render: args => <XIcon {...args} />,
  args: {
    width: 24,
    height: 24,
  },
};

export const Plus: Story = {
  render: args => <PlusIcon {...args} />,
  args: {
    width: 24,
    height: 24,
  },
};

export const User: Story = {
  render: args => <UserIcon {...args} />,
  args: {
    width: 24,
    height: 24,
  },
};

export const Settings: Story = {
  render: args => <SettingsIcon {...args} />,
  args: {
    width: 24,
    height: 24,
  },
};

export const LogOut: Story = {
  render: args => <LogOutIcon {...args} />,
  args: {
    width: 24,
    height: 24,
  },
};

export const Eye: Story = {
  render: args => <EyeIcon {...args} />,
  args: {
    width: 24,
    height: 24,
  },
};

export const EyeOff: Story = {
  render: args => <EyeOffIcon {...args} />,
  args: {
    width: 24,
    height: 24,
  },
};

export const ChevronDown: Story = {
  render: args => <ChevronDownIcon {...args} />,
  args: {
    width: 24,
    height: 24,
  },
};

export const Building: Story = {
  render: args => <BuildingIcon {...args} />,
  args: {
    width: 24,
    height: 24,
  },
};

export const BuildingAlt: Story = {
  render: args => <BuildingAltIcon {...args} />,
  args: {
    width: 24,
    height: 24,
  },
};

export const CircleCheck: Story = {
  render: args => <CircleCheckIcon {...args} />,
  args: {
    width: 24,
    height: 24,
  },
};

export const CircleAlert: Story = {
  render: args => <CircleAlertIcon {...args} />,
  args: {
    width: 24,
    height: 24,
  },
};

export const TriangleAlert: Story = {
  render: args => <TriangleAlertIcon {...args} />,
  args: {
    width: 24,
    height: 24,
  },
};

export const Info: Story = {
  render: args => <InfoIcon {...args} />,
  args: {
    width: 24,
    height: 24,
  },
};

export const AllIcons: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        width: '800px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          padding: '16px',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
        }}
      >
        <CheckIcon width={32} height={32} />
        <span style={{fontSize: '12px', textAlign: 'center'}}>Check</span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          padding: '16px',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
        }}
      >
        <XIcon width={32} height={32} />
        <span style={{fontSize: '12px', textAlign: 'center'}}>X</span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          padding: '16px',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
        }}
      >
        <PlusIcon width={32} height={32} />
        <span style={{fontSize: '12px', textAlign: 'center'}}>Plus</span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          padding: '16px',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
        }}
      >
        <UserIcon width={32} height={32} />
        <span style={{fontSize: '12px', textAlign: 'center'}}>User</span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          padding: '16px',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
        }}
      >
        <SettingsIcon width={32} height={32} />
        <span style={{fontSize: '12px', textAlign: 'center'}}>Settings</span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          padding: '16px',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
        }}
      >
        <LogOutIcon width={32} height={32} />
        <span style={{fontSize: '12px', textAlign: 'center'}}>LogOut</span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          padding: '16px',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
        }}
      >
        <EyeIcon width={32} height={32} />
        <span style={{fontSize: '12px', textAlign: 'center'}}>Eye</span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          padding: '16px',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
        }}
      >
        <EyeOffIcon width={32} height={32} />
        <span style={{fontSize: '12px', textAlign: 'center'}}>EyeOff</span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          padding: '16px',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
        }}
      >
        <ChevronDownIcon width={32} height={32} />
        <span style={{fontSize: '12px', textAlign: 'center'}}>ChevronDown</span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          padding: '16px',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
        }}
      >
        <BuildingIcon width={32} height={32} />
        <span style={{fontSize: '12px', textAlign: 'center'}}>Building</span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          padding: '16px',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
        }}
      >
        <BuildingAltIcon width={32} height={32} />
        <span style={{fontSize: '12px', textAlign: 'center'}}>BuildingAlt</span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          padding: '16px',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
        }}
      >
        <CircleCheckIcon width={32} height={32} />
        <span style={{fontSize: '12px', textAlign: 'center'}}>CircleCheck</span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          padding: '16px',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
        }}
      >
        <CircleAlertIcon width={32} height={32} />
        <span style={{fontSize: '12px', textAlign: 'center'}}>CircleAlert</span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          padding: '16px',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
        }}
      >
        <TriangleAlertIcon width={32} height={32} />
        <span style={{fontSize: '12px', textAlign: 'center'}}>TriangleAlert</span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          padding: '16px',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
        }}
      >
        <InfoIcon width={32} height={32} />
        <span style={{fontSize: '12px', textAlign: 'center'}}>Info</span>
      </div>
    </div>
  ),
};

export const DifferentSizes: Story = {
  render: () => (
    <div style={{display: 'flex', alignItems: 'center', gap: '24px'}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'}}>
        <CheckIcon width={16} height={16} />
        <span style={{fontSize: '12px'}}>16px</span>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'}}>
        <CheckIcon width={24} height={24} />
        <span style={{fontSize: '12px'}}>24px</span>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'}}>
        <CheckIcon width={32} height={32} />
        <span style={{fontSize: '12px'}}>32px</span>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'}}>
        <CheckIcon width={48} height={48} />
        <span style={{fontSize: '12px'}}>48px</span>
      </div>
    </div>
  ),
};

export const DifferentColors: Story = {
  render: () => (
    <div style={{display: 'flex', alignItems: 'center', gap: '24px'}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'}}>
        <CheckIcon width={32} height={32} color="#007bff" />
        <span style={{fontSize: '12px'}}>Primary</span>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'}}>
        <CheckIcon width={32} height={32} color="#28a745" />
        <span style={{fontSize: '12px'}}>Success</span>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'}}>
        <CheckIcon width={32} height={32} color="#ffc107" />
        <span style={{fontSize: '12px'}}>Warning</span>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'}}>
        <CheckIcon width={32} height={32} color="#dc3545" />
        <span style={{fontSize: '12px'}}>Error</span>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'}}>
        <CheckIcon width={32} height={32} color="#6c757d" />
        <span style={{fontSize: '12px'}}>Gray</span>
      </div>
    </div>
  ),
};

export const InButtons: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
      <button
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
        }}
      >
        <CheckIcon width={16} height={16} />
        Save
      </button>
      <button
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          backgroundColor: 'transparent',
          color: '#007bff',
          border: '1px solid #007bff',
          borderRadius: '4px',
        }}
      >
        <PlusIcon width={16} height={16} />
        Add
      </button>
      <button
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          backgroundColor: 'transparent',
          color: '#dc3545',
          border: '1px solid #dc3545',
          borderRadius: '4px',
        }}
      >
        <XIcon width={16} height={16} />
        Delete
      </button>
      <button
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          backgroundColor: 'transparent',
          color: '#6c757d',
          border: '1px solid #6c757d',
          borderRadius: '4px',
        }}
      >
        <SettingsIcon width={16} height={16} />
        Settings
      </button>
    </div>
  ),
};

export const InFormFields: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '16px', width: '300px'}}>
      <div style={{position: 'relative'}}>
        <input
          type="text"
          placeholder="Search..."
          style={{padding: '8px 40px 8px 8px', border: '1px solid #ccc', borderRadius: '4px', width: '100%'}}
        />
        <div style={{position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)'}}>
          <EyeIcon width={16} height={16} color="#6c757d" />
        </div>
      </div>
      <div style={{position: 'relative'}}>
        <input
          type="password"
          placeholder="Password"
          style={{padding: '8px 40px 8px 8px', border: '1px solid #ccc', borderRadius: '4px', width: '100%'}}
        />
        <div style={{position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)'}}>
          <EyeOffIcon width={16} height={16} color="#6c757d" />
        </div>
      </div>
      <div style={{position: 'relative'}}>
        <input
          type="text"
          placeholder="Username"
          style={{padding: '8px 40px 8px 8px', border: '1px solid #ccc', borderRadius: '4px', width: '100%'}}
        />
        <div style={{position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)'}}>
          <UserIcon width={16} height={16} color="#6c757d" />
        </div>
      </div>
    </div>
  ),
};

export const StatusIcons: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '16px', width: '300px'}}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
        }}
      >
        <CircleCheckIcon width={24} height={24} color="#28a745" />
        <span>Success message</span>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
        }}
      >
        <CircleAlertIcon width={24} height={24} color="#dc3545" />
        <span>Error message</span>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
        }}
      >
        <TriangleAlertIcon width={24} height={24} color="#ffc107" />
        <span>Warning message</span>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
        }}
      >
        <InfoIcon width={24} height={24} color="#007bff" />
        <span>Information message</span>
      </div>
    </div>
  ),
};