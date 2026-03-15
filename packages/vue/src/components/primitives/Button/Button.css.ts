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
  gap: calc(var(--asgardeo-spacing-unit) * 0.75);
  border-radius: var(--asgardeo-button-borderRadius);
  font-family: var(--asgardeo-typography-fontFamily);
  font-weight: var(--asgardeo-button-fontWeight);
  letter-spacing: var(--asgardeo-typography-letterSpacing-normal);
  cursor: pointer;
  outline: none;
  text-decoration: none;
  white-space: nowrap;
  border-width: 1px;
  border-style: solid;
  box-sizing: border-box;
  transition:
    background-color var(--asgardeo-transition-fast),
    color var(--asgardeo-transition-fast),
    border-color var(--asgardeo-transition-fast),
    box-shadow var(--asgardeo-transition-fast),
    opacity var(--asgardeo-transition-fast),
    transform var(--asgardeo-transition-fast);
  position: relative;
  vertical-align: middle;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  user-select: none;
}

.asgardeo-button:focus-visible {
  outline: none;
  box-shadow: 0 0 0 var(--asgardeo-focus-ring-width) var(--asgardeo-focus-ring-color);
}

/* -- Sizes -- */

.asgardeo-button--small {
  padding: 0 var(--asgardeo-button-sm-paddingX);
  font-size: var(--asgardeo-button-sm-fontSize);
  height: var(--asgardeo-button-sm-height);
}

.asgardeo-button--medium {
  padding: 0 var(--asgardeo-button-md-paddingX);
  font-size: var(--asgardeo-button-md-fontSize);
  height: var(--asgardeo-button-md-height);
}

.asgardeo-button--large {
  padding: 0 var(--asgardeo-button-lg-paddingX);
  font-size: var(--asgardeo-button-lg-fontSize);
  height: var(--asgardeo-button-lg-height);
}

/* -- Modifiers -- */

.asgardeo-button--full-width {
  width: 100%;
}

.asgardeo-button--loading,
.asgardeo-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  pointer-events: none;
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
.asgardeo-button--solid.asgardeo-button--primary:active:not(:disabled) {
  transform: scale(0.98);
}

.asgardeo-button--solid.asgardeo-button--secondary {
  background-color: var(--asgardeo-color-secondary-light);
  color: var(--asgardeo-color-secondary-main);
  border-color: var(--asgardeo-color-border);
}
.asgardeo-button--solid.asgardeo-button--secondary:hover:not(:disabled) {
  background-color: var(--asgardeo-color-border);
  border-color: var(--asgardeo-color-border);
}
.asgardeo-button--solid.asgardeo-button--secondary:active:not(:disabled) {
  transform: scale(0.98);
}

.asgardeo-button--solid.asgardeo-button--danger {
  background-color: var(--asgardeo-color-error-main);
  color: #ffffff;
  border-color: var(--asgardeo-color-error-main);
}
.asgardeo-button--solid.asgardeo-button--danger:hover:not(:disabled) {
  filter: brightness(0.92);
}
.asgardeo-button--solid.asgardeo-button--danger:active:not(:disabled) {
  transform: scale(0.98);
}

/* -- Outline variants -- */

.asgardeo-button--outline.asgardeo-button--primary {
  background-color: transparent;
  color: var(--asgardeo-color-primary-main);
  border-color: var(--asgardeo-color-primary-main);
}
.asgardeo-button--outline.asgardeo-button--primary:hover:not(:disabled) {
  background-color: var(--asgardeo-color-primary-light);
}
.asgardeo-button--outline.asgardeo-button--primary:active:not(:disabled) {
  transform: scale(0.98);
}

.asgardeo-button--outline.asgardeo-button--secondary {
  background-color: transparent;
  color: var(--asgardeo-color-secondary-main);
  border-color: var(--asgardeo-color-border);
}
.asgardeo-button--outline.asgardeo-button--secondary:hover:not(:disabled) {
  background-color: var(--asgardeo-color-secondary-light);
  border-color: var(--asgardeo-color-secondary-main);
}
.asgardeo-button--outline.asgardeo-button--secondary:active:not(:disabled) {
  transform: scale(0.98);
}

.asgardeo-button--outline.asgardeo-button--danger {
  background-color: transparent;
  color: var(--asgardeo-color-error-main);
  border-color: var(--asgardeo-color-error-main);
}
.asgardeo-button--outline.asgardeo-button--danger:hover:not(:disabled) {
  background-color: var(--asgardeo-color-error-light);
}
.asgardeo-button--outline.asgardeo-button--danger:active:not(:disabled) {
  transform: scale(0.98);
}

/* -- Ghost variants -- */

.asgardeo-button--ghost.asgardeo-button--primary {
  background-color: transparent;
  color: var(--asgardeo-color-primary-main);
  border-color: transparent;
}
.asgardeo-button--ghost.asgardeo-button--primary:hover:not(:disabled) {
  background-color: var(--asgardeo-color-primary-light);
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
  background-color: var(--asgardeo-color-error-light);
  border-color: transparent;
}

/* -- Text variants -- */

.asgardeo-button--text {
  border-color: transparent;
  background-color: transparent;
  padding-left: calc(var(--asgardeo-spacing-unit) * 0.25);
  padding-right: calc(var(--asgardeo-spacing-unit) * 0.25);
}

.asgardeo-button--text.asgardeo-button--primary {
  color: var(--asgardeo-color-primary-main);
}
.asgardeo-button--text.asgardeo-button--primary:hover:not(:disabled) {
  color: var(--asgardeo-color-primary-dark);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.asgardeo-button--text.asgardeo-button--secondary {
  color: var(--asgardeo-color-secondary-main);
}
.asgardeo-button--text.asgardeo-button--secondary:hover:not(:disabled) {
  color: var(--asgardeo-color-text-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.asgardeo-button--text.asgardeo-button--danger {
  color: var(--asgardeo-color-error-main);
}
.asgardeo-button--text.asgardeo-button--danger:hover:not(:disabled) {
  text-decoration: underline;
  text-underline-offset: 2px;
}

/* -- Inner elements -- */

.asgardeo-button__start-icon,
.asgardeo-button__end-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  line-height: 0;
}
.asgardeo-button--small .asgardeo-button__start-icon svg,
.asgardeo-button--small .asgardeo-button__end-icon svg {
  width: 14px;
  height: 14px;
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
