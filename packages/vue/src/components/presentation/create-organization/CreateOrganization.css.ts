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
 * Styles for the CreateOrganization presentation component.
 *
 * BEM block: `.asgardeo-create-organization`
 *
 * The root element is a Card, whose padding is intentionally kept
 * as this is a full form panel.
 *
 * Elements:
 *   __title        – form heading (Typography h6)
 *   __description  – optional sub-heading (Typography body2)
 *   __error        – error Alert
 *   __input        – the org-name TextField
 *   __submit       – the submit Button
 */
const CREATE_ORGANIZATION_CSS = `
/* ============================================================
   CreateOrganization
   ============================================================ */

.asgardeo-create-organization {
  display: flex;
  flex-direction: column;
  gap: calc(var(--asgardeo-spacing-unit) * 2);
  max-width: 480px;
  width: 100%;
}

/* Title & description --------------------------------------- */

.asgardeo-create-organization__description {
  margin-top: calc(var(--asgardeo-spacing-unit) * -1);
  color: var(--asgardeo-color-text-secondary);
}

/* Input ----------------------------------------------------- */

.asgardeo-create-organization__input {
  width: 100%;
}

/* Submit ---------------------------------------------------- */

.asgardeo-create-organization__submit {
  align-self: flex-start;
}
`;

export default CREATE_ORGANIZATION_CSS;
