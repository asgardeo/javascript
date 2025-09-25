import { I18nTranslations, I18nMetadata, I18nBundle } from '../models/i18n';

const translations: I18nTranslations = {
  
  'elements.buttons.signIn': 'साइन इन',
  'elements.buttons.signOut': 'साइन आउट',
  'elements.buttons.signUp': 'साइन अप',
  'elements.buttons.facebook': 'Facebook के साथ जारी रखें',
  'elements.buttons.google': 'Google के साथ जारी रखें',
  'elements.buttons.github': 'GitHub के साथ जारी रखें',
  'elements.buttons.microsoft': 'Microsoft के साथ जारी रखें',
  'elements.buttons.linkedin': 'LinkedIn के साथ जारी रखें',
  'elements.buttons.ethereum': 'Ethereum के साथ साइन इन करें',
  'elements.buttons.multi.option': '{connection} के साथ जारी रखें',
  'elements.buttons.social': '{connection} के साथ जारी रखें',

  'elements.fields.placeholder': '{field} दर्ज करें',

  
  'signin.title': 'साइन इन',
  'signin.subtitle': 'जारी रखने के लिए अपनी प्रमाणिक जानकारी दर्ज करें।',

  'signup.title': 'साइन अप',
  'signup.subtitle': 'शुरू करने के लिए नया खाता बनाएं।',

  'email.otp.title': 'OTP सत्यापन',
  'email.otp.subtitle': 'अपनी ईमेल पर भेजा गया कोड दर्ज करें।',
  'email.otp.submit.button': 'जारी रखें',

  'identifier.first.title': 'साइन इन',
  'identifier.first.subtitle': 'अपना उपयोगकर्ता नाम या ईमेल दर्ज करें।',
  'identifier.first.submit.button': 'जारी रखें',

  'sms.otp.title': 'OTP सत्यापन',
  'sms.otp.subtitle': 'अपने फ़ोन नंबर पर भेजा गया कोड दर्ज करें।',
  'sms.otp.submit.button': 'जारी रखें',

  'totp.title': 'अपनी पहचान सत्यापित करें',
  'totp.subtitle': 'अपने ऑथेंटिकेटर ऐप से कोड दर्ज करें।',
  'totp.submit.button': 'जारी रखें',

  'username.password.submit.button': 'जारी रखें',
  'username.password.title': 'साइन इन',
  'username.password.subtitle': 'अपना उपयोगकर्ता नाम और पासवर्ड दर्ज करें।',

  
  'user.profile.title': 'प्रोफ़ाइल',
  'user.profile.update.generic.error': 'प्रोफ़ाइल अपडेट करते समय त्रुटि हुई। कृपया पुनः प्रयास करें।',

  
  'organization.switcher.select.organization': 'संगठन चुनें',
  'organization.switcher.switch.organization': 'संगठन बदलें',
  'organization.switcher.loading.organizations': 'संगठन लोड हो रहे हैं...',
  'organization.switcher.members': 'सदस्य',
  'organization.switcher.member': 'सदस्य',
  'organization.switcher.create.organization': 'संगठन बनाएं',
  'organization.switcher.manage.organizations': 'संगठनों का प्रबंधन करें',
  'organization.switcher.manage.button': 'प्रबंधित करें',
  'organization.switcher.organizations.title': 'संगठन',
  'organization.switcher.switch.button': 'बदलें',
  'organization.switcher.no.access': 'कोई पहुँच नहीं',
  'organization.switcher.status.label': 'स्थिति:',
  'organization.switcher.showing.count': '{total} में से {showing} संगठन दिखा रहे हैं',
  'organization.switcher.refresh.button': 'रिफ्रेश',
  'organization.switcher.load.more': 'और संगठन लोड करें',
  'organization.switcher.loading.more': 'लोड हो रहा है...',
  'organization.switcher.no.organizations': 'कोई संगठन नहीं मिला',
  'organization.switcher.error.prefix': 'त्रुटि:',

  'organization.profile.title': 'संगठन प्रोफ़ाइल',
  'organization.profile.loading': 'संगठन लोड हो रहा है...',
  'organization.profile.error': 'संगठन लोड करने में विफल',

  'organization.create.title': 'संगठन बनाएं',
  'organization.create.name.label': 'संगठन का नाम',
  'organization.create.name.placeholder': 'संगठन का नाम दर्ज करें',
  'organization.create.handle.label': 'संगठन हैंडल',
  'organization.create.handle.placeholder': 'my-organization',
  'organization.create.description.label': 'विवरण',
  'organization.create.description.placeholder': 'संगठन विवरण दर्ज करें',
  'organization.create.button': 'संगठन बनाएं',
  'organization.create.creating': 'बनाया जा रहा है...',
  'organization.create.cancel': 'रद्द करें',

  
  'messages.loading': 'लोड हो रहा है...',

  
  'errors.title': 'त्रुटि',
  'errors.sign.in.initialization': 'इनिशियलाइज़ेशन में त्रुटि हुई। कृपया बाद में पुनः प्रयास करें।',
  'errors.sign.in.flow.failure': 'साइन-इन प्रक्रिया में त्रुटि। कृपया बाद में पुनः प्रयास करें।',
  'errors.sign.in.flow.completion.failure': 'साइन-इन प्रक्रिया पूरी करते समय त्रुटि। कृपया बाद में पुनः प्रयास करें।',
  'errors.sign.in.flow.passkeys.failure': 'पासकीज़ के साथ साइन-इन करते समय त्रुटि।',
  'errors.sign.in.flow.passkeys.completion.failure': 'पासकीज़ साइन-इन पूरी करते समय त्रुटि।',
};

const metadata: I18nMetadata = {
  localeCode: 'hi-IN',
  countryCode: 'IN',
  languageCode: 'hi',
  displayName: 'हिन्दी (भारत)',
  direction: 'ltr',
};

const hi_IN: I18nBundle = {
  metadata,
  translations,
};

export default hi_IN;
