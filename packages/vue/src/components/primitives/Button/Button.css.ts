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
 * Styles for the Button primitive component.
 *
 * BEM block: `.asgardeo-button`
 *
 * Modifiers:
 *   Variant:  --solid | --outline | --ghost | --text
 *   Color:    --primary | --secondary | --danger
 *   Size:     --small | --medium | --large
 *   State:    --full-width | --loading
 *
 * Elements:
 *   __start-icon | __end-icon | __content | __spinner
 *
 * Note: The `asgardeo-spin` keyframe animation is defined in
 * `styles/animations.css.ts` and shared with the Spinner component.
 */
const BUTTON_CSS = `
/* ============================================================
   Button
   ============================================================ */

.asgardeo-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: calc(var(--asgardeo-spacing-unit) * 1);
  border-radius: var(--asgardeo-border-radius-medium);
  font-family: var(--asgardeo-typography-fontFamily);
  font-weight: var(--asgardeo-typography-fontWeight-medium);
  cursor: pointer;
  outline: none;
  text-decoration: none;
  white-space: nowrap;
  border-width: 1px;
  border-style: solid;
  box-sizing: border-box;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s, opacity 0.2s, filter 0.2s;
  position: relative;
  vertical-align: middle;
}

.asgardeo-button:focus-visible {
  outline: 2px solid var(--asgardeo-color-primary-main);
  outline-offset: 2px;
}

/* -- Sizes -- */

.asgardeo-button--small {
  padding: calc(var(--asgardeo-spacing-unit) * 0.5) calc(var(--asgardeo-spacing-unit) * 1);
  font-size: var(--asgardeo-typography-fontSize-sm);
  min-height: calc(var(--asgardeo-spacing-unit) * 3);
}

.asgardeo-button--medium {
  padding: calc(var(--asgardeo-spacing-unit) * 1) calc(var(--asgardeo-spacing-unit) * 2);
  font-size: var(--asgardeo-typography-fontSize-md);
  min-height: calc(var(--asgardeo-spacing-unit) * 4);
}

.asgardeo-button--large {
  padding: calc(var(--asgardeo-spacing-unit) * 1.5) calc(var(--asgardeo-spacing-unit) * 3);
  font-size: var(--asgardeo-typography-fontSize-lg);
  min-height: calc(var(--asgardeo-spacing-unit) * 5);
}

/* -- Modifiers -- */

.asgardeo-button--full-width {
  width: 100%;
}

.asgardeo-button--loading,
.asgardeo-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* -- Solid variants -- */

.asgardeo-button--solid.asgardeo-button--primary {
  background-color: var(--asgardeo-color-primary-main);
  color: var(--asgardeo-color-primary-contrastText);
  border-color: var(--asgardeo-color-primary-main);
}
.asgardeo-button--solid.asgardeo-button--primary:hover:not(:disabled) {
  background-color: var(--asgardeo-color-primary-dark);
  border-color: var(--asgardeo-color-primary-dark);
}

.asgardeo-button--solid.asgardeo-button--secondary {
  background-color: var(--asgardeo-color-secondary-main);
  color: var(--asgardeo-color-secondary-contrastText);
  border-color: var(--asgardeo-color-secondary-main);
}
.asgardeo-button--solid.asgardeo-button--secondary:hover:not(:disabled) {
  filter: brightness(1.15);
}

.asgardeo-button--solid.asgardeo-button--danger {
  background-color: var(--asgardeo-color-error-main);
  color: #ffffff;
  border-color: var(--asgardeo-color-error-main);
}
.asgardeo-button--solid.asgardeo-button--danger:hover:not(:disabled) {
  filter: brightness(0.9);
}

/* -- Outline variants -- */

.asgardeo-button--outline.asgardeo-button--primary {
  background-color: transparent;
  color: var(--asgardeo-color-primary-main);
  border-color: var(--asgardeo-color-primary-main);
}
.asgardeo-button--outline.asgardeo-button--primary:hover:not(:disabled) {
  background-color: var(--asgardeo-color-primary-main);
  color: var(--asgardeo-color-primary-contrastText);
}

.asgardeo-button--outline.asgardeo-button--secondary {
  background-color: transparent;
  color: var(--asgardeo-color-secondary-main);
  border-color: var(--asgardeo-color-secondary-main);
}
.asgardeo-button--outline.asgardeo-button--secondary:hover:not(:disabled) {
  background-color: var(--asgardeo-color-secondary-main);
  color: var(--asgardeo-color-secondary-contrastText);
}

.asgardeo-button--outline.asgardeo-button--danger {
  background-color: transparent;
  color: var(--asgardeo-color-error-main);
  border-color: var(--asgardeo-color-error-main);
}
.asgardeo-button--outline.asgardeo-button--danger:hover:not(:disabled) {
  background-color: var(--asgardeo-color-error-main);
  color: #ffffff;
}

/* -- Ghost variants -- */

.asgardeo-button--ghost.asgardeo-button--primary {
  background-color: transparent;
  color: var(--asgardeo-color-primary-main);
  border-color: transparent;
}
.asgardeo-button--ghost.asgardeo-button--primary:hover:not(:disabled) {
  background-color: var(--asgardeo-color-action-hover);
  border-color: transparent;
}

.asgardeo-button--ghost.asgardeo-button--secondary {
  background-color: transparent;
  color: var(--asgardeo-color-secondary-main);
  border-color: transparent;
}
.asgardeo-button--ghost.asgardeo-button--secondary:hover:not(:disabled) {
  background-color: var(--asgardeo-color-action-hover);
  border-color: transparent;
}

.asgardeo-button--ghost.asgardeo-button--danger {
  background-color: transparent;
  color: var(--asgardeo-color-error-main);
  border-color: transparent;
}
.asgardeo-button--ghost.asgardeo-button--danger:hover:not(:disabled) {
  background-color: rgba(211, 47, 47, 0.08);
  border-color: transparent;
}

/* -- Text variants -- */

.asgardeo-button--text {
  border-color: transparent;
  background-color: transparent;
  padding-left: 0;
  padding-right: 0;
}

.asgardeo-button--text.asgardeo-button--primary {
  color: var(--asgardeo-color-primary-main);
}
.asgardeo-button--text.asgardeo-button--primary:hover:not(:disabled) {
  text-decoration: underline;
}

.asgardeo-button--text.asgardeo-button--secondary {
  color: var(--asgardeo-color-secondary-main);
}
.asgardeo-button--text.asgardeo-button--secondary:hover:not(:disabled) {
  text-decoration: underline;
}

.asgardeo-button--text.asgardeo-button--danger {
  color: var(--asgardeo-color-error-main);
}
.asgardeo-button--text.asgardeo-button--danger:hover:not(:disabled) {
  text-decoration: underline;
}

/* -- Inner elements -- */

.asgardeo-button__start-icon,
.asgardeo-button__end-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.asgardeo-button__content {
  display: inline-flex;
  align-items: center;
}

.asgardeo-button__spinner {
  display: inline-block;
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: asgardeo-spin 0.6s linear infinite;
  margin-left: calc(var(--asgardeo-spacing-unit) * 0.5);
}
`;

export default BUTTON_CSS;
