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

import {FC, PropsWithChildren, ReactNode} from 'react';
import useAsgardeo from '../../../contexts/Asgardeo/useAsgardeo';

/**
 * Props for the Loading component.
 */
export interface LoadingProps {
  /**
   * Content to show when the user is not signed in.
   */
  fallback?: ReactNode;
}

/**
 * A component that only renders its children when the Asgardeo is loading.
 *
 * @remarks This component is only supported in browser based React applications (CSR).
 *
 * @example
 * ```tsx
 * import { Loading } from '@asgardeo/auth-react';
 *
 * const App = () => {
 *   return (
 *     <Loading fallback={<p>Finished Loading...</p>}>
 *       <p>Loading...</p>
 *     </Loading>
 *   );
 * }
 * ```
 */
const Loading: FC<PropsWithChildren<LoadingProps>> = ({children, fallback = null}: PropsWithChildren<LoadingProps>) => {
  const {isLoading} = useAsgardeo();

  if (!isLoading) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

Loading.displayName = 'Loading';

export default Loading;
