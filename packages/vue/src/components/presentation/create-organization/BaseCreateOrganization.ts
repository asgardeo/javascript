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
import type {PropType} from 'vue';
import {defineComponent, h, ref} from 'vue';
import Alert from '../../primitives/Alert';
import Button from '../../primitives/Button';
import Card from '../../primitives/Card';
import TextField from '../../primitives/TextField';
import Typography from '../../primitives/Typography';

const cls = (name: string): string => withVendorCSSClassPrefix(`create-organization${name}`);

/**
 * BaseCreateOrganization — unstyled sub-organisation creation form.
 *
 * Provides a form with an org name input and create button.
 */
const BaseCreateOrganization = defineComponent({
  name: 'BaseCreateOrganization',
  props: {
    className: {type: String, default: ''},
    onCreate: {type: Function as PropType<(name: string) => Promise<void> | void>, default: undefined},
    title: {type: String, default: 'Create Organization'},
    description: {type: String, default: 'Create a new sub-organization.'},
  },
  setup(props, {slots}) {
    const orgName = ref('');
    const isSubmitting = ref(false);
    const error = ref<string | null>(null);

    const handleSubmit = async (): Promise<void> => {
      const name = orgName.value.trim();
      if (!name) {
        error.value = 'Organization name is required.';
        return;
      }

      error.value = null;
      isSubmitting.value = true;
      try {
        await props.onCreate?.(name);
        orgName.value = '';
      } catch (err: unknown) {
        error.value = err instanceof Error ? err.message : 'Failed to create organization.';
      } finally {
        isSubmitting.value = false;
      }
    };

    return () => {
      if (slots['default']) {
        return slots['default']({
          orgName: orgName.value,
          setOrgName: (v: string) => {
            orgName.value = v;
          },
          isSubmitting: isSubmitting.value,
          error: error.value,
          handleSubmit,
        });
      }

      return h(
        Card,
        {class: [cls(''), props.className].filter(Boolean).join(' ')},
        () => [
          h(Typography, {variant: 'h6', class: cls('__title')}, () => props.title),
          props.description
            ? h(Typography, {variant: 'body2', class: cls('__description')}, () => props.description)
            : null,
          error.value
            ? h(Alert, {type: 'error', class: cls('__error')}, () => error.value)
            : null,
          h(TextField, {
            label: 'Organization Name',
            modelValue: orgName.value,
            'onUpdate:modelValue': (v: string) => {
              orgName.value = v;
            },
            placeholder: 'Enter organization name',
            class: cls('__input'),
          }),
          h(
            Button,
            {
              variant: 'solid',
              color: 'primary',
              loading: isSubmitting.value,
              disabled: isSubmitting.value,
              onClick: handleSubmit,
              class: cls('__submit'),
            },
            () => 'Create',
          ),
        ],
      );
    };
  },
});

export default BaseCreateOrganization;
