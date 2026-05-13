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
 * Styles for the UserProfile presentation component.
 *
 * BEM block: `.asgardeo-user-profile`
 *
 * Modifiers:
 *   --compact   – reduced field padding for modal / dropdown embedding
 *
 * New elements in this version:
 *   __hero           – avatar + name + subtitle banner
 *   __avatar--sm/md/lg  – avatar size variants
 *   __hero-name      – prominent display name
 *   __hero-subtitle  – secondary line (email / username)
 */
const USER_PROFILE_CSS: string = `
/* ============================================================
   UserProfile  (modern redesign)
   ============================================================ */

.asgardeo-user-profile {
  display: flex;
  flex-direction: column;
  min-width: 320px;
  overflow: hidden;
  font-family: var(--asgardeo-typography-fontFamily);
}

/* ── Header ─────────────────────────────────────────────────── */

.asgardeo-user-profile__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(var(--asgardeo-spacing-unit) * 2) calc(var(--asgardeo-spacing-unit) * 2.5)
    calc(var(--asgardeo-spacing-unit) * 1.75);
}

.asgardeo-user-profile__title {
  margin: 0;
  font-size: var(--asgardeo-typography-fontSize-md);
  font-weight: var(--asgardeo-typography-fontWeight-semibold);
  color: var(--asgardeo-color-text-primary);
  letter-spacing: var(--asgardeo-typography-letterSpacing-tight);
}

.asgardeo-user-profile__header-divider {
  margin: 0;
}

/* ── Hero (avatar + name + subtitle) ────────────────────────── */

.asgardeo-user-profile__hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: calc(var(--asgardeo-spacing-unit) * 3) calc(var(--asgardeo-spacing-unit) * 2.5)
    calc(var(--asgardeo-spacing-unit) * 2);
  gap: calc(var(--asgardeo-spacing-unit) * 1.25);
  background: linear-gradient(
    180deg,
    var(--asgardeo-color-primary-light) 0%,
    var(--asgardeo-color-background-surface) 100%
  );
  border-bottom: 1px solid var(--asgardeo-color-border);
}

.asgardeo-user-profile__avatar-wrapper {
  position: relative;
  border-radius: 50%;
  padding: 3px;
  background: linear-gradient(
    135deg,
    var(--asgardeo-color-primary-main),
    var(--asgardeo-color-primary-dark)
  );
  box-shadow: 0 4px 14px rgba(75, 110, 245, 0.28);
}

.asgardeo-user-profile__avatar {
  width: var(--asgardeo-avatar-size, 72px);
  height: var(--asgardeo-avatar-size, 72px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 2px solid var(--asgardeo-color-background-surface);
}

/* Avatar size variants */

.asgardeo-user-profile__avatar--sm {
  width: 48px;
  height: 48px;
}

.asgardeo-user-profile__avatar--sm .asgardeo-user-profile__avatar-initials {
  font-size: 1rem;
}

.asgardeo-user-profile__avatar--md {
  width: 64px;
  height: 64px;
}

.asgardeo-user-profile__avatar--md .asgardeo-user-profile__avatar-initials {
  font-size: 1.25rem;
}

.asgardeo-user-profile__avatar--lg {
  width: 80px;
  height: 80px;
}

.asgardeo-user-profile__avatar--lg .asgardeo-user-profile__avatar-initials {
  font-size: 1.625rem;
}

.asgardeo-user-profile__avatar-initials {
  color: #ffffff;
  font-weight: var(--asgardeo-typography-fontWeight-semibold);
  line-height: 1;
  letter-spacing: 0.02em;
  pointer-events: none;
  user-select: none;
}

.asgardeo-user-profile__hero-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: calc(var(--asgardeo-spacing-unit) * 0.375);
  text-align: center;
}

.asgardeo-user-profile__hero-name {
  font-size: var(--asgardeo-typography-fontSize-lg);
  font-weight: var(--asgardeo-typography-fontWeight-semibold);
  color: var(--asgardeo-color-text-primary);
  line-height: var(--asgardeo-typography-lineHeight-tight);
  letter-spacing: var(--asgardeo-typography-letterSpacing-tight);
}

.asgardeo-user-profile__hero-subtitle {
  font-size: var(--asgardeo-typography-fontSize-sm);
  color: var(--asgardeo-color-text-secondary);
  line-height: var(--asgardeo-typography-lineHeight-normal);
}

/* ── Alerts & loading ────────────────────────────────────────── */

.asgardeo-user-profile__error {
  margin: calc(var(--asgardeo-spacing-unit) * 1.5) calc(var(--asgardeo-spacing-unit) * 2.5)
    calc(var(--asgardeo-spacing-unit) * 0.5);
}

.asgardeo-user-profile__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: calc(var(--asgardeo-spacing-unit) * 3.5) 0;
}

/* ── Fields ──────────────────────────────────────────────────── */

.asgardeo-user-profile__fields {
  display: flex;
  flex-direction: column;
}

.asgardeo-user-profile__field {
  display: grid;
  grid-template-columns: 38% 62%;
  align-items: start;
  padding: calc(var(--asgardeo-spacing-unit) * 1.5) calc(var(--asgardeo-spacing-unit) * 2.5);
  gap: calc(var(--asgardeo-spacing-unit) * 0.75);
  box-sizing: border-box;
  transition: background-color var(--asgardeo-transition-fast);
}

.asgardeo-user-profile__field:hover {
  background-color: var(--asgardeo-color-action-hover);
}

.asgardeo-user-profile__field + .asgardeo-user-profile__field {
  border-top: 1px solid var(--asgardeo-color-border);
}

.asgardeo-user-profile__field-label {
  color: var(--asgardeo-color-text-secondary);
  font-size: var(--asgardeo-typography-fontSize-sm);
  font-weight: var(--asgardeo-typography-fontWeight-medium);
  padding-top: 2px;
}

.asgardeo-user-profile__field-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--asgardeo-spacing-unit) * 0.5);
  min-height: 1.5rem;
}

.asgardeo-user-profile__field-value {
  color: var(--asgardeo-color-text-primary);
  word-break: break-word;
  flex: 1;
  font-size: var(--asgardeo-typography-fontSize-sm);
}

.asgardeo-user-profile__field-placeholder {
  color: var(--asgardeo-color-primary-main);
  font-size: var(--asgardeo-typography-fontSize-sm);
  font-style: italic;
  flex: 1;
  cursor: pointer;
  text-decoration: underline;
  text-decoration-style: dotted;
  text-underline-offset: 2px;
  opacity: 0.8;
  transition: opacity var(--asgardeo-transition-fast);
}

.asgardeo-user-profile__field-placeholder:hover {
  opacity: 1;
}

/* ── Edit button (pencil) ────────────────────────────────────── */

.asgardeo-user-profile__field-edit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--asgardeo-color-text-secondary);
  flex-shrink: 0;
  padding: calc(var(--asgardeo-spacing-unit) * 0.375);
  border-radius: var(--asgardeo-border-radius-small);
  transition:
    color var(--asgardeo-transition-fast),
    background-color var(--asgardeo-transition-fast),
    opacity var(--asgardeo-transition-fast);
  opacity: 0;
  line-height: 0;
}

.asgardeo-user-profile__field:hover .asgardeo-user-profile__field-edit-btn {
  opacity: 1;
}

.asgardeo-user-profile__field-edit-btn:hover {
  color: var(--asgardeo-color-primary-main);
  background-color: var(--asgardeo-color-primary-light);
}

.asgardeo-user-profile__field-edit-btn:focus-visible {
  opacity: 1;
  outline: none;
  box-shadow: 0 0 0 var(--asgardeo-focus-ring-width) var(--asgardeo-focus-ring-color);
}

/* ── Edit mode ───────────────────────────────────────────────── */

.asgardeo-user-profile__field-edit {
  display: flex;
  flex-direction: column;
  gap: calc(var(--asgardeo-spacing-unit) * 0.75);
  padding: calc(var(--asgardeo-spacing-unit) * 0.25) 0;
}

.asgardeo-user-profile__field-edit-actions {
  display: flex;
  align-items: center;
  gap: calc(var(--asgardeo-spacing-unit) * 0.75);
}

/* ── Footer slot ─────────────────────────────────────────────── */

.asgardeo-user-profile__footer {
  padding: calc(var(--asgardeo-spacing-unit) * 1.5) calc(var(--asgardeo-spacing-unit) * 2.5);
  border-top: 1px solid var(--asgardeo-color-border);
}

/* ── Compact modifier ────────────────────────────────────────── */

.asgardeo-user-profile--compact .asgardeo-user-profile__hero {
  padding: calc(var(--asgardeo-spacing-unit) * 2) calc(var(--asgardeo-spacing-unit) * 2);
}

.asgardeo-user-profile--compact .asgardeo-user-profile__avatar--lg {
  width: 56px;
  height: 56px;
}

.asgardeo-user-profile--compact .asgardeo-user-profile__avatar--lg .asgardeo-user-profile__avatar-initials {
  font-size: 1.125rem;
}

.asgardeo-user-profile--compact .asgardeo-user-profile__field {
  padding: calc(var(--asgardeo-spacing-unit) * 1) calc(var(--asgardeo-spacing-unit) * 2);
}

.asgardeo-user-profile--compact .asgardeo-user-profile__hero-name {
  font-size: var(--asgardeo-typography-fontSize-md);
}
`;

export default USER_PROFILE_CSS;
