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
 * Styles for the DatePicker primitive component.
 *
 * BEM block: `.asgardeo-date-picker`
 *
 * Modifiers:
 *   --error  – shows validation error state
 *
 * Elements:
 *   __label | __required | __input | __error
 */
const DATE_PICKER_CSS: string = `
/* ============================================================
   DatePicker
   ============================================================ */

.asgardeo-date-picker {
  display: flex;
  flex-direction: column;
  gap: calc(var(--asgardeo-spacing-unit) * 0.5);
  font-family: var(--asgardeo-typography-fontFamily);
  width: 100%;
  box-sizing: border-box;
}

.asgardeo-date-picker__label {
  font-size: var(--asgardeo-typography-fontSize-sm);
  font-weight: var(--asgardeo-typography-fontWeight-medium);
  color: var(--asgardeo-color-text-primary);
  display: block;
  line-height: var(--asgardeo-typography-lineHeight-normal);
}

.asgardeo-date-picker__required {
  color: var(--asgardeo-color-error-main);
  margin-left: 2px;
}

.asgardeo-date-picker__input {
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
  cursor: pointer;
}
.asgardeo-date-picker__input:focus {
  border-color: var(--asgardeo-input-focusBorderColor);
  box-shadow: var(--asgardeo-input-focusRing);
}
.asgardeo-date-picker--error .asgardeo-date-picker__input {
  border-color: var(--asgardeo-color-error-main);
}
.asgardeo-date-picker--error .asgardeo-date-picker__input:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
}
.asgardeo-date-picker__input:disabled {
  background-color: var(--asgardeo-color-background-disabled);
  color: var(--asgardeo-color-action-disabled);
  cursor: not-allowed;
}

.asgardeo-date-picker__error {
  font-size: var(--asgardeo-typography-fontSize-xs);
  color: var(--asgardeo-color-error-contrastText);
  line-height: var(--asgardeo-typography-lineHeight-normal);
}
`;

export default DATE_PICKER_CSS;
