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
import Card from './Card';
import Button from '../Button/Button';
import Typography from '../Typography/Typography';

const meta: Meta<typeof Card> = {
  title: 'Components/Primitives/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outlined', 'elevated'],
      description: 'The visual variant of the card',
    },
    clickable: {
      control: 'boolean',
      description: 'Whether the card should be clickable (shows hover effects)',
    },
    children: {
      control: 'text',
      description: 'Card content',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Simple card content',
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    children: 'Outlined card content',
  },
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    children: 'Elevated card content',
  },
};

export const Clickable: Story = {
  args: {
    clickable: true,
    children: 'Clickable card content',
  },
};

export const WithHeader: Story = {
  args: {
    children: (
      <>
        <Card.Header>
          <Card.Title>Card Title</Card.Title>
          <Card.Description>This is a card description</Card.Description>
        </Card.Header>
        <Card.Content>
          <Typography>This is the main content of the card.</Typography>
        </Card.Content>
      </>
    ),
  },
};

export const WithFooter: Story = {
  args: {
    children: (
      <>
        <Card.Content>
          <Typography>This is the main content of the card.</Typography>
        </Card.Content>
        <Card.Footer>
          <Button variant="outline">Cancel</Button>
          <Button>Submit</Button>
        </Card.Footer>
      </>
    ),
  },
};

export const Complete: Story = {
  args: {
    variant: 'elevated',
    children: (
      <>
        <Card.Header>
          <Card.Title level={2}>Complete Card</Card.Title>
          <Card.Description>This is a complete card example with all components</Card.Description>
          <Card.Action>
            <Button variant="text" size="small">
              Action
            </Button>
          </Card.Action>
        </Card.Header>
        <Card.Content>
          <Typography variant="body1">
            This is the main content area of the card. It can contain any type of content including text, images, forms,
            or other components.
          </Typography>
          <Typography variant="body2" style={{marginTop: '16px'}}>
            Additional content can be added here to demonstrate the card's flexibility.
          </Typography>
        </Card.Content>
        <Card.Footer>
          <Button variant="outline">Cancel</Button>
          <Button>Save Changes</Button>
        </Card.Footer>
      </>
    ),
  },
};

export const ProductCard: Story = {
  args: {
    variant: 'outlined',
    clickable: true,
    children: (
      <>
        <Card.Content>
          <div style={{height: '200px', backgroundColor: '#f5f5f5', borderRadius: '8px', marginBottom: '16px'}}>
            <div
              style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666'}}
            >
              Product Image
            </div>
          </div>
          <Card.Title level={4}>Product Name</Card.Title>
          <Card.Description>Product description goes here</Card.Description>
          <Typography variant="h6" style={{marginTop: '16px', color: '#007bff'}}>
            $99.99
          </Typography>
        </Card.Content>
        <Card.Footer>
          <Button fullWidth>Add to Cart</Button>
        </Card.Footer>
      </>
    ),
  },
};

export const UserProfileCard: Story = {
  args: {
    variant: 'elevated',
    children: (
      <>
        <Card.Header>
          <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
            <div
              style={{
                width: '64px',
                height: '64px',
                backgroundColor: '#007bff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '24px',
                fontWeight: 'bold',
              }}
            >
              JD
            </div>
            <div>
              <Card.Title level={3}>John Doe</Card.Title>
              <Card.Description>Software Engineer</Card.Description>
            </div>
          </div>
        </Card.Header>
        <Card.Content>
          <Typography variant="body2">
            Experienced software engineer with expertise in React, TypeScript, and modern web development practices.
          </Typography>
        </Card.Content>
        <Card.Footer>
          <Button variant="outline" size="small">
            Message
          </Button>
          <Button size="small">Follow</Button>
        </Card.Footer>
      </>
    ),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '16px', flexWrap: 'wrap'}}>
      <Card variant="default" style={{width: '200px'}}>
        <Card.Content>
          <Card.Title level={4}>Default Card</Card.Title>
          <Typography variant="body2">This is a default card variant.</Typography>
        </Card.Content>
      </Card>
      <Card variant="outlined" style={{width: '200px'}}>
        <Card.Content>
          <Card.Title level={4}>Outlined Card</Card.Title>
          <Typography variant="body2">This is an outlined card variant.</Typography>
        </Card.Content>
      </Card>
      <Card variant="elevated" style={{width: '200px'}}>
        <Card.Content>
          <Card.Title level={4}>Elevated Card</Card.Title>
          <Typography variant="body2">This is an elevated card variant.</Typography>
        </Card.Content>
      </Card>
    </div>
  ),
};

export const AllTitleLevels: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
      <Card variant="outlined">
        <Card.Content>
          <Card.Title level={1}>Heading Level 1</Card.Title>
          <Typography variant="body2">This card uses heading level 1.</Typography>
        </Card.Content>
      </Card>
      <Card variant="outlined">
        <Card.Content>
          <Card.Title level={2}>Heading Level 2</Card.Title>
          <Typography variant="body2">This card uses heading level 2.</Typography>
        </Card.Content>
      </Card>
      <Card variant="outlined">
        <Card.Content>
          <Card.Title level={3}>Heading Level 3</Card.Title>
          <Typography variant="body2">This card uses heading level 3.</Typography>
        </Card.Content>
      </Card>
      <Card variant="outlined">
        <Card.Content>
          <Card.Title level={4}>Heading Level 4</Card.Title>
          <Typography variant="body2">This card uses heading level 4.</Typography>
        </Card.Content>
      </Card>
      <Card variant="outlined">
        <Card.Content>
          <Card.Title level={5}>Heading Level 5</Card.Title>
          <Typography variant="body2">This card uses heading level 5.</Typography>
        </Card.Content>
      </Card>
      <Card variant="outlined">
        <Card.Content>
          <Card.Title level={6}>Heading Level 6</Card.Title>
          <Typography variant="body2">This card uses heading level 6.</Typography>
        </Card.Content>
      </Card>
    </div>
  ),
};

export const ClickableVariants: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '16px', flexWrap: 'wrap'}}>
      <Card variant="default" clickable style={{width: '200px'}}>
        <Card.Content>
          <Card.Title level={4}>Clickable Default</Card.Title>
          <Typography variant="body2">Hover to see the effect.</Typography>
        </Card.Content>
      </Card>
      <Card variant="outlined" clickable style={{width: '200px'}}>
        <Card.Content>
          <Card.Title level={4}>Clickable Outlined</Card.Title>
          <Typography variant="body2">Hover to see the effect.</Typography>
        </Card.Content>
      </Card>
      <Card variant="elevated" clickable style={{width: '200px'}}>
        <Card.Content>
          <Card.Title level={4}>Clickable Elevated</Card.Title>
          <Typography variant="body2">Hover to see the effect.</Typography>
        </Card.Content>
      </Card>
    </div>
  ),
};
