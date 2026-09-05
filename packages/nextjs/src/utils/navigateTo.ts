/**
 * Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com).
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
 * The subset of the Next.js app router used for in-app navigation.
 */
export interface InAppRouter {
  push: (href: string) => void;
}

/**
 * Whether `url` points outside the current origin (e.g. the identity server's hosted
 * login or logout endpoint). Relative URLs and same-origin URLs return `false`.
 */
export const isCrossOriginUrl = (url: string): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return new URL(url, window.location.origin).origin !== window.location.origin;
  } catch {
    return false;
  }
};

/**
 * Navigates to `url`, using the Next.js router for in-app URLs and a full browser
 * navigation for cross-origin ones.
 *
 * The app router can only render routes of this application: handing it an external
 * URL makes it request that URL as a React Server Components payload first, which the
 * browser blocks (CORS) before the router falls back to a normal navigation, leaving
 * "Failed to fetch RSC payload" errors in the console on every hosted sign-in or sign-out.
 */
const navigateTo = (router: InAppRouter, url: string): void => {
  if (isCrossOriginUrl(url)) {
    window.location.assign(url);

    return;
  }

  router.push(url);
};

export default navigateTo;
