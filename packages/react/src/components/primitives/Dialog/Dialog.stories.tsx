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
import {useState} from 'react';
import Dialog from './Dialog';
import Button from '../Button/Button';
import Typography from '../Typography/Typography';

const meta: Meta<typeof Dialog> = {
  title: 'Components/Primitives/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    initialOpen: {
      control: 'boolean',
      description: 'Whether the dialog is initially open',
    },
    open: {
      control: 'boolean',
      description: 'Whether the dialog is open (controlled)',
    },
    onOpenChange: {
      action: 'openChanged',
      description: 'Callback when the open state changes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button>Open Dialog</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Heading>Dialog Title</Dialog.Heading>
        <Dialog.Description>This is a basic dialog with a title and description.</Dialog.Description>
        <div style={{marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '8px'}}>
          <Dialog.Close asChild>
            <Button variant="outline">Cancel</Button>
          </Dialog.Close>
          <Dialog.Close asChild>
            <Button>Confirm</Button>
          </Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog>
  ),
};

export const ConfirmationDialog: Story = {
  render: () => (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button variant="outline" color="error">
          Delete Item
        </Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Heading>Delete Item</Dialog.Heading>
        <Dialog.Description>
          Are you sure you want to delete this item? This action cannot be undone.
        </Dialog.Description>
        <div style={{marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '8px'}}>
          <Dialog.Close asChild>
            <Button variant="outline">Cancel</Button>
          </Dialog.Close>
          <Dialog.Close asChild>
            <Button color="error">Delete</Button>
          </Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog>
  ),
};

export const FormDialog: Story = {
  render: () => (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button>Add New Item</Button>
      </Dialog.Trigger>
      <Dialog.Content style={{minWidth: '400px'}}>
        <Dialog.Heading>Add New Item</Dialog.Heading>
        <Dialog.Description>Fill out the form below to add a new item to your list.</Dialog.Description>
        <div style={{marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px'}}>
          <div>
            <label style={{display: 'block', marginBottom: '4px', fontWeight: '500'}}>Name</label>
            <input
              type="text"
              placeholder="Enter item name"
              style={{width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px'}}
            />
          </div>
          <div>
            <label style={{display: 'block', marginBottom: '4px', fontWeight: '500'}}>Description</label>
            <textarea
              placeholder="Enter description"
              rows={3}
              style={{width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', resize: 'vertical'}}
            />
          </div>
        </div>
        <div style={{marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '8px'}}>
          <Dialog.Close asChild>
            <Button variant="outline">Cancel</Button>
          </Dialog.Close>
          <Dialog.Close asChild>
            <Button>Save Item</Button>
          </Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog>
  ),
};

export const InformationDialog: Story = {
  render: () => (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button variant="text">View Information</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Heading>Information</Dialog.Heading>
        <Dialog.Description>
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
            <Typography variant="body2">
              This is an information dialog that provides additional details about a feature or action.
            </Typography>
            <Typography variant="body2">
              It can contain multiple paragraphs of text and other content to help users understand what they need to
              know.
            </Typography>
          </div>
        </Dialog.Description>
        <div style={{marginTop: '24px', display: 'flex', justifyContent: 'center'}}>
          <Dialog.Close asChild>
            <Button>Got it</Button>
          </Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog>
  ),
};

export const SettingsDialog: Story = {
  render: () => (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button variant="outline">Settings</Button>
      </Dialog.Trigger>
      <Dialog.Content style={{minWidth: '500px'}}>
        <Dialog.Heading>Settings</Dialog.Heading>
        <Dialog.Description>Configure your application settings below.</Dialog.Description>
        <div style={{marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '20px'}}>
          <div>
            <Typography variant="subtitle2" style={{marginBottom: '8px'}}>
              General
            </Typography>
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              <label style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <input type="checkbox" />
                Enable notifications
              </label>
              <label style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <input type="checkbox" />
                Auto-save changes
              </label>
            </div>
          </div>
          <div>
            <Typography variant="subtitle2" style={{marginBottom: '8px'}}>
              Appearance
            </Typography>
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              <label style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <input type="radio" name="theme" />
                Light theme
              </label>
              <label style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <input type="radio" name="theme" />
                Dark theme
              </label>
              <label style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <input type="radio" name="theme" />
                System theme
              </label>
            </div>
          </div>
        </div>
        <div style={{marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '8px'}}>
          <Dialog.Close asChild>
            <Button variant="outline">Cancel</Button>
          </Dialog.Close>
          <Dialog.Close asChild>
            <Button>Save Settings</Button>
          </Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog>
  ),
};

export const AlertDialog: Story = {
  render: () => (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button color="error">Show Alert</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Heading>Important Alert</Dialog.Heading>
        <Dialog.Description>
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
            <Typography variant="body2" color="error">
              ⚠️ This is an important alert that requires your attention.
            </Typography>
            <Typography variant="body2">Please review the information carefully before proceeding.</Typography>
          </div>
        </Dialog.Description>
        <div style={{marginTop: '24px', display: 'flex', justifyContent: 'center'}}>
          <Dialog.Close asChild>
            <Button color="error">I Understand</Button>
          </Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog>
  ),
};

export const ControlledDialog: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center'}}>
        <div style={{display: 'flex', gap: '8px'}}>
          <Button onClick={() => setOpen(true)}>Open Dialog</Button>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close Dialog
          </Button>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <Dialog.Content>
            <Dialog.Heading>Controlled Dialog</Dialog.Heading>
            <Dialog.Description>
              This dialog is controlled by external state. You can open and close it using the buttons above.
            </Dialog.Description>
            <div style={{marginTop: '24px', display: 'flex', justifyContent: 'center'}}>
              <Dialog.Close asChild>
                <Button onClick={() => setOpen(false)}>Close</Button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog>
      </div>
    );
  },
};

export const CustomTrigger: Story = {
  render: () => (
    <Dialog>
      <Dialog.Trigger asChild>
        <div
          style={{
            padding: '16px',
            border: '2px dashed #ccc',
            borderRadius: '8px',
            cursor: 'pointer',
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" color="textSecondary">
            Click here to open dialog
          </Typography>
        </div>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Heading>Custom Trigger</Dialog.Heading>
        <Dialog.Description>
          This dialog was opened using a custom trigger element instead of a button.
        </Dialog.Description>
        <div style={{marginTop: '24px', display: 'flex', justifyContent: 'center'}}>
          <Dialog.Close asChild>
            <Button>Close</Button>
          </Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog>
  ),
};

export const LongContentDialog: Story = {
  render: () => (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button>View Long Content</Button>
      </Dialog.Trigger>
      <Dialog.Content style={{maxHeight: '80vh', overflowY: 'auto'}}>
        <Dialog.Heading>Terms and Conditions</Dialog.Heading>
        <Dialog.Description>
          <div style={{display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '400px', overflowY: 'auto'}}>
            <Typography variant="body2">
              <strong>1. Acceptance of Terms</strong>
              <br />
              By accessing and using this service, you accept and agree to be bound by the terms and provision of this
              agreement.
            </Typography>
            <Typography variant="body2">
              <strong>2. Use License</strong>
              <br />
              Permission is granted to temporarily download one copy of the materials on this service for personal,
              non-commercial transitory viewing only.
            </Typography>
            <Typography variant="body2">
              <strong>3. Disclaimer</strong>
              <br />
              The materials on this service are provided on an 'as is' basis. The service makes no warranties, expressed
              or implied, and hereby disclaims and negates all other warranties.
            </Typography>
            <Typography variant="body2">
              <strong>4. Limitations</strong>
              <br />
              In no event shall the service or its suppliers be liable for any damages arising out of the use or
              inability to use the materials on this service.
            </Typography>
            <Typography variant="body2">
              <strong>5. Accuracy of Materials</strong>
              <br />
              The materials appearing on this service could include technical, typographical, or photographic errors.
            </Typography>
            <Typography variant="body2">
              <strong>6. Links</strong>
              <br />
              The service has not reviewed all of the sites linked to its website and is not responsible for the
              contents of any such linked site.
            </Typography>
          </div>
        </Dialog.Description>
        <div style={{marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '8px'}}>
          <Dialog.Close asChild>
            <Button variant="outline">Decline</Button>
          </Dialog.Close>
          <Dialog.Close asChild>
            <Button>Accept</Button>
          </Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog>
  ),
};
