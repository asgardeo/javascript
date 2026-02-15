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

import {User as IUser} from '@asgardeo/browser';
import {FC, ReactElement, ReactNode} from 'react';
import BaseUser, {BaseUserProps} from './BaseUser';
import useAsgardeo from '../../../contexts/Asgardeo/useAsgardeo';

/**
 * Props for the User component.
 * Extends BaseUserProps but makes the user prop optional since it will be obtained from useAsgardeo
 */
export interface UserProps extends Omit<BaseUserProps, 'user'> {
  /**
   * Render prop that takes the user object and returns a ReactNode.
   * @param user - The authenticated user object from Asgardeo.
   * @returns A ReactNode to render.
   */
  children: (user: IUser | null) => ReactNode;

  /**
   * Optional element to render when no user is signed in.
   */
  fallback?: ReactNode;
}

/**
 * A component that uses render props to expose the authenticated user object.
 * This component automatically retrieves the user from Asgardeo context.
 *
 * @remarks This component is only supported in browser based React applications (CSR).
 *
 * @example
 * ```tsx
 * import { IUser } from '@asgardeo/auth-react';
 *
 * const App = () => {
 *   return (
 *     <User fallback={<p>Please sign in</p>}>
 *       {(user) => (
 *         <div>
 *           <h1>Welcome, {user.displayName}!</h1>
 *           <p>Email: {user.email}</p>
 *         </div>
 *       )}
 *     </User>
 *   );
 * }
 * ```
 */
const User: FC<UserProps> = ({children, fallback = null}: UserProps): ReactElement => {
  const {user} = useAsgardeo();

  return (
    <BaseUser user={user} fallback={fallback}>
      {children}
    </BaseUser>
  );
};

User.displayName = 'User';

export default User;
