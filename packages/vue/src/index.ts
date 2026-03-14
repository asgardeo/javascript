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

// ── Plugin ──
export {default as AsgardeoPlugin} from './plugins/AsgardeoPlugin';

// ── Components ──
export {default as AsgardeoProvider} from './components/AsgardeoProvider';

// ── Providers ──
export {default as BrandingProvider} from './providers/BrandingProvider';
export {default as FlowMetaProvider} from './providers/FlowMetaProvider';
export {default as FlowProvider} from './providers/FlowProvider';
export {default as I18nProvider} from './providers/I18nProvider';
export {default as OrganizationProvider} from './providers/OrganizationProvider';
export {default as ThemeProvider} from './providers/ThemeProvider';
export {default as UserProvider} from './providers/UserProvider';

// ── Composables ──
export {default as useAsgardeo} from './composables/useAsgardeo';
export {default as useBranding} from './composables/useBranding';
export {default as useFlow} from './composables/useFlow';
export {default as useFlowMeta} from './composables/useFlowMeta';
export {default as useI18n} from './composables/useI18n';
export {default as useOrganization} from './composables/useOrganization';
export {default as useTheme} from './composables/useTheme';
export {default as useUser} from './composables/useUser';

// ── Client ──
export {default as AsgardeoVueClient} from './AsgardeoVueClient';

// ── Keys ──
export {
  ASGARDEO_KEY,
  BRANDING_KEY,
  FLOW_KEY,
  FLOW_META_KEY,
  I18N_KEY,
  ORGANIZATION_KEY,
  THEME_KEY,
  USER_KEY,
} from './keys';

// ── Models / Types ──
export type {AsgardeoVueConfig} from './models/config';
export type {
  AsgardeoContext,
  BrandingContextValue,
  FlowContextValue,
  FlowMessage,
  FlowMetaContextValue,
  FlowStep,
  I18nContextValue,
  OrganizationContextValue,
  ThemeContextValue,
  UserContextValue,
} from './models/contexts';

// ── UI Components — Primitives ──
export {default as Button} from './components/primitives/Button/Button';
export {default as Card} from './components/primitives/Card/Card';
export {default as Alert} from './components/primitives/Alert/Alert';
export {default as TextField} from './components/primitives/TextField/TextField';
export {default as PasswordField} from './components/primitives/PasswordField/PasswordField';
export {default as Select} from './components/primitives/Select/Select';
export type {SelectOption} from './components/primitives/Select/Select';
export {default as Checkbox} from './components/primitives/Checkbox/Checkbox';
export {default as DatePicker} from './components/primitives/DatePicker/DatePicker';
export {default as OtpField} from './components/primitives/OtpField/OtpField';
export {default as Typography} from './components/primitives/Typography/Typography';
export {default as Divider} from './components/primitives/Divider/Divider';
export {default as Logo} from './components/primitives/Logo/Logo';
export {default as Spinner} from './components/primitives/Spinner/Spinner';
export {
  UserIcon,
  EyeIcon,
  EyeOffIcon,
  ChevronDownIcon,
  CheckIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  XIcon,
  PlusIcon,
  LogOutIcon,
  ArrowLeftRightIcon,
  BuildingIcon,
  GlobeIcon,
  PencilIcon,
} from './components/primitives/Icons';

// ── UI Components — Actions ──
export {default as SignInButton} from './components/actions/SignInButton';
export {default as BaseSignInButton} from './components/actions/BaseSignInButton';
export {default as SignOutButton} from './components/actions/SignOutButton';
export {default as BaseSignOutButton} from './components/actions/BaseSignOutButton';
export {default as SignUpButton} from './components/actions/SignUpButton';
export {default as BaseSignUpButton} from './components/actions/BaseSignUpButton';

// ── UI Components — Auth Flow ──
export {default as Callback} from './components/auth/Callback';

// ── UI Components — Control ──
export {default as SignedIn} from './components/control/SignedIn';
export {default as SignedOut} from './components/control/SignedOut';
export {default as Loading} from './components/control/Loading';
export {default as UserComponent} from './components/control/user/User';
export {default as OrganizationComponent} from './components/control/organization/Organization';

// ── UI Components — Presentation ──
export {default as SignIn} from './components/presentation/sign-in/SignIn';
export {default as BaseSignIn} from './components/presentation/sign-in/BaseSignIn';
export {default as SignUp} from './components/presentation/sign-up/SignUp';
export {default as BaseSignUp} from './components/presentation/sign-up/BaseSignUp';
export {default as UserProfileComponent} from './components/presentation/user-profile/UserProfile';
export {default as BaseUserProfile} from './components/presentation/user-profile/BaseUserProfile';
export {default as UserDropdown} from './components/presentation/user-dropdown/UserDropdown';
export {default as BaseUserDropdown} from './components/presentation/user-dropdown/BaseUserDropdown';
export {default as AcceptInvite} from './components/presentation/accept-invite/AcceptInvite';
export {default as BaseAcceptInvite} from './components/presentation/accept-invite/BaseAcceptInvite';
export {default as InviteUser} from './components/presentation/invite-user/InviteUser';
export {default as BaseInviteUser} from './components/presentation/invite-user/BaseInviteUser';
export {default as OrganizationList} from './components/presentation/organization-list/OrganizationList';
export {default as BaseOrganizationList} from './components/presentation/organization-list/BaseOrganizationList';
export {default as OrganizationProfile} from './components/presentation/organization-profile/OrganizationProfile';
export {default as BaseOrganizationProfile} from './components/presentation/organization-profile/BaseOrganizationProfile';
export {default as OrganizationSwitcher} from './components/presentation/organization-switcher/OrganizationSwitcher';
export {default as BaseOrganizationSwitcher} from './components/presentation/organization-switcher/BaseOrganizationSwitcher';
export {default as CreateOrganization} from './components/presentation/create-organization/CreateOrganization';
export {default as BaseCreateOrganization} from './components/presentation/create-organization/BaseCreateOrganization';
export {default as LanguageSwitcher} from './components/presentation/language-switcher/LanguageSwitcher';
export {default as BaseLanguageSwitcher} from './components/presentation/language-switcher/BaseLanguageSwitcher';

// ── UI Components — Adapters ──
export {default as GoogleButton} from './components/adapters/GoogleButton';
export {default as GitHubButton} from './components/adapters/GitHubButton';
export {default as MicrosoftButton} from './components/adapters/MicrosoftButton';
export {default as FacebookButton} from './components/adapters/FacebookButton';

// ── Factories ──
export {default as FieldFactory, createField, validateFieldValue} from './components/factories/FieldFactory';
export type {FieldConfig} from './components/factories/FieldFactory';

// ── Re-exports from @asgardeo/browser ──
export {
  type AllOrganizationsApiResponse,
  type Config,
  type EmbeddedFlowExecuteRequestConfig,
  type EmbeddedFlowExecuteRequestPayload,
  type EmbeddedFlowExecuteResponse,
  type EmbeddedSignInFlowHandleRequestPayload,
  type HttpRequestConfig,
  type HttpResponse,
  type IdToken,
  type Organization,
  type SignInOptions,
  type SignOutOptions,
  type SignUpOptions,
  type TokenExchangeRequestConfig,
  type TokenResponse,
  type User,
  type UserProfile,
} from '@asgardeo/browser';
