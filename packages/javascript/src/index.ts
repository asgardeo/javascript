/**
 * Copyright (c) 2020-2026, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
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

export {AsgardeoAuthClient} from './__legacy__/client';
export type {
  DefaultAuthClientConfig,
  WellKnownAuthClientConfig,
  BaseURLAuthClientConfig,
  ExplicitAuthClientConfig,
  StrictAuthClientConfig,
  AuthClientConfig,
} from './__legacy__/models';

export {IsomorphicCrypto} from './IsomorphicCrypto';

export {default as initializeEmbeddedSignInFlow} from './api/initializeEmbeddedSignInFlow';
export {default as executeEmbeddedSignInFlow} from './api/executeEmbeddedSignInFlow';
export {default as executeEmbeddedSignUpFlow} from './api/executeEmbeddedSignUpFlow';
export {default as getUserInfo} from './api/getUserInfo';
export type {default as getScim2Me, GetScim2MeConfig} from './api/getScim2Me';
export type {default as getSchemas, GetSchemasConfig} from './api/getSchemas';
export type {default as getAllOrganizations, GetAllOrganizationsConfig} from './api/getAllOrganizations';
export type {
  default as createOrganization,
  CreateOrganizationPayload,
  CreateOrganizationConfig,
} from './api/createOrganization';
export type {default as getMeOrganizations, GetMeOrganizationsConfig} from './api/getMeOrganizations';
export type {default as getOrganization, OrganizationDetails, GetOrganizationConfig} from './api/getOrganization';
export {default as updateOrganization, createPatchOperations} from './api/updateOrganization';
export type {UpdateOrganizationConfig} from './api/updateOrganization';
export {default as updateMeProfile} from './api/updateMeProfile';
export type {UpdateMeProfileConfig} from './api/updateMeProfile';
export type {default as getBrandingPreference, GetBrandingPreferenceConfig} from './api/getBrandingPreference';
export {default as executeEmbeddedSignInFlowV2} from './api/v2/executeEmbeddedSignInFlowV2';
export {default as executeEmbeddedSignUpFlowV2} from './api/v2/executeEmbeddedSignUpFlowV2';
export {default as executeEmbeddedRecoveryFlowV2} from './api/v2/executeEmbeddedRecoveryFlowV2';
export type {
  default as executeEmbeddedUserOnboardingFlowV2,
  EmbeddedUserOnboardingFlowResponse,
} from './api/v2/executeEmbeddedUserOnboardingFlowV2';
export {default as getFlowMetaV2} from './api/v2/getFlowMetaV2';
export {default as getOrganizationUnitChildren} from './api/v2/getOrganizationUnitChildren';

export {default as ApplicationNativeAuthenticationConstants} from './constants/ApplicationNativeAuthenticationConstants';
export {default as TokenConstants} from './constants/TokenConstants';
export {default as OIDCRequestConstants} from './constants/OIDCRequestConstants';
export {default as VendorConstants} from './constants/VendorConstants';

export {default as AsgardeoError} from './errors/AsgardeoError';
export {default as AsgardeoAPIError} from './errors/AsgardeoAPIError';
export {default as AsgardeoRuntimeError} from './errors/AsgardeoRuntimeError';
export {AsgardeoAuthException} from './errors/exception';

export type {AllOrganizationsApiResponse} from './models/organization';
export {Platform} from './models/platforms';
export type {
  EmbeddedSignInFlowInitiateResponse,
  EmbeddedSignInFlowStatus,
  EmbeddedSignInFlowType,
  EmbeddedSignInFlowStepType,
  EmbeddedSignInFlowAuthenticator,
  EmbeddedSignInFlowLink,
  EmbeddedSignInFlowHandleRequestPayload,
  EmbeddedSignInFlowHandleResponse,
  EmbeddedSignInFlowAuthenticatorParamType,
  EmbeddedSignInFlowAuthenticatorPromptType,
  EmbeddedSignInFlowAuthenticatorKnownIdPType,
} from './models/embedded-signin-flow';
export type {
  EmbeddedFlowComponentType as EmbeddedFlowComponentTypeV2,
  EmbeddedFlowActionVariant as EmbeddedFlowActionVariantV2,
  EmbeddedFlowTextVariant as EmbeddedFlowTextVariantV2,
  EmbeddedFlowEventType as EmbeddedFlowEventTypeV2,
  EmbeddedFlowComponent as EmbeddedFlowComponentV2,
  EmbeddedFlowResponseData as EmbeddedFlowResponseDataV2,
  EmbeddedFlowExecuteRequestConfig as EmbeddedFlowExecuteRequestConfigV2,
  ConsentAttributeElement as ConsentAttributeElementV2,
  ConsentPurposeDecision as ConsentPurposeDecisionV2,
  ConsentDecisions as ConsentDecisionsV2,
  ConsentPurposeData as ConsentPurposeDataV2,
  ConsentPromptData as ConsentPromptDataV2,
} from './models/v2/embedded-flow-v2';
export type {
  EmbeddedSignInFlowStatus as EmbeddedSignInFlowStatusV2,
  EmbeddedSignInFlowType as EmbeddedSignInFlowTypeV2,
  ExtendedEmbeddedSignInFlowResponse as ExtendedEmbeddedSignInFlowResponseV2,
  EmbeddedSignInFlowResponse as EmbeddedSignInFlowResponseV2,
  EmbeddedSignInFlowCompleteResponse as EmbeddedSignInFlowCompleteResponseV2,
  EmbeddedSignInFlowInitiateRequest as EmbeddedSignInFlowInitiateRequestV2,
  EmbeddedSignInFlowRequest as EmbeddedSignInFlowRequestV2,
} from './models/v2/embedded-signin-flow-v2';
export type {
  EmbeddedSignUpFlowStatus as EmbeddedSignUpFlowStatusV2,
  EmbeddedSignUpFlowType as EmbeddedSignUpFlowTypeV2,
  ExtendedEmbeddedSignUpFlowResponse as ExtendedEmbeddedSignUpFlowResponseV2,
  EmbeddedSignUpFlowResponse as EmbeddedSignUpFlowResponseV2,
  EmbeddedSignUpFlowCompleteResponse as EmbeddedSignUpFlowCompleteResponseV2,
  EmbeddedSignUpFlowInitiateRequest as EmbeddedSignUpFlowInitiateRequestV2,
  EmbeddedSignUpFlowRequest as EmbeddedSignUpFlowRequestV2,
  EmbeddedSignUpFlowErrorResponse as EmbeddedSignUpFlowErrorResponseV2,
} from './models/v2/embedded-signup-flow-v2';
export type {
  EmbeddedRecoveryFlowStatus as EmbeddedRecoveryFlowStatusV2,
  EmbeddedRecoveryFlowType as EmbeddedRecoveryFlowTypeV2,
  EmbeddedRecoveryFlowResponse as EmbeddedRecoveryFlowResponseV2,
  EmbeddedRecoveryFlowInitiateRequest as EmbeddedRecoveryFlowInitiateRequestV2,
  EmbeddedRecoveryFlowRequest as EmbeddedRecoveryFlowRequestV2,
  EmbeddedRecoveryFlowErrorResponse as EmbeddedRecoveryFlowErrorResponseV2,
} from './models/v2/embedded-recovery-flow-v2';
export type {
  OrganizationUnit,
  OrganizationUnitListResponse,
  GetOrganizationUnitChildrenConfig,
} from './models/v2/organization-unit';
export type {
  FlowMetaType,
  ApplicationMetadata,
  OUMetadata,
  DesignMetadata,
  I18nMetadata,
  FlowMetadataResponse,
  GetFlowMetaRequestConfig,
  FlowMetaTheme,
  FlowMetaThemeColorSet,
  FlowMetaThemeBackground,
  FlowMetaThemeTextColors,
  FlowMetaThemeColors,
  FlowMetaThemeColorScheme,
  FlowMetaThemeShape,
  FlowMetaThemeTypography,
} from './models/v2/flow-meta-v2';
export type {
  EmbeddedFlowType,
  EmbeddedFlowStatus,
  EmbeddedFlowExecuteResponse,
  EmbeddedFlowResponseType,
  EmbeddedSignUpFlowData,
  EmbeddedFlowComponent,
  EmbeddedFlowComponentType,
  EmbeddedFlowExecuteRequestPayload,
  EmbeddedFlowExecuteRequestConfig,
  EmbeddedFlowExecuteErrorResponse,
} from './models/embedded-flow';
export {FlowMode} from './models/flow';
export type {AsgardeoClient} from './models/client';
export type {
  BaseConfig,
  Config,
  Preferences,
  ThemePreferences,
  I18nPreferences,
  I18nStorageStrategy,
  WithPreferences,
  Extensions,
  WithExtensions,
  SignInOptions,
  SignOutOptions,
  SignUpOptions,
} from './models/config';
export type {TokenEndpointAuthMethod} from './models/token-endpoint-auth';
export type {ComponentRenderContext, ComponentRenderer, ComponentsExtensions} from './models/v2/extensions/components';
export type {TokenResponse, IdToken, TokenExchangeRequestConfig} from './models/token';
export type {AgentConfig} from './models/agent';
export type {AuthCodeResponse} from './models/auth-code-response';
export type {Crypto, JWKInterface} from './models/crypto';
export type {OAuthResponseMode} from './models/oauth-response';
export type {
  AuthorizeRequestUrlParams,
  KnownExtendedAuthorizeRequestUrlParams,
  ExtendedAuthorizeRequestUrlParams,
} from './models/oauth-request';
export type {OIDCEndpoints} from './models/oidc-endpoints';
export type {OIDCDiscoveryApiResponse} from './models/oidc-discovery';
export type {Storage, TemporaryStore} from './models/store';
export type {User, UserProfile} from './models/user';
export type {SessionData} from './models/session';
export type {Organization} from './models/organization';
export type {TranslationFn} from './models/v2/translation';
export type {ResolveFlowTemplateLiteralsOptions} from './models/v2/vars';
export type {
  BrandingPreference,
  BrandingPreferenceConfig,
  BrandingLayout,
  BrandingTheme,
  ThemeVariant,
  ButtonsConfig,
  ColorsConfig,
  ColorVariants,
  BrandingOrganizationDetails,
  UrlsConfig,
} from './models/branding-preference';
export type {Schema, SchemaAttribute, WellKnownSchemaIds, FlattenedSchema} from './models/scim2-schema';
export type {RecursivePartial} from './models/utility-types';
export {FieldType} from './models/field';

export {default as AsgardeoJavaScriptClient} from './AsgardeoJavaScriptClient';

export {default as createTheme, DEFAULT_THEME} from './theme/createTheme';
export type {ThemeColors, ThemeConfig, Theme, ThemeMode, ThemeDetection} from './theme/types';

export {default as arrayBufferToBase64url} from './utils/arrayBufferToBase64url';
export {default as base64urlToArrayBuffer} from './utils/base64urlToArrayBuffer';
export {default as bem} from './utils/bem';
export {default as formatDate} from './utils/formatDate';
export {default as processUsername} from './utils/processUsername';
export {default as deepMerge} from './utils/deepMerge';
export {default as deriveOrganizationHandleFromBaseUrl} from './utils/deriveOrganizationHandleFromBaseUrl';
export {default as extractUserClaimsFromIdToken} from './utils/extractUserClaimsFromIdToken';
export {default as isRecognizedBaseUrlPattern} from './utils/isRecognizedBaseUrlPattern';
export {default as extractPkceStorageKeyFromState} from './utils/extractPkceStorageKeyFromState';
export {default as flattenUserSchema} from './utils/flattenUserSchema';
export {default as generateUserProfile} from './utils/generateUserProfile';
export {default as getLatestStateParam} from './utils/getLatestStateParam';
export {default as generateFlattenedUserProfile} from './utils/generateFlattenedUserProfile';
export {default as getRedirectBasedSignUpUrl} from './utils/getRedirectBasedSignUpUrl';
export {default as identifyPlatform} from './utils/identifyPlatform';
export {default as isEmpty} from './utils/isEmpty';
export {default as isEmojiUri, EMOJI_URI_SCHEME} from './utils/v2/isEmojiUri';
export {default as extractEmojiFromUri} from './utils/v2/extractEmojiFromUri';
export {default as set} from './utils/set';
export {default as get} from './utils/get';
export {default as removeTrailingSlash} from './utils/removeTrailingSlash';
export {default as resolveFieldType} from './utils/resolveFieldType';
export {default as resolveFieldName} from './utils/resolveFieldName';
export {default as resolveMeta} from './utils/v2/resolveMeta';
export {default as resolveFlowTemplateLiterals} from './utils/v2/resolveFlowTemplateLiterals';
export {default as countryCodeToFlagEmoji} from './utils/v2/countryCodeToFlagEmoji';
export {default as resolveLocaleDisplayName} from './utils/v2/resolveLocaleDisplayName';
export {default as resolveLocaleEmoji} from './utils/v2/resolveLocaleEmoji';
export {default as processOpenIDScopes} from './utils/processOpenIDScopes';
export {default as withVendorCSSClassPrefix} from './utils/withVendorCSSClassPrefix';
export {default as transformBrandingPreferenceToTheme} from './utils/transformBrandingPreferenceToTheme';

export type {
  default as logger,
  createLogger,
  createComponentLogger,
  createPackageLogger,
  createPackageComponentLogger,
  LogLevel,
  configure as configureLogger,
  debug,
  info,
  warn,
  error,
} from './utils/logger';
export type {LoggerConfig} from './utils/logger';

export {default as StorageManager} from './StorageManager';

export {HttpClient} from './HttpClient';
export type {HttpError, HttpRequestConfig, HttpResponse} from './models/http';
