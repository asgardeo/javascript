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
 * Trigger modifiers:
 *   __trigger--open               – ring + border while menu is visible
 *   __avatar--sm / --lg           – trigger avatar size variants (default is 32 px)
 *
 * Menu modifiers:
 *   __menu--align-left            – panel opens to the left of the trigger
 *   __menu--size-sm               – compact menu (180 px min-width, tighter padding)
 *   __menu--size-lg               – spacious menu (280 px min-width, more padding)
 *
 * Item modifiers:
 *   __item--danger                – destructive action (red text/hover)
 *
 * Elements:
 *   __chevron                     – rotates 180° when menu is open
 *   __menu-header                 – user identity section at top of menu
 *   __menu-header-avatar          – gradient avatar circle in header
 *   __menu-header-info            – name + subtitle column
 *   __menu-header-name            – bold display name
 *   __menu-header-subtitle        – muted email / username
 *   __menu-divider                – thin horizontal separator
 */
const USER_DROPDOWN_CSS: string = `
/* ============================================================
   UserDropdown
   ============================================================ */

.asgardeo-user-dropdown {
  position: relative;
  display: inline-block;
  font-family: var(--asgardeo-typography-fontFamily);
}

/* ── Trigger ─────────────────────────────────────────────────── */

.asgardeo-user-dropdown__trigger {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--asgardeo-spacing-unit) * 0.5);
  padding: 3px;
  background: none;
  border: 2px solid transparent;
  border-radius: var(--asgardeo-border-radius-full);
  cursor: pointer;
  color: var(--asgardeo-color-text-primary);
  transition:
    border-color var(--asgardeo-transition-fast),
    box-shadow var(--asgardeo-transition-fast);
  box-sizing: border-box;
  outline: none;
}

.asgardeo-user-dropdown__trigger:hover {
  border-color: var(--asgardeo-color-primary-main);
}

.asgardeo-user-dropdown__trigger--open {
  border-color: var(--asgardeo-color-primary-main);
  box-shadow: 0 0 0 3px var(--asgardeo-focus-ring-color);
}

.asgardeo-user-dropdown__trigger:focus-visible {
  border-color: var(--asgardeo-color-primary-main);
  box-shadow: 0 0 0 var(--asgardeo-focus-ring-width) var(--asgardeo-focus-ring-color);
}

/* ── Trigger avatar ──────────────────────────────────────────── */

.asgardeo-user-dropdown__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: #ffffff;
  flex-shrink: 0;
  font-size: var(--asgardeo-typography-fontSize-sm);
  font-weight: var(--asgardeo-typography-fontWeight-semibold);
  line-height: 1;
  user-select: none;
  pointer-events: none;
}

/* sm — 28 px */
.asgardeo-user-dropdown__avatar--sm {
  width: 28px;
  height: 28px;
  font-size: var(--asgardeo-typography-fontSize-xs);
}

/* lg — 38 px */
.asgardeo-user-dropdown__avatar--lg {
  width: 38px;
  height: 38px;
  font-size: var(--asgardeo-typography-fontSize-md);
}

/* ── Chevron ─────────────────────────────────────────────────── */

.asgardeo-user-dropdown__chevron {
  display: inline-flex;
  align-items: center;
  color: var(--asgardeo-color-text-secondary);
  transition: transform var(--asgardeo-transition-normal);
  padding-right: calc(var(--asgardeo-spacing-unit) * 0.25);
}

.asgardeo-user-dropdown__trigger--open .asgardeo-user-dropdown__chevron {
  transform: rotate(180deg);
}

/* ── Dropdown menu ───────────────────────────────────────────── */

.asgardeo-user-dropdown__menu {
  position: absolute;
  top: calc(100% + calc(var(--asgardeo-spacing-unit) * 0.75));
  right: 0;
  z-index: 1000;
  background-color: var(--asgardeo-color-background-surface);
  border: 1px solid var(--asgardeo-color-border);
  border-radius: var(--asgardeo-dropdown-borderRadius);
  box-shadow: var(--asgardeo-dropdown-shadow);
  overflow: hidden;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  animation: asgardeo-dropdown-enter var(--asgardeo-transition-fast) ease;
}

/* Alignment */

.asgardeo-user-dropdown__menu--align-left {
  right: auto;
  left: 0;
}

/* Size: sm */

.asgardeo-user-dropdown__menu--size-sm {
  min-width: 180px;
}

.asgardeo-user-dropdown__menu--size-sm .asgardeo-user-dropdown__menu-header {
  padding: calc(var(--asgardeo-spacing-unit) * 1.25) calc(var(--asgardeo-spacing-unit) * 1.5);
  gap: calc(var(--asgardeo-spacing-unit) * 1);
}

.asgardeo-user-dropdown__menu--size-sm .asgardeo-user-dropdown__menu-header-avatar {
  width: 30px;
  height: 30px;
  font-size: var(--asgardeo-typography-fontSize-sm);
}

.asgardeo-user-dropdown__menu--size-sm .asgardeo-user-dropdown__item {
  padding: calc(var(--asgardeo-spacing-unit) * 0.75) calc(var(--asgardeo-spacing-unit) * 1.5);
  font-size: var(--asgardeo-typography-fontSize-xs);
}

/* Size: lg */

.asgardeo-user-dropdown__menu--size-lg {
  min-width: 280px;
}

.asgardeo-user-dropdown__menu--size-lg .asgardeo-user-dropdown__menu-header {
  padding: calc(var(--asgardeo-spacing-unit) * 2) calc(var(--asgardeo-spacing-unit) * 2);
  gap: calc(var(--asgardeo-spacing-unit) * 1.5);
}

.asgardeo-user-dropdown__menu--size-lg .asgardeo-user-dropdown__menu-header-avatar {
  width: 42px;
  height: 42px;
  font-size: var(--asgardeo-typography-fontSize-lg);
}

.asgardeo-user-dropdown__menu--size-lg .asgardeo-user-dropdown__item {
  padding: calc(var(--asgardeo-spacing-unit) * 1.25) calc(var(--asgardeo-spacing-unit) * 2);
  font-size: var(--asgardeo-typography-fontSize-md);
}

@keyframes asgardeo-dropdown-enter {
  from {
    opacity: 0;
    transform: translateY(-6px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ── Menu header (user identity) ─────────────────────────────── */

.asgardeo-user-dropdown__menu-header {
  display: flex;
  align-items: center;
  gap: calc(var(--asgardeo-spacing-unit) * 1.25);
  padding: calc(var(--asgardeo-spacing-unit) * 1.5) calc(var(--asgardeo-spacing-unit) * 1.75);
}

.asgardeo-user-dropdown__menu-header-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: #ffffff;
  flex-shrink: 0;
  font-size: var(--asgardeo-typography-fontSize-md);
  font-weight: var(--asgardeo-typography-fontWeight-semibold);
  line-height: 1;
  user-select: none;
}

.asgardeo-user-dropdown__menu-header-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.asgardeo-user-dropdown__menu-header-name {
  font-size: var(--asgardeo-typography-fontSize-sm);
  font-weight: var(--asgardeo-typography-fontWeight-semibold);
  color: var(--asgardeo-color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: var(--asgardeo-typography-lineHeight-tight);
}

.asgardeo-user-dropdown__menu-header-subtitle {
  font-size: var(--asgardeo-typography-fontSize-xs);
  color: var(--asgardeo-color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: var(--asgardeo-typography-lineHeight-normal);
}

/* ── Menu divider ────────────────────────────────────────────── */

.asgardeo-user-dropdown__menu-divider {
  height: 1px;
  background-color: var(--asgardeo-color-border);
  margin: calc(var(--asgardeo-spacing-unit) * 0.5) 0;
  flex-shrink: 0;
}

/* ── Menu items ──────────────────────────────────────────────── */

.asgardeo-user-dropdown__item {
  display: flex;
  align-items: center;
  gap: calc(var(--asgardeo-spacing-unit) * 1);
  width: 100%;
  padding: calc(var(--asgardeo-spacing-unit) * 1) calc(var(--asgardeo-spacing-unit) * 1.75);
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

/* Danger variant (sign-out) */

.asgardeo-user-dropdown__item--danger {
  color: var(--asgardeo-color-error-main);
}

.asgardeo-user-dropdown__item--danger:hover {
  background-color: var(--asgardeo-color-error-light);
}

/* ── Modal overlay ───────────────────────────────────────────── */

.asgardeo-user-dropdown__modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(3px);
  animation: asgardeo-overlay-enter var(--asgardeo-transition-fast) ease;
}

@keyframes asgardeo-overlay-enter {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* ── Modal content ───────────────────────────────────────────── */

.asgardeo-user-dropdown__modal-content {
  background: var(--asgardeo-color-background-surface);
  border-radius: var(--asgardeo-border-radius-large);
  box-shadow: var(--asgardeo-shadow-large);
  max-width: 480px;
  width: 92%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: asgardeo-modal-enter var(--asgardeo-transition-normal) ease;
}

@keyframes asgardeo-modal-enter {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ── Modal close button ──────────────────────────────────────── */

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
  padding: calc(var(--asgardeo-spacing-unit) * 0.625);
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
