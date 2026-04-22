/**
 * nuxt.config.ts
 *
 * Sample Nuxt application using the @asgardeo/nuxt module.
 * Configuration is driven by environment variables so no secrets are
 * committed to source control.
 *
 * Usage:
 *   cd samples/nuxt-sdk-playground
 *   cp .env.example .env
 *   # fill in .env values
 *   pnpm dev
 */
export default defineNuxtConfig({
  modules: ['@asgardeo/nuxt'],

  asgardeo: {
    baseUrl: process.env['NUXT_PUBLIC_ASGARDEO_BASE_URL'] || '',
    clientId: process.env['NUXT_PUBLIC_ASGARDEO_CLIENT_ID'] || '',
    clientSecret: process.env['ASGARDEO_CLIENT_SECRET'] || '',
    sessionSecret: process.env['ASGARDEO_SESSION_SECRET'] || 'dev-only-secret-change-in-production',
    afterSignInUrl: '/',
    afterSignOutUrl: '/',
    scopes: ['openid', 'profile', 'email'],
  },

  devtools: {enabled: true},
  compatibilityDate: '2024-04-03',
});
