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
import Divider from '../../primitives/Divider';
import Logo from '../../primitives/Logo';
import Spinner from '../../primitives/Spinner';
import Typography from '../../primitives/Typography';

export interface BaseSignInProps {
  afterSignInUrl?: string;
  className?: string;
  isLoading?: boolean;
  onError?: (error: Error) => void;
  onInitialize?: () => Promise<unknown>;
  onSubmit?: (payload: unknown, request?: unknown) => Promise<unknown>;
  onSuccess?: (authData: Record<string, unknown>) => void;
  showLogo?: boolean;
  showSubtitle?: boolean;
  showTitle?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'elevated' | 'outlined' | 'flat';
}

/**
 * BaseSignIn — unstyled sign-in presentation component.
 *
 * Provides default slot for full customization, or renders a default
 * sign-in card UI with flow support.
 */
const BaseSignIn = defineComponent({
  name: 'BaseSignIn',
  props: {
    className: {type: String, default: ''},
    isLoading: {type: Boolean, default: false},
    showLogo: {type: Boolean, default: true},
    showTitle: {type: Boolean, default: true},
    showSubtitle: {type: Boolean, default: true},
    size: {type: String as PropType<'small' | 'medium' | 'large'>, default: 'medium'},
    variant: {type: String as PropType<'elevated' | 'outlined' | 'flat'>, default: 'elevated'},
    afterSignInUrl: {type: String, default: undefined},
    onInitialize: {type: Function as PropType<() => Promise<unknown>>, default: undefined},
    onSubmit: {type: Function as PropType<(payload: unknown, request?: unknown) => Promise<unknown>>, default: undefined},
    onSuccess: {type: Function as PropType<(authData: Record<string, unknown>) => void>, default: undefined},
    onError: {type: Function as PropType<(error: Error) => void>, default: undefined},
  },
  setup(props, {slots}) {
    const loading = ref(props.isLoading);
    const error = ref<string | null>(null);

    return () => {
      if (slots['default']) {
        return slots['default']({isLoading: loading.value, error: error.value});
      }

      const prefix = withVendorCSSClassPrefix;

      const children: VNode[] = [];

      if (props.showLogo) {
        children.push(h('div', {class: prefix('sign-in__logo')}, [h(Logo)]));
      }

      if (props.showTitle) {
        children.push(h(Typography, {variant: 'h5', class: prefix('sign-in__title')}, () => 'Sign In'));
      }

      if (props.showSubtitle) {
        children.push(
          h(Typography, {variant: 'body2', class: prefix('sign-in__subtitle')}, () => 'Sign in to your account'),
        );
      }

      children.push(h(Divider, {class: prefix('sign-in__divider')}));

      if (error.value) {
        children.push(
          h(Alert, {severity: 'error' as const, class: prefix('sign-in__error'), dismissible: true}, () => error.value),
        );
      }

      if (loading.value) {
        children.push(h('div', {class: prefix('sign-in__loading')}, [h(Spinner)]));
      }

      // Slot for flow content (form fields, social buttons, etc.)
      if (slots['content']) {
        children.push(h('div', {class: prefix('sign-in__content')}, slots['content']()));
      }

      // Slot for actions
      if (slots['actions']) {
        children.push(h('div', {class: prefix('sign-in__actions')}, slots['actions']()));
      }

      // Slot for footer content
      if (slots['footer']) {
        children.push(h('div', {class: prefix('sign-in__footer')}, slots['footer']()));
      }

      return h(
        Card,
        {
          class: [prefix('sign-in'), prefix(`sign-in--${props.size}`), props.className].filter(Boolean).join(' '),
          variant: props.variant,
        },
        () => children,
      );
    };
  },
});

export default BaseSignIn;
