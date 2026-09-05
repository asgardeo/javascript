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

import resolveFlowErrorMessage from './resolveFlowErrorMessage';

/**
 * Identity server rejections that have a dedicated, translated explanation.
 * The identity server reports these under a generic code (e.g. `ABA-60001`), so they are matched on the description.
 */
const REDIRECT_URI_MISMATCH: RegExp = /invalid_callback|callback\.not\.match/i;

export interface ResolveSignInErrorMessageOptions {
  /** The URL the SDK sends as the OAuth `redirect_uri`; shown to the developer when it is not registered. */
  afterSignInUrl?: string;
  /** Message to use when the error carries nothing meaningful. */
  fallback: string;
  /** Translation function. */
  t: (key: string, params?: Record<string, string | number>) => string;
}

/**
 * Resolves the message to show for an error raised by the embedded sign-in flow.
 * Known identity server rejections map to translated, actionable messages; anything else falls back to
 * {@link resolveFlowErrorMessage}.
 */
const resolveSignInErrorMessage = (
  error: unknown,
  {afterSignInUrl, fallback, t}: ResolveSignInErrorMessageOptions,
): string => {
  const message: string = resolveFlowErrorMessage(error, '');

  if (REDIRECT_URI_MISMATCH.test(message)) {
    const origin: string = typeof window !== 'undefined' ? window.location.origin : '';
    // `afterSignInUrl` may be relative (e.g. `/dashboard`); the redirect URI the server saw is origin-resolved.
    const url: string = afterSignInUrl && origin ? new URL(afterSignInUrl, origin).href : afterSignInUrl || origin;

    return t('errors.signin.redirect.uri.mismatch', {url});
  }

  return message || fallback;
};

export default resolveSignInErrorMessage;
