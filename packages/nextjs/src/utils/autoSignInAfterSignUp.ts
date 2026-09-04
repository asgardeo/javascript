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

import {EmbeddedSignInFlowAuthenticator, EmbeddedSignInFlowInitiateResponse} from '@asgardeo/node';
import logger from './logger';
import signInAction from '../server/actions/signInAction';

/**
 * Input keys, in order of preference, under which the registration form submits the username.
 */
const USERNAME_INPUT_KEYS: string[] = [
  'http://wso2.org/claims/username',
  'username',
  'userName',
  'http://wso2.org/claims/emailaddress',
  'email',
];

const PASSWORD_INPUT_KEYS: string[] = ['password', 'http://wso2.org/claims/password'];

export interface SignUpCredentials {
  password: string;
  username: string;
}

/**
 * Extracts the username and password from the inputs of a registration flow submission, if present.
 */
export const extractSignUpCredentials = (inputs?: Record<string, unknown>): SignUpCredentials | undefined => {
  if (!inputs) {
    return undefined;
  }

  const pick = (keys: string[]): string | undefined =>
    keys.map((key: string) => inputs[key]).find((value: unknown) => typeof value === 'string' && value !== '') as
      | string
      | undefined;

  const username: string | undefined = pick(USERNAME_INPUT_KEYS);
  const password: string | undefined = pick(PASSWORD_INPUT_KEYS);

  return username && password ? {password, username} : undefined;
};

/**
 * Signs the user in right after a successful embedded registration, using the credentials they just
 * submitted, through the app-native (embedded) sign-in flow. On success the session cookie is set exactly
 * as for a regular sign-in.
 *
 * Returns `false` (without throwing) whenever an automatic sign-in is not possible, for example when
 * app-native authentication is disabled for the application or the login flow needs more than a
 * username/password step. The caller should then fall back to sending the user to the sign-in page.
 */
const autoSignInAfterSignUp = async ({username, password}: SignUpCredentials): Promise<boolean> => {
  try {
    const initiation: Awaited<ReturnType<typeof signInAction>> = await signInAction({
      flowId: '',
      selectedAuthenticator: {authenticatorId: '', params: {}},
    });
    const flow: EmbeddedSignInFlowInitiateResponse | undefined = initiation?.data as
      | EmbeddedSignInFlowInitiateResponse
      | undefined;

    if (!initiation.success || !flow || !('nextStep' in flow)) {
      logger.warn(
        `[autoSignInAfterSignUp] Could not start the sign-in flow after registration, the user has to sign in manually. ${
          initiation.error ?? ''
        }`,
      );

      return false;
    }

    const basicAuthenticator: EmbeddedSignInFlowAuthenticator | undefined = flow.nextStep?.authenticators?.find(
      (authenticator: EmbeddedSignInFlowAuthenticator) =>
        authenticator.idp === 'LOCAL' &&
        authenticator.requiredParams?.includes('username') &&
        authenticator.requiredParams?.includes('password'),
    );

    if (!basicAuthenticator) {
      logger.warn(
        '[autoSignInAfterSignUp] The first login step has no username/password authenticator, the user has to sign in manually.',
      );

      return false;
    }

    const link: {href: string; method: string} | undefined = flow.links?.[0];
    const completion: Awaited<ReturnType<typeof signInAction>> = await signInAction(
      {
        flowId: flow.flowId,
        selectedAuthenticator: {authenticatorId: basicAuthenticator.authenticatorId, params: {password, username}},
      },
      link ? {method: link.method, url: link.href} : {},
    );

    if (completion.success && completion.data && 'afterSignInUrl' in completion.data) {
      return true;
    }

    logger.warn(
      `[autoSignInAfterSignUp] Sign-in did not complete in a single step (status: ${
        (completion.data as {flowStatus?: string})?.flowStatus ?? 'unknown'
      }), the user has to sign in manually. ${completion.error ?? ''}`,
    );

    return false;
  } catch (error) {
    logger.warn(
      `[autoSignInAfterSignUp] Automatic sign-in failed, the user has to sign in manually: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );

    return false;
  }
};

export default autoSignInAfterSignUp;
