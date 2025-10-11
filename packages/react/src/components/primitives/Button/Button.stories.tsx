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
import Button from './Button';
import {Check, Plus, Settings} from '../Icons';

const meta: Meta<typeof Button> = {
  title: 'Components/Primitives/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description: 'Button text content',
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary'],
      description: 'The button color that determines the color scheme',
    },
    variant: {
      control: 'select',
      options: ['solid', 'outline', 'text', 'icon'],
      description: 'The button variant that determines the visual style',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'The size of the button',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Whether the button should take the full width of its container',
    },
    loading: {
      control: 'boolean',
      description: 'Whether the button is in a loading state',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    shape: {
      control: 'select',
      options: ['square', 'round'],
      description: 'The shape of the button',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    color: 'primary',
    variant: 'solid',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    color: 'secondary',
    variant: 'solid',
  },
};

export const Tertiary: Story = {
  args: {
    children: 'Tertiary Button',
    color: 'tertiary',
    variant: 'solid',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline Button',
    variant: 'outline',
  },
};

export const Text: Story = {
  args: {
    children: 'Text Button',
    variant: 'text',
  },
};

export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'small',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'large',
  },
};

export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    fullWidth: true,
  },
  parameters: {
    layout: 'padded',
  },
};

export const Loading: Story = {
  args: {
    children: 'Loading Button',
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};

export const WithStartIcon: Story = {
  args: {
    children: 'Save',
    startIcon: <Check width={16} height={16} />,
  },
};

export const WithEndIcon: Story = {
  args: {
    children: 'Continue',
    endIcon: <Plus width={16} height={16} />,
  },
};

export const WithBothIcons: Story = {
  args: {
    children: 'Save and Continue',
    startIcon: <Check width={16} height={16} />,
    endIcon: <Plus width={16} height={16} />,
  },
};

export const IconButton: Story = {
  args: {
    variant: 'icon',
    children: <Settings width={20} height={20} />,
  },
};

export const Round: Story = {
  args: {
    children: 'Round Button',
    shape: 'round',
  },
};

export const RoundIcon: Story = {
  args: {
    variant: 'icon',
    shape: 'round',
    children: <Settings width={20} height={20} />,
  },
};

export const LoadingWithIcon: Story = {
  args: {
    children: 'Saving',
    startIcon: <Check width={16} height={16} />,
    loading: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '16px', flexWrap: 'wrap'}}>
      <Button variant="solid">Solid</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="text">Text</Button>
      <Button variant="icon">
        <Settings width={20} height={20} />
      </Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
      <Button size="small">Small</Button>
      <Button size="medium">Medium</Button>
      <Button size="large">Large</Button>
    </div>
  ),
};

export const AllColors: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '16px', flexWrap: 'wrap'}}>
      <Button color="primary">Primary</Button>
      <Button color="secondary">Secondary</Button>
      <Button color="tertiary">Tertiary</Button>
    </div>
  ),
};
