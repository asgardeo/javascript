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

import AsgardeoError from '../AsgardeoError';

describe('AsgardeoError', (): void => {
  it('should create an error with javascript SDK origin', (): void => {
    const message: string = 'Test error message';
    const code: string = 'TEST_ERROR';
    const origin: string = 'javascript';
    const error = new AsgardeoError(message, code, origin);

    expect(error.message).toBe(message);
    expect(error.code).toBe(code);
    expect(error.toString()).toBe(
      '[AsgardeoError]\n🛡️ Asgardeo - @asgardeo/javascript: Test error message\n(code="TEST_ERROR")',
    );
  });

  it('should create an error with react SDK origin', (): void => {
    const message: string = 'Test error message';
    const code: string = 'TEST_ERROR';
    const origin: string = 'react';
    const error = new AsgardeoError(message, code, origin);

    expect(error.message).toBe(message);
    expect(error.code).toBe(code);
    expect(error.toString()).toBe(
      '[AsgardeoError]\n🛡️ Asgardeo - @asgardeo/react: Test error message\n(code="TEST_ERROR")',
    );
  });

  it('should format different SDK origins correctly', (): void => {
    const message: string = 'Test error message';
    const code: string = 'TEST_ERROR';
    const origins: string[] = ['react', 'nextjs', 'javascript'];
    const expectedNames: string[] = [
      'Asgardeo - @asgardeo/react',
      'Asgardeo - @asgardeo/nextjs',
      'Asgardeo - @asgardeo/javascript',
    ];

    origins.forEach((origin, index) => {
      const error = new AsgardeoError(message, code, origin);

      expect(error.toString()).toContain(`🛡️ ${expectedNames[index]}:`);
    });
  });

  it('should sanitize message if it already contains the SDK prefix', (): void => {
    const message: string = '🛡️ Asgardeo - @asgardeo/react: Already prefixed message';
    const code: string = 'TEST_ERROR';
    const origin: string = 'react';
    const error = new AsgardeoError(message, code, origin);

    expect(error.message).toBe(message);
    expect(error.code).toBe(code);
  });

  it('should have correct name and be instance of Error', (): void => {
    const message: string = 'Test message';
    const code: string = 'TEST_ERROR';
    const origin: string = 'javascript';
    const error = new AsgardeoError(message, code, origin);

    expect(error.name).toBe('AsgardeoError');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AsgardeoError);
  });

  it('should have a stack trace that includes the error message', () => {
    const message: string = 'Test message';
    const code: string = 'TEST_ERROR';
    const origin: string = 'javascript';
    const error = new AsgardeoError(message, code, origin);

    expect(error.stack).toBeDefined();
    expect(String(error.stack)).toContain('Test message');
  });

  it('should format toString output correctly with SDK origin', (): void => {
    const message: string = 'Test message';
    const code: string = 'TEST_ERROR';
    const origin: string = 'react';
    const error: AsgardeoError = new AsgardeoError(message, code, origin);

    const expectedString: string = '[AsgardeoError]\n🛡️ Asgardeo - @asgardeo/react: Test message\n(code="TEST_ERROR")';

    expect(error.toString()).toBe(expectedString);
  });

  it('should default to the agnostic SDK if no origin is provided', (): void => {
    const message: string = 'Test message';
    const code: string = 'TEST_ERROR';
    const error: AsgardeoError = new AsgardeoError(message, code, '');

    expect(error.origin).toBe('@asgardeo/javascript');
  });
});
