# 13 — Testing Strategy

## Overview

The testing strategy follows a pyramid model: many unit tests, focused integration tests, and targeted e2e tests.

---

## Test Pyramid

```
         ╱╲
        ╱  ╲        E2E Tests (Playwright)
       ╱    ╲       • Full sign-in/sign-out flows
      ╱──────╲      • OAuth callback handling
     ╱        ╲     • Protected route access
    ╱──────────╲
   ╱            ╲   Integration Tests (Vitest + @nuxt/test-utils)
  ╱              ╲  • Server routes with mocked Node SDK
 ╱                ╲ • Composables with mocked server
╱──────────────────╲
╱                    ╲ Unit Tests (Vitest)
╱                      ╲ • SessionManager (JWT sign/verify)
╱                        ╲ • Route matcher
╱                          ╲ • Config validation
╱                            ╲ • Error utilities
╱                              ╲ • SCIM2 utilities
```

---

## Unit Tests

### What to Test

| Module | Test Focus | Mocking |
|--------|-----------|---------|
| `SessionManager` | JWT creation, verification, expiry, temp sessions | Mock `jose` (or use real with test secret) |
| `createRouteMatcher` | Pattern matching: exact, glob, dynamic segments | None (pure function) |
| `validateConfig` | Required field validation, env var resolution, warnings | Mock `process.env` |
| `resolveConfigFromEnv` | Config merging precedence (env > options > defaults) | Mock `process.env` |
| `flattenScim2Profile` | SCIM2 → flat profile conversion | None (pure function) |
| `toScim2PatchOperations` | Flat update → SCIM2 PATCH operations | None (pure function) |
| `validateReturnUrl` | Open redirect prevention, same-origin validation | None (pure function) |
| `maskToken` | Token masking for logs | None (pure function) |
| `AsgardeoError` | Error construction, serialization | None |
| `wrapFetchError` | $fetch error → AsgardeoError conversion | None (pure function) |

### Example Unit Test

```typescript
// tests/unit/session-manager.test.ts

import { describe, it, expect, beforeEach } from 'vitest'
import { SessionManager } from '../../src/runtime/server/session-manager'

describe('SessionManager', () => {
  let sessionManager: SessionManager
  const TEST_SECRET = 'test-secret-that-is-at-least-32-chars-long'
  
  beforeEach(() => {
    sessionManager = new SessionManager(TEST_SECRET)
  })
  
  describe('createSession / getSession', () => {
    it('should create and verify a session JWT', async () => {
      const mockEvent = createMockH3Event()
      const payload = {
        accessToken: 'test-access-token',
        sessionId: 'session-123',
        accessTokenExpiresAt: Date.now() + 3600000,
      }
      
      await sessionManager.createSession(mockEvent, payload)
      const session = await sessionManager.getSession(mockEvent)
      
      expect(session).toBeTruthy()
      expect(session!.sessionId).toBe('session-123')
      expect(session!.accessToken).toBe('test-access-token')
    })
    
    it('should return null for expired session', async () => {
      const mockEvent = createMockH3Event()
      // Create session with already-expired JWT
      // (would need to mock time or use a very short expiry)
    })
    
    it('should return null for tampered cookie', async () => {
      const mockEvent = createMockH3Event()
      // Set a cookie with invalid signature
      mockEvent.cookies['asgardeo-session'] = 'tampered.jwt.token'
      
      const session = await sessionManager.getSession(mockEvent)
      expect(session).toBeNull()
    })
  })
  
  describe('temp sessions', () => {
    it('should create and verify a temp session', async () => {
      const mockEvent = createMockH3Event()
      await sessionManager.createTempSession(mockEvent, {
        sessionId: 'temp-123',
        state: 'random-state',
        codeVerifier: 'pkce-verifier',
        afterSignInUrl: '/dashboard',
      })
      
      const temp = await sessionManager.getTempSession(mockEvent)
      expect(temp!.state).toBe('random-state')
      expect(temp!.codeVerifier).toBe('pkce-verifier')
    })
  })
})
```

### Route Matcher Tests

```typescript
// tests/unit/route-matcher.test.ts

import { describe, it, expect } from 'vitest'
import { createRouteMatcher } from '../../src/runtime/utils/route-matcher'

describe('createRouteMatcher', () => {
  it('matches exact paths', () => {
    const matcher = createRouteMatcher(['/dashboard', '/settings'])
    expect(matcher('/dashboard')).toBe(true)
    expect(matcher('/settings')).toBe(true)
    expect(matcher('/other')).toBe(false)
  })
  
  it('matches glob patterns (**)', () => {
    const matcher = createRouteMatcher(['/admin/**'])
    expect(matcher('/admin')).toBe(true)
    expect(matcher('/admin/users')).toBe(true)
    expect(matcher('/admin/users/123')).toBe(true)
    expect(matcher('/other')).toBe(false)
  })
  
  it('matches single-segment wildcards (*)', () => {
    const matcher = createRouteMatcher(['/users/*'])
    expect(matcher('/users/123')).toBe(true)
    expect(matcher('/users/abc')).toBe(true)
    expect(matcher('/users/123/edit')).toBe(false)
  })
  
  it('returns false for empty patterns', () => {
    const matcher = createRouteMatcher([])
    expect(matcher('/anything')).toBe(false)
  })
})
```

---

## Integration Tests

Use `@nuxt/test-utils` to test server routes and composables in a Nuxt context.

### Server Route Tests

```typescript
// tests/integration/auth-routes.test.ts

import { describe, it, expect, beforeAll } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('Auth Server Routes', () => {
  beforeAll(async () => {
    await setup({
      rootDir: '../fixtures/basic',
      server: true,
    })
  })
  
  describe('GET /api/auth/session', () => {
    it('returns isSignedIn=false when no session', async () => {
      const response = await $fetch('/api/auth/session')
      expect(response.isSignedIn).toBe(false)
      expect(response.user).toBeNull()
    })
  })
  
  describe('GET /api/auth/signin', () => {
    it('redirects to Asgardeo authorization endpoint', async () => {
      const response = await $fetch.raw('/api/auth/signin', {
        redirect: 'manual',
      })
      expect(response.status).toBe(302)
      
      const location = response.headers.get('location')
      expect(location).toContain('/oauth2/authorize')
      expect(location).toContain('code_challenge=')
      expect(location).toContain('state=')
    })
    
    it('sets temp session cookie', async () => {
      const response = await $fetch.raw('/api/auth/signin', {
        redirect: 'manual',
      })
      
      const cookies = response.headers.get('set-cookie')
      expect(cookies).toContain('asgardeo-temp-session')
      expect(cookies).toContain('HttpOnly')
    })
  })
  
  describe('GET /api/auth/callback', () => {
    it('returns 400 when state is missing', async () => {
      try {
        await $fetch('/api/auth/callback?code=test')
      } catch (err: any) {
        expect(err.statusCode).toBe(400)
      }
    })
    
    it('returns 400 when code is missing', async () => {
      try {
        await $fetch('/api/auth/callback?state=test')
      } catch (err: any) {
        expect(err.statusCode).toBe(400)
      }
    })
  })
  
  describe('GET /api/auth/token', () => {
    it('returns 401 when no session', async () => {
      try {
        await $fetch('/api/auth/token')
      } catch (err: any) {
        expect(err.statusCode).toBe(401)
      }
    })
  })
})
```

### Composable Tests

```typescript
// tests/integration/composables.test.ts

import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'

describe('useAsgardeo', () => {
  it('provides reactive auth state', async () => {
    const component = await mountSuspended({
      setup() {
        const { isSignedIn, isLoading, user } = useAsgardeo()
        return { isSignedIn, isLoading, user }
      },
      template: '<div>{{ isSignedIn }}</div>',
    })
    
    expect(component.vm.isSignedIn).toBe(false)
    expect(component.vm.isLoading).toBe(false)
    expect(component.vm.user).toBeNull()
  })
})
```

---

## E2E Tests

Use Playwright (consistent with the existing `e2e/` setup in the monorepo).

### Test Scenarios

| Scenario | Priority | What It Tests |
|----------|----------|---------------|
| Redirect sign-in → callback → dashboard | P0 | Full OAuth flow end-to-end |
| Sign-out → token revocation → redirect | P0 | Complete sign-out lifecycle |
| Protected route → redirect to sign-in → return | P0 | Middleware and redirect |
| Session expiry → auto-refresh | P1 | Token refresh flow |
| Embedded sign-in (username/password) | P1 | App-native flow |
| Organization switch | P2 | Token exchange flow |
| User profile update | P2 | SCIM2 profile PATCH |
| Invalid state → error page | P1 | Security: state mismatch handling |
| No session → /api/auth/token → 401 | P1 | API route protection |

### Example E2E Test

```typescript
// e2e/tests/nuxt/redirect-sign-in.spec.ts

import { test, expect } from '@playwright/test'

test.describe('Nuxt SDK - Redirect Sign-In', () => {
  test('should redirect to Asgardeo for sign-in', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Should be redirected to sign-in (middleware protection)
    await page.waitForURL('**/oauth2/authorize**')
    
    // Should include PKCE and state
    const url = new URL(page.url())
    expect(url.searchParams.has('code_challenge')).toBe(true)
    expect(url.searchParams.has('state')).toBe(true)
    expect(url.searchParams.get('code_challenge_method')).toBe('S256')
  })
  
  test('should show user info after sign-in', async ({ page }) => {
    // Perform sign-in (using test helpers)
    await signIn(page)
    
    await page.goto('/dashboard')
    
    // Should show user name (SSR hydrated, no loading flash)
    await expect(page.locator('[data-testid="user-name"]')).toBeVisible()
  })
  
  test('should handle sign-out', async ({ page }) => {
    await signIn(page)
    await page.goto('/dashboard')
    
    await page.click('[data-testid="sign-out-button"]')
    
    // Should redirect to home page
    await page.waitForURL('/')
    
    // Should show signed-out state
    await expect(page.locator('[data-testid="sign-in-button"]')).toBeVisible()
  })
})
```

---

## Test Fixtures

```
tests/
├── unit/
│   ├── session-manager.test.ts
│   ├── route-matcher.test.ts
│   ├── config-validation.test.ts
│   ├── scim2-utils.test.ts
│   ├── url-validation.test.ts
│   ├── error-codes.test.ts
│   └── token-masking.test.ts
├── integration/
│   ├── auth-routes.test.ts
│   ├── composables.test.ts
│   ├── middleware.test.ts
│   └── ssr-hydration.test.ts
├── fixtures/
│   └── basic/
│       ├── nuxt.config.ts      (minimal Nuxt config with @asgardeo/nuxt)
│       ├── app.vue
│       └── pages/
│           ├── index.vue
│           ├── dashboard.vue   (protected)
│           └── login.vue
└── helpers/
    ├── mock-h3-event.ts
    ├── mock-node-client.ts
    └── test-utils.ts
```

---

## CI Integration

```yaml
# In the monorepo's CI pipeline
- name: Test Nuxt SDK
  run: |
    pnpm --filter @asgardeo/nuxt test        # Unit + integration
    pnpm --filter @asgardeo/nuxt test:e2e     # E2E (requires Asgardeo instance)
```

### Scripts in `package.json`

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test"
  }
}
```
