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

/* eslint-disable @typescript-eslint/typedef, sort-keys, no-restricted-syntax */

import {describe, it, expect} from 'vitest';
import {AsgardeoError, ErrorCode} from '../../src/runtime/errors';

describe('ErrorCode', () => {
  it('has stable string values for known codes', () => {
    expect(ErrorCode.ConfigMissingBaseUrl).toBe('config/missing-base-url');
    expect(ErrorCode.ConfigMissingClientId).toBe('config/missing-client-id');
    expect(ErrorCode.ConfigMissingSecret).toBe('config/missing-session-secret');
    expect(ErrorCode.SessionMissing).toBe('session/missing');
    expect(ErrorCode.SessionInvalid).toBe('session/invalid');
    expect(ErrorCode.SessionExpired).toBe('session/expired');
    expect(ErrorCode.OAuthCallbackError).toBe('oauth/callback-error');
    expect(ErrorCode.TokenExchangeFailed).toBe('oauth/token-exchange-failed');
    expect(ErrorCode.OpenRedirectBlocked).toBe('security/open-redirect-blocked');
  });

  it('has at least 16 distinct values', () => {
    const values = Object.values(ErrorCode);
    const unique = new Set(values);
    expect(unique.size).toBeGreaterThanOrEqual(16);
    for (const v of values) {
      expect(typeof v).toBe('string');
      expect(v.length).toBeGreaterThan(0);
    }
  });

  it('all values follow a namespaced path format (category/code)', () => {
    for (const v of Object.values(ErrorCode)) {
      expect(v).toMatch(/^[a-z0-9-]+\/[a-z0-9-]+$/);
    }
  });
});

describe('AsgardeoError', () => {
  it('constructs with message and code', () => {
    const err = new AsgardeoError('Something went wrong', ErrorCode.SessionMissing);
    expect(err.message).toBe('Something went wrong');
    expect(err.code).toBe(ErrorCode.SessionMissing);
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AsgardeoError);
    expect(err.name).toBe('AsgardeoError');
  });

  it('accepts optional statusCode, cause, and context', () => {
    const cause = new Error('original');
    const context = {userId: 'abc'};
    const err = new AsgardeoError('Token is expired', ErrorCode.SessionExpired, {
      statusCode: 401,
      cause,
      context,
    });
    expect(err.statusCode).toBe(401);
    expect(err.cause).toBe(cause);
    expect(err.context).toEqual({userId: 'abc'});
  });

  it('maintains correct prototype chain', () => {
    const err = new AsgardeoError('fail', ErrorCode.OAuthCallbackError);
    expect(Object.getPrototypeOf(err)).toBe(AsgardeoError.prototype);
  });

  it('is throwable and catchable as Error', () => {
    const fn = (): never => {
      throw new AsgardeoError('fail', ErrorCode.OAuthCallbackError);
    };
    expect(fn).toThrowError('fail');
    try {
      fn();
    } catch (e) {
      expect(e).toBeInstanceOf(AsgardeoError);
      if (e instanceof AsgardeoError) {
        expect(e.code).toBe(ErrorCode.OAuthCallbackError);
      }
    }
  });
});
