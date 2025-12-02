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
  'elements.buttons.signIn': 'ලොග් වෙන්න',
  'elements.buttons.signOut': 'ඉවත් වෙන්න',
  'elements.buttons.signUp': 'ලියාපදිංචි වෙන්න',
  'elements.buttons.facebook': 'Facebook සමග ඉදිරියට යන්න',
  'elements.buttons.google': 'Google සමග ඉදිරියට යන්න',
  'elements.buttons.github': 'GitHub සමග ඉදිරියට යන්න',
  'elements.buttons.microsoft': 'Microsoft සමග ඉදිරියට යන්න',
  'elements.buttons.linkedin': 'LinkedIn සමග ඉදිරියට යන්න',
  'elements.buttons.ethereum': 'Ethereum සමග ඉදිරියට යන්න',
  'elements.buttons.smsotp': 'SMS සමග ඉදිරියට යන්න',
  'elements.buttons.multi.option': '{connection} සමග ඉදිරියට යන්න',
  'elements.buttons.social': '{connection} සමග ඉදිරියට යන්න',

  /* Fields */
  'elements.fields.placeholder': 'ඔබේ {field} ඇතුලත් කරන්න',
  'elements.fields.username': 'පරිශීලක නාමය',
  'elements.fields.password': 'මුරපදය',
  'elements.fields.ouName': 'සංවිධානයේ නම',
  'elements.fields.ouHandle': 'සංවිධාන හැඳුනුම්පත',
  'elements.fields.ouDescription': 'සංවිධානයේ විස්තරය',

  /* Validation */
  'field.required': 'මෙම ක්ෂේත්‍රය අවශ්‍යයි',

  /* |---------------------------------------------------------------| */
  /* |                        Widgets                                | */
  /* |---------------------------------------------------------------| */

  /* Base Sign In */
  'signin.title': 'ලොග් වෙන්න',
  'signin.subtitle': 'ඉදිරියට යාමට ඔබේ සත්‍යාපන තොරතුරු ඇතුළත් කරන්න.',

  /* Base Sign Up */
  'signup.title': 'ලියාපදිංචි වන්න',
  'signup.subtitle': 'ආරම්භ කිරීමට නව ගිණුමක් සාදන්න.',

  /* Email OTP */
  'email.otp.title': 'OTP සත්‍යාපනය',
  'email.otp.subtitle': 'ඔබේ විද්‍යුත් තැපැල් ලිපිනයට යවන ලද කේතය ඇතුළත් කරන්න.',
  'email.otp.submit.button': 'ඉදිරියට යන්න',

  /* Identifier First */
  'identifier.first.title': 'ලොග් වෙන්න',
  'identifier.first.subtitle': 'ඔබේ පරිශීලක නාමය හෝ විද්‍යුත් තැපැල් ලිපිනය ඇතුළත් කරන්න.',
  'identifier.first.submit.button': 'ඉදිරියට යන්න',

  /* SMS OTP */
  'sms.otp.title': 'OTP සත්‍යාපනය',
  'sms.otp.subtitle': 'ඔබේ දුරකථන අංකයට යවන ලද කේතය ඇතුළත් කරන්න.',
  'sms.otp.submit.button': 'ඉදිරියට යන්න',

  /* TOTP */
  'totp.title': 'ඔබගේ අනන්‍යතාවය තහවුරු කරන්න',
  'totp.subtitle': 'ඔබේ authenticator යෙදුමෙන් ලබාගත් කේතය ඇතුළත් කරන්න.',
  'totp.submit.button': 'ඉදිරියට යන්න',

  /* Username Password */
  'username.password.submit.button': 'ඉදිරියට යන්න',
  'username.password.title': 'ලොග් වෙන්න',
  'username.password.subtitle': 'ඉදිරියට යාමට ඔබේ පරිශීලක නාමය සහ මුරපදය ඇතුළත් කරන්න.',

  /* |---------------------------------------------------------------| */
  /* |                          User Profile                         | */
  /* |---------------------------------------------------------------| */

  'user.profile.title': 'පැතිකඩ',
  'user.profile.update.generic.error': 'ඔබේ පැතිකඩ යාවත්කාලීන කිරීමේදී දෝෂයක් ඇතිවිය.කරුණාකර නැවත උත්සාහ කරන්න',

  /* |---------------------------------------------------------------| */
  /* |                     Organization Switcher                     | */
  /* |---------------------------------------------------------------| */

  'organization.switcher.select.organization': 'සංවිධානය තෝරන්න',
  'organization.switcher.switch.organization': 'සංවිධානය මාරු කරන්න',
  'organization.switcher.loading.organizations': 'සංවිධාන ලෝඩ් වෙමින්...',
  'organization.switcher.members': 'සාමාජිකයන්',
  'organization.switcher.member': 'සාමාජිකයා',
  'organization.switcher.create.organization': 'සංවිධානයක් සාදන්න',
  'organization.switcher.manage.organizations': 'සංවිධාන කළමනාකරණය කරන්න',
  'organization.switcher.manage.button': 'කළමනාකරණය කරන්න',
  'organization.switcher.organizations.title': 'සංවිධාන',
  'organization.switcher.switch.button': 'මාරු කරන්න',
  'organization.switcher.no.access': 'ප්‍රවේශය නැත',
  'organization.switcher.status.label': 'තත්ත්වය:',
  'organization.switcher.showing.count': 'මුළු සංවිධාන {showing} න් {total} ක් පෙන්වමින්',
  'organization.switcher.refresh.button': 'නැවුම් කරන්න',
  'organization.switcher.load.more': 'තවත් සංවිධාන ලෝඩ් කරන්න',
  'organization.switcher.loading.more': 'ලෝඩ් වෙමින්...',
  'organization.switcher.no.organizations': 'සංවිධාන කිසිවක් හමු නොවීය.',
  'organization.switcher.error.prefix': 'දෝෂය:',
  'organization.profile.title': 'සංවිධානයේ පැතිකඩ',
  'organization.profile.loading': 'සංවිධානය ලෝඩ් වෙමින්...',
  'organization.profile.error': 'සංවිධානය ලෝඩ් කිරීමට අසමත් විය',

  'organization.create.title': 'සංවිධානය සාදන්න',
  'organization.create.name.label': 'සංවිධානයේ නම',
  'organization.create.name.placeholder': 'සංවිධානයේ නම ඇතුළත් කරන්න',
  'organization.create.handle.label': 'සංවිධානයේ හෑන්ඩලය',
  'organization.create.handle.placeholder': 'my-organization',
  'organization.create.description.label': 'විස්තරය',
  'organization.create.description.placeholder': 'සංවිධානයේ විස්තරය ඇතුළත් කරන්න',
  'organization.create.button': 'සංවිධානය සාදන්න',
  'organization.create.creating': 'සාදමින්...',
  'organization.create.cancel': 'අවලංගු කරන්න',

  /* |---------------------------------------------------------------| */
  /* |                        Messages                               | */
  /* |---------------------------------------------------------------| */

  'messages.loading': 'ලෝඩ් වෙමින්...',

  /* |---------------------------------------------------------------| */
  /* |                        Errors                                 | */
  /* |---------------------------------------------------------------| */

  'errors.title': 'දෝෂය',
  'errors.sign.in.initialization': 'ආරම්භ කිරීමේදී දෝෂයක් සිදු විය. කරුණාකර පසුව නැවත උත්සාහ කරන්න.',
  'errors.sign.in.flow.failure': 'ලොග් වීමේදී දෝෂයක් සිදු විය. කරුණාකර පසුව නැවත උත්සාහ කරන්න.',
  'errors.sign.in.flow.completion.failure':
    'ලොග් වීමේ ක්‍රියාවලිය සම්පූර්ණ කිරීමේදී දෝෂයක් සිදු විය. කරුණාකර පසුව නැවත උත්සාහ කරන්න.',
  'errors.sign.in.flow.passkeys.failure': 'passkeys සමඟ ලොග් වීමේදී දෝෂයක් සිදු විය. කරුණාකර පසුව නැවත උත්සාහ කරන්න.',
  'errors.sign.in.flow.passkeys.completion.failure':
    'passkeys සමඟ ලොග් වීමේ ක්‍රියාවලිය සම්පූර්ණ කිරීමේදී දෝෂයක් සිදු විය. කරුණාකර පසුව නැවත උත්සාහ කරන්න.',
  'errors.sign.up.initialization': 'ආරම්භ කිරීමේදී දෝෂයක් සිදු විය. කරුණාකර පසුව නැවත උත්සාහ කරන්න.',
  'errors.sign.up.flow.failure': 'ගිණුම් තැනීමේ ක්‍රියාවලියේදී දෝෂයක් සිදු විය. කරුණාකර පසුව නැවත උත්සාහ කරන්න.',
  'errors.sign.up.flow.initialization.failure':
    'ගිණුම් තැනීමේ ක්‍රියාවලිය ආරම්භ කිරීමේදී දෝෂයක් සිදු විය. කරුණාකර පසුව නැවත උත්සාහ කරන්න.',
  'errors.sign.up.components.not.available': 'ගිණුම් තැනීමේ පිටුව දැන් ලබා ගත නොහැකිය. කරුණාකර පසුව නැවත උත්සාහ කරන්න.',
  'errors.sign.in.components.not.available': 'ප්‍රවේශ වීමේ පිටුව දැන් ලබා ගත නොහැකිය. කරුණාකර පසුව නැවත උත්සාහ කරන්න.',
};

const metadata: I18nMetadata = {
  localeCode: 'si_LK',
  countryCode: 'LK',
  languageCode: 'si',
  displayName: 'සිංහල (ශ්‍රී ලංකාව)',
  direction: 'ltr',
};

const si_LK: I18nBundle = {
  metadata,
  translations,
};

export default si_LK;
