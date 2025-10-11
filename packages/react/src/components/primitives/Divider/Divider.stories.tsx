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
import Divider from './Divider';

const meta: Meta<typeof Divider> = {
  title: 'Components/Primitives/Divider',
  component: Divider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description: 'Text to display in the center of the divider',
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'The orientation of the divider',
    },
    variant: {
      control: 'select',
      options: ['solid', 'dashed', 'dotted'],
      description: 'The variant style of the divider',
    },
    color: {
      control: 'color',
      description: 'Custom color for the divider',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
  },
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
  },
  render: args => (
    <div style={{display: 'flex', alignItems: 'center', height: '100px'}}>
      <span>Left content</span>
      <Divider {...args} />
      <span>Right content</span>
    </div>
  ),
};

export const WithText: Story = {
  args: {
    children: 'OR',
  },
};

export const WithCustomText: Story = {
  args: {
    children: 'Continue with',
  },
};

export const Solid: Story = {
  args: {
    variant: 'solid',
  },
};

export const Dashed: Story = {
  args: {
    variant: 'dashed',
  },
};

export const Dotted: Story = {
  args: {
    variant: 'dotted',
  },
};

export const CustomColor: Story = {
  args: {
    color: '#007bff',
  },
};

export const CustomColorWithText: Story = {
  args: {
    children: 'Custom Color',
    color: '#28a745',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '16px', width: '300px'}}>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>Solid</h4>
        <Divider variant="solid" />
      </div>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>Dashed</h4>
        <Divider variant="dashed" />
      </div>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>Dotted</h4>
        <Divider variant="dotted" />
      </div>
    </div>
  ),
};

export const AllOrientations: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '16px', width: '300px'}}>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>Horizontal</h4>
        <Divider orientation="horizontal" />
      </div>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>Vertical</h4>
        <div style={{display: 'flex', alignItems: 'center', height: '40px'}}>
          <span>Left</span>
          <Divider orientation="vertical" />
          <span>Right</span>
        </div>
      </div>
    </div>
  ),
};

export const WithDifferentTexts: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '16px', width: '300px'}}>
      <Divider>OR</Divider>
      <Divider>Continue with</Divider>
      <Divider>Sign in with</Divider>
      <Divider>Or connect using</Divider>
      <Divider>Separator</Divider>
    </div>
  ),
};

export const CustomColors: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '16px', width: '300px'}}>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>Primary</h4>
        <Divider color="#007bff" />
      </div>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>Success</h4>
        <Divider color="#28a745" />
      </div>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>Warning</h4>
        <Divider color="#ffc107" />
      </div>
      <div>
        <h4 style={{margin: '0 0 8px 0'}}>Error</h4>
        <Divider color="#dc3545" />
      </div>
    </div>
  ),
};

export const LoginFormExample: Story = {
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
      <h3 style={{margin: '0 0 16px 0', textAlign: 'center'}}>Sign In</h3>
      <button style={{padding: '12px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: 'white'}}>
        Continue with Google
      </button>
      <button style={{padding: '12px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: 'white'}}>
        Continue with GitHub
      </button>
      <Divider>OR</Divider>
      <input
        type="email"
        placeholder="Email"
        style={{padding: '12px', border: '1px solid #ccc', borderRadius: '4px'}}
      />
      <input
        type="password"
        placeholder="Password"
        style={{padding: '12px', border: '1px solid #ccc', borderRadius: '4px'}}
      />
      <button
        style={{padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px'}}
      >
        Sign In
      </button>
    </div>
  ),
};

export const ContentSeparation: Story = {
  render: () => (
    <div style={{width: '400px', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px'}}>
      <h3 style={{margin: '0 0 16px 0'}}>Article Title</h3>
      <p style={{margin: '0 0 16px 0'}}>
        This is the first paragraph of the article. It contains some introductory content.
      </p>
      <Divider />
      <h4 style={{margin: '16px 0 8px 0'}}>Section 1</h4>
      <p style={{margin: '0 0 16px 0'}}>
        This is the content for section 1. The divider above helps separate it from the introduction.
      </p>
      <Divider variant="dashed" />
      <h4 style={{margin: '16px 0 8px 0'}}>Section 2</h4>
      <p style={{margin: '0 0 16px 0'}}>
        This is the content for section 2. The dashed divider provides a different visual separation.
      </p>
      <Divider variant="dotted" />
      <h4 style={{margin: '16px 0 8px 0'}}>Conclusion</h4>
      <p style={{margin: '0'}}>
        This is the concluding paragraph. The dotted divider adds variety to the visual hierarchy.
      </p>
    </div>
  ),
};

export const VerticalLayout: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        height: '200px',
        gap: '16px',
        padding: '20px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
      }}
    >
      <div style={{flex: 1}}>
        <h4 style={{margin: '0 0 8px 0'}}>Left Section</h4>
        <p style={{margin: '0'}}>This is the left section content.</p>
      </div>
      <Divider orientation="vertical" />
      <div style={{flex: 1}}>
        <h4 style={{margin: '0 0 8px 0'}}>Right Section</h4>
        <p style={{margin: '0'}}>This is the right section content.</p>
      </div>
    </div>
  ),
};
