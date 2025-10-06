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

import { FunctionComponent, PropsWithChildren, ReactElement } from "react";
import AsgardeoContext from "./asgardeo-context";

/**
 * Asgardeo provider props interface.
 */
export interface AsgardeoProviderPropsInterface {
  /**
   * Flag to indicate whether the app is initialized or not.
   */
  isAppInitialized: boolean;
}

/**
 * Asgardeo provider component.
 *
 * @param props - Props containing the children components and provider input props.
 * @returns - Asgardeo provider wrapping the children components.
 */
const AsgardeoProvider: FunctionComponent<PropsWithChildren<AsgardeoProviderPropsInterface>> = ({
  isAppInitialized,
  children
}: PropsWithChildren<AsgardeoProviderPropsInterface>): ReactElement => {
  return (
    <AsgardeoContext.Provider value={{ isAppInitialized }}>
      {children}
    </AsgardeoContext.Provider>
  )
}

export default AsgardeoProvider;
