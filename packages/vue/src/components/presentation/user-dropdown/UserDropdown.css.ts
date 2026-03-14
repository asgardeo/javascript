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
 * Styles for the UserDropdown presentation component.
 *
 * BEM block: `.asgardeo-user-dropdown`
 *
 * The root element is a plain `div` (no Card wrapper), so this file
 * is responsible for all layout. The dropdown is absolute-positioned
 * relative to the root using `position: relative`.
 *
 * Elements:
 *   __trigger  – pill-shaped trigger button (avatar + name + chevron)
 *   __avatar   – circular icon container inside the trigger
 *   __name     – display-name Typography inside the trigger
 *   __menu     – absolute-positioned dropdown panel
 *   __item     – each action row inside the menu
 */
const USER_DROPDOWN_CSS = `
/* ============================================================
   UserDropdown
   ============================================================ */

.asgardeo-user-dropdown {
  position: relative;
  display: inline-block;
  font-family: var(--asgardeo-typography-fontFamily);
}

/* Trigger ---------------------------------------------------- */

.asgardeo-user-dropdown__trigger {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--asgardeo-spacing-unit) * 1);
  padding: calc(var(--asgardeo-spacing-unit) * 0.75) calc(var(--asgardeo-spacing-unit) * 1.25)
    calc(var(--asgardeo-spacing-unit) * 0.75) calc(var(--asgardeo-spacing-unit) * 0.75);
  background: none;
  border: 1px solid var(--asgardeo-color-border);
  border-radius: var(--asgardeo-border-radius-large);
  cursor: pointer;
  color: var(--asgardeo-color-text-primary);
  font-family: var(--asgardeo-typography-fontFamily);
  transition: background-color 0.15s ease, border-color 0.15s ease;
  box-sizing: border-box;
}

.asgardeo-user-dropdown__trigger:hover {
  background-color: var(--asgardeo-color-action-hover);
  border-color: var(--asgardeo-color-primary-main);
}

.asgardeo-user-dropdown__trigger:focus-visible {
  outline: 2px solid var(--asgardeo-color-primary-main);
  outline-offset: 2px;
}

/* Avatar ---------------------------------------------------- */

.asgardeo-user-dropdown__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(var(--asgardeo-spacing-unit) * 3.5);
  height: calc(var(--asgardeo-spacing-unit) * 3.5);
  border-radius: 50%;
  background-color: var(--asgardeo-color-primary-main);
  color: var(--asgardeo-color-primary-contrastText);
  flex-shrink: 0;
}

/* Name ------------------------------------------------------ */

.asgardeo-user-dropdown__name {
  max-width: 160px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Dropdown menu --------------------------------------------- */

.asgardeo-user-dropdown__menu {
  position: absolute;
  top: calc(100% + calc(var(--asgardeo-spacing-unit) * 0.5));
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

/* Menu items ------------------------------------------------ */

.asgardeo-user-dropdown__item {
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
  font-size: var(--asgardeo-typography-fontSize-sm);
  color: var(--asgardeo-color-text-primary);
  transition: background-color 0.15s ease;
  box-sizing: border-box;
}

.asgardeo-user-dropdown__item:not(:first-child) {
  border-top-color: var(--asgardeo-color-border);
}

.asgardeo-user-dropdown__item:hover {
  background-color: var(--asgardeo-color-action-hover);
}

.asgardeo-user-dropdown__item:focus-visible {
  outline: 2px solid var(--asgardeo-color-primary-main);
  outline-offset: -2px;
}

/* Modal overlay ------------------------------------------------ */

.asgardeo-user-dropdown__modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

/* Modal content ------------------------------------------------ */

.asgardeo-user-dropdown__modal-content {
  background: white;
  border-radius: var(--asgardeo-border-radius-medium);
  box-shadow: var(--asgardeo-shadow-large);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

/* Modal close button ------------------------------------------ */

.asgardeo-user-dropdown__modal-close {
  position: absolute;
  top: calc(var(--asgardeo-spacing-unit) * 1.5);
  right: calc(var(--asgardeo-spacing-unit) * 1.5);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--asgardeo-color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: calc(var(--asgardeo-spacing-unit) * 0.5);
  border-radius: var(--asgardeo-border-radius-small);
  z-index: 10001;
  transition: color 0.15s ease, background-color 0.15s ease;
  line-height: 0;
}

.asgardeo-user-dropdown__modal-close:hover {
  color: var(--asgardeo-color-text-primary);
  background-color: var(--asgardeo-color-action-hover);
}

.asgardeo-user-dropdown__modal-close:focus-visible {
  outline: 2px solid var(--asgardeo-color-primary-main);
  outline-offset: 1px;
}
`;

export default USER_DROPDOWN_CSS;
