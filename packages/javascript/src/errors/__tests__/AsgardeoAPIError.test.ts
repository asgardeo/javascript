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

import AsgardeoAPIError from '../AsgardeoAPIError';
import AsgardeoError from '../AsgardeoError';

describe('AsgardeoAPIError', (): void => {
  it('should create an API error with status code and text', (): void => {
    const message: string = 'Not Found Error';
    const code: string = 'API_NOT_FOUND';
    const origin: string = 'react';
    const statusCode: number = 404;
    const statusText: string = 'Not Found';
    const error: AsgardeoAPIError = new AsgardeoAPIError(message, code, origin, statusCode, statusText);

    expect(error.message).toBe(message);
    expect(error.code).toBe(code);
    expect(error.statusCode).toBe(statusCode);
    expect(error.statusText).toBe(statusText);
    expect(error.toString()).toBe(
      '[AsgardeoAPIError] (code="API_NOT_FOUND") (HTTP 404 - Not Found)\nMessage: Not Found Error',
    );
  });

  it('should create an API error without status code and text', (): void => {
    const message: string = 'Unknown API Error';
    const code: string = 'API_ERROR';
    const origin: string = 'javascript';
    const error: AsgardeoAPIError = new AsgardeoAPIError(message, code, origin);

    expect(error.message).toBe(message);
    expect(error.statusCode).toBeUndefined();
    expect(error.statusText).toBeUndefined();
    expect(error.toString()).toBe('[AsgardeoAPIError] (code="API_ERROR")\nMessage: Unknown API Error');
  });

  it('should have correct name and be instance of Error, AsgardeoError, and AsgardeoAPIError', (): void => {
    const message: string = 'Test Error';
    const code: string = 'TEST_ERROR';
    const origin: string = 'react';
    const error: AsgardeoAPIError = new AsgardeoAPIError(message, code, origin);

    expect(error.name).toBe('AsgardeoAPIError');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AsgardeoAPIError);
    expect(error).toBeInstanceOf(AsgardeoError);
  });

  it('should format toString with status when available', (): void => {
    const message: string = 'Bad Request';
    const code: string = 'API_BAD_REQUEST';
    const origin: string = 'react';
    const statusCode: number = 400;
    const statusText: string = 'Bad Request';
    const error: AsgardeoAPIError = new AsgardeoAPIError(message, code, origin, statusCode, statusText);

    const expected: string =
      '[AsgardeoAPIError] (code="API_BAD_REQUEST") (HTTP 400 - Bad Request)\nMessage: Bad Request';

    expect(error.toString()).toBe(expected);
  });

  it('should format toString without status when not available', (): void => {
    const message: string = 'Test Error';
    const code: string = 'TEST_ERROR';
    const origin: string = 'react';
    const error: AsgardeoAPIError = new AsgardeoAPIError(message, code, origin);

    const expected: string = '[AsgardeoAPIError] (code="TEST_ERROR")\nMessage: Test Error';

    expect(error.toString()).toBe(expected);
  });

  it('should default to the agnostic SDK if no origin is provided', (): void => {
    const message: string = 'Test message';
    const code: string = 'TEST_ERROR';
    const error: AsgardeoAPIError = new AsgardeoAPIError(message, code, '');

    expect(error.origin).toBe('@asgardeo/javascript');
  });

  it('should have a stack trace that includes the error message', () => {
    const err: AsgardeoAPIError = new AsgardeoAPIError('Trace me', 'TRACE', 'js');
    expect(err.stack).toBeDefined();
    expect(String(err.stack)).toContain('Trace me');
  });

  it('toString includes status when statusCode is present but statusText is missing', () => {
    const err: AsgardeoAPIError = new AsgardeoAPIError('Oops', 'CODE', 'js', 500);
    expect(err.toString()).toBe('[AsgardeoAPIError] (code="CODE") (HTTP 500 - undefined)\nMessage: Oops');
  });
});

describe('AsgardeoAPIError.fromResponseText', (): void => {
  it('should extract description.defaultValue from a structured error body', (): void => {
    const errorText: string = JSON.stringify({
      code: 'SSE-5000',
      description: {defaultValue: 'An unexpected error occurred', key: 'error.desc'},
      message: {defaultValue: 'Internal server error', key: 'error.msg'},
    });
    const error: AsgardeoAPIError = AsgardeoAPIError.fromResponseText(
      errorText,
      'CODE',
      'javascript',
      500,
      'Internal Server Error',
    );
    expect(error.message).toBe('An unexpected error occurred');
    expect(error.statusCode).toBe(500);
    expect(error.statusText).toBe('Internal Server Error');
  });

  it('should fall back to message.defaultValue when description is absent', (): void => {
    const errorText: string = JSON.stringify({
      code: 'SSE-5000',
      message: {defaultValue: 'Internal server error', key: 'error.msg'},
    });
    const error: AsgardeoAPIError = AsgardeoAPIError.fromResponseText(errorText, 'CODE', 'javascript', 500);
    expect(error.message).toBe('Internal server error');
  });

  it('should use raw text when response is not structured JSON', (): void => {
    const error: AsgardeoAPIError = AsgardeoAPIError.fromResponseText(
      'Unauthorized',
      'CODE',
      'javascript',
      401,
      'Unauthorized',
    );
    expect(error.message).toBe('Unauthorized');
  });

  it('should use raw text when JSON does not match the known error shape', (): void => {
    const errorText: string = JSON.stringify({error: 'something_went_wrong'});
    const error: AsgardeoAPIError = AsgardeoAPIError.fromResponseText(errorText, 'CODE', 'javascript', 400);
    expect(error.message).toBe(errorText);
  });

  it('should produce an instance of AsgardeoAPIError', (): void => {
    const error: AsgardeoAPIError = AsgardeoAPIError.fromResponseText('raw', 'CODE', 'javascript');
    expect(error).toBeInstanceOf(AsgardeoAPIError);
  });

  it('should prepend prefix to a structured description.defaultValue', (): void => {
    const errorText: string = JSON.stringify({
      description: {defaultValue: 'Invalid credentials provided'},
    });
    const error: AsgardeoAPIError = AsgardeoAPIError.fromResponseText(
      errorText,
      'CODE',
      'javascript',
      401,
      'Unauthorized',
      'Authorization request failed',
    );
    expect(error.message).toBe('Authorization request failed: Invalid credentials provided');
  });

  it('should prepend prefix to raw text when response is not structured JSON', (): void => {
    const error: AsgardeoAPIError = AsgardeoAPIError.fromResponseText(
      'Unauthorized',
      'CODE',
      'javascript',
      401,
      'Unauthorized',
      'Authorization request failed',
    );
    expect(error.message).toBe('Authorization request failed: Unauthorized');
  });

  it('should not prepend prefix when prefix is not provided', (): void => {
    const errorText: string = JSON.stringify({
      description: {defaultValue: 'Invalid credentials provided'},
    });
    const error: AsgardeoAPIError = AsgardeoAPIError.fromResponseText(errorText, 'CODE', 'javascript', 401);
    expect(error.message).toBe('Invalid credentials provided');
  });
});
