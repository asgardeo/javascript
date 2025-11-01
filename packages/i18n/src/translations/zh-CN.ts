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
  'elements.buttons.signIn': '登录',
  'elements.buttons.signOut': '登出',
  'elements.buttons.signUp': '注册',
  'elements.buttons.facebook': '使用 Facebook 登录',
  'elements.buttons.google': '使用 Google 登录',
  'elements.buttons.github': '使用 GitHub 登录',
  'elements.buttons.microsoft': '使用 Microsoft 登录',
  'elements.buttons.linkedin': '使用 LinkedIn 登录',
  'elements.buttons.ethereum': '使用 Ethereum 登录',
  'elements.buttons.smsotp': '使用短信 OTP 登录',
  'elements.buttons.multi.option': '使用 {connection} 登录',
  'elements.buttons.social': '使用 {connection} 登录',

  /* Fields */
  'elements.fields.placeholder': '请输入您的 {field}',
  'elements.fields.username': '用户名',
  'elements.fields.password': '密码',

  /* |---------------------------------------------------------------| */
  /* |                        Widgets                                | */
  /* |---------------------------------------------------------------| */

  /* Base Sign In */
  'signin.title': '登录',
  'signin.subtitle': '请输入您的凭证以继续。',

  /* Base Sign Up */
  'signup.title': '注册',
  'signup.subtitle': '创建一个新帐户以开始使用。',

  /* Email OTP */
  'email.otp.title': 'OTP 验证',
  'email.otp.subtitle': '请输入发送到您邮箱的验证码。',
  'email.otp.submit.button': '继续',

  /* Identifier First */
  'identifier.first.title': '登录',
  'identifier.first.subtitle': '请输入您的用户名或电子邮箱地址。',
  'identifier.first.submit.button': '继续',

  /* SMS OTP */
  'sms.otp.title': 'OTP 验证',
  'sms.otp.subtitle': '请输入发送到您手机号的验证码。',
  'sms.otp.submit.button': '继续',

  /* TOTP */
  'totp.title': '验证您的身份',
  'totp.subtitle': '请输入来自身份验证器应用的验证码。',
  'totp.submit.button': '继续',

  /* Username Password */
  'username.password.submit.button': '继续',
  'username.password.title': '登录',
  'username.password.subtitle': '请输入您的用户名和密码以继续。',

  /* |---------------------------------------------------------------| */
  /* |                          User Profile                         | */
  /* |---------------------------------------------------------------| */

  'user.profile.title': '个人资料',
  'user.profile.update.generic.error': '更新个人资料时发生错误。请重试。',

  /* |---------------------------------------------------------------| */
  /* |                     Organization Switcher                     | */
  /* |---------------------------------------------------------------| */

  'organization.switcher.select.organization': '选择组织',
  'organization.switcher.switch.organization': '切换组织',
  'organization.switcher.loading.organizations': '正在加载组织...',
  'organization.switcher.members': '成员',
  'organization.switcher.member': '成员',
  'organization.switcher.create.organization': '创建组织',
  'organization.switcher.manage.organizations': '管理组织',
  'organization.switcher.manage.button': '管理',
  'organization.switcher.organizations.title': '组织',
  'organization.switcher.switch.button': '切换',
  'organization.switcher.no.access': '无权限',
  'organization.switcher.status.label': '状态：',
  'organization.switcher.showing.count': '显示 {showing} / 共 {total} 个组织',
  'organization.switcher.refresh.button': '刷新',
  'organization.switcher.load.more': '加载更多组织',
  'organization.switcher.loading.more': '正在加载...',
  'organization.switcher.no.organizations': '未找到组织',
  'organization.switcher.error.prefix': '错误：',
  'organization.profile.title': '组织资料',
  'organization.profile.loading': '正在加载组织...',
  'organization.profile.error': '载入组织失败',

  'organization.create.title': '创建组织',
  'organization.create.name.label': '组织名称',
  'organization.create.name.placeholder': '请输入组织名称',
  'organization.create.handle.label': '组织标识',
  'organization.create.handle.placeholder': 'my-organization',
  'organization.create.description.label': '描述',
  'organization.create.description.placeholder': '请输入组织描述',
  'organization.create.button': '创建组织',
  'organization.create.creating': '正在创建...',
  'organization.create.cancel': '取消',

  /* |---------------------------------------------------------------| */
  /* |                        Messages                               | */
  /* |---------------------------------------------------------------| */

  'messages.loading': '加载中...',

  /* |---------------------------------------------------------------| */
  /* |                        Errors                                 | */
  /* |---------------------------------------------------------------| */

  'errors.title': '错误',
  'errors.sign.in.initialization': '初始化时发生错误。请稍后再试。',
  'errors.sign.in.flow.failure': '登录流程中发生错误。请稍后再试。',
  'errors.sign.in.flow.completion.failure': '完成登录流程时发生错误。请稍后再试。',
  'errors.sign.in.flow.passkeys.failure': '使用 passkeys 登录时发生错误。请稍后再试。',
  'errors.sign.in.flow.passkeys.completion.failure': '完成 passkeys 登录流程时发生错误。请稍后再试。',
};

const metadata: I18nMetadata = {
  localeCode: 'zh-CN',
  countryCode: 'CN',
  languageCode: 'zh',
  displayName: '简体中文 (中国)',
  direction: 'ltr',
};

const zh_CN: I18nBundle = {
  metadata,
  translations,
};

export default zh_CN;
