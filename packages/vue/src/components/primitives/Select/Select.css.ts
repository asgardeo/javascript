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
 * Styles for the Select primitive component.
 *
 * BEM block: `.asgardeo-select`
 *
 * Modifiers:
 *   --error  – shows validation error state
 *
 * Elements:
 *   __label | __required | __input | __error | __helper
 */
const SELECT_CSS = `
/* ============================================================
   Select
   ============================================================ */

.asgardeo-select {
  display: flex;
  flex-direction: column;
  gap: calc(var(--asgardeo-spacing-unit) * 0.5);
  font-family: var(--asgardeo-typography-fontFamily);
  width: 100%;
  box-sizing: border-box;
}

.asgardeo-select__label {
  font-size: var(--asgardeo-typography-fontSize-sm);
  font-weight: var(--asgardeo-typography-fontWeight-medium);
  color: var(--asgardeo-color-text-primary);
  display: block;
}

.asgardeo-select__required {
  color: var(--asgardeo-color-error-main);
  margin-left: 2px;
}

.asgardeo-select__input {
  width: 100%;
  padding: calc(var(--asgardeo-spacing-unit) * 1) calc(var(--asgardeo-spacing-unit) * 4) calc(var(--asgardeo-spacing-unit) * 1) calc(var(--asgardeo-spacing-unit) * 1.5);
  border: 1px solid var(--asgardeo-color-border);
  border-radius: var(--asgardeo-border-radius-small);
  font-family: var(--asgardeo-typography-fontFamily);
  font-size: var(--asgardeo-typography-fontSize-md);
  color: var(--asgardeo-color-text-primary);
  background-color: var(--asgardeo-color-background-surface);
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right calc(var(--asgardeo-spacing-unit) * 1.5) center;
  cursor: pointer;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
  line-height: var(--asgardeo-typography-lineHeight-normal);
}
.asgardeo-select__input:focus {
  border-color: var(--asgardeo-color-primary-main);
  box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.15);
}
.asgardeo-select__input:disabled {
  background-color: var(--asgardeo-color-background-disabled);
  cursor: not-allowed;
}

.asgardeo-select--error .asgardeo-select__input {
  border-color: var(--asgardeo-color-error-main);
}

.asgardeo-select__error {
  font-size: var(--asgardeo-typography-fontSize-xs);
  color: var(--asgardeo-color-error-contrastText);
}

.asgardeo-select__helper {
  font-size: var(--asgardeo-typography-fontSize-xs);
  color: var(--asgardeo-color-text-secondary);
}
`;

export default SELECT_CSS;
