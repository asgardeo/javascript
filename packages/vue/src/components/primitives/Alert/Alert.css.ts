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
 * Styles for the Alert primitive component.
 *
 * BEM block: `.asgardeo-alert`
 *
 * Modifiers:
 *   Severity: --info | --success | --warning | --error
 *
 * Elements:
 *   __content | __dismiss
 */
const ALERT_CSS = `
/* ============================================================
   Alert
   ============================================================ */

.asgardeo-alert {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: calc(var(--asgardeo-spacing-unit) * 1);
  padding: var(--asgardeo-alert-paddingY) var(--asgardeo-alert-paddingX);
  border-radius: var(--asgardeo-alert-borderRadius);
  border: 1px solid transparent;
  font-family: var(--asgardeo-typography-fontFamily);
  font-size: var(--asgardeo-typography-fontSize-sm);
  box-sizing: border-box;
  width: 100%;
  line-height: var(--asgardeo-typography-lineHeight-normal);
}

.asgardeo-alert__content {
  flex: 1;
}

.asgardeo-alert--info {
  background-color: var(--asgardeo-color-info-light);
  border-color: var(--asgardeo-color-info-main);
  color: var(--asgardeo-color-info-contrastText);
}

.asgardeo-alert--success {
  background-color: var(--asgardeo-color-success-light);
  border-color: var(--asgardeo-color-success-main);
  color: var(--asgardeo-color-success-contrastText);
}

.asgardeo-alert--warning {
  background-color: var(--asgardeo-color-warning-light);
  border-color: var(--asgardeo-color-warning-main);
  color: var(--asgardeo-color-warning-contrastText);
}

.asgardeo-alert--error {
  background-color: var(--asgardeo-color-error-light);
  border-color: var(--asgardeo-color-error-main);
  color: var(--asgardeo-color-error-contrastText);
}

.asgardeo-alert__dismiss {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1em;
  line-height: 0;
  padding: calc(var(--asgardeo-spacing-unit) * 0.25);
  border-radius: var(--asgardeo-border-radius-xs);
  color: inherit;
  opacity: 0.6;
  flex-shrink: 0;
  transition: opacity var(--asgardeo-transition-fast), background-color var(--asgardeo-transition-fast);
}
.asgardeo-alert__dismiss:hover {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.06);
}
`;

export default ALERT_CSS;
