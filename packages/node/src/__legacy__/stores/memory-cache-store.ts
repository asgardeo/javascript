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

import {Storage} from '@asgardeo/javascript';
import cache from 'memory-cache';

export class MemoryCacheStore implements Storage {
  public async setData(key: string, value: string): Promise<void> {
    cache.put(key, value);
  }

  public async getData(key: string): Promise<string> {
    return cache.get(key) ?? '{}';
  }

  public async removeData(key: string): Promise<void> {
    cache.del(key);
  }
}
