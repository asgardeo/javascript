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
 * Styles for the OtpField primitive component.
 *
 * BEM block: `.asgardeo-otp-field`
 *
 * Elements:
 *   __label | __required | __inputs | __digit | __error
 */
const OTP_FIELD_CSS = `
/* ============================================================
   OtpField
   ============================================================ */

.asgardeo-otp-field {
  display: flex;
  flex-direction: column;
  gap: calc(var(--asgardeo-spacing-unit) * 1);
  font-family: var(--asgardeo-typography-fontFamily);
}

.asgardeo-otp-field__label {
  font-size: var(--asgardeo-typography-fontSize-sm);
  font-weight: var(--asgardeo-typography-fontWeight-medium);
  color: var(--asgardeo-color-text-primary);
  display: block;
}

.asgardeo-otp-field__required {
  color: var(--asgardeo-color-error-main);
  margin-left: 2px;
}

.asgardeo-otp-field__inputs {
  display: flex;
  gap: calc(var(--asgardeo-spacing-unit) * 1);
}

.asgardeo-otp-field__digit {
  width: calc(var(--asgardeo-spacing-unit) * 5);
  height: calc(var(--asgardeo-spacing-unit) * 5);
  text-align: center;
  border: 1px solid var(--asgardeo-color-border);
  border-radius: var(--asgardeo-border-radius-small);
  font-family: var(--asgardeo-typography-fontFamily);
  font-size: var(--asgardeo-typography-fontSize-lg);
  font-weight: var(--asgardeo-typography-fontWeight-semibold);
  color: var(--asgardeo-color-text-primary);
  background-color: var(--asgardeo-color-background-surface);
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.asgardeo-otp-field__digit:focus {
  border-color: var(--asgardeo-color-primary-main);
  box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.15);
}
.asgardeo-otp-field__digit:disabled {
  background-color: var(--asgardeo-color-background-disabled);
  cursor: not-allowed;
}

.asgardeo-otp-field__error {
  font-size: var(--asgardeo-typography-fontSize-xs);
  color: var(--asgardeo-color-error-contrastText);
}
`;

export default OTP_FIELD_CSS;
