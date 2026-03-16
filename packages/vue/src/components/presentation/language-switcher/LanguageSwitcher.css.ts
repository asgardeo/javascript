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
 * Styles for the LanguageSwitcher presentation component.
 *
 * BEM block: `.asgardeo-language-switcher`
 *
 * The root element is a Card (`.asgardeo-card`). We override its default
 * padding to 0 so the trigger button fills the surface edge-to-edge,
 * and apply `position: relative` to anchor the absolute dropdown.
 * The Card's border-radius and shadow are intentionally kept.
 *
 * Elements:
 *   __trigger        – compact trigger button (globe icon + language label + chevron)
 *   __trigger-label  – the current language name Typography inside the trigger
 *   __dropdown       – absolute-positioned dropdown listbox
 *   __item           – each selectable language row
 *   __item--active   – the currently selected language
 */
const LANGUAGE_SWITCHER_CSS: string = `
/* ============================================================
   LanguageSwitcher
   ============================================================ */

/* Override Card's default padding so the trigger fills the surface */
.asgardeo-language-switcher.asgardeo-card {
  padding: 0;
  position: relative;
  display: inline-block;
}

/* Trigger ---------------------------------------------------- */

.asgardeo-language-switcher__trigger {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--asgardeo-spacing-unit) * 0.5);
  padding: var(--asgardeo-dropdown-itemPaddingY) var(--asgardeo-dropdown-itemPaddingX);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--asgardeo-color-text-primary);
  font-family: var(--asgardeo-typography-fontFamily);
  font-size: var(--asgardeo-typography-fontSize-md);
  border-radius: var(--asgardeo-dropdown-borderRadius);
  transition: background-color var(--asgardeo-transition-fast);
  white-space: nowrap;
  box-sizing: border-box;
}

.asgardeo-language-switcher__trigger:hover {
  background-color: var(--asgardeo-color-action-hover);
}

.asgardeo-language-switcher__trigger:focus-visible {
  outline: none;
  box-shadow: inset 0 0 0 var(--asgardeo-focus-ring-width) var(--asgardeo-focus-ring-color);
  border-radius: var(--asgardeo-dropdown-borderRadius);
}

.asgardeo-language-switcher__trigger-label {
  flex: 0 0 auto;
}

/* Dropdown --------------------------------------------------- */

.asgardeo-language-switcher__dropdown {
  position: absolute;
  top: calc(100% + calc(var(--asgardeo-spacing-unit) * 0.5));
  right: 0;
  z-index: 1000;
  background-color: var(--asgardeo-color-background-surface);
  border: 1px solid var(--asgardeo-color-border);
  border-radius: var(--asgardeo-dropdown-borderRadius);
  box-shadow: var(--asgardeo-dropdown-shadow);
  overflow: hidden;
  min-width: 130px;
  display: flex;
  flex-direction: column;
  padding: calc(var(--asgardeo-spacing-unit) * 0.5) 0;
}

/* Items ----------------------------------------------------- */

.asgardeo-language-switcher__item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: var(--asgardeo-dropdown-itemPaddingY) var(--asgardeo-dropdown-itemPaddingX);
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  font-family: var(--asgardeo-typography-fontFamily);
  font-size: var(--asgardeo-typography-fontSize-md);
  color: var(--asgardeo-color-text-primary);
  transition: background-color var(--asgardeo-transition-fast);
  box-sizing: border-box;
}

.asgardeo-language-switcher__item:hover {
  background-color: var(--asgardeo-color-action-hover);
}

.asgardeo-language-switcher__item--active {
  background-color: var(--asgardeo-color-action-selected);
  color: var(--asgardeo-color-primary-main);
  font-weight: var(--asgardeo-typography-fontWeight-medium);
}

.asgardeo-language-switcher__item--active:hover {
  background-color: var(--asgardeo-color-action-focus);
}
`;

export default LANGUAGE_SWITCHER_CSS;
