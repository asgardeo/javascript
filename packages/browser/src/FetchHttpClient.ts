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

import {HttpClient, HttpError, HttpRequestConfig, HttpResponse} from '@asgardeo/javascript';

/**
 * Fetch-based HTTP client. Extends `HttpClient` and implements `transport()`
 * using the native Fetch API.
 *
 * To plug in a custom HTTP transport, extend `HttpClient` from `@asgardeo/javascript`
 * and override `transport()`, then pass your implementation where `FetchHttpClient`
 * is currently used.
 */
export class FetchHttpClient extends HttpClient {
  private static instances: Map<number, FetchHttpClient> = new Map<number, FetchHttpClient>();

  static getInstance(
    instanceId: number = 0,
    isHandlerEnabled: boolean = true,
    attachToken: (request: HttpRequestConfig) => Promise<void> = (): Promise<void> => Promise.resolve(),
  ): FetchHttpClient {
    if (!this.instances.has(instanceId)) {
      this.instances.set(instanceId, new FetchHttpClient(isHandlerEnabled, attachToken));
    }
    return this.instances.get(instanceId)!;
  }

  static destroyInstance(instanceId: number = 0): void {
    this.instances.delete(instanceId);
  }

  // eslint-disable-next-line class-methods-use-this
  protected async transport<T = any>(config: HttpRequestConfig): Promise<HttpResponse<T>> {
    let url: string = config.url ?? '';

    if (config.params) {
      const qs: string = new URLSearchParams(config.params).toString();
      if (qs) {
        url = `${url}?${qs}`;
      }
    }

    const headers: Record<string, string> = {...(config.headers ?? {})};
    let body: BodyInit | undefined;

    if (config.data !== undefined) {
      if (config.data instanceof FormData) {
        body = config.data;
      } else {
        body = JSON.stringify(config.data);
        if (!headers['Content-Type'] && !headers['content-type']) {
          headers['Content-Type'] = 'application/json';
        }
      }
    }

    let fetchResponse: Response;

    try {
      fetchResponse = await fetch(url, {
        body,
        credentials: 'include',
        headers,
        method: (config.method ?? 'GET').toUpperCase(),
      });
    } catch (networkError: any) {
      throw Object.assign(new Error(networkError.message), {
        code: 'NETWORK_ERROR',
        config,
      } as Partial<HttpError>);
    }

    const contentType: string = fetchResponse.headers.get('content-type') ?? '';
    const data: T = contentType.includes('application/json')
      ? await fetchResponse.json()
      : ((await fetchResponse.text()) as any);

    const responseHeaders: Record<string, string> = {};
    fetchResponse.headers.forEach((value: string, key: string) => {
      responseHeaders[key] = value;
    });

    if (!fetchResponse.ok) {
      throw Object.assign(new Error(fetchResponse.statusText), {
        config,
        response: {
          data,
          headers: responseHeaders,
          status: fetchResponse.status,
          statusText: fetchResponse.statusText,
        },
      } as Partial<HttpError>);
    }

    return {
      config,
      data,
      headers: responseHeaders,
      status: fetchResponse.status,
      statusText: fetchResponse.statusText,
    };
  }
}
