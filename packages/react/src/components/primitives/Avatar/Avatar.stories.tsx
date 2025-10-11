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
import Avatar from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Primitives/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'text',
      description: 'The name to use for generating initials when no image is provided',
    },
    imageUrl: {
      control: 'text',
      description: 'The URL of the avatar image',
    },
    size: {
      control: 'number',
      description: 'The size of the avatar in pixels',
    },
    variant: {
      control: 'select',
      options: ['circular', 'square'],
      description: 'The variant of the avatar shape',
    },
    background: {
      control: 'select',
      options: ['random', 'none'],
      description: 'Background generation strategy',
    },
    isLoading: {
      control: 'boolean',
      description: 'Loading state of the avatar',
    },
    alt: {
      control: 'text',
      description: 'Alternative text for the avatar image',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithName: Story = {
  args: {
    name: 'John Doe',
  },
};

export const WithInitials: Story = {
  args: {
    name: 'Jane Smith',
  },
};

export const WithImage: Story = {
  args: {
    name: 'John Doe',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  },
};

export const Small: Story = {
  args: {
    name: 'John Doe',
    size: 32,
  },
};

export const Medium: Story = {
  args: {
    name: 'John Doe',
    size: 64,
  },
};

export const Large: Story = {
  args: {
    name: 'John Doe',
    size: 96,
  },
};

export const ExtraLarge: Story = {
  args: {
    name: 'John Doe',
    size: 128,
  },
};

export const Square: Story = {
  args: {
    name: 'John Doe',
    variant: 'square',
  },
};

export const Circular: Story = {
  args: {
    name: 'John Doe',
    variant: 'circular',
  },
};

export const NoBackground: Story = {
  args: {
    name: 'John Doe',
    background: 'none',
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const LoadingWithSize: Story = {
  args: {
    isLoading: true,
    size: 96,
  },
};

export const WithCustomAlt: Story = {
  args: {
    name: 'John Doe',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    alt: 'Profile picture of John Doe',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
      <div style={{textAlign: 'center'}}>
        <Avatar name="John Doe" size={24} />
        <div style={{marginTop: '4px', fontSize: '12px'}}>24px</div>
      </div>
      <div style={{textAlign: 'center'}}>
        <Avatar name="John Doe" size={32} />
        <div style={{marginTop: '4px', fontSize: '12px'}}>32px</div>
      </div>
      <div style={{textAlign: 'center'}}>
        <Avatar name="John Doe" size={48} />
        <div style={{marginTop: '4px', fontSize: '12px'}}>48px</div>
      </div>
      <div style={{textAlign: 'center'}}>
        <Avatar name="John Doe" size={64} />
        <div style={{marginTop: '4px', fontSize: '12px'}}>64px</div>
      </div>
      <div style={{textAlign: 'center'}}>
        <Avatar name="John Doe" size={96} />
        <div style={{marginTop: '4px', fontSize: '12px'}}>96px</div>
      </div>
      <div style={{textAlign: 'center'}}>
        <Avatar name="John Doe" size={128} />
        <div style={{marginTop: '4px', fontSize: '12px'}}>128px</div>
      </div>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
      <div style={{textAlign: 'center'}}>
        <Avatar name="John Doe" variant="circular" />
        <div style={{marginTop: '8px', fontSize: '12px'}}>Circular</div>
      </div>
      <div style={{textAlign: 'center'}}>
        <Avatar name="John Doe" variant="square" />
        <div style={{marginTop: '8px', fontSize: '12px'}}>Square</div>
      </div>
    </div>
  ),
};

export const DifferentNames: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
      <div style={{textAlign: 'center'}}>
        <Avatar name="Alice Johnson" />
        <div style={{marginTop: '8px', fontSize: '12px'}}>Alice Johnson</div>
      </div>
      <div style={{textAlign: 'center'}}>
        <Avatar name="Bob Smith" />
        <div style={{marginTop: '8px', fontSize: '12px'}}>Bob Smith</div>
      </div>
      <div style={{textAlign: 'center'}}>
        <Avatar name="Charlie Brown" />
        <div style={{marginTop: '8px', fontSize: '12px'}}>Charlie Brown</div>
      </div>
      <div style={{textAlign: 'center'}}>
        <Avatar name="Diana Prince" />
        <div style={{marginTop: '8px', fontSize: '12px'}}>Diana Prince</div>
      </div>
      <div style={{textAlign: 'center'}}>
        <Avatar name="Eve Wilson" />
        <div style={{marginTop: '8px', fontSize: '12px'}}>Eve Wilson</div>
      </div>
    </div>
  ),
};

export const WithImages: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
      <div style={{textAlign: 'center'}}>
        <Avatar
          name="John Doe"
          imageUrl="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
        />
        <div style={{marginTop: '8px', fontSize: '12px'}}>John Doe</div>
      </div>
      <div style={{textAlign: 'center'}}>
        <Avatar
          name="Jane Smith"
          imageUrl="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
        />
        <div style={{marginTop: '8px', fontSize: '12px'}}>Jane Smith</div>
      </div>
      <div style={{textAlign: 'center'}}>
        <Avatar
          name="Bob Johnson"
          imageUrl="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
        />
        <div style={{marginTop: '8px', fontSize: '12px'}}>Bob Johnson</div>
      </div>
    </div>
  ),
};

export const LoadingStates: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
      <div style={{textAlign: 'center'}}>
        <Avatar isLoading size={32} />
        <div style={{marginTop: '8px', fontSize: '12px'}}>Small Loading</div>
      </div>
      <div style={{textAlign: 'center'}}>
        <Avatar isLoading size={64} />
        <div style={{marginTop: '8px', fontSize: '12px'}}>Medium Loading</div>
      </div>
      <div style={{textAlign: 'center'}}>
        <Avatar isLoading size={96} />
        <div style={{marginTop: '8px', fontSize: '12px'}}>Large Loading</div>
      </div>
    </div>
  ),
};

export const BackgroundVariations: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
      <div style={{textAlign: 'center'}}>
        <Avatar name="John Doe" background="random" />
        <div style={{marginTop: '8px', fontSize: '12px'}}>Random Background</div>
      </div>
      <div style={{textAlign: 'center'}}>
        <Avatar name="John Doe" background="none" />
        <div style={{marginTop: '8px', fontSize: '12px'}}>No Background</div>
      </div>
    </div>
  ),
};
