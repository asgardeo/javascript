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

import {withVendorCSSClassPrefix} from '@asgardeo/browser';
import {type PropType, type VNode, defineComponent, h, ref} from 'vue';
import Alert from '../primitives/Alert';
import Button from '../primitives/Button';
import Card from '../primitives/Card';
import Spinner from '../primitives/Spinner';
import TextField from '../primitives/TextField';
import Typography from '../primitives/Typography';

export interface BaseInviteUserProps {
  className?: string;
  isLoading?: boolean;
  onError?: (error: Error) => void;
  onInvite?: (email: string, roles?: string[]) => Promise<void>;
  onSuccess?: () => void;
  size?: 'small' | 'medium' | 'large';
  variant?: 'elevated' | 'outlined' | 'flat';
}

/**
 * BaseInviteUser — unstyled admin invite UI.
 *
 * Provides an email input and invite button for inviting users to an organization.
 */
const BaseInviteUser = defineComponent({
  name: 'BaseInviteUser',
  props: {
    className: {type: String, default: ''},
    isLoading: {type: Boolean, default: false},
    size: {type: String as PropType<'small' | 'medium' | 'large'>, default: 'medium'},
    variant: {type: String as PropType<'elevated' | 'outlined' | 'flat'>, default: 'elevated'},
    onInvite: {type: Function as PropType<(email: string, roles?: string[]) => Promise<void>>, default: undefined},
    onSuccess: {type: Function as PropType<() => void>, default: undefined},
    onError: {type: Function as PropType<(error: Error) => void>, default: undefined},
  },
  setup(props, {slots}) {
    const loading = ref(props.isLoading);
    const error = ref<string | null>(null);
    const email = ref('');
    const success = ref(false);

    const handleInvite = async () => {
      if (!email.value || !props.onInvite) return;

      loading.value = true;
      error.value = null;
      success.value = false;

      try {
        await props.onInvite(email.value);
        success.value = true;
        email.value = '';
        props.onSuccess?.();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to send invitation';
        error.value = message;
        props.onError?.(err instanceof Error ? err : new Error(message));
      } finally {
        loading.value = false;
      }
    };

    return () => {
      if (slots['default']) {
        return slots['default']({
          isLoading: loading.value,
          error: error.value,
          email: email.value,
          invite: handleInvite,
        });
      }

      const prefix = withVendorCSSClassPrefix;
      const children: VNode[] = [];

      children.push(h(Typography, {variant: 'h5', class: prefix('invite-user__title')}, () => 'Invite User'));
      children.push(
        h(
          Typography,
          {variant: 'body2', class: prefix('invite-user__subtitle')},
          () => 'Send an invitation to join your organization.',
        ),
      );

      if (error.value) {
        children.push(h(Alert, {severity: 'error' as const, dismissible: true}, () => error.value));
      }

      if (success.value) {
        children.push(h(Alert, {severity: 'success' as const, dismissible: true}, () => 'Invitation sent successfully!'));
      }

      children.push(
        h('div', {class: prefix('invite-user__form')}, [
          h(TextField, {
            label: 'Email Address',
            type: 'email',
            modelValue: email.value,
            'onUpdate:modelValue': (v: string) => (email.value = v),
            placeholder: 'user@example.com',
            required: true,
          }),
        ]),
      );

      if (slots['content']) {
        children.push(h('div', {class: prefix('invite-user__extra')}, slots['content']()));
      }

      children.push(
        h('div', {class: prefix('invite-user__actions')}, [
          h(
            Button,
            {
              color: 'primary' as const,
              variant: 'solid' as const,
              disabled: loading.value || !email.value,
              loading: loading.value,
              onClick: handleInvite,
            },
            () => 'Send Invitation',
          ),
        ]),
      );

      return h(
        Card,
        {
          class: [prefix('invite-user'), prefix(`invite-user--${props.size}`), props.className]
            .filter(Boolean)
            .join(' '),
          variant: props.variant,
        },
        () => children,
      );
    };
  },
});

export default BaseInviteUser;
