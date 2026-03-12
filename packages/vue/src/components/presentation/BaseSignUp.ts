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
import Card from '../primitives/Card';
import Divider from '../primitives/Divider';
import Logo from '../primitives/Logo';
import Spinner from '../primitives/Spinner';
import Typography from '../primitives/Typography';

export interface BaseSignUpProps {
  afterSignUpUrl?: string;
  className?: string;
  isLoading?: boolean;
  onComplete?: (redirectUrl: string) => void;
  onError?: (error: Error) => void;
  onInitialize?: () => Promise<unknown>;
  onSubmit?: (payload: unknown) => Promise<unknown>;
  onSuccess?: (response: Record<string, unknown>) => void;
  showLogo?: boolean;
  showSubtitle?: boolean;
  showTitle?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'elevated' | 'outlined' | 'flat';
}

/**
 * BaseSignUp — unstyled sign-up presentation component.
 *
 * Provides slot-based customization for the sign-up form.
 */
const BaseSignUp = defineComponent({
  name: 'BaseSignUp',
  props: {
    className: {type: String, default: ''},
    isLoading: {type: Boolean, default: false},
    showLogo: {type: Boolean, default: true},
    showTitle: {type: Boolean, default: true},
    showSubtitle: {type: Boolean, default: true},
    size: {type: String as PropType<'small' | 'medium' | 'large'>, default: 'medium'},
    variant: {type: String as PropType<'elevated' | 'outlined' | 'flat'>, default: 'elevated'},
    afterSignUpUrl: {type: String, default: undefined},
    onInitialize: {type: Function as PropType<() => Promise<unknown>>, default: undefined},
    onSubmit: {type: Function as PropType<(payload: unknown) => Promise<unknown>>, default: undefined},
    onSuccess: {type: Function as PropType<(response: Record<string, unknown>) => void>, default: undefined},
    onComplete: {type: Function as PropType<(redirectUrl: string) => void>, default: undefined},
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
        children.push(h('div', {class: prefix('sign-up__logo')}, [h(Logo)]));
      }

      if (props.showTitle) {
        children.push(h(Typography, {variant: 'h5', class: prefix('sign-up__title')}, () => 'Create Account'));
      }

      if (props.showSubtitle) {
        children.push(
          h(Typography, {variant: 'body2', class: prefix('sign-up__subtitle')}, () => 'Sign up for a new account'),
        );
      }

      children.push(h(Divider, {class: prefix('sign-up__divider')}));

      if (error.value) {
        children.push(
          h(Alert, {severity: 'error' as const, class: prefix('sign-up__error'), dismissible: true}, () => error.value),
        );
      }

      if (loading.value) {
        children.push(h('div', {class: prefix('sign-up__loading')}, [h(Spinner)]));
      }

      if (slots['content']) {
        children.push(h('div', {class: prefix('sign-up__content')}, slots['content']()));
      }

      if (slots['actions']) {
        children.push(h('div', {class: prefix('sign-up__actions')}, slots['actions']()));
      }

      if (slots['footer']) {
        children.push(h('div', {class: prefix('sign-up__footer')}, slots['footer']()));
      }

      return h(
        Card,
        {
          class: [prefix('sign-up'), prefix(`sign-up--${props.size}`), props.className].filter(Boolean).join(' '),
          variant: props.variant,
        },
        () => children,
      );
    };
  },
});

export default BaseSignUp;
