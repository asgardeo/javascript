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
import Alert from '../../primitives/Alert';
import Button from '../../primitives/Button';
import Card from '../../primitives/Card';
import Spinner from '../../primitives/Spinner';
import Typography from '../../primitives/Typography';

export interface BaseAcceptInviteProps {
  className?: string;
  invitationCode?: string;
  isLoading?: boolean;
  onAccept?: (invitationCode: string) => Promise<void>;
  onError?: (error: Error) => void;
  onSuccess?: () => void;
  size?: 'small' | 'medium' | 'large';
  variant?: 'elevated' | 'outlined' | 'flat';
}

/**
 * BaseAcceptInvite — unstyled invitation acceptance UI.
 *
 * Requires an invitationCode prop and calls onAccept when the user accepts.
 */
const BaseAcceptInvite = defineComponent({
  name: 'BaseAcceptInvite',
  props: {
    className: {type: String, default: ''},
    invitationCode: {type: String, default: ''},
    isLoading: {type: Boolean, default: false},
    size: {type: String as PropType<'small' | 'medium' | 'large'>, default: 'medium'},
    variant: {type: String as PropType<'elevated' | 'outlined' | 'flat'>, default: 'elevated'},
    onAccept: {type: Function as PropType<(invitationCode: string) => Promise<void>>, default: undefined},
    onSuccess: {type: Function as PropType<() => void>, default: undefined},
    onError: {type: Function as PropType<(error: Error) => void>, default: undefined},
  },
  setup(props, {slots}) {
    const loading = ref(props.isLoading);
    const error = ref<string | null>(null);

    const handleAccept = async () => {
      if (!props.invitationCode || !props.onAccept) return;

      loading.value = true;
      error.value = null;

      try {
        await props.onAccept(props.invitationCode);
        props.onSuccess?.();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to accept invitation';
        error.value = message;
        props.onError?.(err instanceof Error ? err : new Error(message));
      } finally {
        loading.value = false;
      }
    };

    return () => {
      if (slots['default']) {
        return slots['default']({isLoading: loading.value, error: error.value, accept: handleAccept});
      }

      const prefix = withVendorCSSClassPrefix;
      const children: VNode[] = [];

      children.push(
        h(Typography, {variant: 'h5', class: prefix('accept-invite__title')}, () => 'Accept Invitation'),
      );

      children.push(
        h(
          Typography,
          {variant: 'body2', class: prefix('accept-invite__subtitle')},
          () => 'You have been invited to join an organization.',
        ),
      );

      if (error.value) {
        children.push(h(Alert, {severity: 'error' as const, dismissible: true}, () => error.value));
      }

      if (loading.value) {
        children.push(h('div', {class: prefix('accept-invite__loading')}, [h(Spinner)]));
      }

      if (slots['content']) {
        children.push(h('div', {class: prefix('accept-invite__content')}, slots['content']()));
      }

      children.push(
        h('div', {class: prefix('accept-invite__actions')}, [
          h(
            Button,
            {
              color: 'primary' as const,
              variant: 'solid' as const,
              disabled: loading.value || !props.invitationCode,
              loading: loading.value,
              onClick: handleAccept,
            },
            () => 'Accept Invitation',
          ),
        ]),
      );

      return h(
        Card,
        {
          class: [prefix('accept-invite'), prefix(`accept-invite--${props.size}`), props.className]
            .filter(Boolean)
            .join(' '),
          variant: props.variant,
        },
        () => children,
      );
    };
  },
});

export default BaseAcceptInvite;
