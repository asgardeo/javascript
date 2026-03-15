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
 * Styles for the OrganizationList presentation component.
 *
 * BEM block: `.asgardeo-organization-list`
 *
 * The root element is a plain `div`. There is no Card wrapper here,
 * so this file provides the full layout including border and spacing.
 *
 * Elements:
 *   __loading  – loading state container (centred Spinner)
 *   __empty    – empty state message (Typography body2)
 *   __item     – each selectable organization row button
 */
const ORGANIZATION_LIST_CSS = `
/* ============================================================
   OrganizationList
   ============================================================ */

.asgardeo-organization-list {
  display: flex;
  flex-direction: column;
  gap: calc(var(--asgardeo-spacing-unit) * 0.5);
  font-family: var(--asgardeo-typography-fontFamily);
}

/* Loading / Empty ------------------------------------------- */

.asgardeo-organization-list__loading,
.asgardeo-organization-list__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: calc(var(--asgardeo-spacing-unit) * 3);
  color: var(--asgardeo-color-text-secondary);
}

/* Items ----------------------------------------------------- */

.asgardeo-organization-list__item {
  display: flex;
  align-items: center;
  gap: calc(var(--asgardeo-spacing-unit) * 1.25);
  width: 100%;
  padding: calc(var(--asgardeo-spacing-unit) * 1.25) calc(var(--asgardeo-spacing-unit) * 1.5);
  background: var(--asgardeo-color-background-surface);
  border: 1px solid var(--asgardeo-color-border);
  border-radius: var(--asgardeo-border-radius-small);
  cursor: pointer;
  text-align: left;
  font-family: var(--asgardeo-typography-fontFamily);
  font-size: var(--asgardeo-typography-fontSize-md);
  color: var(--asgardeo-color-text-primary);
  transition:
    background-color var(--asgardeo-transition-fast),
    border-color var(--asgardeo-transition-fast),
    box-shadow var(--asgardeo-transition-fast);
  box-sizing: border-box;
}

.asgardeo-organization-list__item:hover {
  background-color: var(--asgardeo-color-primary-light);
  border-color: var(--asgardeo-color-primary-main);
}

.asgardeo-organization-list__item:focus-visible {
  outline: none;
  box-shadow: 0 0 0 var(--asgardeo-focus-ring-width) var(--asgardeo-focus-ring-color);
}
`;

export default ORGANIZATION_LIST_CSS;
