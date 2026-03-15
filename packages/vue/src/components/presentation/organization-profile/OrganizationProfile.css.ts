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
 * Styles for the OrganizationProfile presentation component.
 *
 * BEM block: `.asgardeo-organization-profile`
 */
const ORGANIZATION_PROFILE_CSS = `
/* ============================================================
   OrganizationProfile
   ============================================================ */

.asgardeo-organization-profile {
  display: flex;
  flex-direction: column;
  min-width: 320px;
  padding: 0;
  overflow: hidden;
}

/* Header: title + divider ------------------------------------ */

.asgardeo-organization-profile__header {
  padding: calc(var(--asgardeo-spacing-unit) * 2) calc(var(--asgardeo-spacing-unit) * 2.5);
  padding-bottom: calc(var(--asgardeo-spacing-unit) * 1.5);
}

.asgardeo-organization-profile__title {
  margin: 0;
}

.asgardeo-organization-profile__header-divider {
  margin: 0;
}

/* Identity: avatar + org name + handle ----------------------- */

.asgardeo-organization-profile__identity {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: calc(var(--asgardeo-spacing-unit) * 2) 0 calc(var(--asgardeo-spacing-unit) * 1.5);
  gap: calc(var(--asgardeo-spacing-unit) * 0.5);
}

.asgardeo-organization-profile__avatar {
  width: var(--asgardeo-avatar-size);
  height: var(--asgardeo-avatar-size);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-bottom: calc(var(--asgardeo-spacing-unit) * 0.375);
}

.asgardeo-organization-profile__avatar-initials {
  color: #ffffff;
  font-size: var(--asgardeo-avatar-fontSize);
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0.02em;
  pointer-events: none;
  user-select: none;
}

.asgardeo-organization-profile__org-name {
  margin: 0;
  text-align: center;
}

.asgardeo-organization-profile__org-handle {
  color: var(--asgardeo-color-text-secondary);
  text-align: center;
}

.asgardeo-organization-profile__identity-divider {
  margin: 0;
}

/* Fields ---------------------------------------------------- */

.asgardeo-organization-profile__fields {
  display: flex;
  flex-direction: column;
}

.asgardeo-organization-profile__field {
  display: grid;
  grid-template-columns: 36% 64%;
  align-items: center;
  padding: calc(var(--asgardeo-spacing-unit) * 1.25) calc(var(--asgardeo-spacing-unit) * 2.5);
  gap: calc(var(--asgardeo-spacing-unit) * 0.75);
  box-sizing: border-box;
  transition: background-color var(--asgardeo-transition-fast);
}

.asgardeo-organization-profile__field:hover {
  background-color: var(--asgardeo-color-action-hover);
}

.asgardeo-organization-profile__field + .asgardeo-organization-profile__field {
  border-top: 1px solid var(--asgardeo-color-border);
}

.asgardeo-organization-profile__field-label-col {
  /* label column */
}

.asgardeo-organization-profile__field-label {
  color: var(--asgardeo-color-text-secondary);
  font-size: var(--asgardeo-typography-fontSize-sm);
}

.asgardeo-organization-profile__field-value-col {
  /* value column */
}

.asgardeo-organization-profile__field-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--asgardeo-spacing-unit) * 0.5);
  min-height: 1.5rem;
}

.asgardeo-organization-profile__field-value {
  color: var(--asgardeo-color-text-primary);
  word-break: break-word;
  flex: 1;
  font-size: var(--asgardeo-typography-fontSize-sm);
}

.asgardeo-organization-profile__field-value--id {
  font-size: calc(var(--asgardeo-typography-fontSize-sm) * 0.9);
  color: var(--asgardeo-color-text-secondary);
  font-family: monospace;
  word-break: break-all;
}

.asgardeo-organization-profile__field-placeholder {
  color: var(--asgardeo-color-primary-main);
  font-style: italic;
  font-size: var(--asgardeo-typography-fontSize-sm);
  flex: 1;
  cursor: pointer;
  text-decoration: underline;
  text-decoration-style: dotted;
  text-underline-offset: 2px;
}

/* Edit button (pencil icon) --------------------------------- */

.asgardeo-organization-profile__field-edit-btn {
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

.asgardeo-organization-profile__field:hover .asgardeo-organization-profile__field-edit-btn {
  opacity: 1;
}

.asgardeo-organization-profile__field-edit-btn:hover {
  color: var(--asgardeo-color-primary-main);
  background-color: var(--asgardeo-color-primary-light);
}

.asgardeo-organization-profile__field-edit-btn:focus-visible {
  opacity: 1;
  outline: none;
  box-shadow: 0 0 0 var(--asgardeo-focus-ring-width) var(--asgardeo-focus-ring-color);
}

/* Edit mode ------------------------------------------------- */

.asgardeo-organization-profile__field-edit {
  display: flex;
  flex-direction: column;
  gap: calc(var(--asgardeo-spacing-unit) * 0.75);
}

.asgardeo-organization-profile__field-edit-actions {
  display: flex;
  align-items: center;
  gap: calc(var(--asgardeo-spacing-unit) * 0.75);
}
`;

export default ORGANIZATION_PROFILE_CSS;
