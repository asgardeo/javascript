// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@asgardeo/nuxt', '@nuxtjs/tailwindcss'],

  asgardeo: {
    baseUrl:        process.env['NUXT_PUBLIC_ASGARDEO_BASE_URL'],
    clientId:       process.env['NUXT_PUBLIC_ASGARDEO_CLIENT_ID'],
    clientSecret:   process.env['ASGARDEO_CLIENT_SECRET'],
    sessionSecret:  process.env['ASGARDEO_SESSION_SECRET'],
    afterSignInUrl: '/',
    afterSignOutUrl: '/',
    scopes: ['openid', 'profile', 'email', 'internal_login'],
    preferences: {
      user:  { fetchUserProfile: true, fetchOrganizations: true },
      theme: { inheritFromBranding: false, mode: 'light' },
    },
  },

  css: ['~/assets/css/main.css'],
  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: '~/tailwind.config.ts',
  },
  devtools: { enabled: true },
  typescript: { strict: true },
  compatibilityDate: '2024-04-03',
});
