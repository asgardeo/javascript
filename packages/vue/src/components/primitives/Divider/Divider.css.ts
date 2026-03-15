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
 * Styles for the Divider primitive component.
 *
 * BEM block: `.asgardeo-divider`
 *
 * Modifiers:
 *   --horizontal   – full-width horizontal rule
 *   --vertical     – inline vertical bar
 *   --with-content – flex row with centred label between two lines
 *
 * Elements:
 *   __line | __content
 */
const DIVIDER_CSS = `
/* ============================================================
   Divider
   ============================================================ */

.asgardeo-divider {
  box-sizing: border-box;
}

.asgardeo-divider--horizontal {
  width: 100%;
  border: none;
  border-top: 1px solid var(--asgardeo-color-border);
  margin: calc(var(--asgardeo-spacing-unit) * 1) 0;
}

.asgardeo-divider--vertical {
  display: inline-block;
  width: 1px;
  height: 100%;
  min-height: 1em;
  border: none;
  background-color: var(--asgardeo-color-border);
  margin: 0 calc(var(--asgardeo-spacing-unit) * 1);
  align-self: stretch;
}

.asgardeo-divider--with-content {
  display: flex;
  align-items: center;
  gap: calc(var(--asgardeo-spacing-unit) * 1);
  border: none;
  margin: calc(var(--asgardeo-spacing-unit) * 1) 0;
}

.asgardeo-divider__line {
  flex: 1;
  height: 1px;
  background-color: var(--asgardeo-color-border);
}

.asgardeo-divider__content {
  flex-shrink: 0;
  font-size: var(--asgardeo-typography-fontSize-xs);
  color: var(--asgardeo-color-text-secondary);
  padding: 0 calc(var(--asgardeo-spacing-unit) * 0.5);
  font-family: var(--asgardeo-typography-fontFamily);
  text-transform: uppercase;
  letter-spacing: var(--asgardeo-typography-letterSpacing-wide);
  font-weight: var(--asgardeo-typography-fontWeight-medium);
}
`;

export default DIVIDER_CSS;
