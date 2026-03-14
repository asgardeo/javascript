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
 * Styles for the OrganizationSwitcher presentation component.
 *
 * BEM block: `.asgardeo-organization-switcher`
 *
 * The root element is a Card (`.asgardeo-card`), so we override its
 * default padding to let the trigger button fill the surface edge-to-edge,
 * and apply `position: relative` to anchor the absolute dropdown.
 *
 * Modifiers:  (none — state is controlled via isOpen in component logic)
 *
 * Elements:
 *   __trigger        – the clickable trigger button showing current org
 *   __trigger-label  – the org name Typography inside the trigger
 *   __dropdown       – the absolute-positioned dropdown listbox
 *   __loading        – loading state container (Spinner)
 *   __empty          – empty state message (Typography)
 *   __item           – each selectable organization row
 *   __item--active   – currently selected organization
 */
const ORGANIZATION_SWITCHER_CSS = `
/* ============================================================
   OrganizationSwitcher
   ============================================================ */

/* Override Card's default padding so the trigger button fills the surface */
.asgardeo-organization-switcher.asgardeo-card {
  padding: 0;
  position: relative;
  display: inline-block;
  min-width: 200px;
}

/* Trigger ---------------------------------------------------- */

.asgardeo-organization-switcher__trigger {
  display: flex;
  align-items: center;
  gap: calc(var(--asgardeo-spacing-unit) * 1);
  width: 100%;
  padding: calc(var(--asgardeo-spacing-unit) * 1.25) calc(var(--asgardeo-spacing-unit) * 1.5);
  background: none;
  border: none;
  cursor: pointer;
  border-radius: var(--asgardeo-border-radius-medium);
  color: var(--asgardeo-color-text-primary);
  font-family: var(--asgardeo-typography-fontFamily);
  transition: background-color 0.15s ease;
  text-align: left;
  box-sizing: border-box;
}

.asgardeo-organization-switcher__trigger:hover {
  background-color: var(--asgardeo-color-action-hover);
}

.asgardeo-organization-switcher__trigger:focus-visible {
  outline: 2px solid var(--asgardeo-color-primary-main);
  outline-offset: -2px;
  border-radius: var(--asgardeo-border-radius-medium);
}

.asgardeo-organization-switcher__trigger-label {
  flex: 1;
  text-align: left;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* Dropdown --------------------------------------------------- */

.asgardeo-organization-switcher__dropdown {
  position: absolute;
  top: calc(100% + calc(var(--asgardeo-spacing-unit) * 0.5));
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: var(--asgardeo-color-background-surface);
  border: 1px solid var(--asgardeo-color-border);
  border-radius: var(--asgardeo-border-radius-medium);
  box-shadow: var(--asgardeo-shadow-medium);
  overflow: hidden;
  min-width: 180px;
  display: flex;
  flex-direction: column;
}

/* Loading / Empty states ------------------------------------ */

.asgardeo-organization-switcher__loading,
.asgardeo-organization-switcher__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: calc(var(--asgardeo-spacing-unit) * 2);
  color: var(--asgardeo-color-text-secondary);
}

/* Items ----------------------------------------------------- */

.asgardeo-organization-switcher__item {
  display: flex;
  align-items: center;
  gap: calc(var(--asgardeo-spacing-unit) * 1);
  width: 100%;
  padding: calc(var(--asgardeo-spacing-unit) * 1.25) calc(var(--asgardeo-spacing-unit) * 1.5);
  background: none;
  border: none;
  border-top: 1px solid transparent;
  cursor: pointer;
  text-align: left;
  font-family: var(--asgardeo-typography-fontFamily);
  color: var(--asgardeo-color-text-primary);
  transition: background-color 0.15s ease;
  box-sizing: border-box;
}

.asgardeo-organization-switcher__item:hover {
  background-color: var(--asgardeo-color-action-hover);
}

.asgardeo-organization-switcher__item:not(:first-child) {
  border-top-color: var(--asgardeo-color-border);
}

.asgardeo-organization-switcher__item--active {
  background-color: var(--asgardeo-color-action-selected);
  color: var(--asgardeo-color-primary-main);
  font-weight: var(--asgardeo-typography-fontWeight-medium);
}

.asgardeo-organization-switcher__item--active:hover {
  background-color: var(--asgardeo-color-action-focus);
}
`;

export default ORGANIZATION_SWITCHER_CSS;
