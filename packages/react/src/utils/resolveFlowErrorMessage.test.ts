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

import {describe, expect, it} from 'vitest';
import resolveFlowErrorMessage from './resolveFlowErrorMessage';

describe('resolveFlowErrorMessage', () => {
  const FALLBACK: string = 'Something went wrong.';

  it('returns the fallback for empty input', () => {
    expect(resolveFlowErrorMessage(undefined, FALLBACK)).toBe(FALLBACK);
    expect(resolveFlowErrorMessage(null, FALLBACK)).toBe(FALLBACK);
    expect(resolveFlowErrorMessage(new Error(''), FALLBACK)).toBe(FALLBACK);
  });

  it('extracts the description from an embedded JSON error payload', () => {
    const error: Error = new Error(
      'Authorization request failed: {"code":"ABA-60007","message":"App native authentication is not enabled for the application.","description":"App native authentication is not enabled for this application with id 6af54eb1"}',
    );

    expect(resolveFlowErrorMessage(error, FALLBACK)).toBe(
      'App native authentication is not enabled for this application with id 6af54eb1',
    );
  });

  it('handles errors serialized across a server action boundary', () => {
    const error: Error = new Error(
      '[AsgardeoAPIError] (code="initializeEmbeddedSignInFlow-ResponseError-001") (HTTP 400 - Bad Request)\nMessage: Authorization request failed: {"code":"ABA-60001","message":"Invalid authentication request.","description":"invalid_callback - callback.not.match"}',
    );

    expect(resolveFlowErrorMessage(error, FALLBACK)).toBe('invalid_callback - callback.not.match');
  });

  it('falls back to the message field when there is no description', () => {
    expect(resolveFlowErrorMessage(new Error('Failed: {"code":"X","message":"Flow is disabled."}'), FALLBACK)).toBe(
      'Flow is disabled.',
    );
  });

  it('strips the serialized preamble when the message is not JSON', () => {
    expect(
      resolveFlowErrorMessage(new Error('[AsgardeoAPIError] (code="x")\nMessage: Network or parsing error'), FALLBACK),
    ).toBe('Network or parsing error');
  });

  it('accepts plain error objects and strings', () => {
    expect(resolveFlowErrorMessage({code: 'FEE-1', description: 'Provisioning failed.'}, FALLBACK)).toBe(
      'Provisioning failed.',
    );
    expect(resolveFlowErrorMessage({code: 'FEE-1', message: 'Only message.'}, FALLBACK)).toBe('Only message.');
    expect(resolveFlowErrorMessage('Plain text error', FALLBACK)).toBe('Plain text error');
  });
});
