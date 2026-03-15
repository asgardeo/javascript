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
 * Styles for the PasswordField primitive component.
 *
 * BEM block: `.asgardeo-password-field`
 *
 * Modifiers:
 *   --error  – shows validation error state
 *
 * Elements:
 *   __label | __required | __wrapper | __input | __toggle | __error
 */
const PASSWORD_FIELD_CSS = `
/* ============================================================
   PasswordField
   ============================================================ */

.asgardeo-password-field {
  display: flex;
  flex-direction: column;
  gap: calc(var(--asgardeo-spacing-unit) * 0.5);
  font-family: var(--asgardeo-typography-fontFamily);
  width: 100%;
  box-sizing: border-box;
}

.asgardeo-password-field__label {
  font-size: var(--asgardeo-typography-fontSize-sm);
  font-weight: var(--asgardeo-typography-fontWeight-medium);
  color: var(--asgardeo-color-text-primary);
  display: block;
  line-height: var(--asgardeo-typography-lineHeight-normal);
}

.asgardeo-password-field__required {
  color: var(--asgardeo-color-error-main);
  margin-left: 2px;
}

.asgardeo-password-field__wrapper {
  display: flex;
  align-items: center;
  height: var(--asgardeo-input-height);
  border: 1px solid var(--asgardeo-input-borderColor);
  border-radius: var(--asgardeo-input-borderRadius);
  background-color: var(--asgardeo-color-background-surface);
  transition:
    border-color var(--asgardeo-transition-fast),
    box-shadow var(--asgardeo-transition-fast);
  overflow: hidden;
  box-sizing: border-box;
}
.asgardeo-password-field__wrapper:focus-within {
  border-color: var(--asgardeo-input-focusBorderColor);
  box-shadow: var(--asgardeo-input-focusRing);
}
.asgardeo-password-field--error .asgardeo-password-field__wrapper {
  border-color: var(--asgardeo-color-error-main);
}
.asgardeo-password-field--error .asgardeo-password-field__wrapper:focus-within {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
}

.asgardeo-password-field__input {
  flex: 1;
  padding: 0 var(--asgardeo-input-paddingX);
  border: none;
  outline: none;
  font-family: var(--asgardeo-typography-fontFamily);
  font-size: var(--asgardeo-input-fontSize);
  color: var(--asgardeo-color-text-primary);
  background: transparent;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  min-width: 0;
}
.asgardeo-password-field__input::placeholder {
  color: var(--asgardeo-color-text-secondary);
}
.asgardeo-password-field__input:disabled {
  cursor: not-allowed;
}

.asgardeo-password-field__toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 var(--asgardeo-input-paddingX);
  color: var(--asgardeo-color-text-secondary);
  font-size: var(--asgardeo-typography-fontSize-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  height: 100%;
  transition: color var(--asgardeo-transition-fast);
}
.asgardeo-password-field__toggle:hover {
  color: var(--asgardeo-color-text-primary);
}

.asgardeo-password-field__error {
  font-size: var(--asgardeo-typography-fontSize-xs);
  color: var(--asgardeo-color-error-contrastText);
  line-height: var(--asgardeo-typography-lineHeight-normal);
}
`;

export default PASSWORD_FIELD_CSS;
