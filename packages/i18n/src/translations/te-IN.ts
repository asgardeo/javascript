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
  'elements.buttons.signIn': 'సైన్ ఇన్ చేయండి',
  'elements.buttons.signOut': 'సైన్ అవుట్ చేయండి',
  'elements.buttons.signUp': 'సైన్ అప్ చేయండి',
  'elements.buttons.facebook': 'Facebook తో కొనసాగించండి',
  'elements.buttons.google': 'Google తో కొనసాగించండి',
  'elements.buttons.github': 'GitHub తో కొనసాగించండి',
  'elements.buttons.microsoft': 'Microsoft తో కొనసాగించండి',
  'elements.buttons.linkedin': 'LinkedIn తో కొనసాగించండి',
  'elements.buttons.ethereum': 'Ethereum తో సైన్ ఇన్ చేయండి',
  'elements.buttons.smsotp': 'SMS తో కొనసాగించండి',
  'elements.buttons.multi.option': '{connection} తో కొనసాగించండి',
  'elements.buttons.social': '{connection} తో కొనసాగించండి',

  /* Fields */
  'elements.fields.placeholder': 'మీ {field} ను నమోదు చేయండి',
  'elements.fields.username': 'వినియోగదారు పేరు',
  'elements.fields.password': 'పాస్వర్డ్',
  'elements.fields.ouName': 'సంస్థ పేరు',
  'elements.fields.ouHandle': 'సంస్థ హ్యాండిల్',
  'elements.fields.ouDescription': 'సంస్థ వివరణ',

  /* Validation */
  'field.required': 'ఈ ఫీల్డ్ అవసరం',

  /* |---------------------------------------------------------------| */
  /* |                        Widgets                                | */
  /* |---------------------------------------------------------------| */

  /* Base Sign In */
  'signin.title': 'సైన్ ఇన్ చేయండి',
  'signin.subtitle': 'కొనసాగించడానికి మీ వివరాలు ఇవ్వండి.',

  /* Base Sign Up */
  'signup.title': 'సైన్ అప్ చేయండి',
  'signup.subtitle': 'కొత్త అకౌంట్ సృష్టించండి.',

  /* Email OTP */
  'email.otp.title': 'OTP వెరిఫికేషన్',
  'email.otp.subtitle': 'మీ ఇమెయిల్‌కి పంపిన కోడ్‌ను నమోదు చేయండి.',
  'email.otp.submit.button': 'కొనసాగించండి',

  /* Identifier First */
  'identifier.first.title': 'సైన్ ఇన్ చేయండి',
  'identifier.first.subtitle': 'మీ యూజర్ పేరు లేదా ఇమెయిల్ ఇవ్వండి.',
  'identifier.first.submit.button': 'కొనసాగించండి',

  /* SMS OTP */
  'sms.otp.title': 'OTP వెరిఫికేషన్',
  'sms.otp.subtitle': 'మీ ఫోన్ నంబర్‌కి పంపిన కోడ్‌ను నమోదు చేయండి.',
  'sms.otp.submit.button': 'కొనసాగించండి',

  /* TOTP */
  'totp.title': 'మీ గుర్తింపును ధృవీకరించండి',
  'totp.subtitle': 'మీ ఆథెంటికేటర్ యాప్‌లోని కోడ్‌ను నమోదు చేయండి.',
  'totp.submit.button': 'కొనసాగించండి',

  /* Username Password */
  'username.password.submit.button': 'కొనసాగించండి',
  'username.password.title': 'సైన్ ఇన్ చేయండి',
  'username.password.subtitle': 'మీ యూజర్ పేరు మరియు పాస్‌వర్డ్ ఇవ్వండి.',

  /* |---------------------------------------------------------------| */
  /* |                          User Profile                         | */
  /* |---------------------------------------------------------------| */

  'user.profile.title': 'ప్రొఫైల్',
  'user.profile.update.generic.error': 'ప్రొఫైల్ అప్‌డేట్ చేస్తూ లోపం వచ్చింది. దయచేసి మళ్లీ ప్రయత్నించండి.',

  /* |---------------------------------------------------------------| */
  /* |                     Organization Switcher                     | */
  /* |---------------------------------------------------------------| */

  'organization.switcher.select.organization': 'ఆర్గనైజేషన్‌ను ఎంచుకోండి',
  'organization.switcher.switch.organization': 'ఆర్గనైజేషన్ మార్చండి',
  'organization.switcher.loading.organizations': 'ఆర్గనైజేషన్‌లు లోడ్ అవుతున్నాయి...',
  'organization.switcher.members': 'సభ్యులు',
  'organization.switcher.member': 'సభ్యుడు',
  'organization.switcher.create.organization': 'ఆర్గనైజేషన్ సృష్టించండి',
  'organization.switcher.manage.organizations': 'ఆర్గనైజేషన్‌లను నిర్వహించండి',
  'organization.switcher.manage.button': 'నిర్వహించండి',
  'organization.switcher.organizations.title': 'ఆర్గనైజేషన్‌లు',
  'organization.switcher.switch.button': 'మార్చండి',
  'organization.switcher.no.access': 'యాక్సెస్ లేదు',
  'organization.switcher.status.label': 'స్టేటస్:',
  'organization.switcher.showing.count': '{total} లో {showing} ఆర్గనైజేషన్‌లు చూపుతున్నాయి',
  'organization.switcher.refresh.button': 'రిఫ్రెష్ చేయండి',
  'organization.switcher.load.more': 'మరిన్ని ఆర్గనైజేషన్‌లను లోడ్ చేయండి',
  'organization.switcher.loading.more': 'లోడ్ అవుతోంది...',
  'organization.switcher.no.organizations': 'ఏ ఆర్గనైజేషన్‌లు లభించలేదు',
  'organization.switcher.error.prefix': 'లోపం:',
  'organization.profile.title': 'ఆర్గనైజేషన్ ప్రొఫైల్',
  'organization.profile.loading': 'లోడ్ అవుతోంది...',
  'organization.profile.error': 'ఆర్గనైజేషన్‌ను లోడ్ చేయడం విఫలమైంది',

  'organization.create.title': 'ఆర్గనైజేషన్ సృష్టించండి',
  'organization.create.name.label': 'ఆర్గనైజేషన్ పేరు',
  'organization.create.name.placeholder': 'ఆర్గనైజేషన్ పేరు ఇవ్వండి',
  'organization.create.handle.label': 'ఆర్గనైజేషన్ హ్యాండిల్',
  'organization.create.handle.placeholder': 'నా-ఆర్గనైజేషన్',
  'organization.create.description.label': 'వివరణ',
  'organization.create.description.placeholder': 'వివరణ ఇవ్వండి',
  'organization.create.button': 'సృష్టించండి',
  'organization.create.creating': 'సృష్టిస్తోంది...',
  'organization.create.cancel': 'రద్దు చేయండి',

  /* |---------------------------------------------------------------| */
  /* |                        Messages                               | */
  /* |---------------------------------------------------------------| */

  'messages.loading': 'లోడ్ అవుతోంది...',

  /* |---------------------------------------------------------------| */
  /* |                        Errors                                 | */
  /* |---------------------------------------------------------------| */

  'errors.title': 'లోపం',
  'errors.sign.in.initialization': 'ప్రారంభించేటప్పుడు లోపం వచ్చింది. దయచేసి తరువాత మళ్లీ ప్రయత్నించండి.',
  'errors.sign.in.flow.failure': 'సైన్ ఇన్ ప్రక్రియలో లోపం వచ్చింది. దయచేసి తరువాత మళ్లీ ప్రయత్నించండి.',
  'errors.sign.in.flow.completion.failure': 'సైన్ ఇన్ పూర్తి చేయడంలో లోపం వచ్చింది. దయచేసి తరువాత మళ్లీ ప్రయత్నించండి.',
  'errors.sign.in.flow.passkeys.failure':
    'పాస్‌కీలతో సైన్ ఇన్ చేస్తూ లోపం వచ్చింది. దయచేసి తరువాత మళ్లీ ప్రయత్నించండి.',
  'errors.sign.in.flow.passkeys.completion.failure':
    'పాస్‌కీ సైన్ ఇన్ పూర్తి చేయడంలో లోపం వచ్చింది. దయచేసి తరువాత మళ్లీ ప్రయత్నించండి.',
  'errors.sign.up.initialization': 'ప్రారంభించేటప్పుడు లోపం వచ్చింది. దయచేసి తరువాత మళ్లీ ప్రయత్నించండి.',
  'errors.sign.up.flow.failure': 'సైన్ అప్ ప్రక్రియలో లోపం వచ్చింది. దయచేసి తరువాత మళ్లీ ప్రయత్నించండి.',
  'errors.sign.up.flow.initialization.failure':
    'సైన్ అప్ ప్రక్రియను ప్రారంభించేటప్పుడు లోపం వచ్చింది. దయచేసి తరువాత మళ్లీ ప్రయత్నించండి.',
  'errors.sign.up.components.not.available':
    'సైన్ అప్ ఫారం ప్రస్తుతం అందుబాటులో లేదు. దయచేసి తరువాత మళ్లీ ప్రయత్నించండి.',
  'errors.sign.in.components.not.available':
    'సైన్ ఇన్ ఫారం ప్రస్తుతం అందుబాటులో లేదు. దయచేసి తరువాత మళ్లీ ప్రయత్నించండి.',
};

const metadata: I18nMetadata = {
  localeCode: 'te-IN',
  countryCode: 'IN',
  languageCode: 'te',
  displayName: 'తెలుగు (భారతదేశం)',
  direction: 'ltr',
};

const te_IN: I18nBundle = {
  metadata,
  translations,
};

export default te_IN;
