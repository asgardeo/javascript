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
  'elements.buttons.signIn': 'Iniciar Sesión',
  'elements.buttons.signOut': 'Cerrar Sesión',
  'elements.buttons.signUp': 'Registrarse',
  'elements.buttons.facebook': 'Continuar con Facebook',
  'elements.buttons.google': 'Continuar con Google',
  'elements.buttons.github': 'Continuar con GitHub',
  'elements.buttons.microsoft': 'Continuar con Microsoft',
  'elements.buttons.linkedin': 'Continuar con LinkedIn',
  'elements.buttons.ethereum': 'Continuar con Sign In Ethereum',
  'elements.buttons.smsotp': 'Continuar con SMS OTP',
  'elements.buttons.multi.option': 'Continuar con {connection}',
  'elements.buttons.social': 'Continuar con {connection}',

  /* Fields */
  'elements.fields.placeholder': 'Introduce tu {field}',
  'elements.fields.username': 'Nombre de usuario',
  'elements.fields.password': 'Contraseña',

  /* |---------------------------------------------------------------| */
  /* |                        Widgets                                | */
  /* |---------------------------------------------------------------| */

  /* Base Sign In */
  'signin.title': 'Iniciar Sesión',
  'signin.subtitle': 'Introduce tus credenciales para continuar.',

  /* Base Sign Up */
  'signup.title': 'Registrarse',
  'signup.subtitle': 'Crea una nueva cuenta para comenzar.',

  /* Email OTP */
  'email.otp.title': 'Verificación OTP',
  'email.otp.subtitle': 'Introduce el código enviado a tu dirección de correo electrónico.',
  'email.otp.submit.button': 'Continuar',

  /* Identifier First */
  'identifier.first.title': 'Iniciar Sesión',
  'identifier.first.subtitle': 'Introduce tu nombre de usuario o correo electrónico.',
  'identifier.first.submit.button': 'Continuar',

  /* SMS OTP */
  'sms.otp.title': 'Verificación OTP',
  'sms.otp.subtitle': 'Introduce el código enviado a tu número de teléfono.',
  'sms.otp.submit.button': 'Continuar',

  /* TOTP */
  'totp.title': 'Verifica tu Identidad',
  'totp.subtitle': 'Introduce el código de tu aplicación de autenticación.',
  'totp.submit.button': 'Continuar',

  /* Username Password */
  'username.password.submit.button': 'Continuar',
  'username.password.title': 'Iniciar Sesión',
  'username.password.subtitle': 'Introduce tu nombre de usuario y contraseña para continuar.',

  /* |---------------------------------------------------------------| */
  /* |                          User Profile                         | */
  /* |---------------------------------------------------------------| */

  'user.profile.title': 'Perfil',
  'user.profile.update.generic.error': 'Se produjo un error al actualizar tu perfil. Por favor, inténtalo de nuevo.',

  /* |---------------------------------------------------------------| */
  /* |                     Organization Switcher                     | */
  /* |---------------------------------------------------------------| */

  'organization.switcher.select.organization': 'Seleccionar Organización',
  'organization.switcher.switch.organization': 'Cambiar Organización',
  'organization.switcher.loading.organizations': 'Cargando organizaciones...',
  'organization.switcher.members': 'miembros',
  'organization.switcher.member': 'miembro',
  'organization.switcher.create.organization': 'Crear Organización',
  'organization.switcher.manage.organizations': 'Gestionar Organizaciones',
  'organization.switcher.manage.button': 'Gestionar',
  'organization.switcher.organizations.title': 'Organizaciones',
  'organization.switcher.switch.button': 'Cambiar',
  'organization.switcher.no.access': 'Sin Acceso',
  'organization.switcher.status.label': 'Estado:',
  'organization.switcher.showing.count': 'Mostrando {showing} de {total} organizaciones',
  'organization.switcher.refresh.button': 'Actualizar',
  'organization.switcher.load.more': 'Cargar Más Organizaciones',
  'organization.switcher.loading.more': 'Cargando...',
  'organization.switcher.no.organizations': 'No se encontraron organizaciones',
  'organization.switcher.error.prefix': 'Error:',
  'organization.profile.title': 'Perfil de la Organización',
  'organization.profile.loading': 'Cargando organización...',
  'organization.profile.error': 'Error al cargar la organización',

  'organization.create.title': 'Crear Organización',
  'organization.create.name.label': 'Nombre de la Organización',
  'organization.create.name.placeholder': 'Introduce el nombre de la organización',
  'organization.create.handle.label': 'Identificador de la Organización',
  'organization.create.handle.placeholder': 'mi-organizacion',
  'organization.create.description.label': 'Descripción',
  'organization.create.description.placeholder': 'Introduce la descripción de la organización',
  'organization.create.button': 'Crear Organización',
  'organization.create.creating': 'Creando...',
  'organization.create.cancel': 'Cancelar',

  /* |---------------------------------------------------------------| */
  /* |                        Messages                               | */
  /* |---------------------------------------------------------------| */

  'messages.loading': 'Cargando...',

  /* |---------------------------------------------------------------| */
  /* |                        Errors                                 | */
  /* |---------------------------------------------------------------| */

  'errors.title': 'Error',
  'errors.sign.in.initialization': 'Se produjo un error durante la inicialización. Por favor, inténtalo más tarde.',
  'errors.sign.in.flow.failure': 'Se produjo un error durante el proceso de inicio de sesión. Por favor, inténtalo más tarde.',
  'errors.sign.in.flow.completion.failure': 'Se produjo un error al completar el proceso de inicio de sesión. Por favor, inténtalo más tarde.',
  'errors.sign.in.flow.passkeys.failure': 'Se produjo un error al iniciar sesión con passkeys. Por favor, inténtalo más tarde.',
  'errors.sign.in.flow.passkeys.completion.failure': 'Se produjo un error al completar el inicio de sesión con passkeys. Por favor, inténtalo más tarde.',
};

const metadata: I18nMetadata = {
  localeCode: 'es-ES',
  countryCode: 'ES',
  languageCode: 'es',
  displayName: 'Español (España)',
  direction: 'ltr',
};

const es_ES: I18nBundle = {
  metadata,
  translations,
};

export default es_ES;
