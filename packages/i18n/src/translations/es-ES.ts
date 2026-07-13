/**
 * Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com).
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

import { I18nTranslations, I18nMetadata, I18nBundle } from '../models/i18n';

const translations: I18nTranslations = {
  /* |---------------------------------------------------------------| */
  /* |                        Elements                               | */
  /* |---------------------------------------------------------------| */

  /* Buttons */
  'elements.buttons.signin.text': 'Iniciar sesión',
  'elements.buttons.signout.text': 'Cerrar sesión',
  'elements.buttons.signup.text': 'Registrarse',
  'elements.buttons.submit.text': 'Continuar',
  'elements.buttons.facebook.text': 'Continuar con Facebook',
  'elements.buttons.google.text': 'Continuar con Google',
  'elements.buttons.github.text': 'Continuar con GitHub',
  'elements.buttons.microsoft.text': 'Continuar con Microsoft',
  'elements.buttons.linkedin.text': 'Continuar con LinkedIn',
  'elements.buttons.ethereum.text': 'Continuar con Iniciar sesión con Ethereum',
  'elements.buttons.smsotp.text': 'Continuar con SMS OTP',
  'elements.buttons.multi.option.text': 'Continuar con {connection}',
  'elements.buttons.social.text': 'Continuar con {connection}',

  /* Display */
  'elements.display.divider.or_separator': 'O',
  'elements.display.copyable_text.copy': 'Copiar',
  'elements.display.copyable_text.copied': 'Copiado!',

  /* Fields */
  'elements.fields.generic.placeholder': 'Ingresa tu {field}',
  'elements.fields.username.label': 'Nombre de usuario',
  'elements.fields.username.placeholder': 'Ingresa tu nombre de usuario',
  'elements.fields.password.label': 'Contraseña',
  'elements.fields.password.placeholder': 'Ingresa tu Contraseña',
  'elements.fields.first_name.label': 'Nombre',
  'elements.fields.first_name.placeholder': 'Ingresa tu nombre',
  'elements.fields.last_name.label': 'Apellido',
  'elements.fields.last_name.placeholder': 'Ingresa tu apellido',
  'elements.fields.email.label': 'Correo electrónico',
  'elements.fields.email.placeholder': 'Correo electrónico',
  'elements.fields.organization.name.label': 'Nombre de la organización',
  'elements.fields.organization.handle.label': 'Identificador de la organización',
  'elements.fields.organization.description.label': 'Descripción de la organización',
  'elements.fields.organization.select.label': 'Seleccionar organización',
  'elements.fields.organization.select.placeholder': 'Elige una organización',

  /* Validation */
  'validations.required.field.error': 'Este campo es obligatorio',

  /* |---------------------------------------------------------------| */
  /* |                        Widgets                                | */
  /* |---------------------------------------------------------------| */

  /* Base Sign In */
  'signin.heading': 'Iniciar sesión',
  'signin.subheading': 'Bienvenido de nuevo! Por favor, inicia sesión para continuar.',

  /* Base Sign Up */
  'signup.heading': 'Regístrate',
  'signup.subheading': 'Crea una nueva cuenta para empezar.',

  /* Email OTP */
  'email.otp.heading': 'Verificación de OTP',
  'email.otp.subheading': 'Ingresa el código que te enviamos a tu correo electrónico.',
  'email.otp.buttons.submit.text': 'Continuar',

  /* Identifier First */
  'identifier.first.heading': 'Iniciar sesión',
  'identifier.first.subheading': 'Ingresa tu nombre de usuario o dirección de correo.',
  'identifier.first.buttons.submit.text': 'Continuar',

  /* SMS OTP */
  'sms.otp.heading': 'Verificación de OTP',
  'sms.otp.subheading': 'Ingresa el código que te enviaron a tu número de teléfono.',
  'sms.otp.buttons.submit.text': 'Continuar',

  /* TOTP */
  'totp.heading': 'Verifica tu identidad',
  'totp.subheading': 'Introduce el código de tu aplicación de autenticación.',
  'totp.buttons.submit.text': 'Continuar',

  /* Username Password */
  'username.password.heading': 'Iniciar sesión',
  'username.password.subheading': 'Ingresa tu usuario y contraseña para continuar.',
  'username.password.buttons.submit.text': 'Continuar',

  /* Passkeys */
  'passkey.button.use': 'Iniciar sesión con clave de acceso',
  'passkey.signin.heading': 'Iniciar sesión con clave de acceso',
  'passkey.register.heading': 'Registrar clave de acceso',
  'passkey.register.description': 'Crea una clave de acceso para iniciar sesión en tu cuenta de manera segura sin contraseña.',

  /* |---------------------------------------------------------------| */
  /* |                          User Profile                         | */
  /* |---------------------------------------------------------------| */

  'user.profile.heading': 'Perfil',
  'user.profile.update.generic.error': 'Ocurrió un error al actualizar tu perfil. Por favor, inténtalo de nuevo.',

  /* |---------------------------------------------------------------| */
  /* |                     Organization Switcher                     | */
  /* |---------------------------------------------------------------| */

  'organization.switcher.switch.organization': 'Cambiar de organización',
  'organization.switcher.loading.placeholder.organizations': 'Cargando organizaciones...',
  'organization.switcher.members': 'miembros',
  'organization.switcher.member': 'miembro',
  'organization.switcher.create.organization': 'Crear organización',
  'organization.switcher.manage.organizations': 'Administrar organizaciones',
  'organization.switcher.buttons.manage.text': 'Administrar',
  'organization.switcher.organizations.heading': 'Organizaciones',
  'organization.switcher.buttons.switch.text': 'Cambiar',
  'organization.switcher.no.access': 'Sin Acceso',
  'organization.switcher.status.label': 'Estatus:',
  'organization.switcher.showing.count': 'Mostrando {showing} de {total} organizaciones',
  'organization.switcher.buttons.refresh.text': 'Actualizar',
  'organization.switcher.buttons.load_more.text': 'Cargar más organizaciones',
  'organization.switcher.loading.more': 'Cargando...',
  'organization.switcher.no.organizations': 'No se encontraron organizaciones',
  'organization.switcher.error.prefix': 'Error:',

  'organization.profile.heading': 'Perfil de la organización',
  'organization.profile.loading': 'Cargando organización...',
  'organization.profile.error': 'No se pudo cargar la organización',

  'organization.create.heading': 'Crear organización',
  'organization.create.buttons.create_organization.text': 'Crear organización',
  'organization.create.buttons.create_organization.loading.text': 'Creando...',
  'organization.create.buttons.cancel.text': 'Cancelar',

  /* |---------------------------------------------------------------| */
  /* |                        Messages                               | */
  /* |---------------------------------------------------------------| */

  'messages.loading.placeholder': 'Cargando...',

  /* |---------------------------------------------------------------| */
  /* |                        Errors                                 | */
  /* |---------------------------------------------------------------| */

  'errors.heading': 'Error',
  'errors.signin.components.not.available': 'El formulario de inicio de sesión no está disponible en este momento. Por favor, inténtalo de nuevo más tarde.',
  'errors.signin.initialization': 'Ocurrió un error al iniciar. Por favor, inténtalo de nuevo más tarde.',
  'errors.signin.flow.failure': 'Ocurrió un error durante el proceso de inicio de sesión. Por favor, inténtalo de nuevo más tarde.',
  'errors.signin.flow.completion.failure':
    'Ocurrió un error al completar el proceso de inicio de sesión. Por favor, inténtalo de nuevo más tarde.',
  'errors.signin.flow.passkeys.failure': 'Ocurrió un error al iniciar sesión con clave de acceso. Por favor, inténtalo de nuevo más tarde.',
  'errors.signin.flow.passkeys.completion.failure':
    'Ocurrió un error al completar el inicio de sesión con claves de acceso. Por favor, intenta de nuevo más tarde.',
  'errors.signin.timeout': 'Se terminó el tiempo para completar el paso.',

  'errors.signup.initialization': 'Ocurrió un error al iniciar. Por favor, inténtalo de nuevo más tarde.',
  'errors.signup.flow.failure': 'Ocurrió un error durante el proceso de registro. Por favor, inténtalo de nuevo más tarde.',
  'errors.signup.flow.initialization.failure':
    'Ocurrió un error al iniciar el proceso de registro. Por favor, inténtalo de nuevo más tarde.',
  'errors.signup.components.not.available': 'El formulario de registro no está disponible en este momento. Por favor, inténtalo de nuevo más tarde.',
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
