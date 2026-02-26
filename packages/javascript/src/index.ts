/**
 * Copyright (c) 2020, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
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
export {
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
export {default as getScim2Me, GetScim2MeConfig} from './api/getScim2Me';
export {default as getSchemas, GetSchemasConfig} from './api/getSchemas';
export {default as getAllOrganizations, GetAllOrganizationsConfig} from './api/getAllOrganizations';
export {
  default as createOrganization,
  CreateOrganizationPayload,
  CreateOrganizationConfig,
} from './api/createOrganization';
export {default as getMeOrganizations, GetMeOrganizationsConfig} from './api/getMeOrganizations';
export {default as getOrganization, OrganizationDetails, GetOrganizationConfig} from './api/getOrganization';
export {default as updateOrganization, createPatchOperations, UpdateOrganizationConfig} from './api/updateOrganization';
export {default as updateMeProfile, UpdateMeProfileConfig} from './api/updateMeProfile';
export {default as getBrandingPreference, GetBrandingPreferenceConfig} from './api/getBrandingPreference';
export {default as executeEmbeddedSignInFlowV2} from './api/v2/executeEmbeddedSignInFlowV2';
export {default as executeEmbeddedSignUpFlowV2} from './api/v2/executeEmbeddedSignUpFlowV2';
export {
  default as executeEmbeddedUserOnboardingFlowV2,
  EmbeddedUserOnboardingFlowResponse,
} from './api/v2/executeEmbeddedUserOnboardingFlowV2';
export {default as getFlowMetaV2} from './api/v2/getFlowMetaV2';

export {default as ApplicationNativeAuthenticationConstants} from './constants/ApplicationNativeAuthenticationConstants';
export {default as TokenConstants} from './constants/TokenConstants';
export {default as OIDCRequestConstants} from './constants/OIDCRequestConstants';
export {default as VendorConstants} from './constants/VendorConstants';

export {default as AsgardeoError} from './errors/AsgardeoError';
export {default as AsgardeoAPIError} from './errors/AsgardeoAPIError';
export {default as AsgardeoRuntimeError} from './errors/AsgardeoRuntimeError';
export {AsgardeoAuthException} from './errors/exception';

export {AllOrganizationsApiResponse} from './models/organization';
export {Platform} from './models/platforms';
export {
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
export {
  EmbeddedFlowComponentType as EmbeddedFlowComponentTypeV2,
  EmbeddedFlowActionVariant as EmbeddedFlowActionVariantV2,
  EmbeddedFlowTextVariant as EmbeddedFlowTextVariantV2,
  EmbeddedFlowEventType as EmbeddedFlowEventTypeV2,
  EmbeddedFlowComponent as EmbeddedFlowComponentV2,
  EmbeddedFlowResponseData as EmbeddedFlowResponseDataV2,
  EmbeddedFlowExecuteRequestConfig as EmbeddedFlowExecuteRequestConfigV2,
} from './models/v2/embedded-flow-v2';
export {
  EmbeddedSignInFlowStatus as EmbeddedSignInFlowStatusV2,
  EmbeddedSignInFlowType as EmbeddedSignInFlowTypeV2,
  ExtendedEmbeddedSignInFlowResponse as ExtendedEmbeddedSignInFlowResponseV2,
  EmbeddedSignInFlowResponse as EmbeddedSignInFlowResponseV2,
  EmbeddedSignInFlowCompleteResponse as EmbeddedSignInFlowCompleteResponseV2,
  EmbeddedSignInFlowInitiateRequest as EmbeddedSignInFlowInitiateRequestV2,
  EmbeddedSignInFlowRequest as EmbeddedSignInFlowRequestV2,
} from './models/v2/embedded-signin-flow-v2';
export {
  EmbeddedSignUpFlowStatus as EmbeddedSignUpFlowStatusV2,
  EmbeddedSignUpFlowType as EmbeddedSignUpFlowTypeV2,
  ExtendedEmbeddedSignUpFlowResponse as ExtendedEmbeddedSignUpFlowResponseV2,
  EmbeddedSignUpFlowResponse as EmbeddedSignUpFlowResponseV2,
  EmbeddedSignUpFlowCompleteResponse as EmbeddedSignUpFlowCompleteResponseV2,
  EmbeddedSignUpFlowInitiateRequest as EmbeddedSignUpFlowInitiateRequestV2,
  EmbeddedSignUpFlowRequest as EmbeddedSignUpFlowRequestV2,
  EmbeddedSignUpFlowErrorResponse as EmbeddedSignUpFlowErrorResponseV2,
} from './models/v2/embedded-signup-flow-v2';
export {
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
export {
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
export {AsgardeoClient} from './models/client';
export {
  BaseConfig,
  Config,
  Preferences,
  ThemePreferences,
  I18nPreferences,
  WithPreferences,
  SignInOptions,
  SignOutOptions,
  SignUpOptions,
} from './models/config';
export {TokenResponse, IdToken, TokenExchangeRequestConfig} from './models/token';
export {Crypto, JWKInterface} from './models/crypto';
export {OAuthResponseMode} from './models/oauth-response';
export {
  AuthorizeRequestUrlParams,
  KnownExtendedAuthorizeRequestUrlParams,
  ExtendedAuthorizeRequestUrlParams,
} from './models/oauth-request';
export {OIDCEndpoints} from './models/oidc-endpoints';
export {Storage, TemporaryStore} from './models/store';
export {User, UserProfile} from './models/user';
export {SessionData} from './models/session';
export {Organization} from './models/organization';
export {TranslationFn} from './models/v2/translation';
export {ResolveVarsOptions} from './models/v2/vars';
export {
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
export {Schema, SchemaAttribute, WellKnownSchemaIds, FlattenedSchema} from './models/scim2-schema';
export {RecursivePartial} from './models/utility-types';
export {FieldType} from './models/field';

export {default as AsgardeoJavaScriptClient} from './AsgardeoJavaScriptClient';

export {default as createTheme, DEFAULT_THEME} from './theme/createTheme';
export {ThemeColors, ThemeConfig, Theme, ThemeMode, ThemeDetection} from './theme/types';

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
export {default as set} from './utils/set';
export {default as get} from './utils/get';
export {default as removeTrailingSlash} from './utils/removeTrailingSlash';
export {default as resolveFieldType} from './utils/resolveFieldType';
export {default as resolveFieldName} from './utils/resolveFieldName';
export {default as resolveMeta} from './utils/v2/resolveMeta';
export {default as resolveVars} from './utils/v2/resolveVars';
export {default as processOpenIDScopes} from './utils/processOpenIDScopes';
export {default as withVendorCSSClassPrefix} from './utils/withVendorCSSClassPrefix';
export {default as transformBrandingPreferenceToTheme} from './utils/transformBrandingPreferenceToTheme';

export {
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
