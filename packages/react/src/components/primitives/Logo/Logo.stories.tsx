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
import Logo from './Logo';

const meta: Meta<typeof Logo> = {
  title: 'Components/Primitives/Logo',
  component: Logo,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    src: {
      control: 'text',
      description: 'Custom logo URL to override theme logo',
    },
    alt: {
      control: 'text',
      description: 'Custom alt text for the logo',
    },
    title: {
      control: 'text',
      description: 'Custom title for the logo',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Size of the logo',
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

export const CustomSrc: Story = {
  args: {
    src: 'https://via.placeholder.com/200x80/007bff/ffffff?text=Custom+Logo',
    alt: 'Custom Logo',
  },
};

export const CustomAlt: Story = {
  args: {
    src: 'https://via.placeholder.com/200x80/28a745/ffffff?text=Brand+Logo',
    alt: 'Brand Logo',
  },
};

export const CustomTitle: Story = {
  args: {
    src: 'https://via.placeholder.com/200x80/dc3545/ffffff?text=Company+Logo',
    alt: 'Company Logo',
    title: 'Company Logo - Click to visit homepage',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '24px', alignItems: 'center'}}>
      <div style={{textAlign: 'center'}}>
        <Logo size="small" src="https://via.placeholder.com/100x40/007bff/ffffff?text=Small" alt="Small Logo" />
        <div style={{marginTop: '8px', fontSize: '12px'}}>Small</div>
      </div>
      <div style={{textAlign: 'center'}}>
        <Logo size="medium" src="https://via.placeholder.com/150x60/28a745/ffffff?text=Medium" alt="Medium Logo" />
        <div style={{marginTop: '8px', fontSize: '12px'}}>Medium</div>
      </div>
      <div style={{textAlign: 'center'}}>
        <Logo size="large" src="https://via.placeholder.com/200x80/dc3545/ffffff?text=Large" alt="Large Logo" />
        <div style={{marginTop: '8px', fontSize: '12px'}}>Large</div>
      </div>
    </div>
  ),
};

export const DifferentLogos: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap'}}>
      <div style={{textAlign: 'center'}}>
        <Logo
          src="https://via.placeholder.com/150x60/007bff/ffffff?text=Brand+A"
          alt="Brand A Logo"
          title="Brand A - Premium Quality"
        />
        <div style={{marginTop: '8px', fontSize: '12px'}}>Brand A</div>
      </div>
      <div style={{textAlign: 'center'}}>
        <Logo
          src="https://via.placeholder.com/150x60/28a745/ffffff?text=Brand+B"
          alt="Brand B Logo"
          title="Brand B - Innovation"
        />
        <div style={{marginTop: '8px', fontSize: '12px'}}>Brand B</div>
      </div>
      <div style={{textAlign: 'center'}}>
        <Logo
          src="https://via.placeholder.com/150x60/dc3545/ffffff?text=Brand+C"
          alt="Brand C Logo"
          title="Brand C - Excellence"
        />
        <div style={{marginTop: '8px', fontSize: '12px'}}>Brand C</div>
      </div>
      <div style={{textAlign: 'center'}}>
        <Logo
          src="https://via.placeholder.com/150x60/ffc107/000000?text=Brand+D"
          alt="Brand D Logo"
          title="Brand D - Creativity"
        />
        <div style={{marginTop: '8px', fontSize: '12px'}}>Brand D</div>
      </div>
    </div>
  ),
};

export const HeaderExample: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        width: '600px',
      }}
    >
      <Logo
        src="https://via.placeholder.com/120x48/007bff/ffffff?text=MyApp"
        alt="MyApp Logo"
        title="MyApp - Homepage"
      />
      <nav style={{display: 'flex', gap: '24px'}}>
        <a href="#" style={{textDecoration: 'none', color: '#333'}}>
          Home
        </a>
        <a href="#" style={{textDecoration: 'none', color: '#333'}}>
          About
        </a>
        <a href="#" style={{textDecoration: 'none', color: '#333'}}>
          Contact
        </a>
      </nav>
    </div>
  ),
};

export const FooterExample: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: '#f8f9fa',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        width: '600px',
      }}
    >
      <Logo
        size="small"
        src="https://via.placeholder.com/80x32/6c757d/ffffff?text=Logo"
        alt="Company Logo"
        title="Company Logo"
      />
      <div style={{marginLeft: '16px', fontSize: '14px', color: '#6c757d'}}>
        © 2024 Company Name. All rights reserved.
      </div>
    </div>
  ),
};

export const LoginPageExample: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        width: '400px',
      }}
    >
      <Logo
        size="large"
        src="https://via.placeholder.com/200x80/007bff/ffffff?text=MyApp"
        alt="MyApp Logo"
        title="MyApp"
      />
      <h2 style={{margin: '24px 0 16px 0', textAlign: 'center'}}>Welcome Back</h2>
      <p style={{margin: '0 0 24px 0', textAlign: 'center', color: '#666'}}>Sign in to your account to continue</p>
      <div style={{width: '100%', display: 'flex', flexDirection: 'column', gap: '16px'}}>
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
    </div>
  ),
};

export const CardExample: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        width: '300px',
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', marginBottom: '16px'}}>
        <Logo size="small" src="https://via.placeholder.com/60x24/28a745/ffffff?text=Partner" alt="Partner Logo" />
        <div style={{marginLeft: '12px'}}>
          <h4 style={{margin: '0', fontSize: '16px'}}>Partner Company</h4>
          <p style={{margin: '0', fontSize: '12px', color: '#666'}}>Official Partner</p>
        </div>
      </div>
      <p style={{margin: '0', fontSize: '14px', color: '#666'}}>
        This is a partnership card showing how the logo component can be used alongside other content.
      </p>
    </div>
  ),
};

export const ResponsiveExample: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '16px', width: '400px'}}>
      <div style={{padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px'}}>
        <h4 style={{margin: '0 0 8px 0'}}>Mobile Header</h4>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <Logo size="small" src="https://via.placeholder.com/80x32/007bff/ffffff?text=Mobile" alt="Mobile Logo" />
          <button
            style={{padding: '8px', backgroundColor: 'transparent', border: '1px solid #ccc', borderRadius: '4px'}}
          >
            Menu
          </button>
        </div>
      </div>
      <div style={{padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px'}}>
        <h4 style={{margin: '0 0 8px 0'}}>Desktop Header</h4>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <Logo size="medium" src="https://via.placeholder.com/120x48/007bff/ffffff?text=Desktop" alt="Desktop Logo" />
          <nav style={{display: 'flex', gap: '16px'}}>
            <a href="#" style={{textDecoration: 'none', color: '#333'}}>
              Home
            </a>
            <a href="#" style={{textDecoration: 'none', color: '#333'}}>
              About
            </a>
            <a href="#" style={{textDecoration: 'none', color: '#333'}}>
              Contact
            </a>
          </nav>
        </div>
      </div>
    </div>
  ),
};
