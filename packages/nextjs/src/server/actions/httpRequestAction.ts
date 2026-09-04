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

'use server';

import {HttpRequestConfig, HttpResponse} from '@asgardeo/node';
import getAccessToken from './getAccessToken';
import getClientOrigin from './getClientOrigin';
import AsgardeoNextClient from '../../AsgardeoNextClient';

/**
 * Result of {@link httpRequestAction}. Kept serializable so it can cross the server action boundary.
 */
export interface HttpRequestActionResult {
  data?: HttpResponse;
  error?: string;
  success: boolean;
}

/**
 * Origins a request may target: the identity server (`baseUrl`) and the app's own origin.
 * Anything else is refused so that a Client Component cannot turn the server into an open proxy
 * (for example towards internal networks or cloud metadata endpoints).
 */
const getAllowedOrigins = async (): Promise<string[]> => {
  const origins: string[] = [];

  try {
    const {baseUrl}: {baseUrl?: string} = await AsgardeoNextClient.getInstance().getConfiguration();

    if (baseUrl) {
      origins.push(new URL(baseUrl).origin);
    }
  } catch {
    // Configuration not available; only the app origin will be allowed.
  }

  try {
    origins.push(new URL(await getClientOrigin()).origin);
  } catch {
    // No request headers available (e.g. outside a request); skip the app origin.
  }

  return origins;
};

/**
 * Server action that performs an HTTP request on behalf of the signed-in user.
 *
 * The access token never leaves the server: it is read from the session cookie and attached as a
 * `Bearer` token unless `attachToken` is `false`. This backs `useAsgardeo().http.request` in Client Components.
 * Only the identity server's origin and the app's own origin can be targeted.
 *
 * @param requestConfig - Request configuration (`url`, `method`, `headers`, `data`, `params`, `attachToken`).
 * @returns The response (status, headers, parsed body) or an error description.
 */
const httpRequestAction = async (requestConfig: HttpRequestConfig): Promise<HttpRequestActionResult> => {
  const {url, method = 'GET', headers = {}, data, params, attachToken = true} = requestConfig ?? {};

  if (!url) {
    return {error: '[httpRequestAction] `url` is required.', success: false};
  }

  const accessToken: string | undefined = attachToken ? await getAccessToken() : undefined;

  if (attachToken && !accessToken) {
    return {
      error: '[httpRequestAction] No active session. Sign in before making authenticated requests.',
      success: false,
    };
  }

  let resolvedUrl: URL;

  try {
    resolvedUrl = new URL(url);
  } catch {
    return {error: `[httpRequestAction] Invalid \`url\`: ${url}`, success: false};
  }

  const allowedOrigins: string[] = await getAllowedOrigins();

  if (!allowedOrigins.includes(resolvedUrl.origin)) {
    return {
      error: `[httpRequestAction] Requests to ${
        resolvedUrl.origin
      } are not allowed. Only the identity server and the app's own origin can be called (${
        allowedOrigins.join(', ') || 'none resolved'
      }).`,
      success: false,
    };
  }

  if (params) {
    Object.entries(params).forEach(([key, value]: [string, unknown]) => {
      if (value !== undefined && value !== null) {
        resolvedUrl.searchParams.set(key, String(value));
      }
    });
  }

  const isJsonBody: boolean = data !== undefined && typeof data !== 'string';
  const requestHeaders: Record<string, string> = {
    ...(isJsonBody ? {'Content-Type': 'application/json'} : {}),
    ...headers,
    ...(accessToken ? {Authorization: `Bearer ${accessToken}`} : {}),
  };

  let body: string | undefined;

  if (data !== undefined) {
    body = isJsonBody ? JSON.stringify(data) : (data as string);
  }

  try {
    const response: Response = await fetch(resolvedUrl.toString(), {
      body,
      headers: requestHeaders,
      method,
    });

    const rawBody: string = await response.text();
    let parsedBody: unknown = rawBody;

    try {
      parsedBody = rawBody ? JSON.parse(rawBody) : undefined;
    } catch {
      // Not JSON, keep the raw text.
    }

    const responseHeaders: Record<string, string> = {};

    response.headers.forEach((value: string, key: string) => {
      responseHeaders[key] = value;
    });

    const httpResponse: HttpResponse = {
      config: requestConfig,
      data: parsedBody,
      headers: responseHeaders,
      status: response.status,
      statusText: response.statusText,
    };

    if (!response.ok) {
      return {
        data: httpResponse,
        error: `[httpRequestAction] Request to ${resolvedUrl.origin}${resolvedUrl.pathname} failed with status ${response.status}.`,
        success: false,
      };
    }

    return {data: httpResponse, success: true};
  } catch (error) {
    return {
      error: `[httpRequestAction] ${error instanceof Error ? error.message : String(error)}`,
      success: false,
    };
  }
};

export default httpRequestAction;
