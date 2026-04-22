// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-04-19',

  devtools: {enabled: true},

  devServer: {
    https: true,
  },

  modules: ['@asgardeo/nuxt'],

  asgardeo: {
    // These can also be set via environment variables:
    // NUXT_PUBLIC_ASGARDEO_BASE_URL, NUXT_PUBLIC_ASGARDEO_CLIENT_ID, etc.
    scopes: ['openid', 'profile', 'email'],
    afterSignInUrl: '/',
    afterSignOutUrl: '/',
  },

  css: ['~/assets/css/main.css'],
});