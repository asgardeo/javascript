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
      {route: '/api/auth/signin',   handler: resolve('./runtime/server/routes/auth/session/signin.get')},
      {route: '/api/auth/callback', handler: resolve('./runtime/server/routes/auth/session/callback.get')},
      {route: '/api/auth/signout',  handler: resolve('./runtime/server/routes/auth/session/signout.post'), method: 'post' as const},
      // ── Session / token ───────────────────────────────────────────────
      {route: '/api/auth/session',  handler: resolve('./runtime/server/routes/auth/session/session.get')},
      {route: '/api/auth/token',    handler: resolve('./runtime/server/routes/auth/session/token.get')},
      // ── User ──────────────────────────────────────────────────────────
      {route: '/api/auth/user',         handler: resolve('./runtime/server/routes/auth/user/user.get')},
      {route: '/api/auth/user/profile', handler: resolve('./runtime/server/routes/auth/user/profile.get')},
      {route: '/api/auth/user/profile', handler: resolve('./runtime/server/routes/auth/user/profile.patch'), method: 'patch' as const},
      // ── Organisations ─────────────────────────────────────────────────
      {route: '/api/auth/organizations',         handler: resolve('./runtime/server/routes/auth/organizations/index.get')},
      {route: '/api/auth/organizations',         handler: resolve('./runtime/server/routes/auth/organizations/index.post'),   method: 'post'  as const},
      {route: '/api/auth/organizations/me',      handler: resolve('./runtime/server/routes/auth/organizations/me.get')},
      {route: '/api/auth/organizations/current', handler: resolve('./runtime/server/routes/auth/organizations/current.get')},
      {route: '/api/auth/organizations/:id',     handler: resolve('./runtime/server/routes/auth/organizations/id.get')},
      {route: '/api/auth/organizations/switch',  handler: resolve('./runtime/server/routes/auth/organizations/switch.post'),  method: 'post'  as const},
      // ── Branding ──────────────────────────────────────────────────────
      {route: '/api/auth/branding', handler: resolve('./runtime/server/routes/auth/branding/branding.get')},
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

    // Register Nuxt-specific component containers with the `Asgardeo` prefix.
    //
    // Each container lives at `./runtime/components/<Name>.ts` and:
    //   1. Imports the corresponding BaseXxx from @asgardeo/vue (not the Vue container).
    //   2. Wires composables through `#imports` (Nuxt auto-import layer).
    //   3. Uses `navigateTo` from `#app` for all navigation — SSR-safe, no window.location.
    //
    // This mirrors the Next.js SDK pattern where Base components come from
    // @asgardeo/react and host-specific containers live in the Next.js package.
    //
    // NOTE: Composables (useUser, useOrganization, useTheme, useBranding,
    // useFlow, useI18n) remain direct re-exports from @asgardeo/vue via
    // addImports above — only the components need Nuxt wrappers.

    // ── Control flow ────────────────────────────────────────────────────────
    addComponent({name: 'AsgardeoSignedIn',  filePath: resolve('./runtime/components/control/SignedIn')});
    addComponent({name: 'AsgardeoSignedOut', filePath: resolve('./runtime/components/control/SignedOut')});
    addComponent({name: 'AsgardeoLoading',   filePath: resolve('./runtime/components/control/Loading')});

    // ── Action buttons ───────────────────────────────────────────────────────
    addComponent({name: 'AsgardeoSignInButton',  filePath: resolve('./runtime/components/actions/SignInButton')});
    addComponent({name: 'AsgardeoSignOutButton', filePath: resolve('./runtime/components/actions/SignOutButton')});
    addComponent({name: 'AsgardeoSignUpButton',  filePath: resolve('./runtime/components/actions/SignUpButton')});

    // ── Embedded auth flows ──────────────────────────────────────────────────
    addComponent({name: 'AsgardeoSignIn', filePath: resolve('./runtime/components/auth/SignIn')});
    addComponent({name: 'AsgardeoSignUp', filePath: resolve('./runtime/components/auth/SignUp')});

    // ── User ─────────────────────────────────────────────────────────────────
    addComponent({name: 'AsgardeoUser',         filePath: resolve('./runtime/components/user/User')});
    addComponent({name: 'AsgardeoUserProfile',  filePath: resolve('./runtime/components/user/UserProfile')});
    addComponent({name: 'AsgardeoUserDropdown', filePath: resolve('./runtime/components/user/UserDropdown')});

    // ── Organization ─────────────────────────────────────────────────────────
    addComponent({name: 'AsgardeoOrganization',         filePath: resolve('./runtime/components/organization/Organization')});
    addComponent({name: 'AsgardeoOrganizationProfile',  filePath: resolve('./runtime/components/organization/OrganizationProfile')});
    addComponent({name: 'AsgardeoOrganizationSwitcher', filePath: resolve('./runtime/components/organization/OrganizationSwitcher')});
    addComponent({name: 'AsgardeoOrganizationList',     filePath: resolve('./runtime/components/organization/OrganizationList')});
    addComponent({name: 'AsgardeoCreateOrganization',   filePath: resolve('./runtime/components/organization/CreateOrganization')});

    // ── Auth callback ────────────────────────────────────────────────────────
    addComponent({name: 'AsgardeoCallback', filePath: resolve('./runtime/components/auth/Callback')});

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
