export default defineNuxtConfig({
  modules: ['@asgardeo/nuxt', '@nuxtjs/tailwindcss'],

  asgardeo: {
    baseUrl: process.env.NUXT_PUBLIC_ASGARDEO_BASE_URL,
    clientId: process.env.NUXT_PUBLIC_ASGARDEO_CLIENT_ID,
    clientSecret: process.env.ASGARDEO_CLIENT_SECRET,
    sessionSecret: process.env.ASGARDEO_SESSION_SECRET,
    afterSignInUrl: '/',
    afterSignOutUrl: '/',
    scopes: ['openid', 'profile', 'email'],
    preferences: {
      user: {
        fetchUserProfile: true,
        fetchOrganizations: true,
      },
    },
  },

  compatibilityDate: '2026-04-26',
});