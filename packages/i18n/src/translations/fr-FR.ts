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
  'elements.buttons.signIn': 'Se connecter',
  'elements.buttons.signOut': 'Se déconnecter',
  'elements.buttons.signUp': "S'inscrire",
  'elements.buttons.facebook': 'Continuer avec Facebook',
  'elements.buttons.google': 'Continuer avec Google',
  'elements.buttons.github': 'Continuer avec GitHub',
  'elements.buttons.microsoft': 'Continuer avec Microsoft',
  'elements.buttons.linkedin': 'Continuer with LinkedIn',
  'elements.buttons.ethereum': 'Continuer avec Sign In Ethereum',
  'elements.buttons.smsotp': 'Continuer avec SMS',
  'elements.buttons.multi.option': 'Continuer avec {connection}',
  'elements.buttons.social': 'Continuer avec {connection}',

  /* Fields */
  'elements.fields.placeholder': 'Entrez votre {field}',
  'elements.fields.username': "Nom d'utilisateur",
  'elements.fields.password': 'Mot de passe',
  'elements.fields.ouName': 'Nom de l\'organisation',
  'elements.fields.ouHandle': 'Identifiant de l\'organisation',
  'elements.fields.ouDescription': 'Description de l\'organisation',

  /* Validation */
  'field.required': 'Ce champ est obligatoire',

  /* |---------------------------------------------------------------| */
  /* |                        Widgets                                | */
  /* |---------------------------------------------------------------| */

  /* Base Sign In */
  'signin.title': 'Se connecter',
  'signin.subtitle': 'Entrez vos identifiants pour continuer.',

  /* Base Sign Up */
  'signup.title': "S'inscrire",
  'signup.subtitle': 'Créez un nouveau compte pour commencer.',

  /* Email OTP */
  'email.otp.title': 'Vérification OTP',
  'email.otp.subtitle': 'Entrez le code envoyé à votre adresse e-mail.',
  'email.otp.submit.button': 'Continuer',

  /* Identifier First */
  'identifier.first.title': 'Se connecter',
  'identifier.first.subtitle': "Entrez votre nom d'utilisateur ou votre adresse e-mail.",
  'identifier.first.submit.button': 'Continuer',

  /* SMS OTP */
  'sms.otp.title': 'Vérification OTP',
  'sms.otp.subtitle': 'Entrez le code envoyé à votre numéro de téléphone.',
  'sms.otp.submit.button': 'Continuer',

  /* TOTP */
  'totp.title': 'Vérifiez votre identité',
  'totp.subtitle': "Entrez le code de votre application d'authentification.",
  'totp.submit.button': 'Continuer',

  /* Username Password */
  'username.password.submit.button': 'Continuer',
  'username.password.title': 'Se connecter',
  'username.password.subtitle': "Entrez votre nom d'utilisateur et votre mot de passe pour continuer.",

  /* |---------------------------------------------------------------| */
  /* |                          User Profile                         | */
  /* |---------------------------------------------------------------| */

  'user.profile.title': 'Profil',
  'user.profile.update.generic.error':
    'Une erreur est survenue lors de la mise à jour de votre profil. Veuillez réessayer.',

  /* |---------------------------------------------------------------| */
  /* |                     Organization Switcher                     | */
  /* |---------------------------------------------------------------| */

  'organization.switcher.select.organization': "Sélectionner l'organisation",
  'organization.switcher.switch.organization': "Changer d'organisation",
  'organization.switcher.loading.organizations': 'Chargement des organisations...',
  'organization.switcher.members': 'membres',
  'organization.switcher.member': 'membre',
  'organization.switcher.create.organization': 'Créer une organisation',
  'organization.switcher.manage.organizations': 'Gérer les organisations',
  'organization.switcher.manage.button': 'Gérer',
  'organization.switcher.organizations.title': 'Organisations',
  'organization.switcher.switch.button': 'Changer',
  'organization.switcher.no.access': 'Aucun accès',
  'organization.switcher.status.label': 'Statut:',
  'organization.switcher.showing.count': 'Affichage de {showing} sur {total} organisations',
  'organization.switcher.refresh.button': 'Rafraîchir',
  'organization.switcher.load.more': "Charger plus d'organisations",
  'organization.switcher.loading.more': 'Chargement...',
  'organization.switcher.no.organizations': 'Aucune organisation trouvée',
  'organization.switcher.error.prefix': 'Erreur:',
  'organization.profile.title': "Profil de l'organisation",
  'organization.profile.loading': "Chargement de l'organisation...",
  'organization.profile.error': "Échec du chargement de l'organisation",

  'organization.create.title': 'Créer une organisation',
  'organization.create.name.label': "Nom de l'organisation",
  'organization.create.name.placeholder': "Entrez le nom de l'organisation",
  'organization.create.handle.label': "Identifiant de l'organisation",
  'organization.create.handle.placeholder': 'mon-organisation',
  'organization.create.description.label': 'Description',
  'organization.create.description.placeholder': "Entrez la description de l'organisation",
  'organization.create.button': 'Créer une organisation',
  'organization.create.creating': 'Création en cours...',
  'organization.create.cancel': 'Annuler',

  /* |---------------------------------------------------------------| */
  /* |                        Messages                               | */
  /* |---------------------------------------------------------------| */

  'messages.loading': 'Chargement...',

  /* |---------------------------------------------------------------| */
  /* |                        Errors                                 | */
  /* |---------------------------------------------------------------| */

  'errors.title': 'Erreur',
  'errors.sign.in.initialization': "Une erreur est survenue lors de l'initialisation. Veuillez réessayer plus tard.",
  'errors.sign.in.flow.failure': 'Une erreur est survenue lors du flux de connexion. Veuillez réessayer plus tard.',
  'errors.sign.in.flow.completion.failure':
    'Une erreur est survenue lors de la finalisation du flux de connexion. Veuillez réessayer plus tard.',
  'errors.sign.in.flow.passkeys.failure':
    "Une erreur est survenue lors de la connexion avec les clefs d'accès. Veuillez réessayer plus tard.",
  'errors.sign.in.flow.passkeys.completion.failure':
    "Une erreur est survenue lors de la finalisation du flux de connexion avec les clefs d'accès. Veuillez réessayer plus tard.",
  'errors.sign.up.initialization': "Une erreur est survenue lors de l'initialisation. Veuillez réessayer plus tard.",
  'errors.sign.up.flow.failure': "Une erreur est survenue lors du flux d'inscription. Veuillez réessayer plus tard.",
  'errors.sign.up.flow.initialization.failure':
    "Une erreur est survenue lors de l'initialisation du flux d'inscription. Veuillez réessayer plus tard.",
  'errors.sign.up.components.not.available':
    "Le formulaire d'inscription n'est pas disponible pour le moment. Veuillez réessayer plus tard.",
  'errors.sign.in.components.not.available':
    "Le formulaire de connexion n'est pas disponible pour le moment. Veuillez réessayer plus tard.",
};

const metadata: I18nMetadata = {
  localeCode: 'fr-FR',
  countryCode: 'FR',
  languageCode: 'fr',
  displayName: 'Français (France)',
  direction: 'ltr',
};

const fr_FR: I18nBundle = {
  metadata,
  translations,
};

export default fr_FR;
