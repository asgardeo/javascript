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

/* eslint-disable typescript-sort-keys/interface */

export interface I18nTranslations {
  /* |---------------------------------------------------------------| */
  /* |                        Elements                               | */
  /* |---------------------------------------------------------------| */

  //* Buttons */
  'elements.buttons.signIn': string;
  'elements.buttons.signOut': string;
  'elements.buttons.signUp': string;
  'elements.buttons.facebook': string;
  'elements.buttons.google': string;
  'elements.buttons.github': string;
  'elements.buttons.microsoft': string;
  'elements.buttons.linkedin': string;
  'elements.buttons.ethereum': string;
  'elements.buttons.smsotp': string;
  'elements.buttons.multi.option': string;
  'elements.buttons.social': string;

  /* Fields */
  'elements.fields.placeholder': string;
  'elements.fields.username': string;
  'elements.fields.password': string;
  'elements.fields.ouName': string;
  'elements.fields.ouHandle': string;
  'elements.fields.ouDescription': string;

  /* Validation */
  'field.required': string;

  /* |---------------------------------------------------------------| */
  /* |                        Widgets                                | */
  /* |---------------------------------------------------------------| */

  /* Base Sign In */
  'signin.title': string;
  'signin.subtitle': string;

  /* Base Sign Up */
  'signup.title': string;
  'signup.subtitle': string;

  /* Email OTP */
  'email.otp.title': string;
  'email.otp.subtitle': string;
  'email.otp.submit.button': string;

  /* Identifier First */
  'identifier.first.title': string;
  'identifier.first.subtitle': string;
  'identifier.first.submit.button': string;

  /* SMS OTP */
  'sms.otp.title': string;
  'sms.otp.subtitle': string;
  'sms.otp.submit.button': string;

  /* TOTP */
  'totp.title': string;
  'totp.subtitle': string;
  'totp.submit.button': string;

  /* Username Password */
  'username.password.submit.button': string;
  'username.password.title': string;
  'username.password.subtitle': string;

  /* |---------------------------------------------------------------| */
  /* |                          User Profile                         | */
  /* |---------------------------------------------------------------| */

  'user.profile.title': string;
  'user.profile.update.generic.error': string;

  /* |---------------------------------------------------------------| */
  /* |                     Organization Switcher                     | */
  /* |---------------------------------------------------------------| */

  'organization.switcher.select.organization': string;
  'organization.switcher.switch.organization': string;
  'organization.switcher.loading.organizations': string;
  'organization.switcher.members': string;
  'organization.switcher.member': string;
  'organization.switcher.create.organization': string;
  'organization.switcher.manage.organizations': string;
  'organization.switcher.manage.button': string;
  'organization.switcher.organizations.title': string;
  'organization.switcher.switch.button': string;
  'organization.switcher.no.access': string;
  'organization.switcher.status.label': string;
  'organization.switcher.showing.count': string;
  'organization.switcher.refresh.button': string;
  'organization.switcher.load.more': string;
  'organization.switcher.loading.more': string;
  'organization.switcher.no.organizations': string;
  'organization.switcher.error.prefix': string;
  'organization.profile.title': string;
  'organization.profile.loading': string;
  'organization.profile.error': string;

  /* |---------------------------------------------------------------| */
  /* |                     Organization Creation                     | */
  /* |---------------------------------------------------------------| */

  'organization.create.title': string;
  'organization.create.name.label': string;
  'organization.create.name.placeholder': string;
  'organization.create.handle.label': string;
  'organization.create.handle.placeholder': string;
  'organization.create.description.label': string;
  'organization.create.description.placeholder': string;
  'organization.create.button': string;
  'organization.create.creating': string;
  'organization.create.cancel': string;

  /* |---------------------------------------------------------------| */
  /* |                        Messages                               | */
  /* |---------------------------------------------------------------| */

  'messages.loading': string;

  /* |---------------------------------------------------------------| */
  /* |                        Errors                                 | */
  /* |---------------------------------------------------------------| */

  'errors.title': string;
  'errors.sign.in.initialization': string;
  'errors.sign.in.flow.failure': string;
  'errors.sign.in.flow.completion.failure': string;
  'errors.sign.in.flow.passkeys.failure': string;
  'errors.sign.in.flow.passkeys.completion.failure': string;
  'errors.sign.up.initialization': string;
  'errors.sign.up.flow.failure': string;
  'errors.sign.up.flow.initialization.failure': string;
  'errors.sign.up.components.not.available': string;
  'errors.sign.in.components.not.available': string;
}

export type I18nTextDirection = 'ltr' | 'rtl';

export interface I18nMetadata {
  localeCode: string;
  countryCode: string;
  languageCode: string;
  displayName: string;
  direction: I18nTextDirection;
}

export interface I18nBundle {
  metadata: I18nMetadata;
  translations: I18nTranslations;
}
