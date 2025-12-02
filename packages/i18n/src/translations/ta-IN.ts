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
  'elements.buttons.signIn': 'உள்நுழை',
  'elements.buttons.signOut': 'வெளியேறு',
  'elements.buttons.signUp': 'பதிவு செய்',
  'elements.buttons.facebook': 'Facebook மூலம் தொடரவும்',
  'elements.buttons.google': 'Google மூலம் தொடரவும்',
  'elements.buttons.github': 'GitHub மூலம் தொடரவும்',
  'elements.buttons.microsoft': 'Microsoft மூலம் தொடரவும்',
  'elements.buttons.linkedin': 'LinkedIn மூலம் தொடரவும்',
  'elements.buttons.ethereum': 'Ethereum மூலம் உள்நுழை',
  'elements.buttons.smsotp': 'SMS மூலம் தொடரவும்',
  'elements.buttons.multi.option': '{connection} மூலம் தொடரவும்',
  'elements.buttons.social': '{connection} மூலம் தொடரவும்',

  /* Fields */
  'elements.fields.placeholder': '{field} உள்ளிடவும்',
  'elements.fields.username': 'பயனர்பெயர்',
  'elements.fields.password': 'கடவுச்சொல்',
  'elements.fields.ouName': 'அமைப்பின் பெயர்',
  'elements.fields.ouHandle': 'அமைப்பு கையாளுதல்',
  'elements.fields.ouDescription': 'அமைப்பு விளக்கம்',

  /* Validation */
  'field.required': 'இந்த புலம் தேவை',

  /* |---------------------------------------------------------------| */
  /* |                        Widgets                                | */
  /* |---------------------------------------------------------------| */

  /* Base Sign In */
  'signin.title': 'உள்நுழை',
  'signin.subtitle': 'தொடர உங்கள் சான்றுகளை உள்ளிடவும்.',

  /* Base Sign Up */
  'signup.title': 'பதிவு செய்',
  'signup.subtitle': 'தொடங்க புதிய கணக்கை உருவாக்கவும்.',

  /* Email OTP */
  'email.otp.title': 'OTP சரிபார்ப்பு',
  'email.otp.subtitle': 'உங்கள் மின்னஞ்சலுக்கு அனுப்பப்பட்ட குறியீட்டை உள்ளிடவும்.',
  'email.otp.submit.button': 'தொடரவும்',

  /* Identifier First */
  'identifier.first.title': 'உள்நுழை',
  'identifier.first.subtitle': 'பயனர்பெயர் அல்லது மின்னஞ்சல் முகவரியை உள்ளிடவும்.',
  'identifier.first.submit.button': 'தொடரவும்',

  /* SMS OTP */
  'sms.otp.title': 'OTP சரிபார்ப்பு',
  'sms.otp.subtitle': 'உங்கள் தொலைபேசிக்கு அனுப்பப்பட்ட குறியீட்டை உள்ளிடவும்.',
  'sms.otp.submit.button': 'தொடரவும்',

  /* TOTP */
  'totp.title': 'உங்கள் அடையாளத்தை சரிபார்க்கவும்',
  'totp.subtitle': 'உங்கள் அங்கீகரிப்பு செயலியில் உள்ள குறியீட்டை உள்ளிடவும்.',
  'totp.submit.button': 'தொடரவும்',

  /* Username Password */
  'username.password.submit.button': 'தொடரவும்',
  'username.password.title': 'உள்நுழை',
  'username.password.subtitle': 'தொடர உங்கள் பயனர்பெயர் மற்றும் கடவுச்சொல்லை உள்ளிடவும்.',

  /* |---------------------------------------------------------------| */
  /* |                          User Profile                         | */
  /* |---------------------------------------------------------------| */

  'user.profile.title': 'சுயவிவரம்',
  'user.profile.update.generic.error':
    'உங்கள் சுயவிவரத்தை புதுப்பிக்கும் போது பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.',

  /* |---------------------------------------------------------------| */
  /* |                     Organization Switcher                     | */
  /* |---------------------------------------------------------------| */

  'organization.switcher.select.organization': 'அமைப்பை தேர்ந்தெடு',
  'organization.switcher.switch.organization': 'அமைப்பை மாற்று',
  'organization.switcher.loading.organizations': 'அமைப்புகள் ஏற்றப்படுகின்றன...',
  'organization.switcher.members': 'உறுப்பினர்கள்',
  'organization.switcher.member': 'உறுப்பினர்',
  'organization.switcher.create.organization': 'அமைப்பை உருவாக்கு',
  'organization.switcher.manage.organizations': 'அமைப்புகளை நிர்வகிக்கவும்',
  'organization.switcher.manage.button': 'நிர்வகி',
  'organization.switcher.organizations.title': 'அமைப்புகள்',
  'organization.switcher.switch.button': 'மாற்று',
  'organization.switcher.no.access': 'அணுகல் இல்லை',
  'organization.switcher.status.label': 'நிலை:',
  'organization.switcher.showing.count': 'மொத்த {total} அமைப்புகளில் {showing} காட்டப்படுகிறது',
  'organization.switcher.refresh.button': 'புதுப்பி',
  'organization.switcher.load.more': 'மேலும் அமைப்புகளை ஏற்று',
  'organization.switcher.loading.more': 'ஏற்றப்படுகிறது...',
  'organization.switcher.no.organizations': 'எந்த அமைப்பும் கிடைக்கவில்லை',
  'organization.switcher.error.prefix': 'பிழை:',
  'organization.profile.title': 'அமைப்பு சுயவிவரம்',
  'organization.profile.loading': 'அமைப்பை ஏற்றுகிறது...',
  'organization.profile.error': 'அமைப்பை ஏற்ற முடியவில்லை',

  'organization.create.title': 'அமைப்பை உருவாக்கு',
  'organization.create.name.label': 'அமைப்பின் பெயர்',
  'organization.create.name.placeholder': 'அமைப்பின் பெயரை உள்ளிடவும்',
  'organization.create.handle.label': 'அமைப்பின் கைப்பிடி',
  'organization.create.handle.placeholder': 'my-organization',
  'organization.create.description.label': 'விளக்கம்',
  'organization.create.description.placeholder': 'அமைப்பின் விளக்கத்தை உள்ளிடவும்',
  'organization.create.button': 'அமைப்பை உருவாக்கு',
  'organization.create.creating': 'உருவாக்கப்படுகிறது...',
  'organization.create.cancel': 'ரத்து செய்',

  /* |---------------------------------------------------------------| */
  /* |                        Messages                               | */
  /* |---------------------------------------------------------------| */

  'messages.loading': 'ஏற்றப்படுகிறது...',

  /* |---------------------------------------------------------------| */
  /* |                        Errors                                 | */
  /* |---------------------------------------------------------------| */

  'errors.title': 'பிழை',
  'errors.sign.in.initialization': 'தொடக்கத்தில் பிழை ஏற்பட்டது. பின்னர் மீண்டும் முயற்சிக்கவும்.',
  'errors.sign.in.flow.failure': 'உள்நுழைவு செயல்பாட்டின் போது பிழை ஏற்பட்டது. பின்னர் மீண்டும் முயற்சிக்கவும்.',
  'errors.sign.in.flow.completion.failure':
    'உள்நுழைவு செயல்பாட்டை முடிக்கும் போது பிழை ஏற்பட்டது. பின்னர் மீண்டும் முயற்சிக்கவும்.',
  'errors.sign.in.flow.passkeys.failure':
    'பாஸ்கீக்கள் மூலம் உள்நுழையும்போது பிழை ஏற்பட்டது. பின்னர் மீண்டும் முயற்சிக்கவும்.',
  'errors.sign.in.flow.passkeys.completion.failure':
    'பாஸ்கீ உள்நுழைவு முடிக்கும் போது பிழை ஏற்பட்டது. பின்னர் மீண்டும் முயற்சிக்கவும்.',
  'errors.sign.up.initialization': 'தொடங்கும்போது பிழை ஏற்பட்டது. பின்னர் மீண்டும் முயற்சிக்கவும்.',
  'errors.sign.up.flow.failure': 'பதிவு செய்யும் செயல்பாட்டில் பிழை ஏற்பட்டது. பின்னர் மீண்டும் முயற்சிக்கவும்.',
  'errors.sign.up.flow.initialization.failure':
    'பதிவு செய்யும் செயல்பாட்டை தொடங்கும்போது பிழை ஏற்பட்டது. பின்னர் மீண்டும் முயற்சிக்கவும்.',
  'errors.sign.up.components.not.available': 'பதிவு படிவம் இப்போது கிடைக்கவில்லை. பின்னர் மீண்டும் முயற்சிக்கவும்.',
  'errors.sign.in.components.not.available': 'உள்நுழைவு படிவம் இப்போது கிடைக்கவில்லை. பின்னர் மீண்டும் முயற்சிக்கவும்.',
};

const metadata: I18nMetadata = {
  localeCode: 'ta-IN',
  countryCode: 'IN',
  languageCode: 'ta',
  displayName: 'தமிழ் (இலங்கை)',
  direction: 'ltr',
};

const ta_IN: I18nBundle = {
  metadata,
  translations,
};

export default ta_IN;
