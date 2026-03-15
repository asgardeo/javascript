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
 * Styles for the Typography primitive component.
 *
 * BEM block: `.asgardeo-typography`
 *
 * Modifiers (variant):
 *   --h1 | --h2 | --h3 | --h4 | --h5 | --h6
 *   --subtitle1 | --subtitle2
 *   --body1 | --body2
 *   --caption | --overline
 */
const TYPOGRAPHY_CSS = `
/* ============================================================
   Typography
   ============================================================ */

.asgardeo-typography {
  font-family: var(--asgardeo-typography-fontFamily);
  color: var(--asgardeo-color-text-primary);
  margin: 0;
  line-height: var(--asgardeo-typography-lineHeight-normal);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.asgardeo-typography--h1 {
  font-size: var(--asgardeo-typography-fontSize-3xl);
  font-weight: var(--asgardeo-typography-fontWeight-bold);
  line-height: var(--asgardeo-typography-lineHeight-tight);
  letter-spacing: var(--asgardeo-typography-letterSpacing-tight);
}

.asgardeo-typography--h2 {
  font-size: var(--asgardeo-typography-fontSize-2xl);
  font-weight: var(--asgardeo-typography-fontWeight-bold);
  line-height: var(--asgardeo-typography-lineHeight-tight);
  letter-spacing: var(--asgardeo-typography-letterSpacing-tight);
}

.asgardeo-typography--h3 {
  font-size: var(--asgardeo-typography-fontSize-xl);
  font-weight: var(--asgardeo-typography-fontWeight-semibold);
  line-height: var(--asgardeo-typography-lineHeight-tight);
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
  letter-spacing: var(--asgardeo-typography-letterSpacing-wide);
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
  letter-spacing: 0.08em;
  color: var(--asgardeo-color-text-secondary);
}
`;

export default TYPOGRAPHY_CSS;
