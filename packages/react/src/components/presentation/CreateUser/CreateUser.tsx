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

import {FC, ReactElement, useEffect, useState} from 'react';
import useUser from '../../../contexts/User/useUser';
import {AsgardeoError, detectUserstoreEnvironment, ProfileSchemaType, User} from '@asgardeo/browser';
import BaseCreateUser, {BaseCreateUserProps} from './BaseCreateUser';
import createUser from '../../../api/createUser';
import {useAsgardeo, useTranslation} from '@asgardeo/react';
import getUserstores from '../../../api/getUserstores';

/**
 * Props interface for the CreateOrganization component.
 */
export interface CreateUserProps
  extends Omit<BaseCreateUserProps, 'onSubmit' | 'loading' | 'error' | 'schemas' | 'onCreate'> {
  /**
   * Fallback element to render when the user is not signed in.
   */
  fallback?: ReactElement;
  /**
   * The profile type for the user being created.
   */
  profileType: ProfileSchemaType;
  /**
   * Callback function to handle error.
   * @param error - Error object.
   */
  onError?: (error: unknown) => void;
}

const CreateUser: FC<CreateUserProps> = ({
  mode = 'inline',
  profileType,
  onSuccess,
  onError,
  fallback = null,
  onPopupClose,
  popupOpen = false,
  className = '',
  ...props
}): ReactElement => {
  const {isSignedIn, baseUrl} = useAsgardeo();
  const {getAttributeProfileSchema, schemas} = useUser();
  const {t} = useTranslation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userstores, setUserstores] = useState([]);

  useEffect(() => {
    (async () => {
      const userstores = await getUserstores({baseUrl});
      const resolvedUserstores = detectUserstoreEnvironment(userstores);
      setUserstores(resolvedUserstores.userstoresWritable);
    })();
  }, []);

  if (!isSignedIn && fallback) {
    return fallback;
  }

  if (!isSignedIn) {
    return <></>;
  }

  const handleSubmit = async (payload: any): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response: User = await createUser({baseUrl, payload});

      onSuccess(response);
    } catch (error: unknown) {
      let message: string = t('user.create.generic.error');

      if (error instanceof AsgardeoError) {
        message = error?.message;
      }

      setError(message);
      onError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseCreateUser
      schemas={getAttributeProfileSchema(profileType)}
      onCreate={handleSubmit}
      className={className}
      mode={mode}
      popupOpen={popupOpen}
      onPopupClose={onPopupClose}
      loading={loading}
      error={error}
      userstores={userstores}
      {...props}
    />
  );
};

export default CreateUser;
