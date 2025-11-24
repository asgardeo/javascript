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

import {vi, beforeEach, afterEach, describe, it, expect} from 'vitest';
import navigate from '../navigate';

describe('navigate', () => {
  let pushStateMock: ReturnType<typeof vi.fn>;
  let dispatchEventMock: ReturnType<typeof vi.fn>;
  let locationAssignMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Create mock functions
    pushStateMock = vi.fn();
    dispatchEventMock = vi.fn(() => true);
    locationAssignMock = vi.fn();

    // Mock window.history.pushState
    vi.stubGlobal('window', {
      ...window,
      history: {
        ...window.history,
        pushState: pushStateMock,
      },
      dispatchEvent: dispatchEventMock,
      location: {
        ...window.location,
        origin: 'https://localhost:5173',
        href: 'https://localhost:5173/',
        assign: locationAssignMock,
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should call window.history.pushState with the correct arguments for same-origin', () => {
    navigate('/test-url');
    expect(pushStateMock).toHaveBeenCalledWith(null, '', '/test-url');
    expect(locationAssignMock).not.toHaveBeenCalled();
  });

  it('should dispatch a PopStateEvent with state null for same-origin', () => {
    navigate('/test-url');
    expect(dispatchEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'popstate',
        state: null,
      }),
    );
    expect(locationAssignMock).not.toHaveBeenCalled();
  });

  it('should use window.location.assign for cross-origin URLs', () => {
    const crossOriginUrl = 'https://accounts.asgardeo.io/t/dxlab/accountrecoveryendpoint/register.do';
    navigate(crossOriginUrl);
    expect(locationAssignMock).toHaveBeenCalledWith(crossOriginUrl);
    expect(pushStateMock).not.toHaveBeenCalled();
    expect(dispatchEventMock).not.toHaveBeenCalled();
  });

  it('should use window.location.assign for malformed URLs', () => {
    const malformedUrl = 'http://[::1'; // Invalid URL
    navigate(malformedUrl);
    expect(locationAssignMock).toHaveBeenCalledWith(malformedUrl);
    expect(pushStateMock).not.toHaveBeenCalled();
    expect(dispatchEventMock).not.toHaveBeenCalled();
  });
});
