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
  'elements.buttons.signIn': 'ログイン',
  'elements.buttons.signOut': 'ログアウト',
  'elements.buttons.signUp': 'サインアップ',
  'elements.buttons.facebook': 'Facebookで続行',
  'elements.buttons.google': 'Googleで続行',
  'elements.buttons.github': 'GitHubで続行',
  'elements.buttons.microsoft': 'Microsoftで続行',
  'elements.buttons.linkedin': 'LinkedInで続行',
  'elements.buttons.ethereum': 'Ethereumでサインイン',
  'elements.buttons.smsotp': 'SMSで続行',
  'elements.buttons.multi.option': '{connection}で続行',
  'elements.buttons.social': '{connection}で続行',

  /* Fields */
  'elements.fields.placeholder': '{field}を入力してください',
  'elements.fields.username': 'ユーザー名',
  'elements.fields.password': 'パスワード',
  'elements.fields.ouName': '組織名',
  'elements.fields.ouHandle': '組織ハンドル',
  'elements.fields.ouDescription': '組織の説明',

  /* Validation */
  'field.required': 'この項目は必須です',

  /* |---------------------------------------------------------------| */
  /* |                        Widgets                                | */
  /* |---------------------------------------------------------------| */

  /* Base Sign In */
  'signin.title': 'ログイン',
  'signin.subtitle': '続行するには認証情報を入力してください。',

  /* Base Sign Up */
  'signup.title': 'サインアップ',
  'signup.subtitle': 'はじめるには新しいアカウントを作成してください。',

  /* Email OTP */
  'email.otp.title': 'OTP認証',
  'email.otp.subtitle': 'メールに送信されたコードを入力してください。',
  'email.otp.submit.button': '続行',

  /* Identifier First */
  'identifier.first.title': 'ログイン',
  'identifier.first.subtitle': 'ユーザー名またはメールアドレスを入力してください。',
  'identifier.first.submit.button': '続行',

  /* SMS OTP */
  'sms.otp.title': 'OTP認証',
  'sms.otp.subtitle': '電話番号に送信されたコードを入力してください。',
  'sms.otp.submit.button': '続行',

  /* TOTP */
  'totp.title': '本人確認',
  'totp.subtitle': '認証アプリのコードを入力してください。',
  'totp.submit.button': '続行',

  /* Username Password */
  'username.password.submit.button': '続行',
  'username.password.title': 'ログイン',
  'username.password.subtitle': 'ユーザー名とパスワードを入力してください。',

  /* |---------------------------------------------------------------| */
  /* |                          User Profile                         | */
  /* |---------------------------------------------------------------| */

  'user.profile.title': 'プロフィール',
  'user.profile.update.generic.error': 'プロフィール更新中にエラーが発生しました。もう一度お試しください。',

  /* |---------------------------------------------------------------| */
  /* |                     Organization Switcher                     | */
  /* |---------------------------------------------------------------| */

  'organization.switcher.select.organization': '組織を選択',
  'organization.switcher.switch.organization': '組織を切り替え',
  'organization.switcher.loading.organizations': '組織を読み込み中…',
  'organization.switcher.members': 'メンバー',
  'organization.switcher.member': 'メンバー',
  'organization.switcher.create.organization': '組織を作成',
  'organization.switcher.manage.organizations': '組織を管理',
  'organization.switcher.manage.button': '管理',
  'organization.switcher.organizations.title': '組織',
  'organization.switcher.switch.button': '切り替え',
  'organization.switcher.no.access': 'アクセス権がありません',
  'organization.switcher.status.label': 'ステータス:',
  'organization.switcher.showing.count': '全{total}件中{showing}件を表示',
  'organization.switcher.refresh.button': '更新',
  'organization.switcher.load.more': 'さらに読み込む',
  'organization.switcher.loading.more': '読み込み中…',
  'organization.switcher.no.organizations': '組織が見つかりません',
  'organization.switcher.error.prefix': 'エラー:',
  'organization.profile.title': '組織プロファイル',
  'organization.profile.loading': '組織を読み込み中…',
  'organization.profile.error': '組織の読み込みに失敗しました',

  'organization.create.title': '組織の作成',
  'organization.create.name.label': '組織名',
  'organization.create.name.placeholder': '組織名を入力',
  'organization.create.handle.label': '組織ハンドル',
  'organization.create.handle.placeholder': 'my-organization',
  'organization.create.description.label': '説明',
  'organization.create.description.placeholder': '組織の説明を入力',
  'organization.create.button': '組織を作成',
  'organization.create.creating': '作成中…',
  'organization.create.cancel': 'キャンセル',

  /* |---------------------------------------------------------------| */
  /* |                        Messages                               | */
  /* |---------------------------------------------------------------| */

  'messages.loading': '読み込み中…',

  /* |---------------------------------------------------------------| */
  /* |                        Errors                                 | */
  /* |---------------------------------------------------------------| */

  'errors.title': 'エラー',
  'errors.sign.in.initialization': '初期化中にエラーが発生しました。後でもう一度お試しください。',
  'errors.sign.in.flow.failure': 'サインイン処理中にエラーが発生しました。後でもう一度お試しください。',
  'errors.sign.in.flow.completion.failure':
    'サインイン処理の完了中にエラーが発生しました。後でもう一度お試しください。',
  'errors.sign.in.flow.passkeys.failure':
    'パスキーでのサインイン中にエラーが発生しました。後でもう一度お試しください。',
  'errors.sign.in.flow.passkeys.completion.failure':
    'パスキーによるサインイン完了中にエラーが発生しました。後でもう一度お試しください。',
  'errors.sign.up.initialization': '初期化中にエラーが発生しました。後でもう一度お試しください。',
  'errors.sign.up.flow.failure': 'サインアップフロー中にエラーが発生しました。後でもう一度お試しください。',
  'errors.sign.up.flow.initialization.failure':
    'サインアップフローの初期化中にエラーが発生しました。後でもう一度お試しください。',
  'errors.sign.up.components.not.available': 'サインアップフォームは現在利用できません。後でもう一度お試しください。',
  'errors.sign.in.components.not.available': 'サインインフォームは現在利用できません。後でもう一度お試しください。',
};

const metadata: I18nMetadata = {
  localeCode: 'ja-JP',
  countryCode: 'JP',
  languageCode: 'ja',
  displayName: '日本語 (日本)',
  direction: 'ltr',
};

const ja_JP: I18nBundle = {
  metadata,
  translations,
};

export default ja_JP;
