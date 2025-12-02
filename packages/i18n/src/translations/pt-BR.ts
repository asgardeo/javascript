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
  'elements.buttons.signIn': 'Entrar',
  'elements.buttons.signOut': 'Sair',
  'elements.buttons.signUp': 'Cadastre-se',
  'elements.buttons.facebook': 'Entrar com Facebook',
  'elements.buttons.google': 'Entrar com Google',
  'elements.buttons.github': 'Entrar com GitHub',
  'elements.buttons.microsoft': 'Entrar com Microsoft',
  'elements.buttons.linkedin': 'Entrar com LinkedIn',
  'elements.buttons.ethereum': 'Entrar com Ethereum',
  'elements.buttons.smsotp': 'Entrar com SMS',
  'elements.buttons.multi.option': 'Entrar com {connection}',
  'elements.buttons.social': 'Entrar com {connection}',

  /* Fields */
  'elements.fields.placeholder': 'Digite seu {field}',
  'elements.fields.username': 'Nome de usuário',
  'elements.fields.password': 'Senha',
  'elements.fields.ouName': 'Nome da Organização',
  'elements.fields.ouHandle': 'Identificador da Organização',
  'elements.fields.ouDescription': 'Descrição da Organização',

  /* Validation */
  'field.required': 'Este campo é obrigatório',

  /* |---------------------------------------------------------------| */
  /* |                        Widgets                                | */
  /* |---------------------------------------------------------------| */

  /* Base Sign In */
  'signin.title': 'Entrar',
  'signin.subtitle': 'Digite suas credencias para continuar.',

  /* Base Sign Up */
  'signup.title': 'Cadastra-se',
  'signup.subtitle': 'Crie uma nova conta para iniciar.',

  /* Email OTP */
  'email.otp.title': 'Verificação OTP',
  'email.otp.subtitle': 'Digite o código enviado para seu e-mail.',
  'email.otp.submit.button': 'Continue',

  /* Identifier First */
  'identifier.first.title': 'Entrar',
  'identifier.first.subtitle': 'Digite seu usuário ou e-mail.',
  'identifier.first.submit.button': 'Continue',

  /* SMS OTP */
  'sms.otp.title': 'Verificação OTP',
  'sms.otp.subtitle': 'Digite o código enviado para seu telefone.',
  'sms.otp.submit.button': 'Continue',

  /* TOTP */
  'totp.title': 'Verifique sua identidade',
  'totp.subtitle': 'Digite o código do seu aplicativo autenticador.',
  'totp.submit.button': 'Continue',

  /* Username Password */
  'username.password.submit.button': 'Continue',
  'username.password.title': 'Entrar',
  'username.password.subtitle': 'Digite seu usuário e senha para continuar.',

  /* |---------------------------------------------------------------| */
  /* |                          User Profile                         | */
  /* |---------------------------------------------------------------| */

  'user.profile.title': 'Perfil',
  'user.profile.update.generic.error': 'Ocorreu um erro ao atualizar seu perfil. Tente novamente.',

  /* |---------------------------------------------------------------| */
  /* |                     Organization Switcher                     | */
  /* |---------------------------------------------------------------| */

  'organization.switcher.select.organization': 'Escolher Organização',
  'organization.switcher.switch.organization': 'Trocar Organização',
  'organization.switcher.loading.organizations': 'Carregando organizações...',
  'organization.switcher.members': 'membros',
  'organization.switcher.member': 'membro',
  'organization.switcher.create.organization': 'Criar Organização',
  'organization.switcher.manage.organizations': 'Gerenciar Organizações',
  'organization.switcher.manage.button': 'Gerenciar',
  'organization.switcher.organizations.title': 'Organizações',
  'organization.switcher.switch.button': 'Trocar',
  'organization.switcher.no.access': 'Sem Acesso',
  'organization.switcher.status.label': 'Situação:',
  'organization.switcher.showing.count': 'Exibindo {showing} de {total} organizações',
  'organization.switcher.refresh.button': 'Atualizar',
  'organization.switcher.load.more': 'Carregar Mais Organizações',
  'organization.switcher.loading.more': 'Carregando...',
  'organization.switcher.no.organizations': 'Nenhuma organização encontrada',
  'organization.switcher.error.prefix': 'Erro:',
  'organization.profile.title': 'Perfil da Organização',
  'organization.profile.loading': 'Carregando organização...',
  'organization.profile.error': 'Falha ao carregar organização',

  'organization.create.title': 'Criar Organização',
  'organization.create.name.label': 'Nome da Organização',
  'organization.create.name.placeholder': 'Digite o nome da organização',
  'organization.create.handle.label': 'Identificador da Organização',
  'organization.create.handle.placeholder': 'minha-organizacao',
  'organization.create.description.label': 'Descrição',
  'organization.create.description.placeholder': 'Digite a descrição da organização',
  'organization.create.button': 'Criar Organização',
  'organization.create.creating': 'Criando...',
  'organization.create.cancel': 'Cancelar',

  /* |---------------------------------------------------------------| */
  /* |                        Messages                               | */
  /* |---------------------------------------------------------------| */

  'messages.loading': 'Carregando...',

  /* |---------------------------------------------------------------| */
  /* |                        Errors                                 | */
  /* |---------------------------------------------------------------| */

  'errors.title': 'Erro',
  'errors.sign.in.initialization': 'Ocorreu um erro ao inicializar. Tente novamente mais tarde.',
  'errors.sign.in.flow.failure': 'Ocorreu um erro durante o login. Tente novamente mais tarde.',
  'errors.sign.in.flow.completion.failure': 'Ocorreu um erro ao completar o login. Tente novamente mais tarde.',
  'errors.sign.in.flow.passkeys.failure':
    'Ocorreu um erro ao entrar com as chaves de acesso (passkeys). Tente novamente mais tarde.',
  'errors.sign.in.flow.passkeys.completion.failure':
    'Ocorreu um erro ao completar o login com as chaves de acesso (passkeys). Tente novamente mais tarde.',
  'errors.sign.up.initialization': 'Ocorreu um erro durante a inicialização. Tente novamente mais tarde.',
  'errors.sign.up.flow.failure': 'Ocorreu um erro durante o fluxo de cadastro. Tente novamente mais tarde.',
  'errors.sign.up.flow.initialization.failure':
    'Ocorreu um erro ao inicializar o fluxo de cadastro. Tente novamente mais tarde.',
  'errors.sign.up.components.not.available':
    'O formulário de cadastro não está disponível no momento. Tente novamente mais tarde.',
  'errors.sign.in.components.not.available':
    'O formulário de login não está disponível no momento. Tente novamente mais tarde.',
};

const metadata: I18nMetadata = {
  localeCode: 'pt-BR',
  countryCode: 'BR',
  languageCode: 'pt',
  displayName: 'Português (Brazil)',
  direction: 'ltr',
};

const pt_BR: I18nBundle = {
  metadata,
  translations,
};

export default pt_BR;
