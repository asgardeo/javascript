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

const STYLE_ID = 'asgardeo-vue-styles';

/**
 * Component styles for all Asgardeo Vue primitive components.
 *
 * Uses CSS custom properties (variables) that are set by ThemeProvider.
 * The :root block provides default fallback values so components render
 * correctly even without a ThemeProvider in the tree.
 */
const STYLES = `
/* ============================================================
   Asgardeo Vue SDK – Default CSS variable fallbacks
   (ThemeProvider will override these when present)
   ============================================================ */
:root {
  --asgardeo-color-primary-main: #1a73e8;
  --asgardeo-color-primary-dark: #174ea6;
  --asgardeo-color-primary-contrastText: #ffffff;
  --asgardeo-color-secondary-main: #424242;
  --asgardeo-color-secondary-contrastText: #ffffff;
  --asgardeo-color-background-surface: #ffffff;
  --asgardeo-color-background-disabled: #f0f0f0;
  --asgardeo-color-text-primary: #1a1a1a;
  --asgardeo-color-text-secondary: #666666;
  --asgardeo-color-border: #e0e0e0;
  --asgardeo-color-action-hover: rgba(0, 0, 0, 0.04);
  --asgardeo-color-action-selected: rgba(0, 0, 0, 0.08);
  --asgardeo-color-action-focus: rgba(0, 0, 0, 0.12);
  --asgardeo-color-action-disabled: rgba(0, 0, 0, 0.26);
  --asgardeo-color-action-disabledBackground: rgba(0, 0, 0, 0.12);
  --asgardeo-color-error-main: #d32f2f;
  --asgardeo-color-error-contrastText: #b71c1c;
  --asgardeo-color-success-main: #4caf50;
  --asgardeo-color-success-contrastText: #1b5e20;
  --asgardeo-color-warning-main: #ff9800;
  --asgardeo-color-warning-contrastText: #e65100;
  --asgardeo-color-info-main: #bbebff;
  --asgardeo-color-info-contrastText: #01579b;
  --asgardeo-spacing-unit: 8px;
  --asgardeo-border-radius-small: 4px;
  --asgardeo-border-radius-medium: 8px;
  --asgardeo-border-radius-large: 16px;
  --asgardeo-shadow-small: 0 2px 8px rgba(0, 0, 0, 0.1);
  --asgardeo-shadow-medium: 0 4px 16px rgba(0, 0, 0, 0.15);
  --asgardeo-shadow-large: 0 8px 32px rgba(0, 0, 0, 0.2);
  --asgardeo-typography-fontFamily: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --asgardeo-typography-fontSize-xs: 0.75rem;
  --asgardeo-typography-fontSize-sm: 0.875rem;
  --asgardeo-typography-fontSize-md: 1rem;
  --asgardeo-typography-fontSize-lg: 1.125rem;
  --asgardeo-typography-fontSize-xl: 1.25rem;
  --asgardeo-typography-fontSize-2xl: 1.5rem;
  --asgardeo-typography-fontSize-3xl: 2.125rem;
  --asgardeo-typography-fontWeight-normal: 400;
  --asgardeo-typography-fontWeight-medium: 500;
  --asgardeo-typography-fontWeight-semibold: 600;
  --asgardeo-typography-fontWeight-bold: 700;
  --asgardeo-typography-lineHeight-tight: 1.2;
  --asgardeo-typography-lineHeight-normal: 1.4;
  --asgardeo-typography-lineHeight-relaxed: 1.6;
}

/* ============================================================
   BUTTON
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

@keyframes asgardeo-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* ============================================================
   CARD
   ============================================================ */

.asgardeo-card {
  background-color: var(--asgardeo-color-background-surface);
  border-radius: var(--asgardeo-border-radius-medium);
  padding: calc(var(--asgardeo-spacing-unit) * 3);
  box-sizing: border-box;
}

.asgardeo-card--elevated {
  box-shadow: var(--asgardeo-shadow-medium);
}

.asgardeo-card--outlined {
  border: 1px solid var(--asgardeo-color-border);
}

/* .asgardeo-card--flat: no shadow or border */

/* ============================================================
   TYPOGRAPHY
   ============================================================ */

.asgardeo-typography {
  font-family: var(--asgardeo-typography-fontFamily);
  color: var(--asgardeo-color-text-primary);
  margin: 0;
  line-height: var(--asgardeo-typography-lineHeight-normal);
}

.asgardeo-typography--h1 {
  font-size: var(--asgardeo-typography-fontSize-3xl);
  font-weight: var(--asgardeo-typography-fontWeight-bold);
  line-height: var(--asgardeo-typography-lineHeight-tight);
}

.asgardeo-typography--h2 {
  font-size: var(--asgardeo-typography-fontSize-2xl);
  font-weight: var(--asgardeo-typography-fontWeight-bold);
  line-height: var(--asgardeo-typography-lineHeight-tight);
}

.asgardeo-typography--h3 {
  font-size: var(--asgardeo-typography-fontSize-xl);
  font-weight: var(--asgardeo-typography-fontWeight-semibold);
}

.asgardeo-typography--h4 {
  font-size: var(--asgardeo-typography-fontSize-lg);
  font-weight: var(--asgardeo-typography-fontWeight-semibold);
}

.asgardeo-typography--h5 {
  font-size: var(--asgardeo-typography-fontSize-md);
  font-weight: var(--asgardeo-typography-fontWeight-semibold);
}

.asgardeo-typography--h6 {
  font-size: var(--asgardeo-typography-fontSize-sm);
  font-weight: var(--asgardeo-typography-fontWeight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.asgardeo-typography--subtitle1 {
  font-size: var(--asgardeo-typography-fontSize-lg);
  font-weight: var(--asgardeo-typography-fontWeight-medium);
}

.asgardeo-typography--subtitle2 {
  font-size: var(--asgardeo-typography-fontSize-md);
  font-weight: var(--asgardeo-typography-fontWeight-medium);
  color: var(--asgardeo-color-text-secondary);
}

.asgardeo-typography--body1 {
  font-size: var(--asgardeo-typography-fontSize-md);
  font-weight: var(--asgardeo-typography-fontWeight-normal);
  line-height: var(--asgardeo-typography-lineHeight-relaxed);
}

.asgardeo-typography--body2 {
  font-size: var(--asgardeo-typography-fontSize-sm);
  font-weight: var(--asgardeo-typography-fontWeight-normal);
  line-height: var(--asgardeo-typography-lineHeight-relaxed);
  color: var(--asgardeo-color-text-secondary);
}

.asgardeo-typography--caption {
  font-size: var(--asgardeo-typography-fontSize-xs);
  font-weight: var(--asgardeo-typography-fontWeight-normal);
  color: var(--asgardeo-color-text-secondary);
}

.asgardeo-typography--overline {
  font-size: var(--asgardeo-typography-fontSize-xs);
  font-weight: var(--asgardeo-typography-fontWeight-medium);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--asgardeo-color-text-secondary);
}

/* ============================================================
   ALERT
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

/* ============================================================
   TEXT FIELD
   ============================================================ */

.asgardeo-text-field {
  display: flex;
  flex-direction: column;
  gap: calc(var(--asgardeo-spacing-unit) * 0.5);
  font-family: var(--asgardeo-typography-fontFamily);
  width: 100%;
  box-sizing: border-box;
}

.asgardeo-text-field__label {
  font-size: var(--asgardeo-typography-fontSize-sm);
  font-weight: var(--asgardeo-typography-fontWeight-medium);
  color: var(--asgardeo-color-text-primary);
  display: block;
}

.asgardeo-text-field__required {
  color: var(--asgardeo-color-error-main);
  margin-left: 2px;
}

.asgardeo-text-field__input {
  width: 100%;
  padding: calc(var(--asgardeo-spacing-unit) * 1) calc(var(--asgardeo-spacing-unit) * 1.5);
  border: 1px solid var(--asgardeo-color-border);
  border-radius: var(--asgardeo-border-radius-small);
  font-family: var(--asgardeo-typography-fontFamily);
  font-size: var(--asgardeo-typography-fontSize-md);
  color: var(--asgardeo-color-text-primary);
  background-color: var(--asgardeo-color-background-surface);
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
}
.asgardeo-text-field__input:focus {
  border-color: var(--asgardeo-color-primary-main);
  box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.15);
}
.asgardeo-text-field__input::placeholder {
  color: var(--asgardeo-color-text-secondary);
}
.asgardeo-text-field__input:disabled {
  background-color: var(--asgardeo-color-background-disabled);
  cursor: not-allowed;
}

.asgardeo-text-field--error .asgardeo-text-field__input {
  border-color: var(--asgardeo-color-error-main);
}
.asgardeo-text-field--error .asgardeo-text-field__input:focus {
  box-shadow: 0 0 0 2px rgba(211, 47, 47, 0.15);
}

.asgardeo-text-field__error {
  font-size: var(--asgardeo-typography-fontSize-xs);
  color: var(--asgardeo-color-error-contrastText);
}

.asgardeo-text-field__helper {
  font-size: var(--asgardeo-typography-fontSize-xs);
  color: var(--asgardeo-color-text-secondary);
}

/* ============================================================
   PASSWORD FIELD
   ============================================================ */

.asgardeo-password-field {
  display: flex;
  flex-direction: column;
  gap: calc(var(--asgardeo-spacing-unit) * 0.5);
  font-family: var(--asgardeo-typography-fontFamily);
  width: 100%;
  box-sizing: border-box;
}

.asgardeo-password-field__label {
  font-size: var(--asgardeo-typography-fontSize-sm);
  font-weight: var(--asgardeo-typography-fontWeight-medium);
  color: var(--asgardeo-color-text-primary);
  display: block;
}

.asgardeo-password-field__required {
  color: var(--asgardeo-color-error-main);
  margin-left: 2px;
}

.asgardeo-password-field__wrapper {
  display: flex;
  align-items: center;
  border: 1px solid var(--asgardeo-color-border);
  border-radius: var(--asgardeo-border-radius-small);
  background-color: var(--asgardeo-color-background-surface);
  transition: border-color 0.2s, box-shadow 0.2s;
  overflow: hidden;
}
.asgardeo-password-field__wrapper:focus-within {
  border-color: var(--asgardeo-color-primary-main);
  box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.15);
}
.asgardeo-password-field--error .asgardeo-password-field__wrapper {
  border-color: var(--asgardeo-color-error-main);
}

.asgardeo-password-field__input {
  flex: 1;
  padding: calc(var(--asgardeo-spacing-unit) * 1) calc(var(--asgardeo-spacing-unit) * 1.5);
  border: none;
  outline: none;
  font-family: var(--asgardeo-typography-fontFamily);
  font-size: var(--asgardeo-typography-fontSize-md);
  color: var(--asgardeo-color-text-primary);
  background: transparent;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
}
.asgardeo-password-field__input::placeholder {
  color: var(--asgardeo-color-text-secondary);
}
.asgardeo-password-field__input:disabled {
  cursor: not-allowed;
}

.asgardeo-password-field__toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 calc(var(--asgardeo-spacing-unit) * 1.5);
  color: var(--asgardeo-color-text-secondary);
  font-size: var(--asgardeo-typography-fontSize-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  height: 100%;
  min-height: calc(var(--asgardeo-spacing-unit) * 4);
}
.asgardeo-password-field__toggle:hover {
  color: var(--asgardeo-color-text-primary);
}

.asgardeo-password-field__error {
  font-size: var(--asgardeo-typography-fontSize-xs);
  color: var(--asgardeo-color-error-contrastText);
}

/* ============================================================
   SELECT
   ============================================================ */

.asgardeo-select {
  display: flex;
  flex-direction: column;
  gap: calc(var(--asgardeo-spacing-unit) * 0.5);
  font-family: var(--asgardeo-typography-fontFamily);
  width: 100%;
  box-sizing: border-box;
}

.asgardeo-select__label {
  font-size: var(--asgardeo-typography-fontSize-sm);
  font-weight: var(--asgardeo-typography-fontWeight-medium);
  color: var(--asgardeo-color-text-primary);
  display: block;
}

.asgardeo-select__required {
  color: var(--asgardeo-color-error-main);
  margin-left: 2px;
}

.asgardeo-select__input {
  width: 100%;
  padding: calc(var(--asgardeo-spacing-unit) * 1) calc(var(--asgardeo-spacing-unit) * 4) calc(var(--asgardeo-spacing-unit) * 1) calc(var(--asgardeo-spacing-unit) * 1.5);
  border: 1px solid var(--asgardeo-color-border);
  border-radius: var(--asgardeo-border-radius-small);
  font-family: var(--asgardeo-typography-fontFamily);
  font-size: var(--asgardeo-typography-fontSize-md);
  color: var(--asgardeo-color-text-primary);
  background-color: var(--asgardeo-color-background-surface);
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right calc(var(--asgardeo-spacing-unit) * 1.5) center;
  cursor: pointer;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
  line-height: var(--asgardeo-typography-lineHeight-normal);
}
.asgardeo-select__input:focus {
  border-color: var(--asgardeo-color-primary-main);
  box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.15);
}
.asgardeo-select__input:disabled {
  background-color: var(--asgardeo-color-background-disabled);
  cursor: not-allowed;
}

.asgardeo-select--error .asgardeo-select__input {
  border-color: var(--asgardeo-color-error-main);
}

.asgardeo-select__error {
  font-size: var(--asgardeo-typography-fontSize-xs);
  color: var(--asgardeo-color-error-contrastText);
}

.asgardeo-select__helper {
  font-size: var(--asgardeo-typography-fontSize-xs);
  color: var(--asgardeo-color-text-secondary);
}

/* ============================================================
   CHECKBOX
   ============================================================ */

.asgardeo-checkbox {
  display: flex;
  flex-direction: column;
  gap: calc(var(--asgardeo-spacing-unit) * 0.5);
  font-family: var(--asgardeo-typography-fontFamily);
}

.asgardeo-checkbox__wrapper {
  display: flex;
  align-items: center;
  gap: calc(var(--asgardeo-spacing-unit) * 1);
  cursor: pointer;
}

.asgardeo-checkbox__input {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--asgardeo-color-primary-main);
  flex-shrink: 0;
}
.asgardeo-checkbox__input:disabled {
  cursor: not-allowed;
}

.asgardeo-checkbox__label {
  font-size: var(--asgardeo-typography-fontSize-md);
  color: var(--asgardeo-color-text-primary);
}

.asgardeo-checkbox__error {
  font-size: var(--asgardeo-typography-fontSize-xs);
  color: var(--asgardeo-color-error-contrastText);
}

/* ============================================================
   DATE PICKER
   ============================================================ */

.asgardeo-date-picker {
  display: flex;
  flex-direction: column;
  gap: calc(var(--asgardeo-spacing-unit) * 0.5);
  font-family: var(--asgardeo-typography-fontFamily);
  width: 100%;
  box-sizing: border-box;
}

.asgardeo-date-picker__label {
  font-size: var(--asgardeo-typography-fontSize-sm);
  font-weight: var(--asgardeo-typography-fontWeight-medium);
  color: var(--asgardeo-color-text-primary);
  display: block;
}

.asgardeo-date-picker__required {
  color: var(--asgardeo-color-error-main);
  margin-left: 2px;
}

.asgardeo-date-picker__input {
  width: 100%;
  padding: calc(var(--asgardeo-spacing-unit) * 1) calc(var(--asgardeo-spacing-unit) * 1.5);
  border: 1px solid var(--asgardeo-color-border);
  border-radius: var(--asgardeo-border-radius-small);
  font-family: var(--asgardeo-typography-fontFamily);
  font-size: var(--asgardeo-typography-fontSize-md);
  color: var(--asgardeo-color-text-primary);
  background-color: var(--asgardeo-color-background-surface);
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
  cursor: pointer;
}
.asgardeo-date-picker__input:focus {
  border-color: var(--asgardeo-color-primary-main);
  box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.15);
}
.asgardeo-date-picker--error .asgardeo-date-picker__input {
  border-color: var(--asgardeo-color-error-main);
}
.asgardeo-date-picker__input:disabled {
  background-color: var(--asgardeo-color-background-disabled);
  cursor: not-allowed;
}

.asgardeo-date-picker__error {
  font-size: var(--asgardeo-typography-fontSize-xs);
  color: var(--asgardeo-color-error-contrastText);
}

/* ============================================================
   OTP FIELD
   ============================================================ */

.asgardeo-otp-field {
  display: flex;
  flex-direction: column;
  gap: calc(var(--asgardeo-spacing-unit) * 1);
  font-family: var(--asgardeo-typography-fontFamily);
}

.asgardeo-otp-field__label {
  font-size: var(--asgardeo-typography-fontSize-sm);
  font-weight: var(--asgardeo-typography-fontWeight-medium);
  color: var(--asgardeo-color-text-primary);
  display: block;
}

.asgardeo-otp-field__required {
  color: var(--asgardeo-color-error-main);
  margin-left: 2px;
}

.asgardeo-otp-field__inputs {
  display: flex;
  gap: calc(var(--asgardeo-spacing-unit) * 1);
}

.asgardeo-otp-field__digit {
  width: calc(var(--asgardeo-spacing-unit) * 5);
  height: calc(var(--asgardeo-spacing-unit) * 5);
  text-align: center;
  border: 1px solid var(--asgardeo-color-border);
  border-radius: var(--asgardeo-border-radius-small);
  font-family: var(--asgardeo-typography-fontFamily);
  font-size: var(--asgardeo-typography-fontSize-lg);
  font-weight: var(--asgardeo-typography-fontWeight-semibold);
  color: var(--asgardeo-color-text-primary);
  background-color: var(--asgardeo-color-background-surface);
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.asgardeo-otp-field__digit:focus {
  border-color: var(--asgardeo-color-primary-main);
  box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.15);
}
.asgardeo-otp-field__digit:disabled {
  background-color: var(--asgardeo-color-background-disabled);
  cursor: not-allowed;
}

.asgardeo-otp-field__error {
  font-size: var(--asgardeo-typography-fontSize-xs);
  color: var(--asgardeo-color-error-contrastText);
}

/* ============================================================
   DIVIDER
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
}

/* ============================================================
   LOGO
   ============================================================ */

.asgardeo-logo {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
}

.asgardeo-logo__image {
  display: block;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
}

/* ============================================================
   SPINNER
   ============================================================ */

.asgardeo-spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--asgardeo-color-primary-main);
}

.asgardeo-spinner--small {
  width: calc(var(--asgardeo-spacing-unit) * 2);
  height: calc(var(--asgardeo-spacing-unit) * 2);
}

.asgardeo-spinner--medium {
  width: calc(var(--asgardeo-spacing-unit) * 3);
  height: calc(var(--asgardeo-spacing-unit) * 3);
}

.asgardeo-spinner--large {
  width: calc(var(--asgardeo-spacing-unit) * 4);
  height: calc(var(--asgardeo-spacing-unit) * 4);
}

.asgardeo-spinner__svg {
  width: 100%;
  height: 100%;
  animation: asgardeo-spin 1.4s linear infinite;
}

.asgardeo-spinner__circle {
  stroke-dasharray: 80, 200;
  stroke-dashoffset: 0;
  animation: asgardeo-spinner-dash 1.4s ease-in-out infinite;
}

@keyframes asgardeo-spinner-dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -35px;
  }
  100% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -124px;
  }
}
`;

/**
 * Injects Asgardeo Vue component styles into the document `<head>` once.
 * Subsequent calls are no-ops (idempotent).
 */
export function injectStyles(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = STYLES;
  document.head.appendChild(style);
}

export default injectStyles;
