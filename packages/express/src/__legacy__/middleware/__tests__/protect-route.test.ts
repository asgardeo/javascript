/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com) All Rights Reserved.
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
 */

import type express from 'express';
import {describe, expect, it, vi} from 'vitest';
import type {AsgardeoExpressClient} from '../../client';
import {protectRoute} from '../protect-route';

const createRequest = (sessionId?: string): express.Request =>
  ({cookies: sessionId ? {ASGARDEO_SESSION_ID: sessionId} : {}}) as unknown as express.Request;

const createClient = (isSignedIn: () => Promise<boolean>): AsgardeoExpressClient =>
  ({isSignedIn: vi.fn(isSignedIn)}) as unknown as AsgardeoExpressClient;

describe('protectRoute', () => {
  const res: express.Response = {} as express.Response;

  it('lets a signed-in user through', async () => {
    const next: ReturnType<typeof vi.fn> = vi.fn();
    const callback: ReturnType<typeof vi.fn> = vi.fn();

    await protectRoute(
      createClient(async () => true),
      callback,
    )(createRequest('sid'), res, next);

    expect(next).toHaveBeenCalledWith();
    expect(callback).not.toHaveBeenCalled();
  });

  it('stops an unauthenticated request when the callback handles it', async () => {
    const next: ReturnType<typeof vi.fn> = vi.fn();
    const callback: ReturnType<typeof vi.fn> = vi.fn(() => true);

    await protectRoute(
      createClient(async () => false),
      callback,
    )(createRequest(), res, next);

    expect(callback).toHaveBeenCalledWith(res, 'Unauthenticated');
    expect(next).not.toHaveBeenCalled();
  });

  it('reports an invalid session cookie', async () => {
    const next: ReturnType<typeof vi.fn> = vi.fn();
    const callback: ReturnType<typeof vi.fn> = vi.fn(() => true);

    await protectRoute(
      createClient(async () => false),
      callback,
    )(createRequest('sid'), res, next);

    expect(callback).toHaveBeenCalledWith(res, 'Invalid session cookie');
    expect(next).not.toHaveBeenCalled();
  });

  it('passes errors from the session check to Express', async () => {
    const next: ReturnType<typeof vi.fn> = vi.fn();
    const error: Error = new Error('store unavailable');

    await protectRoute(
      createClient(async () => {
        throw error;
      }),
      vi.fn(),
    )(createRequest('sid'), res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
