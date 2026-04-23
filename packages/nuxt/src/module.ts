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

import {
  addComponent,
  addImports,
  addPlugin,
  addRouteMiddleware,
  addServerHandler,
  addServerPlugin,
  createResolver,
  defineNuxtModule,
} from '@nuxt/kit';
import {defu} from 'defu';
import type {AsgardeoNuxtConfig} from './runtime/types';

const PACKAGE_NAME = '@asgardeo/nuxt';

export default defineNuxtModule<AsgardeoNuxtConfig>({
  meta: {
    configKey: 'asgardeo',
    name: PACKAGE_NAME,
  },
  defaults: {},
  setup(userOptions, nuxt) {
    const {resolve} = createResolver(import.meta.url);

    // Merge config: env vars -> user options -> runtime config
    const publicConfig = defu(
      {
        baseUrl: process.env['NUXT_PUBLIC_ASGARDEO_BASE_URL'],
        clientId: process.env['NUXT_PUBLIC_ASGARDEO_CLIENT_ID'],
        afterSignInUrl: process.env['NUXT_PUBLIC_ASGARDEO_AFTER_SIGN_IN_URL'] || '/',
        afterSignOutUrl: process.env['NUXT_PUBLIC_ASGARDEO_AFTER_SIGN_OUT_URL'] || '/',
        scopes: userOptions.scopes || ['openid', 'profile'],
        preferences: userOptions.preferences,
      },
      userOptions,
    );

    const privateConfig = {
      clientSecret: process.env['ASGARDEO_CLIENT_SECRET'] || userOptions.clientSecret || '',
      sessionSecret: process.env['ASGARDEO_SESSION_SECRET'] || userOptions.sessionSecret || '',
    };

    // Config validation deliberately does not happen here. `setup()` runs during
    // `nuxt module-build prepare` (SDK build) and during the consumer's build —
    // neither is the right moment to complain about unset runtime env vars.
    // Missing/invalid config is reported where it matters:
    //  - Server: runtime/server/plugins/asgardeo-ssr.ts (refuses to initialize)
    //  - Client: runtime/plugins/asgardeo.ts (dev-time browser console warning)

    // Security: ensure secrets are never in public runtime config
    nuxt.options.runtimeConfig.asgardeo = defu(
      nuxt.options.runtimeConfig.asgardeo as Record<string, unknown> || {},
      privateConfig,
    ) as {clientSecret: string; sessionSecret: string};

    nuxt.options.runtimeConfig.public.asgardeo = defu(
      nuxt.options.runtimeConfig.public.asgardeo as Record<string, unknown> || {},
      {
        baseUrl: publicConfig.baseUrl,
        clientId: publicConfig.clientId,
        afterSignInUrl: publicConfig.afterSignInUrl,
        afterSignOutUrl: publicConfig.afterSignOutUrl,
        scopes: publicConfig.scopes,
        preferences: publicConfig.preferences,
      },
    ) as {baseUrl: string; clientId: string; afterSignInUrl: string; afterSignOutUrl: string; scopes: string[]; preferences: AsgardeoNuxtConfig['preferences']};

    // Ensure clientSecret never leaks to public config
    const publicAsgardeo = nuxt.options.runtimeConfig.public.asgardeo as Record<string, unknown>;
    if (publicAsgardeo?.['clientSecret']) {
      delete publicAsgardeo['clientSecret'];
      console.error(`[${PACKAGE_NAME}] SECURITY: clientSecret found in public config. Removed. Use ASGARDEO_CLIENT_SECRET env var.`);
    }
    if (publicAsgardeo?.['sessionSecret']) {
      delete publicAsgardeo['sessionSecret'];
      console.error(`[${PACKAGE_NAME}] SECURITY: sessionSecret found in public config. Removed. Use ASGARDEO_SESSION_SECRET env var.`);
    }

    // Register server API routes
    const serverRoutes = [
      // ── Auth flow ──────────────────────────────────────────────────────
      {route: '/api/auth/signin',    handler: resolve('./runtime/server/routes/auth/signin.get')},
      {route: '/api/auth/callback',  handler: resolve('./runtime/server/routes/auth/callback.get')},
      {route: '/api/auth/signout',   handler: resolve('./runtime/server/routes/auth/signout.get')},
      // ── Session / token ───────────────────────────────────────────────
      {route: '/api/auth/session',   handler: resolve('./runtime/server/routes/auth/session.get')},
      {route: '/api/auth/token',     handler: resolve('./runtime/server/routes/auth/token.get')},
      {route: '/api/auth/user',      handler: resolve('./runtime/server/routes/auth/user.get')},
      // ── Profile (Step 5) ──────────────────────────────────────────────
      {route: '/api/auth/profile',      handler: resolve('./runtime/server/routes/auth/profile.post'),      method: 'post' as const},
      {route: '/api/auth/user-profile', handler: resolve('./runtime/server/routes/auth/user-profile.get')},
      // ── Organisations (Step 5) ────────────────────────────────────────
      {route: '/api/auth/my-orgs',    handler: resolve('./runtime/server/routes/auth/my-orgs.get')},
      {route: '/api/auth/orgs',       handler: resolve('./runtime/server/routes/auth/orgs.get')},
      {route: '/api/auth/switch-org', handler: resolve('./runtime/server/routes/auth/switch-org.post'), method: 'post' as const},
    ];

    for (const sr of serverRoutes) {
      addServerHandler({route: sr.route, handler: sr.handler, method: 'method' in sr ? sr.method : undefined});
    }

    // Register server plugin for SSR auth state + rich SSR data fetching
    addServerPlugin(resolve('./runtime/server/plugins/asgardeo-ssr'));

    // Register client plugin
    addPlugin(resolve('./runtime/plugins/asgardeo'));

    // Register named route middleware for page protection
    addRouteMiddleware({
      name: 'auth',
      path: resolve('./runtime/middleware/auth'),
    });

    // Auto-import composables and utilities
    addImports([
      // Core auth composable (Nuxt-specific wrapper around @asgardeo/vue)
      {name: 'useAsgardeo', from: resolve('./runtime/composables/useAsgardeo')},
      // Composables from @asgardeo/vue — auto-imported directly, no local wrappers
      {name: 'useUser',         from: '@asgardeo/vue'},
      {name: 'useOrganization', from: '@asgardeo/vue'},
      {name: 'useFlow',         from: '@asgardeo/vue'},
      {name: 'useTheme',        from: '@asgardeo/vue'},
      {name: 'useBranding',     from: '@asgardeo/vue'},
      // useI18n aliased to `useAsgardeoI18n` to avoid collision with @nuxtjs/i18n
      {name: 'useI18n', as: 'useAsgardeoI18n', from: '@asgardeo/vue'},
      // Middleware factory
      {name: 'defineAsgardeoMiddleware', from: resolve('./runtime/middleware/defineAsgardeoMiddleware')},
      // Utilities
      {name: 'createRouteMatcher', from: resolve('./runtime/utils/createRouteMatcher')},
    ]);

    // Register the Nuxt-specific root component that mounts the full Vue
    // provider tree (I18nProvider, BrandingProvider, ThemeProvider, etc.).
    // Users wrap their `app.vue` with `<AsgardeoRoot>` — matching the way
    // Next.js users wrap their app with `<AsgardeoServerProvider>`.
    addComponent({
      filePath: resolve('./runtime/components/AsgardeoRoot'),
      name: 'AsgardeoRoot',
    });

    // Auto-register @asgardeo/vue components with `Asgardeo` prefix.
    // The prefix avoids collisions with user-defined components and matches
    // Nuxt's convention for third-party components (cf. `@nuxt/ui` → `UButton`).
    const vueComponents: Array<{name: string; export: string}> = [
      // Control flow
      {name: 'AsgardeoSignedIn',   export: 'SignedIn'},
      {name: 'AsgardeoSignedOut',  export: 'SignedOut'},
      {name: 'AsgardeoLoading',    export: 'Loading'},
      // Action buttons
      {name: 'AsgardeoSignInButton',  export: 'SignInButton'},
      {name: 'AsgardeoSignOutButton', export: 'SignOutButton'},
      {name: 'AsgardeoSignUpButton',  export: 'SignUpButton'},
      // Auth flows (embedded)
      {name: 'AsgardeoSignIn',   export: 'SignIn'},
      {name: 'AsgardeoSignUp',   export: 'SignUp'},
      // User
      {name: 'AsgardeoUser',        export: 'UserComponent'},
      {name: 'AsgardeoUserProfile', export: 'UserProfile'},
      {name: 'AsgardeoUserDropdown',export: 'UserDropdown'},
      // Organization
      {name: 'AsgardeoOrganization',       export: 'OrganizationComponent'},
      {name: 'AsgardeoOrganizationProfile',export: 'OrganizationProfile'},
      {name: 'AsgardeoOrganizationSwitcher',export: 'OrganizationSwitcher'},
      {name: 'AsgardeoOrganizationList',   export: 'OrganizationList'},
      {name: 'AsgardeoCreateOrganization', export: 'CreateOrganization'},
      // Callback helper (for embedded flow client-side handling)
      {name: 'AsgardeoCallback', export: 'Callback'},
    ];

    for (const {name, export: exportName} of vueComponents) {
      addComponent({
        export: exportName,
        filePath: '@asgardeo/vue',
        name,
      });
    }

    // Auto-import server utilities
    nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.imports = nitroConfig.imports || {};
      nitroConfig.imports.imports = nitroConfig.imports.imports || [];
      nitroConfig.imports.imports.push(
        {
          name: 'useServerSession',
          from: resolve('./runtime/server/utils/serverSession'),
        },
        {
          name: 'requireServerSession',
          from: resolve('./runtime/server/utils/serverSession'),
        },
        {
          name: 'getValidAccessToken',
          from: resolve('./runtime/server/utils/token-refresh'),
        },
      );
    });
  },
});

declare module '@nuxt/schema' {
  interface PublicRuntimeConfig {
    asgardeo: {
      baseUrl: string;
      clientId: string;
      afterSignInUrl: string;
      afterSignOutUrl: string;
      scopes: string[];
      preferences?: import('./runtime/types').AsgardeoNuxtConfig['preferences'];
    };
  }

  interface RuntimeConfig {
    asgardeo: {
      clientSecret: string;
      sessionSecret: string;
    };
  }
}
