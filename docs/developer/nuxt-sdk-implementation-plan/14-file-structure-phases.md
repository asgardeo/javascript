# 14 — File Structure & Phased Delivery

## Target File Structure

```
packages/nuxt/
├── package.json
├── tsconfig.json
├── tsconfig.lib.json
├── tsconfig.spec.json
├── vitest.config.ts
├── playground/                          # Dev playground app
│   ├── nuxt.config.ts
│   ├── app.vue
│   └── pages/
│       ├── index.vue
│       ├── dashboard.vue
│       ├── login.vue
│       └── settings/
│           └── profile.vue
│
├── src/
│   ├── module.ts                        # Nuxt module entry point
│   │
│   └── runtime/
│       ├── types/
│       │   ├── index.ts                 # Barrel export
│       │   ├── config.ts               # AsgardeoNuxtConfig, CookieConfig
│       │   ├── session.ts              # SessionPayload, TempSessionPayload
│       │   ├── user.ts                 # UserProfile, UpdateUserProfileRequest
│       │   ├── organization.ts         # Organization, CreateOrganizationRequest
│       │   ├── flow.ts                 # FlowResult, Authenticator, FlowStep
│       │   ├── auth.ts                 # SignInOptions, SignOutOptions, etc.
│       │   └── augments.d.ts           # Nuxt type augmentation
│       │
│       ├── errors/
│       │   ├── index.ts                 # Barrel export
│       │   ├── asgardeo-error.ts       # AsgardeoError class
│       │   └── error-codes.ts          # ErrorCodes enum
│       │
│       ├── utils/
│       │   ├── route-matcher.ts         # createRouteMatcher()
│       │   ├── url-validation.ts        # validateReturnUrl()
│       │   ├── config.ts               # resolveConfigFromEnv()
│       │   ├── validate-config.ts       # validateConfig()
│       │   └── log.ts                   # maskToken(), logger utilities
│       │
│       ├── plugins/
│       │   ├── asgardeo.server.ts       # Server plugin: SSR state hydration
│       │   └── asgardeo.client.ts       # Client plugin: Vue SDK bridge
│       │
│       ├── composables/
│       │   ├── useAsgardeo.ts           # Primary composable (auto-imported)
│       │   ├── useUser.ts              # User-focused composable
│       │   ├── useOrganization.ts       # Organization composable
│       │   └── defineAsgardeoMiddleware.ts  # Custom middleware helper
│       │
│       ├── client/
│       │   └── nuxt-asgardeo-client.ts  # NuxtAsgardeoClient (server-delegating client)
│       │
│       ├── components/
│       │   ├── index.ts                 # Re-exports from @asgardeo/vue
│       │   ├── Callback.vue            # Nuxt-specific callback component
│       │   └── Provider.vue            # Nuxt-specific provider wrapper
│       │
│       ├── middleware/
│       │   └── auth.ts                  # Built-in asgardeo-auth route middleware
│       │
│       └── server/
│           ├── client.ts                # AsgardeoNuxtServerClient
│           ├── session-manager.ts       # SessionManager (JWT cookies)
│           │
│           ├── utils/
│           │   ├── asgardeo-server.ts   # useAsgardeoServer() composable
│           │   ├── token-refresh.ts     # getValidAccessToken()
│           │   ├── scim2.ts             # flattenScim2Profile(), toScim2PatchOperations()
│           │   └── error-handler.ts     # handleAuthRouteError()
│           │
│           ├── middleware/
│           │   └── session-guard.ts     # Server-side route protection
│           │
│           └── routes/
│               └── auth/
│                   ├── signin.get.ts    # Redirect sign-in
│                   ├── signin.post.ts   # Embedded sign-in
│                   ├── signup.get.ts    # Redirect sign-up
│                   ├── signup.post.ts   # Embedded sign-up
│                   ├── callback.get.ts  # OAuth callback
│                   ├── signout.ts       # Sign-out (GET + POST)
│                   ├── session.get.ts   # Get session info
│                   ├── token.get.ts     # Get access token
│                   ├── token.exchange.post.ts  # Token exchange
│                   ├── user.get.ts              # Get user claims
│                   ├── user/
│                   │   ├── profile.get.ts       # Get SCIM2 profile
│                   │   ├── profile.patch.ts     # Update profile
│                   │   └── password.post.ts     # Change password
│                   └── organizations/
│                       ├── index.get.ts         # List all orgs
│                       ├── mine.get.ts          # List user's orgs
│                       ├── current.get.ts       # Get current org
│                       ├── switch.post.ts       # Switch org
│                       └── index.post.ts        # Create org
│
├── tests/
│   ├── unit/
│   │   ├── session-manager.test.ts
│   │   ├── route-matcher.test.ts
│   │   ├── config-validation.test.ts
│   │   ├── scim2-utils.test.ts
│   │   ├── url-validation.test.ts
│   │   └── error-codes.test.ts
│   ├── integration/
│   │   ├── auth-routes.test.ts
│   │   ├── composables.test.ts
│   │   ├── middleware.test.ts
│   │   └── ssr-hydration.test.ts
│   ├── fixtures/
│   │   └── basic/
│   │       ├── nuxt.config.ts
│   │       ├── app.vue
│   │       └── pages/
│   └── helpers/
│       ├── mock-h3-event.ts
│       ├── mock-node-client.ts
│       └── test-utils.ts
│
└── README.md
```

---

## Package.json

```json
{
  "name": "@asgardeo/nuxt",
  "version": "0.1.0",
  "description": "Asgardeo IAM SDK for Nuxt 3",
  "type": "module",
  "main": "./dist/module.cjs",
  "module": "./dist/module.mjs",
  "types": "./dist/types.d.ts",
  "exports": {
    ".": {
      "import": "./dist/module.mjs",
      "require": "./dist/module.cjs"
    }
  },
  "files": ["dist"],
  "scripts": {
    "prepack": "nuxt-module-build build",
    "dev": "nuxi dev playground",
    "dev:build": "nuxi build playground",
    "dev:prepare": "nuxt-module-build build --stub && nuxi prepare playground",
    "build": "nuxt-module-build build",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint ."
  },
  "dependencies": {
    "@asgardeo/vue": "workspace:*",
    "@asgardeo/node": "workspace:*",
    "@nuxt/kit": "^3.16.0",
    "defu": "^6.1.4",
    "jose": "^6.0.0"
  },
  "peerDependencies": {
    "nuxt": ">=3.10.0",
    "vue": ">=3.5.0"
  },
  "devDependencies": {
    "@nuxt/module-builder": "^0.8.0",
    "@nuxt/schema": "^3.16.0",
    "@nuxt/test-utils": "^3.17.0",
    "typescript": "^5.7.0",
    "vitest": "^3.0.0"
  }
}
```

---

## Phased Delivery Plan

### Phase 1: Foundation (Week 1-2)

**Goal:** Core module setup, session management, basic redirect auth flow.

| # | Task | Files | Dependencies |
|---|------|-------|-------------|
| 1.1 | Set up package scaffolding | `package.json`, `tsconfig.*`, build configs | None |
| 1.2 | Define types | `types/config.ts`, `types/session.ts`, `types/auth.ts`, `types/augments.d.ts` | None |
| 1.3 | Implement error model | `errors/asgardeo-error.ts`, `errors/error-codes.ts` | None |
| 1.4 | Implement utilities | `utils/route-matcher.ts`, `utils/url-validation.ts`, `utils/config.ts`, `utils/validate-config.ts`, `utils/log.ts` | 1.2, 1.3 |
| 1.5 | Implement SessionManager | `server/session-manager.ts` | 1.2, `jose` |
| 1.6 | Implement AsgardeoNuxtServerClient | `server/client.ts` | 1.5, `@asgardeo/node` |
| 1.7 | Implement server composable | `server/utils/asgardeo-server.ts` | 1.6 |
| 1.8 | Implement core server routes | `server/routes/auth/signin.get.ts`, `callback.get.ts`, `signout.ts`, `session.get.ts`, `token.get.ts` | 1.6, 1.7 |
| 1.9 | Implement Nuxt module | `module.ts` | 1.4, 1.7, 1.8 |
| 1.10 | Implement server plugin (SSR hydration) | `plugins/asgardeo.server.ts` | 1.7 |
| 1.11 | Write unit tests for Phase 1 | `tests/unit/session-manager.test.ts`, `tests/unit/route-matcher.test.ts`, `tests/unit/config-validation.test.ts` | 1.4, 1.5 |

**Deliverable:** A working redirect sign-in/sign-out flow with session management.

---

### Phase 2: Client Integration (Week 2-3)

**Goal:** Client-side composables, reactive state, SSR hydration.

| # | Task | Files | Dependencies |
|---|------|-------|-------------|
| 2.1 | Implement NuxtAsgardeoClient | `client/nuxt-asgardeo-client.ts` | Phase 1 |
| 2.2 | Implement client plugin | `plugins/asgardeo.client.ts` | 2.1 |
| 2.3 | Implement `useAsgardeo()` composable | `composables/useAsgardeo.ts` | 2.2 |
| 2.4 | Implement `useUser()` composable | `composables/useUser.ts` | 2.3 |
| 2.5 | Implement `useOrganization()` composable | `composables/useOrganization.ts` | 2.3 |
| 2.6 | Implement client middleware | `middleware/auth.ts` | 2.3 |
| 2.7 | Implement server middleware | `server/middleware/session-guard.ts` | Phase 1 |
| 2.8 | Implement `defineAsgardeoMiddleware` | `composables/defineAsgardeoMiddleware.ts` | 2.3 |
| 2.9 | Set up playground app | `playground/*` | 2.3 |
| 2.10 | Integration tests for composables | `tests/integration/composables.test.ts` | 2.3, 2.4, 2.5 |

**Deliverable:** Full client-side auth experience with composables, middleware, and SSR hydration.

---

### Phase 3: UI Components & Embedded Auth (Week 3-4)

**Goal:** UI component re-exports, embedded/app-native sign-in, sign-up flows.

| # | Task | Files | Dependencies |
|---|------|-------|-------------|
| 3.1 | Re-export Vue SDK components | `components/index.ts` | `@asgardeo/vue` |
| 3.2 | Create Nuxt-specific Callback component | `components/Callback.vue` | Phase 2 |
| 3.3 | Create Nuxt-specific Provider wrapper | `components/Provider.vue` | Phase 2 |
| 3.4 | Register components in module | Update `module.ts` | 3.1 |
| 3.5 | Implement embedded sign-in server route | `server/routes/auth/signin.post.ts` | Phase 1 |
| 3.6 | Implement embedded sign-up server routes | `server/routes/auth/signup.get.ts`, `signup.post.ts` | Phase 1 |
| 3.7 | Implement embedded sign-in in client | Update `nuxt-asgardeo-client.ts` | 3.5 |
| 3.8 | Define flow types | `types/flow.ts` | None |
| 3.9 | Update playground with embedded flow | `playground/pages/login.vue` | 3.7 |

**Deliverable:** Full component library with embedded authentication support.

---

### Phase 4: Organization & Profile (Week 4-5)

**Goal:** Multi-org support, SCIM2 profile management.

| # | Task | Files | Dependencies |
|---|------|-------|-------------|
| 4.1 | Define organization types | `types/organization.ts` | None |
| 4.2 | Define user profile types | `types/user.ts` | None |
| 4.3 | Implement SCIM2 utilities | `server/utils/scim2.ts` | 4.2 |
| 4.4 | Implement organization server routes | `server/routes/auth/organizations/*.ts` | Phase 1, 4.1 |
| 4.5 | Implement user profile server routes | `server/routes/auth/user/*.ts` | Phase 1, 4.3 |
| 4.6 | Implement token exchange server route | `server/routes/auth/token.exchange.post.ts` | Phase 1 |
| 4.7 | Implement token refresh utility | `server/utils/token-refresh.ts` | Phase 1 |
| 4.8 | Update composables with org/profile methods | Update `nuxt-asgardeo-client.ts` | 4.4, 4.5, Phase 2 |
| 4.9 | SSR hydration for org data | Update `plugins/asgardeo.server.ts` | 4.4 |
| 4.10 | Unit tests for SCIM2 utilities | `tests/unit/scim2-utils.test.ts` | 4.3 |

**Deliverable:** Complete organization management and user profile CRUD.

---

### Phase 5: Hardening & Documentation (Week 5-6)

**Goal:** Security hardening, comprehensive tests, documentation, sample app.

| # | Task | Files | Dependencies |
|---|------|-------|-------------|
| 5.1 | Security audit (OWASP checklist) | Review all routes and config | All phases |
| 5.2 | Open redirect prevention | `utils/url-validation.ts` (already in Phase 1, but audit) | Phase 1 |
| 5.3 | Input validation on all routes | All server routes | Phase 1, 4 |
| 5.4 | Error handling audit | All composables and routes | Phase 1, 2, 4 |
| 5.5 | Integration tests | `tests/integration/*.test.ts` | All phases |
| 5.6 | E2E tests | `e2e/tests/nuxt/*.spec.ts` | All phases |
| 5.7 | API documentation (README.md) | `README.md` | All phases |
| 5.8 | Sample app | `samples/nuxt-sdk-playground/` | All phases |
| 5.9 | Migration guide (from current SDK) | `docs/migration.md` | All phases |

**Deliverable:** Production-ready SDK with tests, docs, and sample app.

---

## Milestone Summary

| Phase | Milestone | Est. Scope | Cumulative Coverage |
|-------|-----------|-----------|-------------------|
| **Phase 1** | Redirect auth flow works end-to-end | ~15 files | ~30% of spec |
| **Phase 2** | Client composables + middleware + SSR | ~10 files | ~55% of spec |
| **Phase 3** | UI components + embedded auth | ~10 files | ~75% of spec |
| **Phase 4** | Organizations + profiles | ~12 files | ~95% of spec |
| **Phase 5** | Hardened, tested, documented | ~15 test files | ~100% of spec |

---

## Definition of Done (per Phase)

- [ ] All planned files created and implemented
- [ ] Unit tests passing for new code
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Playground app demonstrates the feature
- [ ] Code reviewed
- [ ] README updated with new features
