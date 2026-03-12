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

import {describe, it, expect, vi, beforeEach, Mock} from 'vitest';
import {inject} from 'vue';
import {mockAuthContext} from './mocks/mocks';
import {useAsgardeoContext} from '../composables/useAsgardeoContext';
import {ASGARDEO_INJECTION_KEY} from '../plugins/AsgardeoPlugin';
import {AuthContextInterface} from '../types';

vi.mock('vue', () => ({
  inject: vi.fn(),
}));

describe('useAsgardeoContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return the injected auth context when it exists', () => {
    (inject as Mock).mockReturnValue(mockAuthContext);

    const result: AuthContextInterface = useAsgardeoContext();

    expect(inject).toHaveBeenCalledWith(ASGARDEO_INJECTION_KEY);
    expect(result).toBe(mockAuthContext);
  });

  it('should throw an error when the auth context is not injected', () => {
    (inject as Mock).mockReturnValue(null);

    expect(() => useAsgardeoContext()).toThrow('This can be only used when vue plugin is installed');
    expect(inject).toHaveBeenCalledWith(ASGARDEO_INJECTION_KEY);
  });
});
