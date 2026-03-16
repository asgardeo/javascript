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
 * Default CSS custom property fallback values.
 *
 * These are written into a `:root` rule so that every Asgardeo Vue primitive
 * renders correctly even when no ThemeProvider is mounted. When ThemeProvider
 * IS present it calls `document.documentElement.style.setProperty(...)` which
 * has higher specificity than a stylesheet `:root` rule and therefore wins
 * automatically — no special cascade tricks required.
 *
 * Design token naming follows the pattern:
 *   --asgardeo-{category}-{sub}-{scale?}
 */
const DEFAULTS_CSS: string = `
/* ============================================================
   Asgardeo Vue SDK – CSS variable defaults
   (ThemeProvider overrides these at runtime via inline styles)
   ============================================================ */
:root {
  /* --- Colors: Primary --- */
  --asgardeo-color-primary-main: #4b6ef5;
  --asgardeo-color-primary-light: #eef1fe;
  --asgardeo-color-primary-dark: #3451d1;
  --asgardeo-color-primary-contrastText: #ffffff;

  /* --- Colors: Secondary --- */
  --asgardeo-color-secondary-main: #4b5563;
  --asgardeo-color-secondary-light: #f3f4f6;
  --asgardeo-color-secondary-contrastText: #ffffff;

  /* --- Colors: Background --- */
  --asgardeo-color-background-surface: #ffffff;
  --asgardeo-color-background-body: #f9fafb;
  --asgardeo-color-background-disabled: #f3f4f6;
  --asgardeo-color-background-muted: #f1f3f5;

  /* --- Colors: Text --- */
  --asgardeo-color-text-primary: #111827;
  --asgardeo-color-text-secondary: #6b7280;

  /* --- Colors: Border --- */
  --asgardeo-color-border: #e5e7eb;
  --asgardeo-color-border-focus: var(--asgardeo-color-primary-main);

  /* --- Colors: Action states --- */
  --asgardeo-color-action-hover: rgba(0, 0, 0, 0.04);
  --asgardeo-color-action-selected: rgba(75, 110, 245, 0.08);
  --asgardeo-color-action-focus: rgba(75, 110, 245, 0.12);
  --asgardeo-color-action-disabled: rgba(0, 0, 0, 0.26);
  --asgardeo-color-action-disabledBackground: rgba(0, 0, 0, 0.08);

  /* --- Colors: Semantic --- */
  --asgardeo-color-error-main: #ef4444;
  --asgardeo-color-error-light: #fef2f2;
  --asgardeo-color-error-contrastText: #991b1b;
  --asgardeo-color-success-main: #22c55e;
  --asgardeo-color-success-light: #f0fdf4;
  --asgardeo-color-success-contrastText: #166534;
  --asgardeo-color-warning-main: #f59e0b;
  --asgardeo-color-warning-light: #fffbeb;
  --asgardeo-color-warning-contrastText: #92400e;
  --asgardeo-color-info-main: #3b82f6;
  --asgardeo-color-info-light: #eff6ff;
  --asgardeo-color-info-contrastText: #1e40af;

  /* --- Spacing --- */
  --asgardeo-spacing-unit: 8px;

  /* --- Border Radius --- */
  --asgardeo-border-radius-xs: 4px;
  --asgardeo-border-radius-small: 6px;
  --asgardeo-border-radius-medium: 10px;
  --asgardeo-border-radius-large: 14px;
  --asgardeo-border-radius-full: 9999px;

  /* --- Shadows --- */
  --asgardeo-shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
  --asgardeo-shadow-small: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
  --asgardeo-shadow-medium: 0 4px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05);
  --asgardeo-shadow-large: 0 10px 25px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.05);

  /* --- Transitions --- */
  --asgardeo-transition-fast: 120ms ease;
  --asgardeo-transition-normal: 180ms ease;
  --asgardeo-transition-slow: 280ms ease;

  /* --- Focus Ring --- */
  --asgardeo-focus-ring-width: 2px;
  --asgardeo-focus-ring-offset: 2px;
  --asgardeo-focus-ring-color: rgba(75, 110, 245, 0.35);

  /* --- Typography: Font Family --- */
  --asgardeo-typography-fontFamily: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;

  /* --- Typography: Font Sizes --- */
  --asgardeo-typography-fontSize-xs: 0.6875rem;  /* 11px */
  --asgardeo-typography-fontSize-sm: 0.8125rem;  /* 13px */
  --asgardeo-typography-fontSize-md: 0.875rem;   /* 14px */
  --asgardeo-typography-fontSize-lg: 1rem;       /* 16px */
  --asgardeo-typography-fontSize-xl: 1.125rem;   /* 18px */
  --asgardeo-typography-fontSize-2xl: 1.375rem;  /* 22px */
  --asgardeo-typography-fontSize-3xl: 1.75rem;   /* 28px */

  /* --- Typography: Font Weights --- */
  --asgardeo-typography-fontWeight-normal: 400;
  --asgardeo-typography-fontWeight-medium: 500;
  --asgardeo-typography-fontWeight-semibold: 600;
  --asgardeo-typography-fontWeight-bold: 700;

  /* --- Typography: Line Heights --- */
  --asgardeo-typography-lineHeight-tight: 1.25;
  --asgardeo-typography-lineHeight-normal: 1.5;
  --asgardeo-typography-lineHeight-relaxed: 1.625;

  /* --- Typography: Letter Spacing --- */
  --asgardeo-typography-letterSpacing-tight: -0.01em;
  --asgardeo-typography-letterSpacing-normal: 0;
  --asgardeo-typography-letterSpacing-wide: 0.025em;

  /* --- Component: Button --- */
  --asgardeo-button-borderRadius: var(--asgardeo-border-radius-small);
  --asgardeo-button-fontWeight: var(--asgardeo-typography-fontWeight-medium);
  --asgardeo-button-sm-height: 30px;
  --asgardeo-button-sm-paddingX: calc(var(--asgardeo-spacing-unit) * 1.25);
  --asgardeo-button-sm-fontSize: var(--asgardeo-typography-fontSize-sm);
  --asgardeo-button-md-height: 36px;
  --asgardeo-button-md-paddingX: calc(var(--asgardeo-spacing-unit) * 2);
  --asgardeo-button-md-fontSize: var(--asgardeo-typography-fontSize-md);
  --asgardeo-button-lg-height: 42px;
  --asgardeo-button-lg-paddingX: calc(var(--asgardeo-spacing-unit) * 2.5);
  --asgardeo-button-lg-fontSize: var(--asgardeo-typography-fontSize-lg);

  /* --- Component: Input fields --- */
  --asgardeo-input-borderRadius: var(--asgardeo-border-radius-small);
  --asgardeo-input-height: 36px;
  --asgardeo-input-paddingX: calc(var(--asgardeo-spacing-unit) * 1.25);
  --asgardeo-input-fontSize: var(--asgardeo-typography-fontSize-md);
  --asgardeo-input-borderColor: var(--asgardeo-color-border);
  --asgardeo-input-focusBorderColor: var(--asgardeo-color-primary-main);
  --asgardeo-input-focusRing: 0 0 0 3px var(--asgardeo-focus-ring-color);

  /* --- Component: Card --- */
  --asgardeo-card-borderRadius: var(--asgardeo-border-radius-medium);
  --asgardeo-card-padding: calc(var(--asgardeo-spacing-unit) * 2.5);
  --asgardeo-card-shadow: var(--asgardeo-shadow-small);
  --asgardeo-card-borderColor: var(--asgardeo-color-border);

  /* --- Component: Alert --- */
  --asgardeo-alert-borderRadius: var(--asgardeo-border-radius-small);
  --asgardeo-alert-paddingX: calc(var(--asgardeo-spacing-unit) * 1.5);
  --asgardeo-alert-paddingY: calc(var(--asgardeo-spacing-unit) * 1.25);

  /* --- Component: Checkbox --- */
  --asgardeo-checkbox-size: 16px;

  /* --- Component: Avatar --- */
  --asgardeo-avatar-size: 64px;
  --asgardeo-avatar-fontSize: 1.375rem;

  /* --- Component: Dropdown --- */
  --asgardeo-dropdown-borderRadius: var(--asgardeo-border-radius-medium);
  --asgardeo-dropdown-shadow: var(--asgardeo-shadow-medium);
  --asgardeo-dropdown-itemPaddingX: calc(var(--asgardeo-spacing-unit) * 1.5);
  --asgardeo-dropdown-itemPaddingY: calc(var(--asgardeo-spacing-unit) * 1);

  /* --- Component overrides (set by ThemeProvider when configured) --- */
  --asgardeo-component-button-root-borderRadius: var(--asgardeo-button-borderRadius);
  --asgardeo-component-field-root-borderRadius: var(--asgardeo-input-borderRadius);
}
`;

export default DEFAULTS_CSS;
