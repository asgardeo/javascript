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

import {EmbeddedFlowComponent, EmbeddedFlowComponentType} from '@asgardeo/browser';
import useTranslation, {UseTranslation} from '../../../../hooks/useTranslation';

/**
 * Generate a unique ID for components
 */
const generateId = (prefix: string): string => {
  const suffix = Math.random().toString(36).substring(2, 6);
  return `${prefix}_${suffix}`;
};

/**
 * Convert simple input type to component variant
 */
const getInputVariant = (type: string): 'TEXT' | 'EMAIL' | 'PASSWORD' => {
  switch (type.toLowerCase()) {
    case 'email':
      return 'EMAIL';
    case 'password':
      return 'PASSWORD';
    default:
      return 'TEXT';
  }
};

/**
 * Get appropriate label for input based on name and type
 */
const getInputLabel = (name: string, type: string, t: UseTranslation['t']): string => {
  // Use i18n keys for labels, fallback to capitalized name
  const i18nKey = `elements.fields.${name}`;
  // Try translation, fallback to capitalized name
  const label = t(i18nKey);

  if (label === i18nKey || !label) {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  return label;
};

/**
 * Get appropriate placeholder for input based on name and type
 */
const getInputPlaceholder = (name: string, type: string, t: UseTranslation['t']): string => {
  const label = getInputLabel(name, type, t);
  const placeholder = t('elements.fields.placeholder', {field: label});
  // If translation not found, fallback
  if (!placeholder || placeholder === 'elements.fields.placeholder') {
    return `Enter your ${label}`;
  }
  return placeholder;
};

/**
 * Convert simple input to component-driven input component
 */
const convertSimpleInputToComponent = (
  input: {
    name: string;
    type: string;
    required: boolean;
  },
  t: UseTranslation['t'],
): EmbeddedFlowComponent => {
  const variant = getInputVariant(input.type);
  const label = getInputLabel(input.name, input.type, t);
  const placeholder = getInputPlaceholder(input.name, input.type, t);

  return {
    id: generateId('input'),
    type: EmbeddedFlowComponentType.Input,
    variant,
    config: {
      type: input.type === 'string' ? 'text' : input.type,
      label,
      placeholder,
      required: input.required,
      identifier: input.name,
      hint: '',
    },
    components: [],
  };
};

/**
 * Convert action to component-driven button component
 */
const convertActionToComponent = (
  action: {type: string; id: string},
  t: UseTranslation['t'],
): EmbeddedFlowComponent => {
  // Use i18n key for button text, fallback to capitalized id
  const i18nKey = `elements.buttons.${action.id}`;
  let text = t(i18nKey);
  if (!text || text === i18nKey) {
    text = action.id.replace(/_/g, ' ');
    text = text.charAt(0).toUpperCase() + text.slice(1);
  }
  return {
    id: generateId('action'),
    type: EmbeddedFlowComponentType.Button,
    variant: 'SECONDARY',
    config: {
      type: 'button',
      text,
      actionId: action.id,
      actionType: action.type,
    },
    components: [],
  };
};

/**
 * Transform simple flow response to component-driven format
 */
export const transformSimpleToComponentDriven = (response: any, t: UseTranslation['t']): EmbeddedFlowComponent[] => {
  // Create input components if present
  const inputComponents = response?.data?.inputs?.map((input: any) => convertSimpleInputToComponent(input, t)) || [];

  // Create action buttons if present
  const actionComponents = response?.data?.actions?.map((action: any) => convertActionToComponent(action, t)) || [];

  // Add a submit button if there are inputs
  const submitButton: EmbeddedFlowComponent | null =
    inputComponents.length > 0
      ? {
          id: generateId('button'),
          type: EmbeddedFlowComponentType.Button,
          variant: 'PRIMARY',
          config: {
            type: 'submit',
            text: t('elements.buttons.signIn'),
          },
          components: [],
        }
      : null;

  // Compose form components (inputs + submit only)
  const formComponents: EmbeddedFlowComponent[] = [];
  if (inputComponents.length > 0) {
    formComponents.push(...inputComponents);
    if (submitButton) formComponents.push(submitButton);
  }

  const result: EmbeddedFlowComponent[] = [];
  // Add form if there are input fields
  if (formComponents.length > 0) {
    result.push({
      id: generateId('form'),
      type: EmbeddedFlowComponentType.Form,
      config: {},
      components: formComponents,
    });
  }
  // Add actions outside the form
  if (actionComponents.length > 0) {
    result.push(...actionComponents);
  }
  return result;
};

/**
 * Generic transformer that handles both simple and component-driven responses
 */
export const normalizeFlowResponse = (
  response: any,
  t: UseTranslation['t'],
): {
  flowId: string;
  components: EmbeddedFlowComponent[];
} => {
  return {
    flowId: response.flowId,
    components: transformSimpleToComponentDriven(response, t),
  };
};
