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
 * Styles for the Checkbox primitive component.
 *
 * BEM block: `.asgardeo-checkbox`
 *
 * Modifiers:
 *   --error  – shows validation error state
 *
 * Elements:
 *   __wrapper | __input | __label | __error
 */
const CHECKBOX_CSS = `
/* ============================================================
   Checkbox
   ============================================================ */

.asgardeo-checkbox {
  display: flex;
  flex-direction: column;
  gap: calc(var(--asgardeo-spacing-unit) * 0.5);
  font-family: var(--asgardeo-typography-fontFamily);
}

.asgardeo-checkbox__wrapper {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--asgardeo-spacing-unit) * 0.75);
  cursor: pointer;
  user-select: none;
}

.asgardeo-checkbox__input {
  width: var(--asgardeo-checkbox-size);
  height: var(--asgardeo-checkbox-size);
  cursor: pointer;
  accent-color: var(--asgardeo-color-primary-main);
  flex-shrink: 0;
  border-radius: var(--asgardeo-border-radius-xs);
}
.asgardeo-checkbox__input:focus-visible {
  outline: none;
  box-shadow: 0 0 0 var(--asgardeo-focus-ring-width) var(--asgardeo-focus-ring-color);
}
.asgardeo-checkbox__input:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.asgardeo-checkbox__label {
  font-size: var(--asgardeo-typography-fontSize-md);
  color: var(--asgardeo-color-text-primary);
  line-height: var(--asgardeo-typography-lineHeight-normal);
}

.asgardeo-checkbox__error {
  font-size: var(--asgardeo-typography-fontSize-xs);
  color: var(--asgardeo-color-error-contrastText);
  line-height: var(--asgardeo-typography-lineHeight-normal);
}
`;

export default CHECKBOX_CSS;
