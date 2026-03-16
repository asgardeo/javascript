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

/**
 * Styles for the TextField primitive component.
 *
 * BEM block: `.asgardeo-text-field`
 *
 * Modifiers:
 *   --error  – shows validation error state
 *
 * Elements:
 *   __label | __required | __input | __error | __helper
 */
const TEXT_FIELD_CSS = `
/* ============================================================
   TextField
   ============================================================ */

.asgardeo-text-field {
  display: flex;
  flex-direction: column;
  gap: calc(var(--asgardeo-spacing-unit) * 0.5);
  font-family: var(--asgardeo-typography-fontFamily);
  width: 100%;
  box-sizing: border-box;
}

.asgardeo-text-field__label {
  font-size: var(--asgardeo-typography-fontSize-sm);
  font-weight: var(--asgardeo-typography-fontWeight-medium);
  color: var(--asgardeo-color-text-primary);
  display: block;
  line-height: var(--asgardeo-typography-lineHeight-normal);
}

.asgardeo-text-field__required {
  color: var(--asgardeo-color-error-main);
  margin-left: 2px;
}

.asgardeo-text-field__input {
  width: 100%;
  height: var(--asgardeo-input-height);
  padding: 0 var(--asgardeo-input-paddingX);
  border: 1px solid var(--asgardeo-input-borderColor);
  border-radius: var(--asgardeo-input-borderRadius);
  font-family: var(--asgardeo-typography-fontFamily);
  font-size: var(--asgardeo-input-fontSize);
  color: var(--asgardeo-color-text-primary);
  background-color: var(--asgardeo-color-background-surface);
  box-sizing: border-box;
  transition:
    border-color var(--asgardeo-transition-fast),
    box-shadow var(--asgardeo-transition-fast);
  outline: none;
}
.asgardeo-text-field__input:focus {
  border-color: var(--asgardeo-input-focusBorderColor);
  box-shadow: var(--asgardeo-input-focusRing);
}
.asgardeo-text-field__input::placeholder {
  color: var(--asgardeo-color-text-secondary);
}
.asgardeo-text-field__input:disabled {
  background-color: var(--asgardeo-color-background-disabled);
  color: var(--asgardeo-color-action-disabled);
  cursor: not-allowed;
}

.asgardeo-text-field--error .asgardeo-text-field__input {
  border-color: var(--asgardeo-color-error-main);
}
.asgardeo-text-field--error .asgardeo-text-field__input:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
}

.asgardeo-text-field__error {
  font-size: var(--asgardeo-typography-fontSize-xs);
  color: var(--asgardeo-color-error-contrastText);
  line-height: var(--asgardeo-typography-lineHeight-normal);
}

.asgardeo-text-field__helper {
  font-size: var(--asgardeo-typography-fontSize-xs);
  color: var(--asgardeo-color-text-secondary);
  line-height: var(--asgardeo-typography-lineHeight-normal);
}
`;

export default TEXT_FIELD_CSS;
