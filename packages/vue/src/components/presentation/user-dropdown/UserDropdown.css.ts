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
  gap: calc(var(--asgardeo-spacing-unit) * 0.75);
  padding: calc(var(--asgardeo-spacing-unit) * 0.5) calc(var(--asgardeo-spacing-unit) * 1)
    calc(var(--asgardeo-spacing-unit) * 0.5) calc(var(--asgardeo-spacing-unit) * 0.5);
  background: none;
  border: 1px solid var(--asgardeo-color-border);
  border-radius: 9999px;
  cursor: pointer;
  color: var(--asgardeo-color-text-primary);
  font-family: var(--asgardeo-typography-fontFamily);
  font-size: var(--asgardeo-typography-fontSize-md);
  transition:
    background-color var(--asgardeo-transition-fast),
    border-color var(--asgardeo-transition-fast),
    box-shadow var(--asgardeo-transition-fast);
  box-sizing: border-box;
}

.asgardeo-user-dropdown__trigger:hover {
  background-color: var(--asgardeo-color-action-hover);
  border-color: var(--asgardeo-color-primary-main);
}

.asgardeo-user-dropdown__trigger:focus-visible {
  outline: none;
  box-shadow: 0 0 0 var(--asgardeo-focus-ring-width) var(--asgardeo-focus-ring-color);
}

/* Avatar ---------------------------------------------------- */

.asgardeo-user-dropdown__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(var(--asgardeo-spacing-unit) * 3);
  height: calc(var(--asgardeo-spacing-unit) * 3);
  border-radius: 50%;
  background-color: var(--asgardeo-color-primary-main);
  color: var(--asgardeo-color-primary-contrastText);
  flex-shrink: 0;
  font-size: var(--asgardeo-typography-fontSize-sm);
  font-weight: var(--asgardeo-typography-fontWeight-medium);
}

/* Name ------------------------------------------------------ */

.asgardeo-user-dropdown__name {
  max-width: 140px;
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
  border-radius: var(--asgardeo-dropdown-borderRadius);
  box-shadow: var(--asgardeo-dropdown-shadow);
  overflow: hidden;
  min-width: 160px;
  display: flex;
  flex-direction: column;
  padding: calc(var(--asgardeo-spacing-unit) * 0.5) 0;
}

/* Menu items ------------------------------------------------ */

.asgardeo-user-dropdown__item {
  display: flex;
  align-items: center;
  gap: calc(var(--asgardeo-spacing-unit) * 0.75);
  width: 100%;
  padding: var(--asgardeo-dropdown-itemPaddingY) var(--asgardeo-dropdown-itemPaddingX);
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  font-family: var(--asgardeo-typography-fontFamily);
  font-size: var(--asgardeo-typography-fontSize-sm);
  color: var(--asgardeo-color-text-primary);
  transition: background-color var(--asgardeo-transition-fast);
  box-sizing: border-box;
}

.asgardeo-user-dropdown__item:hover {
  background-color: var(--asgardeo-color-action-hover);
}

.asgardeo-user-dropdown__item:focus-visible {
  outline: none;
  background-color: var(--asgardeo-color-action-focus);
}

/* Modal overlay ------------------------------------------------ */

.asgardeo-user-dropdown__modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

/* Modal content ------------------------------------------------ */

.asgardeo-user-dropdown__modal-content {
  background: var(--asgardeo-color-background-surface);
  border-radius: var(--asgardeo-border-radius-medium);
  box-shadow: var(--asgardeo-shadow-large);
  max-width: 460px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

/* Modal close button ------------------------------------------ */

.asgardeo-user-dropdown__modal-close {
  position: absolute;
  top: calc(var(--asgardeo-spacing-unit) * 1.25);
  right: calc(var(--asgardeo-spacing-unit) * 1.25);
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
  transition:
    color var(--asgardeo-transition-fast),
    background-color var(--asgardeo-transition-fast);
  line-height: 0;
}

.asgardeo-user-dropdown__modal-close:hover {
  color: var(--asgardeo-color-text-primary);
  background-color: var(--asgardeo-color-action-hover);
}

.asgardeo-user-dropdown__modal-close:focus-visible {
  outline: none;
  box-shadow: 0 0 0 var(--asgardeo-focus-ring-width) var(--asgardeo-focus-ring-color);
}
`;

export default USER_DROPDOWN_CSS;
