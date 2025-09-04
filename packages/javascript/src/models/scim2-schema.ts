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

export interface SchemaAttribute {
  name: string;
  type: string;
  multiValued: boolean;
  description?: string;
  required?: boolean;
  caseExact: boolean;
  mutability: string;
  returned: string;
  uniqueness: string;
  displayName?: string;
  displayOrder?: string;
  regEx?: string;
  supportedByDefault?: string;
  sharedProfileValueResolvingMethod?: string;
  subAttributes?: SchemaAttribute[];
  profiles: {
    [key: string]: {
      required?: boolean;
      supportedByDefault?: boolean;
    };
  };
}

/**
 * Represents a SCIM2 schema definition
 */
export interface Schema {
  /** Schema identifier */
  id: string;
  /** Schema name */
  name: string;
  /** Schema description */
  description: string;
  /** Schema attributes */
  attributes: SchemaAttribute[];
}

export interface FlattenedSchema extends Schema {
  schemaId: string;
}

/**
 * Well-known SCIM2 schema IDs
 */
export enum WellKnownSchemaIds {
  /** Core Schema */
  Core = 'urn:ietf:params:scim:schemas:core:2.0',
  /** User Schema */
  User = 'urn:ietf:params:scim:schemas:core:2.0:User',
  /** Enterprise User Schema */
  EnterpriseUser = 'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User',
  /** System User Schema */
  SystemUser = 'urn:scim:wso2:schema',
  /** Custom User Schema */
  CustomUser = 'urn:scim:schemas:extension:custom:User',
}

export type ProfileSchemaType = 'console' | 'endUser' | 'selfRegistration';
