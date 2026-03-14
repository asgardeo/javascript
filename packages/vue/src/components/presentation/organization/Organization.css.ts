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
 * Styles for the Organization presentation component.
 *
 * BEM block: `.asgardeo-organization`
 *
 * A compact inline display of the current organization name with an icon.
 * Used for embedding the organization name anywhere in a layout.
 *
 * Elements:
 *   __name  – the organization name (Typography body1)
 */
const ORGANIZATION_CSS = `
/* ============================================================
   Organization
   ============================================================ */

.asgardeo-organization {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--asgardeo-spacing-unit) * 1);
  color: var(--asgardeo-color-text-primary);
  font-family: var(--asgardeo-typography-fontFamily);
}

.asgardeo-organization__name {
  font-weight: var(--asgardeo-typography-fontWeight-medium);
}
`;

export default ORGANIZATION_CSS;
