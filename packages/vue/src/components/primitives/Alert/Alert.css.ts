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
  padding: calc(var(--asgardeo-spacing-unit) * 1.5) calc(var(--asgardeo-spacing-unit) * 2);
  border-radius: var(--asgardeo-border-radius-small);
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
  background-color: #e3f2fd;
  border-color: var(--asgardeo-color-info-contrastText);
  color: var(--asgardeo-color-info-contrastText);
}

.asgardeo-alert--success {
  background-color: #e8f5e9;
  border-color: #388e3c;
  color: var(--asgardeo-color-success-contrastText);
}

.asgardeo-alert--warning {
  background-color: #fff8e1;
  border-color: #f57c00;
  color: var(--asgardeo-color-warning-contrastText);
}

.asgardeo-alert--error {
  background-color: #ffebee;
  border-color: var(--asgardeo-color-error-main);
  color: var(--asgardeo-color-error-contrastText);
}

.asgardeo-alert__dismiss {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2em;
  line-height: 1;
  padding: 0;
  color: inherit;
  opacity: 0.7;
  flex-shrink: 0;
}
.asgardeo-alert__dismiss:hover {
  opacity: 1;
}
`;

export default ALERT_CSS;
