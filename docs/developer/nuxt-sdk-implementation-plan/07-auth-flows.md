# 07 — Auth Flows

## Overview

Per the IAM SDK Specification §4, the SDK must support two primary authentication paradigms:

1. **Redirect-Based Authentication** — traditional OAuth2/OIDC flow (full-page redirect to IdP)
2. **App-Native (Embedded) Authentication** — in-app authentication UI via the Flow Execution API

Nuxt adds a third consideration:

3. **SSR-Aware Authentication** — the auth state must work seamlessly with server-side rendering

---

## Flow 1: Redirect-Based Sign-In

This is the default and most common flow. The user is redirected to Asgardeo's hosted login page.

### Sequence Diagram

```
User        Nuxt Client         Nuxt Server (Nitro)        Asgardeo
 │              │                       │                       │
 │──click──────►│                       │                       │
 │  signIn()    │                       │                       │
 │              │──navigate────────────►│                       │
 │              │  GET /api/auth/signin │                       │
 │              │                       │──generate PKCE────────│
 │              │                       │  code_verifier        │
 │              │                       │  code_challenge       │
 │              │                       │                       │
 │              │                       │──store temp session──►│
 │              │                       │  (signed JWT cookie)  │
 │              │                       │                       │
 │◄─────────────┼───────────302 redirect│                       │
 │              │  to /oauth2/authorize │                       │
 │──────────────┼───────────────────────┼──────────────────────►│
 │              │                       │                       │
 │              │                       │       ┌───────────┐   │
 │              │                       │       │ User logs  │   │
 │              │                       │       │ in at IdP  │   │
 │              │                       │       └───────────┘   │
 │              │                       │                       │
 │◄─────────────┼───────────────────────┼──302 /api/auth/callback
 │              │                       │  ?code=...&state=...  │
 │──────────────┼──────────────────────►│                       │
 │              │  GET /api/auth/callback│                       │
 │              │                       │──validate state───────│
 │              │                       │──exchange code────────│
 │              │                       │  POST /oauth2/token   │
 │              │                       │  (code_verifier)      │
 │              │                       │◄──tokens──────────────│
 │              │                       │                       │
 │              │                       │──create session───────│
 │              │                       │  (signed JWT cookie)  │
 │              │                       │──delete temp session──│
 │              │                       │                       │
 │◄─────────────┼───────302 redirect────│                       │
 │              │  to afterSignInUrl    │                       │
 │──SSR page───►│                       │                       │
 │              │  (session cookie      │                       │
 │              │   → SSR hydration)    │                       │
 │◄──page with──┤                       │                       │
 │  auth state  │                       │                       │
```

### Implementation Points

| Step | Handler | Key Code |
|------|---------|----------|
| Start | `signin.get.ts` | Generate PKCE pair, state, nonce; store in temp cookie; redirect |
| Callback | `callback.get.ts` | Validate state, exchange code with PKCE verifier, create session JWT |
| Hydrate | `asgardeo.server.ts` plugin | Read session JWT, write to `useState()` |
| Client | `asgardeo.client.ts` plugin | Read `useState()`, provide to composables |

### Configuration

```typescript
// Redirect sign-in with options
signIn()                                    // Default: redirects to IdP
signIn({ returnTo: '/dashboard' })          // Override afterSignInUrl
signIn({ scopes: ['openid', 'custom'] })    // Override scopes for this request
signIn({ prompt: 'login' })                 // Force re-authentication
signIn({ organizationId: 'org-123' })       // Sign in to specific org
```

---

## Flow 2: App-Native (Embedded) Sign-In

Uses the Asgardeo Flow Execution API to render authentication steps within the Nuxt app.

### Sequence Diagram

```
User        Nuxt Client            Nuxt Server (Nitro)         Asgardeo
 │              │                         │                        │
 │──render──►   │                         │                        │
 │ <AsgardeoSignIn                        │                        │
 │   mode="embedded"/>                    │                        │
 │              │──POST /api/auth/signin──►│                        │
 │              │  { mode: 'embedded' }   │──POST /flow/init──────►│
 │              │                         │◄──flow response────────│
 │              │◄──{ flowId, nextStep,───│                        │
 │              │    authenticators }      │                        │
 │              │                         │                        │
 │◄──render     │                         │                        │
 │  step 1 UI   │                         │                        │
 │  (username)   │                         │                        │
 │              │                         │                        │
 │──submit──►   │                         │                        │
 │ username      │──POST /api/auth/signin──►│                        │
 │              │  { flowId, params }     │──POST /flow/continue───►│
 │              │                         │◄──flow response────────│
 │              │◄──{ flowId, nextStep }──│                        │
 │              │                         │                        │
 │◄──render     │                         │                        │
 │  step 2 UI   │                         │                        │
 │  (password)   │                         │                        │
 │              │                         │                        │
 │──submit──►   │                         │                        │
 │  password     │──POST /api/auth/signin──►│                        │
 │              │  { flowId, params }     │──POST /flow/continue───►│
 │              │                         │◄──{ SUCCESS_COMPLETED }─│
 │              │                         │                        │
 │              │                         │──exchange code──────────►│
 │              │                         │◄──tokens────────────────│
 │              │                         │──create session JWT──── │
 │              │                         │                        │
 │              │◄──{ flowStatus:         │                        │
 │              │    'SUCCESS_COMPLETED', │                        │
 │              │    redirectUrl }         │                        │
 │              │                         │                        │
 │              │──navigateTo(redirectUrl)─│                        │
 │◄──dashboard──┤                         │                        │
```

### Multi-Step Flow Support

The embedded flow supports arbitrary authenticator steps:

```typescript
interface FlowResult {
  flowStatus: 'INCOMPLETE' | 'SUCCESS_COMPLETED' | 'FAIL_INCOMPLETE' | 'FAIL_COMPLETED'
  flowId?: string
  nextStep?: {
    stepType: string
    authenticators: Authenticator[]
    acceptedParams: string[]
    requiredParams: string[]
    messages?: FlowMessage[]
  }
  redirectUrl?: string  // Only when SUCCESS_COMPLETED
}

interface Authenticator {
  authenticatorId: string
  authenticator: string
  idp: string
  metadata: {
    promptType?: string
    params?: AuthenticatorParam[]
    additionalData?: Record<string, unknown>
  }
}
```

### Supported Flow Types

| Flow | Trigger | Description |
|------|---------|-------------|
| Sign-In | `signIn({ mode: 'embedded' })` | Username/password + MFA |
| Sign-Up | `signUp({ mode: 'embedded' })` | Self-service registration |
| Password Recovery | Linked from sign-in flow | Forgot password |
| Account Verification | Linked from sign-in flow | Email/SMS verification |

---

## Flow 3: Sign-Up

### Redirect Sign-Up

```typescript
// Redirect to Asgardeo hosted sign-up page
signUp()
signUp({ returnTo: '/welcome' })
```

Server route (`signup.get.ts`) is identical to `signin.get.ts` but adds `&prompt=create` or equivalent parameter to the authorization URL.

### Embedded Sign-Up

```typescript
// Start embedded sign-up flow
const result = await signUp({ mode: 'embedded' })

// Renders the Flow Execution API's registration flow
// Supports custom registration fields, agreements, verification steps
```

---

## Flow 4: Sign-Out

```
User        Nuxt Client         Nuxt Server (Nitro)        Asgardeo
 │              │                       │                       │
 │──click──────►│                       │                       │
 │  signOut()   │                       │                       │
 │              │──navigate────────────►│                       │
 │              │  GET /api/auth/signout │                       │
 │              │                       │──revoke refresh token──►│
 │              │                       │  POST /oauth2/revoke   │
 │              │                       │◄──200 OK───────────────│
 │              │                       │                        │
 │              │                       │──destroy session cookie │
 │              │                       │                        │
 │              │                       │──get end_session_url───│
 │              │                       │  (RP-Initiated Logout) │
 │              │                       │                        │
 │◄─────────────┼──302 redirect─────────│                        │
 │              │  to end_session_url    │                        │
 │──────────────┼───────────────────────┼───────────────────────►│
 │              │                       │        ┌──────────┐    │
 │              │                       │        │ IdP ends  │    │
 │              │                       │        │ session   │    │
 │              │                       │        └──────────┘    │
 │◄─────────────┼───────────────────────┼──302 afterSignOutUrl───│
 │              │                       │                        │
 │──SSR page───►│  (no session cookie)  │                        │
 │◄──page with──┤  isSignedIn = false   │                        │
 │  signed out  │                       │                        │
```

### Sign-Out Steps

1. **Revoke refresh token** — POST to Asgardeo's revocation endpoint
2. **Destroy local session** — delete the session JWT cookie
3. **RP-Initiated Logout** — redirect to Asgardeo's end_session_endpoint with `id_token_hint`
4. **Post-logout redirect** — Asgardeo redirects back to `afterSignOutUrl`

---

## Flow 5: Silent Token Refresh

Access tokens expire. The Nuxt SDK handles this transparently:

```
Component               Client Composable        Server Route
    │                        │                        │
    │──getAccessToken()─────►│                        │
    │                        │──GET /api/auth/token───►│
    │                        │                        │──read session cookie
    │                        │                        │──check expiry
    │                        │                        │
    │                        │                        │ [Token expired]
    │                        │                        │──POST /oauth2/token
    │                        │                        │  grant_type=refresh_token
    │                        │                        │  refresh_token=...
    │                        │                        │◄──new tokens
    │                        │                        │──update session cookie
    │                        │                        │
    │                        │◄──{ accessToken }──────│
    │◄──token────────────────│                        │
```

This is fully server-side. The client never sees the refresh token.

---

## Flow 6: Organization Switch

Per spec §6.7, organization switching uses token exchange:

```
User clicks           Client Composable        Server Route           Asgardeo
org in switcher            │                        │                     │
     │                     │                        │                     │
     │──switchOrg(id)─────►│                        │                     │
     │                     │──POST /api/auth/       │                     │
     │                     │  organizations/switch  │                     │
     │                     │  { orgId }             │                     │
     │                     │                        │──POST /oauth2/token──│
     │                     │                        │  grant_type=         │
     │                     │                        │  urn:ietf:params:    │
     │                     │                        │  oauth:grant-type:   │
     │                     │                        │  organization-switch │
     │                     │                        │  token=<current_at>  │
     │                     │                        │  switching_org=id    │
     │                     │                        │◄──new tokens─────────│
     │                     │                        │──update session──────│
     │                     │◄──{ success }──────────│                     │
     │                     │                        │                     │
     │◄──refresh page──────│                        │                     │
```

---

## Auth State Machine

```
                    ┌─────────────┐
                    │   UNKNOWN   │  (initial SSR state before hydration)
                    └──────┬──────┘
                           │
                    server reads cookie
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
     ┌────────────────┐       ┌──────────────────┐
     │  SIGNED_OUT    │       │   SIGNED_IN       │
     │  isSignedIn=F  │       │   isSignedIn=T    │
     │  isLoading=F   │       │   isLoading=F     │
     └───────┬────────┘       └───────┬───────────┘
             │                        │
         signIn()                 signOut()
             │                        │
     ┌───────▼────────┐       ┌───────▼───────────┐
     │   LOADING      │       │   LOADING          │
     │   isLoading=T  │       │   isLoading=T      │
     └───────┬────────┘       └───────┬───────────┘
             │                        │
      auth success/fail         revoke + redirect
             │                        │
     ┌───────┴────────┐       ┌───────▼───────────┐
     │ SIGNED_IN      │       │  SIGNED_OUT        │
     │ / ERROR        │       │                    │
     └────────────────┘       └───────────────────┘
```
