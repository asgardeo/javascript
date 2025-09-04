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

'use client';

import {CreateOrganizationPayload, AsgardeoRuntimeError} from '@asgardeo/node';
import {BaseCreateOrganization, BaseCreateOrganizationProps, useOrganization} from '@asgardeo/react';
import {FC, ReactElement, useState} from 'react';
import getSessionId from '../../../../server/actions/getSessionId';
import useAsgardeo from '../../../contexts/Asgardeo/useAsgardeo';

/**
 * Props interface for the CreateOrganization component.
 */
export interface CreateOrganizationProps extends Omit<BaseCreateOrganizationProps, 'onSubmit' | 'loading' | 'error'> {
  /**
   * Fallback element to render when the user is not signed in.
   */
  fallback?: ReactElement;
  /**
   * Custom organization creation handler (will use default API if not provided).
   */
  onCreate?: (payload: CreateOrganizationPayload) => Promise<any>;
}

/**
 * CreateOrganization component that provides organization creation functionality.
 * This component automatically integrates with the Asgardeo and Organization contexts.
 *
 * @example
 * ```tsx
 * import { CreateOrganization } from '@asgardeo/react';
 *
 * // Basic usage - uses default API and contexts
 * <CreateOrganization
 *   onSuccess={(org) => console.log('Created:', org)}
 *   onCancel={() => navigate('/organizations')}
 * />
 *
 * // With custom organization creation handler
 * <CreateOrganization
 *   onCreate={async (payload) => {
 *     const result = await myCustomAPI.createOrganization(payload);
 *     return result;
 *   }}
 *   onSuccess={(org) => {
 *     console.log('Organization created:', org.name);
 *     // Custom success logic here
 *   }}
 * />
 *
 * // With fallback for unauthenticated users
 * <CreateOrganization
 *   fallback={<div>Please sign in to create an organization</div>}
 * />
 * ```
 */
export const CreateOrganization: FC<CreateOrganizationProps> = ({
  onCreate,
  fallback = <></>,
  onSuccess,
  defaultParentId,
  ...props
}: CreateOrganizationProps): ReactElement => {
  const {isSignedIn, baseUrl} = useAsgardeo();
  const {currentOrganization, revalidateMyOrganizations, createOrganization} = useOrganization();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Don't render if not authenticated
  if (!isSignedIn && fallback) {
    return fallback;
  }

  if (!isSignedIn) {
    return <></>;
  }

  // Use current organization as parent if no defaultParentId provided
  const parentId: string = defaultParentId || currentOrganization?.id || '';

  const handleSubmit = async (payload: CreateOrganizationPayload): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      let result: any;

      if (onCreate) {
        result = await onCreate(payload);
      } else {
        if (!baseUrl) {
          throw new Error('Base URL is required for organization creation');
        }

        if (!createOrganization) {
          throw new AsgardeoRuntimeError(
            `createOrganization function is not available.`,
            'CreateOrganization-handleSubmit-RuntimeError-001',
            'nextjs',
            'The createOrganization function must be provided by the Organization context.',
          );
        }

        result = await createOrganization(
          {
            ...payload,
            parentId,
          },
          (await getSessionId()) as string,
        );
      }

      // Refresh organizations list to include the new organization
      if (revalidateMyOrganizations) {
        await revalidateMyOrganizations();
      }

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (createError) {
      const errorMessage: string = createError instanceof Error ? createError.message : 'Failed to create organization';
      setError(errorMessage);
      throw createError; // Re-throw to allow form to handle it
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseCreateOrganization
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      defaultParentId={parentId}
      onSuccess={onSuccess}
      {...props}
    />
  );
};

export default CreateOrganization;
