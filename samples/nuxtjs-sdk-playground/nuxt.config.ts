// nuxt.config.ts
import type { NuxtPage } from '@nuxt/schema';

export default defineNuxtConfig({
  modules: ['@asgardeo/nuxt', '@nuxtjs/tailwindcss'],

  // Pages for "Server" demos live under `pages/srv/` on disk because Nuxt's
  // `impound` plugin blocks the Vue layer from importing any path that contains
  // `/server/` — that segment is reserved for Nitro code. We remap the URLs
  // back to `/server/*` here so the user-facing navigation stays clean.
  hooks: {
    'pages:extend'(pages) {
      const walk = (list: NuxtPage[]) => {
        for (const p of list) {
          if (p.path === '/srv') p.path = '/server';
          else if (p.path?.startsWith('/srv/')) p.path = p.path.replace(/^\/srv\//, '/server/');
          if (p.children?.length) walk(p.children);
        }
      };
      walk(pages);
    },
  },

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

  // Keep old playground URLs working for one release while bookmarks transition.
  // See docs/developer/nuxtjs-sdk-playground-navigation-restructure-plan.md §5.
  routeRules: {
    '/routes':                 { redirect: '/server/routes' },
    '/routes/**':              { redirect: '/server/routes/**' },
    '/apis':                   { redirect: '/composables' },
    '/apis/**':                { redirect: '/composables/**' },
    '/debug':                  { redirect: '/playground/state' },
    '/debug/**':               { redirect: '/playground/**' },
    '/server/session':         { redirect: '/server/utilities/session' },
    '/server/token':           { redirect: '/server/utilities/token' },
    '/server/userinfo':        { redirect: '/server/utilities/userinfo' },
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
