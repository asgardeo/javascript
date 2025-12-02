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
  'elements.buttons.signIn': 'Iniciar Sessão',
  'elements.buttons.signOut': 'Terminar Sessão',
  'elements.buttons.signUp': 'Registar-se',
  'elements.buttons.facebook': 'Iniciar Sessão com Facebook',
  'elements.buttons.google': 'Iniciar Sessão com Google',
  'elements.buttons.github': 'Iniciar Sessão com GitHub',
  'elements.buttons.microsoft': 'Iniciar Sessão com Microsoft',
  'elements.buttons.linkedin': 'Iniciar Sessão com LinkedIn',
  'elements.buttons.ethereum': 'Iniciar Sessão com Ethereum',
  'elements.buttons.smsotp': 'Iniciar Sessão com SMS',
  'elements.buttons.multi.option': 'Iniciar Sessão com {connection}',
  'elements.buttons.social': 'Iniciar Sessão com {connection}',

  /* Fields */
  'elements.fields.placeholder': 'Introduza o seu {field}',
  'elements.fields.username': 'Nome de utilizador',
  'elements.fields.password': 'Palavra-passe',
  'elements.fields.ouName': 'Nome da Organização',
  'elements.fields.ouHandle': 'Identificador da Organização',
  'elements.fields.ouDescription': 'Descrição da Organização',

  /* Validation */
  'field.required': 'Este campo é obrigatório',

  /* |---------------------------------------------------------------| */
  /* |                        Widgets                                | */
  /* |---------------------------------------------------------------| */

  /* Base Sign In */
  'signin.title': 'Iniciar Sessão',
  'signin.subtitle': 'Introduza as suas credenciais para continuar.',

  /* Base Sign Up */
  'signup.title': 'Registar-se',
  'signup.subtitle': 'Crie uma nova conta para começar.',

  /* Email OTP */
  'email.otp.title': 'Verificação OTP',
  'email.otp.subtitle': 'Introduza o código enviado para o seu e-mail.',
  'email.otp.submit.button': 'Continuar',

  /* Identifier First */
  'identifier.first.title': 'Iniciar Sessão',
  'identifier.first.subtitle': 'Introduza o seu utilizador ou e-mail.',
  'identifier.first.submit.button': 'Continuar',

  /* SMS OTP */
  'sms.otp.title': 'Verificação OTP',
  'sms.otp.subtitle': 'Introduza o código enviado para o seu telemóvel.',
  'sms.otp.submit.button': 'Continuar',

  /* TOTP */
  'totp.title': 'Verifique a sua identidade',
  'totp.subtitle': 'Introduza o código da sua aplicação autenticadora.',
  'totp.submit.button': 'Continuar',

  /* Username Password */
  'username.password.submit.button': 'Continuar',
  'username.password.title': 'Iniciar Sessão',
  'username.password.subtitle': 'Introduza o seu utilizador e palavra-passe para continuar.',

  /* |---------------------------------------------------------------| */
  /* |                          User Profile                         | */
  /* |---------------------------------------------------------------| */

  'user.profile.title': 'Perfil',
  'user.profile.update.generic.error': 'Ocorreu um erro ao actualizar o seu perfil. Tente novamente.',

  /* |---------------------------------------------------------------| */
  /* |                     Organization Switcher                     | */
  /* |---------------------------------------------------------------| */

  'organization.switcher.select.organization': 'Escolher Organização',
  'organization.switcher.switch.organization': 'Trocar Organização',
  'organization.switcher.loading.organizations': 'A carregar organizações...',
  'organization.switcher.members': 'membros',
  'organization.switcher.member': 'membro',
  'organization.switcher.create.organization': 'Criar Organização',
  'organization.switcher.manage.organizations': 'Gerir Organizações',
  'organization.switcher.manage.button': 'Gerir',
  'organization.switcher.organizations.title': 'Organizações',
  'organization.switcher.switch.button': 'Trocar',
  'organization.switcher.no.access': 'Sem Acesso',
  'organization.switcher.status.label': 'Estado:',
  'organization.switcher.showing.count': 'A mostrar {showing} de {total} organizações',
  'organization.switcher.refresh.button': 'Actualizar',
  'organization.switcher.load.more': 'Carregar Mais Organizações',
  'organization.switcher.loading.more': 'A carregar...',
  'organization.switcher.no.organizations': 'Nenhuma organização encontrada',
  'organization.switcher.error.prefix': 'Erro:',
  'organization.profile.title': 'Perfil da Organização',
  'organization.profile.loading': 'A carregar organização...',
  'organization.profile.error': 'Falha ao carregar organização',

  'organization.create.title': 'Criar Organização',
  'organization.create.name.label': 'Nome da Organização',
  'organization.create.name.placeholder': 'Introduza o nome da organização',
  'organization.create.handle.label': 'Identificador da Organização',
  'organization.create.handle.placeholder': 'minha-organizacao',
  'organization.create.description.label': 'Descrição',
  'organization.create.description.placeholder': 'Introduza a descrição da organização',
  'organization.create.button': 'Criar Organização',
  'organization.create.creating': 'A criar...',
  'organization.create.cancel': 'Cancelar',

  /* |---------------------------------------------------------------| */
  /* |                        Messages                               | */
  /* |---------------------------------------------------------------| */

  'messages.loading': 'A carregar...',

  /* |---------------------------------------------------------------| */
  /* |                        Errors                                 | */
  /* |---------------------------------------------------------------| */

  'errors.title': 'Erro',
  'errors.sign.in.initialization': 'Ocorreu um erro ao inicializar. Tente novamente mais tarde.',
  'errors.sign.in.flow.failure': 'Ocorreu um erro durante o início de sessão. Tente novamente mais tarde.',
  'errors.sign.in.flow.completion.failure':
    'Ocorreu um erro ao completar o início de sessão. Tente novamente mais tarde.',
  'errors.sign.in.flow.passkeys.failure':
    'Ocorreu um erro ao iniciar sessão com as chaves de acesso (passkeys). Tente novamente mais tarde.',
  'errors.sign.in.flow.passkeys.completion.failure':
    'Ocorreu um erro ao completar o início de sessão com as chaves de acesso (passkeys). Tente novamente mais tarde.',
  'errors.sign.up.initialization': 'Ocorreu um erro durante a inicialização. Tente novamente mais tarde.',
  'errors.sign.up.flow.failure': 'Ocorreu um erro durante o fluxo de registo. Tente novamente mais tarde.',
  'errors.sign.up.flow.initialization.failure':
    'Ocorreu um erro ao inicializar o fluxo de registo. Tente novamente mais tarde.',
  'errors.sign.up.components.not.available':
    'O formulário de registo não está disponível de momento. Tente novamente mais tarde.',
  'errors.sign.in.components.not.available':
    'O formulário de início de sessão não está disponível de momento. Tente novamente mais tarde.',
};

const metadata: I18nMetadata = {
  localeCode: 'pt-PT',
  countryCode: 'PT',
  languageCode: 'pt',
  displayName: 'Português (Portugal)',
  direction: 'ltr',
};

const pt_PT: I18nBundle = {
  metadata,
  translations,
};

export default pt_PT;
