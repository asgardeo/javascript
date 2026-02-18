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

import {useContext} from 'react';
import AsgardeoContext, {AsgardeoContextProps} from './AsgardeoContext';
import FlowMetaContext, {FlowMetaContextValue} from '../FlowMeta/FlowMetaContext';

const useAsgardeo = (): AsgardeoContextProps => {
  const context: AsgardeoContextProps | null = useContext(AsgardeoContext);

  if (!context) {
    throw new Error('useAsgardeo must be used within an AsgardeoProvider');
  }

  // FlowMetaContext lives inside AsgardeoProvider, so it is always present in
  // normal usage.  Optional chaining keeps the hook safe in unit tests that
  // don't render FlowMetaProvider.
  const flowMetaContext: FlowMetaContextValue | null = useContext(FlowMetaContext);

  return {
    ...context,
    meta: flowMetaContext?.meta ?? null,
  };
};

export default useAsgardeo;
