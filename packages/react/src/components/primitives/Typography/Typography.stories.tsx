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
import Typography from './Typography';

const meta: Meta<typeof Typography> = {
  title: 'Components/Primitives/Typography',
  component: Typography,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description: 'The content to be rendered',
    },
    variant: {
      control: 'select',
      options: [
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'subtitle1',
        'subtitle2',
        'body1',
        'body2',
        'caption',
        'overline',
        'button',
      ],
      description: 'The typography variant to apply',
    },
    component: {
      control: 'text',
      description: 'The HTML element or React component to render',
    },
    align: {
      control: 'select',
      options: ['left', 'center', 'right', 'justify'],
      description: 'Text alignment',
    },
    color: {
      control: 'select',
      options: [
        'textPrimary',
        'textSecondary',
        'textDisabled',
        'primary',
        'secondary',
        'error',
        'warning',
        'info',
        'success',
      ],
      description: 'Color variant',
    },
    noWrap: {
      control: 'boolean',
      description: 'Whether the text should be clipped with ellipsis when it overflows',
    },
    inline: {
      control: 'boolean',
      description: 'Whether the text should be displayed inline',
    },
    fontWeight: {
      control: 'select',
      options: ['normal', 'medium', 'semibold', 'bold'],
      description: 'Custom font weight',
    },
    gutterBottom: {
      control: 'boolean',
      description: 'Whether to disable gutters (margin bottom)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Typography Text',
  },
};

export const Heading1: Story = {
  args: {
    children: 'Heading 1',
    variant: 'h1',
  },
};

export const Heading2: Story = {
  args: {
    children: 'Heading 2',
    variant: 'h2',
  },
};

export const Heading3: Story = {
  args: {
    children: 'Heading 3',
    variant: 'h3',
  },
};

export const Heading4: Story = {
  args: {
    children: 'Heading 4',
    variant: 'h4',
  },
};

export const Heading5: Story = {
  args: {
    children: 'Heading 5',
    variant: 'h5',
  },
};

export const Heading6: Story = {
  args: {
    children: 'Heading 6',
    variant: 'h6',
  },
};

export const Subtitle1: Story = {
  args: {
    children: 'Subtitle 1',
    variant: 'subtitle1',
  },
};

export const Subtitle2: Story = {
  args: {
    children: 'Subtitle 2',
    variant: 'subtitle2',
  },
};

export const Body1: Story = {
  args: {
    children: 'Body 1 - This is the default body text style used for regular content.',
    variant: 'body1',
  },
};

export const Body2: Story = {
  args: {
    children: 'Body 2 - This is a smaller body text style used for secondary content.',
    variant: 'body2',
  },
};

export const Caption: Story = {
  args: {
    children: 'Caption text',
    variant: 'caption',
  },
};

export const Overline: Story = {
  args: {
    children: 'OVERLINE',
    variant: 'overline',
  },
};

export const Button: Story = {
  args: {
    children: 'Button Text',
    variant: 'button',
  },
};

export const CenterAligned: Story = {
  args: {
    children: 'Center Aligned Text',
    align: 'center',
  },
};

export const RightAligned: Story = {
  args: {
    children: 'Right Aligned Text',
    align: 'right',
  },
};

export const Justified: Story = {
  args: {
    children:
      'This is a justified text example. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    align: 'justify',
  },
};

export const TextSecondary: Story = {
  args: {
    children: 'Secondary Text Color',
    color: 'textSecondary',
  },
};

export const TextDisabled: Story = {
  args: {
    children: 'Disabled Text Color',
    color: 'textDisabled',
  },
};

export const PrimaryColor: Story = {
  args: {
    children: 'Primary Color Text',
    color: 'primary',
  },
};

export const ErrorColor: Story = {
  args: {
    children: 'Error Color Text',
    color: 'error',
  },
};

export const NoWrap: Story = {
  args: {
    children: 'This is a very long text that should be truncated with ellipsis when it overflows the container width.',
    noWrap: true,
  },
  parameters: {
    layout: 'padded',
  },
};

export const Inline: Story = {
  args: {
    children: 'Inline text',
    inline: true,
  },
  render: args => (
    <div>
      This is some text with <Typography {...args} /> inline content.
    </div>
  ),
};

export const CustomFontWeight: Story = {
  args: {
    children: 'Bold Text',
    fontWeight: 'bold',
  },
};

export const WithGutterBottom: Story = {
  args: {
    children: 'Text with bottom margin',
    gutterBottom: true,
  },
  render: args => (
    <div>
      <Typography {...args} />
      <Typography>This text should have spacing above it.</Typography>
    </div>
  ),
};

export const CustomComponent: Story = {
  args: {
    children: 'This renders as a div element',
    component: 'div',
    variant: 'h3',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
      <Typography variant="h1">Heading 1</Typography>
      <Typography variant="h2">Heading 2</Typography>
      <Typography variant="h3">Heading 3</Typography>
      <Typography variant="h4">Heading 4</Typography>
      <Typography variant="h5">Heading 5</Typography>
      <Typography variant="h6">Heading 6</Typography>
      <Typography variant="subtitle1">Subtitle 1</Typography>
      <Typography variant="subtitle2">Subtitle 2</Typography>
      <Typography variant="body1">Body 1 - Regular content text</Typography>
      <Typography variant="body2">Body 2 - Secondary content text</Typography>
      <Typography variant="caption">Caption text</Typography>
      <Typography variant="overline">OVERLINE TEXT</Typography>
      <Typography variant="button">Button Text</Typography>
    </div>
  ),
};

export const AllColors: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
      <Typography color="textPrimary">Primary Text</Typography>
      <Typography color="textSecondary">Secondary Text</Typography>
      <Typography color="textSecondary">Disabled Text</Typography>
      <Typography color="primary">Primary Color</Typography>
      <Typography color="secondary">Secondary Color</Typography>
      <Typography color="error">Error Color</Typography>
      <Typography color="warning">Warning Color</Typography>
      <Typography color="info">Info Color</Typography>
      <Typography color="success">Success Color</Typography>
    </div>
  ),
};
