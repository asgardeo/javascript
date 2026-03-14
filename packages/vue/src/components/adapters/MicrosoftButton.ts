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

import {defineComponent, h} from 'vue';
import useI18n from '../../composables/useI18n';
import Button from '../primitives/Button';

/**
 * Microsoft Sign-In Button Component.
 * Handles authentication with Microsoft identity provider.
 */
const MicrosoftButton = defineComponent({
  name: 'MicrosoftButton',
  props: {
    isLoading: {type: Boolean, default: false},
  },
  emits: ['click'],
  setup(props, {slots, emit, attrs}) {
    const {t} = useI18n();

    const microsoftIcon = () =>
      h('svg', {width: '14', height: '14', viewBox: '0 0 23 23', xmlns: 'http://www.w3.org/2000/svg'}, [
        h('path', {fill: '#f3f3f3', d: 'M0 0h23v23H0z'}),
        h('path', {fill: '#f35325', d: 'M1 1h10v10H1z'}),
        h('path', {fill: '#81bc06', d: 'M12 1h10v10H12z'}),
        h('path', {fill: '#05a6f0', d: 'M1 12h10v10H1z'}),
        h('path', {fill: '#ffba08', d: 'M12 12h10v10H12z'}),
      ]);

    return () =>
      h(
        Button,
        {
          ...attrs,
          fullWidth: true,
          type: 'button' as const,
          color: 'secondary' as const,
          variant: 'solid' as const,
          disabled: props.isLoading,
          ...(slots['default'] ? {} : {startIcon: microsoftIcon()}),
          onClick: (e: MouseEvent) => emit('click', e),
        },
        () => slots['default']?.({isLoading: props.isLoading}) ?? (t('elements.buttons.microsoft.text') || 'Sign in with Microsoft'),
      );
  },
});

export default MicrosoftButton;
