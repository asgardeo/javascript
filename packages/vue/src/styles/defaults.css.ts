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
const DEFAULTS_CSS = `
/* ============================================================
   Asgardeo Vue SDK – CSS variable defaults
   (ThemeProvider overrides these at runtime via inline styles)
   ============================================================ */
:root {
  /* --- Colors: Primary --- */
  --asgardeo-color-primary-main: #1a73e8;
  --asgardeo-color-primary-dark: #174ea6;
  --asgardeo-color-primary-contrastText: #ffffff;

  /* --- Colors: Secondary --- */
  --asgardeo-color-secondary-main: #424242;
  --asgardeo-color-secondary-contrastText: #ffffff;

  /* --- Colors: Background --- */
  --asgardeo-color-background-surface: #ffffff;
  --asgardeo-color-background-disabled: #f0f0f0;

  /* --- Colors: Text --- */
  --asgardeo-color-text-primary: #1a1a1a;
  --asgardeo-color-text-secondary: #666666;

  /* --- Colors: Border --- */
  --asgardeo-color-border: #e0e0e0;

  /* --- Colors: Action states --- */
  --asgardeo-color-action-hover: rgba(0, 0, 0, 0.04);
  --asgardeo-color-action-selected: rgba(0, 0, 0, 0.08);
  --asgardeo-color-action-focus: rgba(0, 0, 0, 0.12);
  --asgardeo-color-action-disabled: rgba(0, 0, 0, 0.26);
  --asgardeo-color-action-disabledBackground: rgba(0, 0, 0, 0.12);

  /* --- Colors: Semantic --- */
  --asgardeo-color-error-main: #d32f2f;
  --asgardeo-color-error-contrastText: #b71c1c;
  --asgardeo-color-success-main: #4caf50;
  --asgardeo-color-success-contrastText: #1b5e20;
  --asgardeo-color-warning-main: #ff9800;
  --asgardeo-color-warning-contrastText: #e65100;
  --asgardeo-color-info-main: #bbebff;
  --asgardeo-color-info-contrastText: #01579b;

  /* --- Spacing --- */
  --asgardeo-spacing-unit: 8px;

  /* --- Border Radius --- */
  --asgardeo-border-radius-small: 4px;
  --asgardeo-border-radius-medium: 8px;
  --asgardeo-border-radius-large: 16px;

  /* --- Shadows --- */
  --asgardeo-shadow-small: 0 2px 8px rgba(0, 0, 0, 0.1);
  --asgardeo-shadow-medium: 0 4px 16px rgba(0, 0, 0, 0.15);
  --asgardeo-shadow-large: 0 8px 32px rgba(0, 0, 0, 0.2);

  /* --- Typography: Font Family --- */
  --asgardeo-typography-fontFamily: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;

  /* --- Typography: Font Sizes --- */
  --asgardeo-typography-fontSize-xs: 0.75rem;    /* 12px */
  --asgardeo-typography-fontSize-sm: 0.875rem;   /* 14px */
  --asgardeo-typography-fontSize-md: 1rem;        /* 16px */
  --asgardeo-typography-fontSize-lg: 1.125rem;   /* 18px */
  --asgardeo-typography-fontSize-xl: 1.25rem;    /* 20px */
  --asgardeo-typography-fontSize-2xl: 1.5rem;    /* 24px */
  --asgardeo-typography-fontSize-3xl: 2.125rem;  /* 34px */

  /* --- Typography: Font Weights --- */
  --asgardeo-typography-fontWeight-normal: 400;
  --asgardeo-typography-fontWeight-medium: 500;
  --asgardeo-typography-fontWeight-semibold: 600;
  --asgardeo-typography-fontWeight-bold: 700;

  /* --- Typography: Line Heights --- */
  --asgardeo-typography-lineHeight-tight: 1.2;
  --asgardeo-typography-lineHeight-normal: 1.4;
  --asgardeo-typography-lineHeight-relaxed: 1.6;

  /* --- Component overrides (set by ThemeProvider when configured) --- */
  --asgardeo-component-button-root-borderRadius: var(--asgardeo-border-radius-medium);
  --asgardeo-component-field-root-borderRadius: var(--asgardeo-border-radius-small);
}
`;

export default DEFAULTS_CSS;
