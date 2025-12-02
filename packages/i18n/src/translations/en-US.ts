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

/* eslint-disable sort-keys */
/* eslint-disable @typescript-eslint/naming-convention */

import {I18nTranslations, I18nMetadata, I18nBundle} from '../models/i18n';

const translations: I18nTranslations = {
  /* |---------------------------------------------------------------| */
  /* |                        Elements                               | */
  /* |---------------------------------------------------------------| */

  /* Buttons */
  'elements.buttons.signIn': 'Sign In',
  'elements.buttons.signOut': 'Sign Out',
  'elements.buttons.signUp': 'Sign Up',
  'elements.buttons.facebook': 'Continue with Facebook',
  'elements.buttons.google': 'Continue with Google',
  'elements.buttons.github': 'Continue with GitHub',
  'elements.buttons.microsoft': 'Continue with Microsoft',
  'elements.buttons.linkedin': 'Continue with LinkedIn',
  'elements.buttons.ethereum': 'Continue with Sign In Ethereum',
  'elements.buttons.smsotp': 'Continue with SMS OTP',
  'elements.buttons.multi.option': 'Continue with {connection}',
  'elements.buttons.social': 'Continue with {connection}',

  /* Fields */
  'elements.fields.placeholder': 'Enter your {field}',
  'elements.fields.username': 'Username',
  'elements.fields.password': 'Password',
  'elements.fields.ouName': 'Organization Name',
  'elements.fields.ouHandle': 'Organization Handle',
  'elements.fields.ouDescription': 'Organization Description',

  /* Validation */
  'field.required': 'This field is required',

  /* |---------------------------------------------------------------| */
  /* |                        Widgets                                | */
  /* |---------------------------------------------------------------| */

  /* Base Sign In */
  'signin.title': 'Sign In',
  'signin.subtitle': 'Welcome back! Please sign in to continue.',

  /* Base Sign Up */
  'signup.title': 'Sign Up',
  'signup.subtitle': 'Create a new account to get started.',

  /* Email OTP */
  'email.otp.title': 'OTP Verification',
  'email.otp.subtitle': 'Enter the code sent to your email address.',
  'email.otp.submit.button': 'Continue',

  /* Identifier First */
  'identifier.first.title': 'Sign In',
  'identifier.first.subtitle': 'Enter your username or email address.',
  'identifier.first.submit.button': 'Continue',

  /* SMS OTP */
  'sms.otp.title': 'OTP Verification',
  'sms.otp.subtitle': 'Enter the code sent to your phone number.',
  'sms.otp.submit.button': 'Continue',

  /* TOTP */
  'totp.title': 'Verify Your Identity',
  'totp.subtitle': 'Enter the code from your authenticator app.',
  'totp.submit.button': 'Continue',

  /* Username Password */
  'username.password.submit.button': 'Continue',
  'username.password.title': 'Sign In',
  'username.password.subtitle': 'Enter your username and password to continue.',

  /* |---------------------------------------------------------------| */
  /* |                          User Profile                         | */
  /* |---------------------------------------------------------------| */

  'user.profile.title': 'Profile',
  'user.profile.update.generic.error': 'An error occurred while updating your profile. Please try again.',

  /* |---------------------------------------------------------------| */
  /* |                     Organization Switcher                     | */
  /* |---------------------------------------------------------------| */

  'organization.switcher.select.organization': 'Select Organization',
  'organization.switcher.switch.organization': 'Switch Organization',
  'organization.switcher.loading.organizations': 'Loading organizations...',
  'organization.switcher.members': 'members',
  'organization.switcher.member': 'member',
  'organization.switcher.create.organization': 'Create Organization',
  'organization.switcher.manage.organizations': 'Manage Organizations',
  'organization.switcher.manage.button': 'Manage',
  'organization.switcher.organizations.title': 'Organizations',
  'organization.switcher.switch.button': 'Switch',
  'organization.switcher.no.access': 'No Access',
  'organization.switcher.status.label': 'Status:',
  'organization.switcher.showing.count': 'Showing {showing} of {total} organizations',
  'organization.switcher.refresh.button': 'Refresh',
  'organization.switcher.load.more': 'Load More Organizations',
  'organization.switcher.loading.more': 'Loading...',
  'organization.switcher.no.organizations': 'No organizations found',
  'organization.switcher.error.prefix': 'Error:',
  'organization.profile.title': 'Organization Profile',
  'organization.profile.loading': 'Loading organization...',
  'organization.profile.error': 'Failed to load organization',

  'organization.create.title': 'Create Organization',
  'organization.create.name.label': 'Organization Name',
  'organization.create.name.placeholder': 'Enter organization name',
  'organization.create.handle.label': 'Organization Handle',
  'organization.create.handle.placeholder': 'my-organization',
  'organization.create.description.label': 'Description',
  'organization.create.description.placeholder': 'Enter organization description',
  'organization.create.button': 'Create Organization',
  'organization.create.creating': 'Creating...',
  'organization.create.cancel': 'Cancel',

  /* |---------------------------------------------------------------| */
  /* |                        Messages                               | */
  /* |---------------------------------------------------------------| */

  'messages.loading': 'Loading...',

  /* |---------------------------------------------------------------| */
  /* |                        Errors                                 | */
  /* |---------------------------------------------------------------| */

  'errors.title': 'Error',
  'errors.sign.in.initialization': 'An error occurred while initializing. Please try again later.',
  'errors.sign.in.flow.failure': 'An error occurred during the sign-in flow. Please try again later.',
  'errors.sign.in.flow.completion.failure':
    'An error occurred while completing the sign-in flow. Please try again later.',
  'errors.sign.in.flow.passkeys.failure': 'An error occurred while signing in with passkeys. Please try again later.',
  'errors.sign.in.flow.passkeys.completion.failure':
    'An error occurred while completing the passkeys sign-in flow. Please try again later.',
  'errors.sign.up.initialization': 'An error occurred while initializing. Please try again later.',
  'errors.sign.up.flow.failure': 'An error occurred during the sign-up flow. Please try again later.',
  'errors.sign.up.flow.initialization.failure':
    'An error occurred while initializing the sign-up flow. Please try again later.',
  'errors.sign.up.components.not.available': 'Sign-up form is not available at the moment. Please try again later.',
  'errors.sign.in.components.not.available': 'Sign-in form is not available at the moment. Please try again later.',
};

const metadata: I18nMetadata = {
  localeCode: 'en-US',
  countryCode: 'US',
  languageCode: 'en',
  displayName: 'English (United States)',
  direction: 'ltr',
};

const en_US: I18nBundle = {
  metadata,
  translations,
};

export default en_US;
