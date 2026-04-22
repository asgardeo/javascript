/**
 * Playground nuxt.config.ts
 *
 * Loads the local @asgardeo/nuxt module directly from the workspace.
 * Configuration is driven by environment variables so no secrets are
 * committed to source control.
 *
 * Usage:
 *   cd packages/nuxt
 *   cp playground/.env.example playground/.env
 *   # fill in .env values
 *   pnpm nuxi dev playground
 */
export default defineNuxtConfig({
  modules: ['../src/module'],

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
