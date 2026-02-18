/**
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
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
 *
 */

import axios, {InternalAxiosRequestConfig} from 'axios';
import {HttpError, HttpRequestConfig, HttpResponse} from '../../..';
import {staticDecorator} from '../helpers';
import {HttpClientInstance, HttpClientInterface, HttpClientStatic} from '../models';

/**
 * An Http Http client to perform Http requests.
 *
 * @remarks
 * Typescript doesn't support static functions in interfaces. Therefore,
 * a decorator i.e `staticDecorator` was written to add static support.
 * Follow {@link https://github.com/Microsoft/TypeScript/issues/13462}
 * for more info.
 *
 * @example
 * Example usage.
 * ```
 *
 * const httpClient = HttpClient.getInstance();
 * httpClient.init(true, onRequestStart, onRequestSuccess, onRequestError, onRequestFinish);
 * ```
 */
@staticDecorator<HttpClientStatic<HttpClientInstance>>()
export class HttpClient implements HttpClientInterface<HttpRequestConfig, HttpResponse, HttpError> {
  private static instances: Map<number, HttpClientInstance> = new Map();
  private static clientInstances: Map<number, HttpClient> = new Map();
  private isHandlerEnabled: boolean;
  private attachToken: (request: HttpRequestConfig) => Promise<void> = () => Promise.resolve();
  private requestStartCallback: (request: HttpRequestConfig) => void = () => null;
  private requestSuccessCallback: (response: HttpResponse) => void = () => null;
  private requestErrorCallback: (error: HttpError) => void = () => null;
  private requestFinishCallback: () => void = () => null;
  private static readonly DEFAULT_HANDLER_DISABLE_TIMEOUT: number = 1000;

  /**
   * Private constructor to avoid object instantiation from outside
   * the class.
   *
   * @hideconstructor
   */
  private constructor() {
    this.init = this.init.bind(this);
    this.setHttpRequestErrorCallback = this.setHttpRequestErrorCallback.bind(this);
    this.setHttpRequestFinishCallback = this.setHttpRequestFinishCallback.bind(this);
    this.setHttpRequestStartCallback = this.setHttpRequestStartCallback.bind(this);
    this.setHttpRequestSuccessCallback = this.setHttpRequestSuccessCallback.bind(this);
  }

  /**
   * Returns an instance-specific HttpClient instance.
   * Each instance ID gets its own axios instance and HttpClient to avoid state conflicts.
   *
   * @param instanceId - The instance ID for multi-auth context support. Defaults to 0.
   * @return {HttpClientInstance}
   */
  public static getInstance(instanceId: number = 0): HttpClientInstance {
    if (this.instances.has(instanceId)) {
      return this.instances.get(instanceId)!;
    }

    const axiosInstance = axios.create({
      withCredentials: true,
    }) as HttpClientInstance;

    const clientInstance = new HttpClient();
    this.clientInstances.set(instanceId, clientInstance);

    // Register request interceptor
    axiosInstance.interceptors.request.use(async (request: InternalAxiosRequestConfig) => await clientInstance.requestHandler(request as HttpRequestConfig) as InternalAxiosRequestConfig);

    // Register response interceptor
    axiosInstance.interceptors.response.use(
      response => clientInstance.successHandler(response),
      error => clientInstance.errorHandler(error),
    );

    // Add the missing helper methods from axios
    axiosInstance.all = axios.all;
    axiosInstance.spread = axios.spread;

    // Add the init method from the `HttpClient` instance.
    axiosInstance.init = clientInstance.init;

    // Add the handler enabling & disabling methods to the instance.
    axiosInstance.enableHandler = clientInstance.enableHandler;
    axiosInstance.disableHandler = clientInstance.disableHandler;
    axiosInstance.disableHandlerWithTimeout = clientInstance.disableHandlerWithTimeout;
    axiosInstance.setHttpRequestStartCallback = clientInstance.setHttpRequestStartCallback;
    axiosInstance.setHttpRequestSuccessCallback = clientInstance.setHttpRequestSuccessCallback;
    axiosInstance.setHttpRequestErrorCallback = clientInstance.setHttpRequestErrorCallback;
    axiosInstance.setHttpRequestFinishCallback = clientInstance.setHttpRequestFinishCallback;
    
    this.instances.set(instanceId, axiosInstance);
    return axiosInstance;
  }

  /**
   * Intercepts all the requests.
   * If the `isHandlerEnabled` flag is set to true, fires the `requestStartCallback`
   * and retrieves the access token from the server and attaches it to the request.
   * Else, just returns the original request.
   *
   * @param {HttpRequestConfig} request - Original request.
   * @return {HttpRequestConfig}
   */
  public async requestHandler(request: HttpRequestConfig): Promise<HttpRequestConfig> {
    await this.attachToken(request);

    if (request?.shouldEncodeToFormData) {
      const data = request?.data;
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });

      request.data = formData;
    }

    request.startTimeInMs = new Date().getTime();

    if (this.isHandlerEnabled) {
      if (this.requestStartCallback && typeof this.requestStartCallback === 'function') {
        this.requestStartCallback(request);
      }
    }
    return request;
  }

  /**
   * Handles response errors.
   * If the `isHandlerEnabled` flag is set to true, fires the `requestErrorCallback`
   * and the `requestFinishCallback` functions. Else, just returns the original error.
   *
   * @param {HttpError} error - Original error.
   * @return {HttpError}
   */
  public errorHandler(error: HttpError): HttpError {
    if (this.isHandlerEnabled) {
      if (this.requestErrorCallback && typeof this.requestErrorCallback === 'function') {
        this.requestErrorCallback(error);
      }
      if (this.requestFinishCallback && typeof this.requestFinishCallback === 'function') {
        this.requestFinishCallback();
      }
    }
    throw error;
  }

  /**
   * Handles response success.
   * If the `isHandlerEnabled` flag is set to true, fires the `requestSuccessCallback`
   * and the `requestFinishCallback` functions. Else, just returns the original response.
   *
   * @param {HttpResponse} response - Original response.
   * @return {HttpResponse}
   */
  public successHandler(response: HttpResponse): HttpResponse {
    if (this.isHandlerEnabled) {
      if (this.requestSuccessCallback && typeof this.requestSuccessCallback === 'function') {
        this.requestSuccessCallback(response);
      }
      if (this.requestFinishCallback && typeof this.requestFinishCallback === 'function') {
        this.requestFinishCallback();
      }
    }
    return response;
  }

  /**
   * Initializes the Http client.
   *
   * @param isHandlerEnabled - Flag to toggle handler enablement.
   * @param requestStartCallback - Callback function to be triggered on request start.
   * @param requestSuccessCallback - Callback function to be triggered on request success.
   * @param requestErrorCallback - Callback function to be triggered on request error.
   * @param requestFinishCallback - Callback function to be triggered on request error.
   */
  public async init(
    isHandlerEnabled = true,
    attachToken: (request: HttpRequestConfig) => Promise<void>,
  ): Promise<void> {
    this.isHandlerEnabled = isHandlerEnabled;
    this.attachToken = attachToken;
  }

  /**
   * Enables the handler.
   */
  public enableHandler(): void {
    this.isHandlerEnabled = true;
  }

  /**
   * Disables the handler.
   */
  public disableHandler(): void {
    this.isHandlerEnabled = false;
  }

  /**
   * Disables the handler for a given period of time.
   *
   * @param {number} timeout - Timeout in milliseconds.
   */
  public disableHandlerWithTimeout(timeout: number = HttpClient.DEFAULT_HANDLER_DISABLE_TIMEOUT): void {
    this.isHandlerEnabled = false;

    setTimeout(() => {
      this.isHandlerEnabled = true;
    }, timeout);
  }

  public setHttpRequestStartCallback(callback: () => void): void {
    this.requestStartCallback = callback;
  }

  public setHttpRequestSuccessCallback(callback: (response: HttpResponse) => void): void {
    this.requestSuccessCallback = callback;
  }
  public setHttpRequestErrorCallback(callback: (error: HttpError) => void): void {
    this.requestErrorCallback = callback;
  }
  public setHttpRequestFinishCallback(callback: () => void): void {
    this.requestFinishCallback = callback;
  }
}
