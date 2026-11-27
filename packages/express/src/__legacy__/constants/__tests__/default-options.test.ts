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
import {CookieConfig} from '../default-options';

describe('CookieConfig', () => {
  it('keeps the session cookie for 24 hours, in milliseconds as res.cookie() expects', () => {
    expect(CookieConfig.defaultMaxAge).toBe(24 * 60 * 60 * 1000);
  });

  it('uses boolean flags so that `secure: false` is not read as a truthy string', () => {
    expect(CookieConfig.defaultSecure).toBe(false);
    expect(CookieConfig.defaultHttpOnly).toBe(true);
    expect(CookieConfig.defaultSameSite).toBe('lax');
  });
});
