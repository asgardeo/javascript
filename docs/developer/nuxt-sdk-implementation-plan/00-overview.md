# Nuxt.js SDK Implementation Plan — Overview

**Package:** `@asgardeo/nuxt`
**SDK Layer:** Framework Specific SDK (Layer 4)
**Parent SDKs:** Vue SDK (`@asgardeo/vue`) + Node SDK (`@asgardeo/node`)
**Spec Compliance Target:** IAM SDK Specification v1.0.0-draft

---

## Table of Contents

| # | Document | Description |
|---|----------|-------------|
| 00 | [Overview](./00-overview.md) | This document — architecture, rationale, scope |
| 01 | [Architecture & Dependency Graph](./01-architecture.md) | Layer diagram, dependency tree, SSR/CSR split |
| 02 | [Gap Analysis — Current vs Target](./02-gap-analysis.md) | What the current Nuxt SDK has vs what it needs |
| 03 | [Module System & Configuration](./03-module-configuration.md) | Nuxt module, runtime config, env variables |
| 04 | [Server-Side Implementation](./04-server-side.md) | Nitro routes, session management, middleware |
| 05 | [Client-Side Implementation](./05-client-side.md) | Composables, plugin, Vue integration |
| 06 | [UI Components](./06-ui-components.md) | Re-exporting Vue SDK components, Nuxt-specific adapters |
| 07 | [Auth Flows](./07-auth-flows.md) | Redirect-based, App-Native, silent sign-in |
| 08 | [Session & Token Management](./08-session-tokens.md) | JWT-based sessions, token refresh, cookie strategy |
| 09 | [Organization & Profile Management](./09-organization-profile.md) | Multi-org support, profile CRUD |
| 10 | [Middleware & Route Protection](./10-middleware-route-protection.md) | Nuxt middleware, route guards, protected pages |
| 11 | [Error Handling](./11-error-handling.md) | Error model, error codes, error boundaries |
| 12 | [Security Requirements](./12-security.md) | PKCE, token storage, CSRF, cookie hardening |
| 13 | [Testing Strategy](./13-testing.md) | Unit, integration, e2e testing approach |
| 14 | [File Structure & Phased Delivery](./14-file-structure-phases.md) | Target directory layout, implementation phases |

---

## Executive Summary

The Nuxt.js SDK is a **Framework Specific SDK** (Layer 4 per the IAM SDK Specification) that provides a first-class authentication and identity management integration for Nuxt 3 applications. It builds on two parent SDKs:

- **`@asgardeo/vue`** (Core Lib SDK — Layer 3) — for client-side Vue composables, reactive state, and UI components
- **`@asgardeo/node`** (Platform SDK — Layer 2) — for server-side OAuth2/OIDC protocol handling, session management, and confidential client flows

The SDK leverages Nuxt's unique capabilities:
- **Auto-imports** — composables and utilities are automatically available in components
- **Nuxt Module system** — zero-config installation via `nuxt.config.ts`
- **Nitro server engine** — server routes for OAuth callbacks, token operations, and API proxying
- **Server-side rendering (SSR)** — initial auth state hydration from server to client
- **Middleware** — route-level protection with both server and client middleware

---

## Why a Rewrite is Needed

The current `@asgardeo/nuxt` package (v0.0.0) is a minimal prototype with significant gaps:

1. **Depends only on `@asgardeo/node`** — bypasses the Vue SDK (Layer 3), violating the spec's layer rule: *"No layer may skip its parent"*
2. **No UI components** — no `<SignIn>`, `<SignedIn>`, `<UserProfile>`, etc.
3. **No reactive state** — the `useAuth()` composable returns plain async functions with no reactive `ref`s
4. **No embedded/app-native flow support** — only redirect-based auth
5. **No session management via JWT** — uses raw UUIDs in cookies; no signed session tokens
6. **No middleware** — no route protection mechanism
7. **No organization management** — no multi-org support
8. **No profile management** — no user profile CRUD
9. **No i18n/theming** — no integration with branding, themes, or i18n
10. **No spec-compliant error handling** — errors are swallowed or thrown as generic `Error`

---

## Design Principles for the New SDK

| Principle | Application |
|-----------|------------|
| **Spec-first** | Every public API maps to the IAM SDK Specification's `IAMClient` interface |
| **Layer compliance** | Depends on `@asgardeo/vue` (client) + `@asgardeo/node` (server); never re-implements parent logic |
| **Nuxt-native** | Uses Nuxt modules, auto-imports, Nitro routes, `useState`, `useFetch` — not generic Vue patterns |
| **SSR-first** | Auth state is resolved server-side and hydrated to the client; no loading flash on initial render |
| **Secure by default** | HTTP-only signed JWT session cookies, PKCE, CSRF protection, no tokens in client JS |
| **Single entry point** | `useAsgardeo()` composable exposes the full API; no need for multiple imports |
| **Component-driven** | Full UI component library re-exported from `@asgardeo/vue` with Nuxt-specific wrappers |

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Session storage | Signed JWT in HTTP-only cookie (via `jose`) | Same pattern as Next.js SDK; works with Nitro's stateless model |
| Client state | `useState()` (Nuxt SSR-safe) + `@asgardeo/vue` composables | Enables SSR hydration of auth state |
| OAuth callback | Nitro server route (`/api/auth/callback`) | Confidential client exchange happens server-side |
| Route protection | Nuxt `defineNuxtRouteMiddleware` + server middleware | Both client nav guards and server-side protection |
| UI components | Re-export from `@asgardeo/vue` + wrap with auto-imports | Avoid duplication; leverage existing Vue component library |
| Configuration | `nuxt.config.ts` module options + runtime config + env vars | Standard Nuxt pattern with env fallbacks |
