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
 * Entry point for all public APIs of this SDK.
 */

// Expose Buffer globally so that browser environments that check window.Buffer
// (e.g. libraries that guard against missing Node polyfills) can find it.
// `buffer` is bundled inline by esbuild — no external import appears in the dist.
// eslint-disable-next-line import/no-cycle
import {Buffer} from 'buffer';

if (typeof window !== 'undefined' && !(window as any).Buffer) {
  (window as any).Buffer = Buffer;
}

// eslint-disable-next-line import/no-cycle
export * from './__legacy__/client';
// eslint-disable-next-line import/no-cycle
export * from './__legacy__/models';

// Utils
// eslint-disable-next-line import/no-cycle
export * from './__legacy__/utils/spa-utils';

// Constants
export * from './__legacy__/constants/storage';
export * from './__legacy__/constants/hooks';

// clients
export * from './__legacy__/clients/main-thread-client';
export * from './__legacy__/clients/web-worker-client';

// models
export * from './__legacy__/models/request-custom-grant';

// helpers
export * from './__legacy__/helpers/authentication-helper';
export * from './__legacy__/helpers/spa-helper';

// worker receiver
export * from './__legacy__/worker/worker-receiver';

export {AsgardeoBrowserConfig} from './models/config';

export {default as hasAuthParamsInUrl} from './utils/hasAuthParamsInUrl';
export {default as hasCalledForThisInstanceInUrl} from './utils/hasCalledForThisInstanceInUrl';
export {default as navigate} from './utils/navigate';

export {default as AsgardeoBrowserClient} from './AsgardeoBrowserClient';
export {FetchHttpClient} from './FetchHttpClient';

// Re-export everything from the JavaScript package
export * from '@asgardeo/javascript';

export {
  detectThemeMode,
  createClassObserver,
  createMediaQueryListener,
  BrowserThemeDetection,
} from './theme/themeDetection';
export {default as getActiveTheme} from './theme/getActiveTheme';

export {default as handleWebAuthnAuthentication} from './utils/handleWebAuthnAuthentication';
export {default as http} from './utils/http';
export {default as resolveEmojiUrisInHtml} from './utils/v2/resolveEmojiUrisInHtml';
