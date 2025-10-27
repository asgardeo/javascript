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

import AsgardeoRuntimeError from '../AsgardeoRuntimeError';
import AsgardeoError from '../AsgardeoError';

describe('AsgardeoRuntimeError', (): void => {
  it('should create a runtime error with details', (): void => {
    const message: string = 'Configuration Error';
    const code: string = 'CONFIG_ERROR';
    const origin: string = 'react';
    const details = {invalidField: 'redirectUri', value: null};
    const error = new AsgardeoRuntimeError(message, code, origin, details);

    expect(error.message).toBe(message);
    expect(error.code).toBe(code);
    expect(error.details).toEqual(details);
    expect(error.toString()).toContain(
      '[AsgardeoRuntimeError] (code="CONFIG_ERROR")\nDetails: {\n  "invalidField": "redirectUri",\n  "value": null\n}\nMessage: Configuration Error',
    );
  });

  it('should create a runtime error without details', (): void => {
    const message: string = 'Unknown Runtime Error';
    const code: string = 'RUNTIME_ERROR';
    const origin: string = 'javascript';
    const error = new AsgardeoRuntimeError(message, code, origin);

    expect(error.message).toBe(message);
    expect(error.details).toBeUndefined();
    expect(error.toString()).toContain('[AsgardeoRuntimeError] (code="RUNTIME_ERROR")\nMessage: Unknown Runtime Error');
  });

  it('should have correct name and be instance of Error, AsgardeoError, and AsgardeoRuntimeError', (): void => {
    const message: string = 'Test Error';
    const code: string = 'TEST_ERROR';
    const origin: string = 'react';
    const error = new AsgardeoRuntimeError(message, code, origin);

    expect(error.name).toBe('AsgardeoRuntimeError');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AsgardeoError);
    expect(error).toBeInstanceOf(AsgardeoRuntimeError);
  });

  it('should format toString with details when available', (): void => {
    const message: string = 'Validation Error';
    const code: string = 'VALIDATION_ERROR';
    const origin: string = 'react';
    const details = {reason: 'invalid_input', field: 'email'};
    const error = new AsgardeoRuntimeError(message, code, origin, details);

    const expected: string =
      '[AsgardeoRuntimeError] (code="VALIDATION_ERROR")\n' +
      'Details: {\n  "reason": "invalid_input",\n  "field": "email"\n}\n' +
      'Message: Validation Error';

    expect(error.toString()).toBe(expected);
  });

  it('should format toString without details when not available', (): void => {
    const message: string = 'Test Error';
    const code: string = 'TEST_ERROR';
    const origin: string = 'react';
    const error = new AsgardeoRuntimeError(message, code, origin);

    const expected: string = '[AsgardeoRuntimeError] (code="TEST_ERROR")\n' + 'Message: Test Error';

    expect(error.toString()).toBe(expected);
  });

  it('should default to the agnostic SDK if no origin is provided', (): void => {
    const message: string = 'Test message';
    const code: string = 'TEST_ERROR';
    const error: AsgardeoError = new AsgardeoRuntimeError(message, code, '');

    expect(error.origin).toBe('@asgardeo/javascript');
  });

  it('should have a stack trace that includes the error message', () => {
    const message: string = 'Test message';
    const code: string = 'TEST_ERROR';
    const origin: string = 'javascript';
    const error = new AsgardeoRuntimeError(message, code, origin);

    expect(error.stack).toBeDefined();
    expect(String(error.stack)).toContain('Test message');
  });
});
