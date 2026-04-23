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

import {describe, it, expect, vi, beforeEach} from 'vitest';

// ── Module mocks ──────────────────────────────────────────────────────────────

// Provide minimal stubs for @asgardeo/vue providers. They are used purely as
// VNode type markers so we can locate them in the rendered VNode tree.
vi.mock('@asgardeo/vue', () => ({
  BrandingProvider: {name: 'BrandingProvider'},
  ThemeProvider: {name: 'ThemeProvider'},
  UserProvider: {name: 'UserProvider'},
  OrganizationProvider: {name: 'OrganizationProvider'},
  FlowProvider: {name: 'FlowProvider'},
  I18nProvider: {name: 'I18nProvider'},
}));

vi.mock('@asgardeo/node', () => ({
  generateFlattenedUserProfile: vi.fn((_user: any, _schemas: any) => ({email: 'updated@example.com'})),
}));

// Stub Nuxt composables so the component's setup() can run in pure Node.
const mockStateStore: Map<string, {value: any}> = new Map();

vi.mock('#imports', () => ({
  useState: vi.fn((key: string, init?: () => any) => {
    if (!mockStateStore.has(key)) {
      mockStateStore.set(key, {value: init ? init() : null});
    }
    return mockStateStore.get(key)!;
  }),
  useRuntimeConfig: vi.fn(() => ({
    public: {asgardeo: {preferences: undefined}},
  })),
}));

// ── Imports (after mocks) ─────────────────────────────────────────────────────

import {
  BrandingProvider,
  FlowProvider,
  I18nProvider,
  OrganizationProvider,
  ThemeProvider,
  UserProvider,
} from '@asgardeo/vue';
import {useRuntimeConfig} from '#imports';
import {generateFlattenedUserProfile} from '@asgardeo/node';
import AsgardeoRoot from '../../src/runtime/components/AsgardeoRoot';

// ── Test fixtures ─────────────────────────────────────────────────────────────

const MOCK_USER_PROFILE = {
  profile: {sub: 'user-123', email: 'test@example.com'},
  flattenedProfile: {email: 'test@example.com'},
  schemas: [{name: 'urn:ietf:params:scim:schemas:core:2.0:User'}],
};

const MOCK_CURRENT_ORG = {id: 'org-1', name: 'Test Org', orgHandle: 'test-org'};

const MOCK_MY_ORGS = [
  {id: 'org-1', name: 'Test Org', orgHandle: 'test-org'},
  {id: 'org-2', name: 'Other Org', orgHandle: 'other-org'},
];

const MOCK_BRANDING = {organizationName: 'TestOrg', theme: 'default'};

const MOCK_AUTH_STATE = {isSignedIn: true, user: {sub: 'user-123'}, isLoading: false};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Seed the five useState stores and call AsgardeoRoot.setup(). */
function buildRenderFn(
  preferences?: Record<string, any>,
  stateOverrides?: {
    userProfile?: any;
    currentOrg?: any;
    myOrgs?: any;
    branding?: any;
    auth?: any;
  },
): () => any {
  // Use explicit `in` checks so that passing `null` is honoured as the desired
  // value rather than being coerced to the default by the `??` operator.
  const hasOverrides = stateOverrides !== undefined;
  mockStateStore.set('asgardeo:user-profile', {
    value: hasOverrides && 'userProfile' in stateOverrides ? stateOverrides.userProfile : MOCK_USER_PROFILE,
  });
  mockStateStore.set('asgardeo:current-org', {
    value: hasOverrides && 'currentOrg' in stateOverrides ? stateOverrides.currentOrg : MOCK_CURRENT_ORG,
  });
  mockStateStore.set('asgardeo:my-orgs', {
    value: hasOverrides && 'myOrgs' in stateOverrides ? stateOverrides.myOrgs : MOCK_MY_ORGS,
  });
  mockStateStore.set('asgardeo:branding', {
    value: hasOverrides && 'branding' in stateOverrides ? stateOverrides.branding : MOCK_BRANDING,
  });
  mockStateStore.set('asgardeo:auth', {
    value: hasOverrides && 'auth' in stateOverrides ? stateOverrides.auth : MOCK_AUTH_STATE,
  });

  // Provide preferences via runtime config
  vi.mocked(useRuntimeConfig).mockReturnValue({
    public: {asgardeo: {preferences}},
  } as any);

  const setupFn = (AsgardeoRoot as any).setup;
  return setupFn(
    {},
    {
      slots: {default: () => null},
      emit: () => {},
      attrs: {},
      expose: () => {},
    },
  );
}

/** Traverse a VNode tree to find the VNode whose `type` matches the target. */
function findByType(vnode: any, target: any): any | null {
  if (!vnode || typeof vnode !== 'object') return null;
  if (vnode.type === target) return vnode;
  if (vnode.children && typeof vnode.children === 'object') {
    if (typeof vnode.children.default === 'function') {
      const child = vnode.children.default();
      const nodes = Array.isArray(child) ? child : [child];
      for (const node of nodes) {
        const found = findByType(node, target);
        if (found) return found;
      }
    }
  }
  return null;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('AsgardeoRoot component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStateStore.clear();
    // Re-apply the $fetch global that Nuxt provides at runtime
    (global as any).$fetch = vi.fn().mockResolvedValue({});
  });

  // ── Provider tree structure ─────────────────────────────────────────────

  it('renders all six providers in the correct nesting order', () => {
    const renderFn = buildRenderFn();
    const root = renderFn();

    expect(root.type).toBe(I18nProvider);
    const branding = findByType(root, BrandingProvider);
    expect(branding).not.toBeNull();
    const theme = findByType(root, ThemeProvider);
    expect(theme).not.toBeNull();
    const flow = findByType(root, FlowProvider);
    expect(flow).not.toBeNull();
    const user = findByType(root, UserProvider);
    expect(user).not.toBeNull();
    const org = findByType(root, OrganizationProvider);
    expect(org).not.toBeNull();
  });

  // ── Default preferences (all features enabled) ──────────────────────────

  it('passes brandingPreference to BrandingProvider when inheritFromBranding is enabled (default)', () => {
    const renderFn = buildRenderFn();
    const root = renderFn();

    const vnode = findByType(root, BrandingProvider);
    expect(vnode!.props.brandingPreference).toEqual(MOCK_BRANDING);
  });

  it('passes inheritFromBranding:true to ThemeProvider when preference is enabled (default)', () => {
    const renderFn = buildRenderFn();
    const root = renderFn();

    const vnode = findByType(root, ThemeProvider);
    expect(vnode!.props.inheritFromBranding).toBe(true);
  });

  it('passes full profile data to UserProvider when fetchUserProfile is enabled (default)', () => {
    const renderFn = buildRenderFn();
    const root = renderFn();

    const vnode = findByType(root, UserProvider);
    expect(vnode!.props.profile).toEqual(MOCK_USER_PROFILE);
    expect(vnode!.props.flattenedProfile).toEqual(MOCK_USER_PROFILE.flattenedProfile);
    expect(vnode!.props.schemas).toEqual(MOCK_USER_PROFILE.schemas);
  });

  it('passes user callbacks to UserProvider when fetchUserProfile is enabled (default)', () => {
    const renderFn = buildRenderFn();
    const root = renderFn();

    const vnode = findByType(root, UserProvider);
    expect(vnode!.props.onUpdateProfile).toBeTypeOf('function');
    expect(vnode!.props.updateProfile).toBeTypeOf('function');
    expect(vnode!.props.revalidateProfile).toBeTypeOf('function');
  });

  it('passes org data to OrganizationProvider when fetchOrganizations is enabled (default)', () => {
    const renderFn = buildRenderFn();
    const root = renderFn();

    const vnode = findByType(root, OrganizationProvider);
    expect(vnode!.props.currentOrganization).toEqual(MOCK_CURRENT_ORG);
    expect(vnode!.props.myOrganizations).toEqual(MOCK_MY_ORGS);
  });

  it('passes org callbacks to OrganizationProvider when fetchOrganizations is enabled (default)', () => {
    const renderFn = buildRenderFn();
    const root = renderFn();

    const vnode = findByType(root, OrganizationProvider);
    expect(vnode!.props.onOrganizationSwitch).toBeTypeOf('function');
    expect(vnode!.props.getAllOrganizations).toBeTypeOf('function');
    expect(vnode!.props.revalidateMyOrganizations).toBeTypeOf('function');
  });

  // ── preferences.user.fetchUserProfile: false ─────────────────────────────

  it('passes profile:null to UserProvider when fetchUserProfile is false', () => {
    const renderFn = buildRenderFn({user: {fetchUserProfile: false}});
    const root = renderFn();

    const vnode = findByType(root, UserProvider);
    expect(vnode!.props.profile).toBeNull();
    expect(vnode!.props.flattenedProfile).toBeNull();
    expect(vnode!.props.schemas).toBeNull();
  });

  it('omits user callbacks from UserProvider when fetchUserProfile is false', () => {
    const renderFn = buildRenderFn({user: {fetchUserProfile: false}});
    const root = renderFn();

    const vnode = findByType(root, UserProvider);
    expect(vnode!.props.onUpdateProfile).toBeUndefined();
    expect(vnode!.props.updateProfile).toBeUndefined();
    expect(vnode!.props.revalidateProfile).toBeUndefined();
  });

  // ── preferences.user.fetchOrganizations: false ───────────────────────────

  it('passes empty org data to OrganizationProvider when fetchOrganizations is false', () => {
    const renderFn = buildRenderFn({user: {fetchOrganizations: false}});
    const root = renderFn();

    const vnode = findByType(root, OrganizationProvider);
    expect(vnode!.props.currentOrganization).toBeNull();
    expect(vnode!.props.myOrganizations).toEqual([]);
  });

  it('omits org callbacks from OrganizationProvider when fetchOrganizations is false', () => {
    const renderFn = buildRenderFn({user: {fetchOrganizations: false}});
    const root = renderFn();

    const vnode = findByType(root, OrganizationProvider);
    expect(vnode!.props.onOrganizationSwitch).toBeUndefined();
    expect(vnode!.props.getAllOrganizations).toBeUndefined();
    expect(vnode!.props.revalidateMyOrganizations).toBeUndefined();
  });

  // ── preferences.theme.inheritFromBranding: false ─────────────────────────

  it('passes brandingPreference:null to BrandingProvider when inheritFromBranding is false', () => {
    const renderFn = buildRenderFn({theme: {inheritFromBranding: false}});
    const root = renderFn();

    const vnode = findByType(root, BrandingProvider);
    expect(vnode!.props.brandingPreference).toBeNull();
  });

  it('passes inheritFromBranding:false to ThemeProvider when preference is false', () => {
    const renderFn = buildRenderFn({theme: {inheritFromBranding: false}});
    const root = renderFn();

    const vnode = findByType(root, ThemeProvider);
    expect(vnode!.props.inheritFromBranding).toBe(false);
  });

  // ── onUpdateProfile callback logic ────────────────────────────────────────

  it('onUpdateProfile updates userProfileState optimistically', () => {
    const renderFn = buildRenderFn();
    const root = renderFn();

    const userProviderVNode = findByType(root, UserProvider);
    const onUpdateProfile = userProviderVNode!.props.onUpdateProfile;

    const updatedUser = {sub: 'user-123', email: 'new@example.com'};
    onUpdateProfile(updatedUser);

    const userProfileState = mockStateStore.get('asgardeo:user-profile')!;
    expect(userProfileState.value.profile).toEqual(updatedUser);
    expect(userProfileState.value.flattenedProfile).toBeDefined();
    expect(generateFlattenedUserProfile).toHaveBeenCalledWith(
      updatedUser,
      MOCK_USER_PROFILE.schemas,
    );
  });

  it('onUpdateProfile keeps asgardeo:auth user in sync', () => {
    const renderFn = buildRenderFn();
    const root = renderFn();

    const userProviderVNode = findByType(root, UserProvider);
    const onUpdateProfile = userProviderVNode!.props.onUpdateProfile;

    const updatedUser = {sub: 'user-123', email: 'synced@example.com'};
    onUpdateProfile(updatedUser);

    const authState = mockStateStore.get('asgardeo:auth')!;
    expect(authState.value.user).toEqual(updatedUser);
  });

  it('onUpdateProfile with no prior profile creates new profile state', () => {
    const renderFn = buildRenderFn(undefined, {userProfile: null});
    const root = renderFn();

    const userProviderVNode = findByType(root, UserProvider);
    // profile prop is null but callbacks are still provided (profile gating
    // checks the preference flag, not the actual state value)
    const onUpdateProfile = userProviderVNode!.props.onUpdateProfile;
    expect(onUpdateProfile).toBeTypeOf('function');

    const freshUser = {sub: 'user-456', email: 'fresh@example.com'};
    onUpdateProfile(freshUser);

    const userProfileState = mockStateStore.get('asgardeo:user-profile')!;
    expect(userProfileState.value.profile).toEqual(freshUser);
    expect(userProfileState.value.schemas).toEqual([]);
  });

  // ── i18n preference passthrough ───────────────────────────────────────────

  it('forwards i18n preferences to I18nProvider', () => {
    const i18nPrefs = {defaultLocale: 'en', fallbackLocale: 'en'};
    const renderFn = buildRenderFn({i18n: i18nPrefs});
    const root = renderFn();

    expect(root.type).toBe(I18nProvider);
    expect(root.props.preferences).toEqual(i18nPrefs);
  });
});
