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
import type {Nuxt} from '@nuxt/schema';
import {defu} from 'defu';
import type {AsgardeoNuxtConfig, AsgardeoSessionPayload, AsgardeoSSRData} from './runtime/types';

const PACKAGE_NAME: string = '@asgardeo/nuxt';

type ServerRoute = {
  handler: string;
  method?: 'patch' | 'post';
  route: string;
};

export default defineNuxtModule<AsgardeoNuxtConfig>({
  defaults: {},
  meta: {
    configKey: 'asgardeo',
    name: PACKAGE_NAME,
  },
  setup(userOptions: AsgardeoNuxtConfig, nuxt: Nuxt) {
    const {resolve} = createResolver(import.meta.url);

    // Merge config: env vars (highest) -> nuxt.config.ts userOptions -> hard defaults (lowest)
    const publicConfig: AsgardeoNuxtConfig = defu(
      // Layer 1: environment variables — only win when actually set
      {
        afterSignInUrl: process.env['NUXT_PUBLIC_ASGARDEO_AFTER_SIGN_IN_URL'],
        afterSignOutUrl: process.env['NUXT_PUBLIC_ASGARDEO_AFTER_SIGN_OUT_URL'],
        applicationId: process.env['NUXT_PUBLIC_ASGARDEO_APPLICATION_ID'],
        baseUrl: process.env['NUXT_PUBLIC_ASGARDEO_BASE_URL'],
        clientId: process.env['NUXT_PUBLIC_ASGARDEO_CLIENT_ID'],
        signInUrl: process.env['NUXT_PUBLIC_ASGARDEO_SIGN_IN_URL'],
        signUpUrl: process.env['NUXT_PUBLIC_ASGARDEO_SIGN_UP_URL'],
      },
      // Layer 2: nuxt.config.ts options
      userOptions,
      // Layer 3: hard defaults
      {
        afterSignInUrl: '/',
        afterSignOutUrl: '/',
        scopes: ['openid', 'profile'],
      },
    );

    const privateConfig: {clientSecret: string; sessionSecret: string} = {
      clientSecret: process.env['ASGARDEO_CLIENT_SECRET'] || userOptions.clientSecret || '',
      sessionSecret: process.env['ASGARDEO_SESSION_SECRET'] || userOptions.sessionSecret || '',
    };

    // Config validation deliberately does not happen here. `setup()` runs during
    // `nuxt module-build prepare` (SDK build) and during the consumer's build —
    // neither is the right moment to complain about unset runtime env vars.
    // Missing/invalid config is reported where it matters:
    //  - Server: runtime/server/plugins/asgardeo-ssr.ts (refuses to initialize)
    //  - Client: runtime/plugins/asgardeo.ts (dev-time browser console warning)

    const {options} = nuxt;

    // Security: ensure secrets are never in public runtime config
    options.runtimeConfig.asgardeo = defu(
      (options.runtimeConfig.asgardeo as Record<string, unknown>) || {},
      privateConfig,
    ) as {clientSecret: string; sessionSecret: string};

    options.runtimeConfig.public.asgardeo = defu(
      (options.runtimeConfig.public.asgardeo as Record<string, unknown>) || {},
      {
        afterSignInUrl: publicConfig.afterSignInUrl,
        afterSignOutUrl: publicConfig.afterSignOutUrl,
        applicationId: publicConfig.applicationId,
        baseUrl: publicConfig.baseUrl,
        clientId: publicConfig.clientId,
        preferences: publicConfig.preferences,
        scopes: publicConfig.scopes,
        signInUrl: publicConfig.signInUrl,
        signUpUrl: publicConfig.signUpUrl,
      },
    ) as {
      afterSignInUrl: string;
      afterSignOutUrl: string;
      applicationId?: string;
      baseUrl: string;
      clientId: string;
      preferences: AsgardeoNuxtConfig['preferences'];
      scopes: string[];
      signInUrl?: string;
      signUpUrl?: string;
    };

    // Ensure clientSecret never leaks to public config
    const publicAsgardeo: Record<string, unknown> = options.runtimeConfig.public.asgardeo as Record<string, unknown>;
    if (publicAsgardeo?.['clientSecret']) {
      delete publicAsgardeo['clientSecret'];
      // eslint-disable-next-line no-console
      console.error(
        `[${PACKAGE_NAME}] SECURITY: clientSecret found in public config. Removed. Use ASGARDEO_CLIENT_SECRET env var.`,
      );
    }
    if (publicAsgardeo?.['sessionSecret']) {
      delete publicAsgardeo['sessionSecret'];
      // eslint-disable-next-line no-console
      console.error(
        `[${PACKAGE_NAME}] SECURITY: sessionSecret found in public config. Removed. Use ASGARDEO_SESSION_SECRET env var.`,
      );
    }

    // Register server API routes
    const serverRoutes: ServerRoute[] = [
      // ── Auth flow ──────────────────────────────────────────────────────
      {handler: resolve('./runtime/server/routes/auth/session/signin.get'), route: '/api/auth/signin'},
      {
        handler: resolve('./runtime/server/routes/auth/session/signin.post'),
        method: 'post' as const,
        route: '/api/auth/signin',
      },
      {
        handler: resolve('./runtime/server/routes/auth/session/signup.post'),
        method: 'post' as const,
        route: '/api/auth/signup',
      },
      {handler: resolve('./runtime/server/routes/auth/session/callback.get'), route: '/api/auth/callback'},
      {
        handler: resolve('./runtime/server/routes/auth/session/callback.post'),
        method: 'post' as const,
        route: '/api/auth/callback',
      },
      {
        handler: resolve('./runtime/server/routes/auth/session/signout.post'),
        method: 'post' as const,
        route: '/api/auth/signout',
      },
      // ── Session / token ───────────────────────────────────────────────
      {handler: resolve('./runtime/server/routes/auth/session/session.get'), route: '/api/auth/session'},
      {handler: resolve('./runtime/server/routes/auth/session/token.get'), route: '/api/auth/token'},
      // ── User ──────────────────────────────────────────────────────────
      {handler: resolve('./runtime/server/routes/auth/user/user.get'), route: '/api/auth/user'},
      {handler: resolve('./runtime/server/routes/auth/user/profile.get'), route: '/api/auth/user/profile'},
      {
        handler: resolve('./runtime/server/routes/auth/user/profile.patch'),
        method: 'patch' as const,
        route: '/api/auth/user/profile',
      },
      // ── Organisations ─────────────────────────────────────────────────
      {
        handler: resolve('./runtime/server/routes/auth/organizations/index.get'),
        route: '/api/auth/organizations',
      },
      {
        handler: resolve('./runtime/server/routes/auth/organizations/index.post'),
        method: 'post' as const,
        route: '/api/auth/organizations',
      },
      {
        handler: resolve('./runtime/server/routes/auth/organizations/me.get'),
        route: '/api/auth/organizations/me',
      },
      {
        handler: resolve('./runtime/server/routes/auth/organizations/current.get'),
        route: '/api/auth/organizations/current',
      },
      {
        handler: resolve('./runtime/server/routes/auth/organizations/id.get'),
        route: '/api/auth/organizations/:id',
      },
      {
        handler: resolve('./runtime/server/routes/auth/organizations/switch.post'),
        method: 'post' as const,
        route: '/api/auth/organizations/switch',
      },
      // ── Branding ──────────────────────────────────────────────────────
      {handler: resolve('./runtime/server/routes/auth/branding/branding.get'), route: '/api/auth/branding'},
    ];

    serverRoutes.forEach((sr: ServerRoute): void => {
      addServerHandler({handler: sr.handler, method: 'method' in sr ? sr.method : undefined, route: sr.route});
    });

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
      {from: resolve('./runtime/composables/useAsgardeo'), name: 'useAsgardeo'},
      // Composables from @asgardeo/vue — auto-imported directly, no local wrappers
      {from: '@asgardeo/vue', name: 'useUser'},
      {from: '@asgardeo/vue', name: 'useOrganization'},
      {from: '@asgardeo/vue', name: 'useFlow'},
      {from: '@asgardeo/vue', name: 'useFlowMeta'},
      {from: '@asgardeo/vue', name: 'useTheme'},
      {from: '@asgardeo/vue', name: 'useBranding'},
      // useI18n aliased to `useAsgardeoI18n` to avoid collision with @nuxtjs/i18n
      {as: 'useAsgardeoI18n', from: '@asgardeo/vue', name: 'useI18n'},
      // Middleware factory
      {from: resolve('./runtime/middleware/defineAsgardeoMiddleware'), name: 'defineAsgardeoMiddleware'},
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
    addComponent({filePath: resolve('./runtime/components/control/SignedIn'), name: 'AsgardeoSignedIn'});
    addComponent({filePath: resolve('./runtime/components/control/SignedOut'), name: 'AsgardeoSignedOut'});
    addComponent({filePath: resolve('./runtime/components/control/Loading'), name: 'AsgardeoLoading'});

    // ── Action buttons ───────────────────────────────────────────────────────
    addComponent({filePath: resolve('./runtime/components/actions/SignInButton'), name: 'AsgardeoSignInButton'});
    addComponent({filePath: resolve('./runtime/components/actions/SignOutButton'), name: 'AsgardeoSignOutButton'});
    addComponent({filePath: resolve('./runtime/components/actions/SignUpButton'), name: 'AsgardeoSignUpButton'});

    // ── Embedded auth flows ──────────────────────────────────────────────────
    addComponent({filePath: resolve('./runtime/components/auth/SignIn'), name: 'AsgardeoSignIn'});
    addComponent({filePath: resolve('./runtime/components/auth/SignUp'), name: 'AsgardeoSignUp'});

    // ── User ─────────────────────────────────────────────────────────────────
    addComponent({filePath: resolve('./runtime/components/user/User'), name: 'AsgardeoUser'});
    addComponent({filePath: resolve('./runtime/components/user/UserProfile'), name: 'AsgardeoUserProfile'});
    addComponent({filePath: resolve('./runtime/components/user/UserDropdown'), name: 'AsgardeoUserDropdown'});

    // ── Organization ─────────────────────────────────────────────────────────
    addComponent({filePath: resolve('./runtime/components/organization/Organization'), name: 'AsgardeoOrganization'});
    addComponent({
      filePath: resolve('./runtime/components/organization/OrganizationProfile'),
      name: 'AsgardeoOrganizationProfile',
    });
    addComponent({
      filePath: resolve('./runtime/components/organization/OrganizationSwitcher'),
      name: 'AsgardeoOrganizationSwitcher',
    });
    addComponent({
      filePath: resolve('./runtime/components/organization/OrganizationList'),
      name: 'AsgardeoOrganizationList',
    });
    addComponent({
      filePath: resolve('./runtime/components/organization/CreateOrganization'),
      name: 'AsgardeoCreateOrganization',
    });

    // ── Auth callback ────────────────────────────────────────────────────────
    addComponent({filePath: resolve('./runtime/components/auth/Callback'), name: 'AsgardeoCallback'});
  },
});

declare module '@nuxt/schema' {
  interface NuxtConfig {
    asgardeo?: AsgardeoNuxtConfig;
  }
  interface NuxtOptions {
    asgardeo?: AsgardeoNuxtConfig;
  }
  interface PublicRuntimeConfig {
    asgardeo: {
      afterSignInUrl: string;
      afterSignOutUrl: string;
      applicationId?: string;
      baseUrl: string;
      clientId: string;
      preferences?: AsgardeoNuxtConfig['preferences'];
      scopes: string[];
      signInUrl?: string;
      signUpUrl?: string;
    };
  }

  interface RuntimeConfig {
    asgardeo: {
      clientSecret: string;
      sessionSecret: string;
    };
  }
}

declare module 'h3' {
  interface H3EventContext {
    asgardeo?: {
      isSignedIn?: boolean;
      session?: AsgardeoSessionPayload | {sub?: string} | null;
      ssr?: AsgardeoSSRData;
    };
  }
}
