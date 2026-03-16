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

import {
  AllOrganizationsApiResponse,
  AsgardeoRuntimeError,
  CreateOrganizationPayload,
  Organization,
  TokenResponse,
} from '@asgardeo/browser';
import {computed, defineComponent, h, provide, readonly, ref, type PropType, type Ref} from 'vue';
import {ORGANIZATION_KEY} from '../keys';
import type {OrganizationContextValue} from '../models/contexts';

/**
 * OrganizationProvider manages organization state and makes it available
 * via `useOrganization()`.
 *
 * @internal — This provider is mounted automatically by `<AsgardeoProvider>`.
 */
const OrganizationProvider = defineComponent({
  name: 'OrganizationProvider',
  props: {
    /** Optional factory for creating a new sub-organization. */
    createOrganization: {
      type: Function as PropType<(payload: CreateOrganizationPayload, sessionId: string) => Promise<Organization>>,
      default: undefined,
    },
    /** The organization the user is currently operating in. */
    currentOrganization: {type: Object as PropType<Organization | null>, default: null},
    /** Callback to fetch all organizations (paginated). */
    getAllOrganizations: {
      type: Function as PropType<() => Promise<AllOrganizationsApiResponse>>,
      default: undefined,
    },
    /** The list of organizations the user is a member of. */
    myOrganizations: {type: Array as PropType<Organization[]>, default: () => []},
    /** Callback when an error occurs. */
    onError: {type: Function as PropType<(error: string) => void>, default: undefined},
    /** Callback that performs the actual organization switch (token exchange). */
    onOrganizationSwitch: {
      type: Function as PropType<(organization: Organization) => Promise<TokenResponse | Response>>,
      default: undefined,
    },
    /** Callback to re-fetch the user's organization list. */
    revalidateMyOrganizations: {
      type: Function as PropType<() => Promise<Organization[]>>,
      default: async () => [],
    },
  },
  setup(props, {slots}) {
    const isLoading: Ref<boolean> = ref(false);
    const error: Ref<string | null> = ref(null);

    const switchOrganization = async (organization: Organization): Promise<void> => {
      if (!props.onOrganizationSwitch) {
        throw new AsgardeoRuntimeError(
          'onOrganizationSwitch callback is required',
          'OrganizationProvider-SwitchError-001',
          'vue',
          'The onOrganizationSwitch callback must be provided to handle organization switching.',
        );
      }

      isLoading.value = true;
      error.value = null;

      try {
        await props.onOrganizationSwitch(organization);
      } catch (switchError) {
        const errorMessage = switchError instanceof Error ? switchError.message : 'Failed to switch organization';
        error.value = errorMessage;
        if (props.onError) {
          props.onError(errorMessage);
        }
        throw switchError;
      } finally {
        isLoading.value = false;
      }
    };

    const getAllOrgs = async (): Promise<AllOrganizationsApiResponse> => {
      if (props.getAllOrganizations) {
        return props.getAllOrganizations();
      }
      return {organizations: []};
    };

    // Use computed refs so context stays in sync when props change
    const currentOrganizationRef = computed(() => props.currentOrganization);
    const myOrganizationsRef = computed(() => props.myOrganizations);

    const context: OrganizationContextValue = {
      createOrganization: props.createOrganization,
      currentOrganization: currentOrganizationRef as unknown as Readonly<Ref<Organization | null>>,
      error: readonly(error),
      getAllOrganizations: getAllOrgs,
      isLoading: readonly(isLoading),
      myOrganizations: myOrganizationsRef as unknown as Readonly<Ref<Organization[]>>,
      revalidateMyOrganizations: props.revalidateMyOrganizations,
      switchOrganization,
    };

    provide(ORGANIZATION_KEY, context);

    return () => h('div', {style: 'display:contents'}, slots['default']?.());
  },
});

export default OrganizationProvider;
