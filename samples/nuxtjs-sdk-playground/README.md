# `@asgardeo/nuxt` SDK Playground

A feature-complete Nuxt 3 showcase for the [`@asgardeo/nuxt`](../../packages/nuxt/) SDK.  
Every public API, component, server utility, and middleware pattern is demonstrated with live previews and copy-pasteable code snippets.

## Quick start

```bash
# 1. Copy env template and fill in your Asgardeo app credentials
cp .env.example .env

# 2. Install dependencies (from repo root)
pnpm install

# 3. Start the dev server
pnpm --filter nuxtjs-sdk-playground dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Description |
|---|---|
| `NUXT_PUBLIC_ASGARDEO_BASE_URL` | Asgardeo org base URL, e.g. `https://api.asgardeo.io/t/your_org` |
| `NUXT_PUBLIC_ASGARDEO_CLIENT_ID` | OAuth2 Client ID |
| `ASGARDEO_CLIENT_SECRET` | Client Secret (server-only) |
| `ASGARDEO_SESSION_SECRET` | JWT signing secret — 32+ random chars |

Generate a strong session secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Structure

```
samples/nuxtjs-sdk-playground/
├── .env.example
├── nuxt.config.ts           # SDK config + Tailwind
├── app.vue                  # Root — wraps <NuxtPage> in <AsgardeoRoot>
├── assets/css/
│   ├── tokens.css           # CSS variable declarations (:root defaults)
│   ├── main.css             # Entry — imports tokens, themes, Tailwind
│   └── themes/
│       ├── orange.css       # Default Asgardeo palette (light + dark)
│       └── blue.css         # Alternate palette (proves swappability)
├── components/
│   ├── layout/              # LayoutPageHeader, LayoutSectionCard, LayoutCodeBlock, LayoutTabGroup, Sidebar
│   └── shared/              # SharedStatusBadge, SharedConfigRow, SharedResultPanel, SharedJsonViewer, SharedCopyButton, SharedThemeSwitcher
├── composables/
│   └── useThemeMode.ts      # Playground palette + dark-mode state
├── pages/
│   ├── index.vue            # Overview — SDK status, config, quick actions
│   ├── auth-flows/          # Redirect & embedded sign-in flows
│   ├── components/          # Every UI component — live preview + code
│   ├── apis/                # Every composable — interactive buttons + ResultPanel
│   ├── server/              # Server utilities: session, token, SCIM2 profile
│   ├── middleware/          # Named auth middleware + defineAsgardeoMiddleware
│   └── debug/               # Raw useState dump + preferences inspector
└── server/api/demo/         # Nitro routes backing the /server/* pages
```

## SDK surface coverage

| Sidebar section | Page | SDK surface |
|---|---|---|
| **Overview** | `/` | `useAsgardeo()`, config inspector, quick links |
| **Auth Flows** | `/auth-flows` | `AsgardeoSignInButton`, `AsgardeoSignOutButton`, `AsgardeoSignUpButton` |
|  | `/auth-flows/embedded` | `<AsgardeoSignIn>`, `<AsgardeoSignUp>`, `<AsgardeoCallback>` |
| **Components** | `/components/control` | `AsgardeoSignedIn`, `AsgardeoSignedOut`, `AsgardeoLoading` |
|  | `/components/actions` | Sign-in / sign-out / sign-up buttons — props, slots, callbacks |
|  | `/components/user` | `AsgardeoUser`, `AsgardeoUserProfile`, `AsgardeoUserDropdown` |
|  | `/components/organization` | `AsgardeoOrganization`, `AsgardeoOrganizationProfile`, `AsgardeoOrganizationSwitcher`, `AsgardeoOrganizationList`, `AsgardeoCreateOrganization` |
| **Public APIs** | `/apis/asgardeo` | `useAsgardeo` — `isSignedIn`, `isLoading`, `user`, `signIn`, `signOut`, `signUp` |
|  | `/apis/user` | `useUser` — `profile`, `flattenedProfile`, `schemas`, `updateProfile`, `revalidateProfile` |
|  | `/apis/organization` | `useOrganization` — `currentOrganization`, `myOrganizations`, `getAllOrganizations`, `onOrganizationSwitch` |
|  | `/apis/flow` | `useFlow` |
|  | `/apis/theme` | `useTheme` — light/dark toggle, branding |
|  | `/apis/branding` | `useBranding` — `BrandingPreference` display, `fetchBranding()` hits `GET /api/auth/branding` |
|  | `/apis/i18n` | `useAsgardeoI18n` — locale switching at runtime |
| **SDK Routes** | `/routes` | Overview table of all `/api/auth/*` routes + one-click smoke-test |
|  | `/routes/session/signin` | `GET /api/auth/signin` — initiates the OAuth2 redirect flow |
|  | `/routes/session/callback` | `GET /api/auth/callback` — code exchange & session cookie |
|  | `/routes/session/signout` | `POST /api/auth/signout` — CSRF-safe session teardown |
|  | `/routes/session/session` | `GET /api/auth/session` — decoded session state |
|  | `/routes/session/token` | `GET /api/auth/token` — current access token |
|  | `/routes/user/user` | `GET /api/auth/user` — basic user info from ID token claims |
|  | `/routes/user/profile-get` | `GET /api/auth/user/profile` — full SCIM2 profile |
|  | `/routes/user/profile-patch` | `PATCH /api/auth/user/profile` — update profile via SCIM2 PatchOp |
|  | `/routes/organizations/list` | `GET /api/auth/organizations` — list all orgs with filter + pagination |
|  | `/routes/organizations/create` | `POST /api/auth/organizations` — create a new organization |
|  | `/routes/organizations/me` | `GET /api/auth/organizations/me` — user's own org memberships |
|  | `/routes/organizations/current` | `GET /api/auth/organizations/current` — currently active org |
|  | `/routes/organizations/by-id` | `GET /api/auth/organizations/:id` — single org by ID |
|  | `/routes/organizations/switch` | `POST /api/auth/organizations/switch` — switch active org |
|  | `/routes/branding` | `GET /api/auth/branding` — org branding preference |
| **Server Utilities** | `/server/session` | `useServerSession(event)` + `requireServerSession(event)` |
|  | `/server/token` | `getValidAccessToken(event)` — proactive refresh demo |
|  | `/server/userinfo` | `AsgardeoNuxtClient.getInstance().getUserProfile()` |
| **Middleware** | `/middleware/protected` | Named `'auth'` middleware — `returnTo` flow |
|  | `/middleware/org-required` | `defineAsgardeoMiddleware({ requireOrganization: true })` |
|  | `/middleware/scoped` | `defineAsgardeoMiddleware({ requireScopes: [...] })` |
| **Debug** | `/debug` | All `useState('asgardeo:*')` keys — live JSON tree |
|  | `/debug/preferences` | `useRuntimeConfig().public.asgardeo.preferences` inspector |

---

## Theming model

Every color, font size, and border radius lives in a **CSS variable token layer** (`assets/css/tokens.css`). Tailwind utility classes map to those vars — zero raw colors appear in component files. Swapping the entire palette means editing **one CSS file**.

### Runtime palette + dark mode (Theme Switcher)

The sidebar **Theme Switcher** calls `useThemeMode()` which sets `data-theme` and `data-theme-mode` attributes on `<html>`:

```
data-theme="orange"       → orange palette (default)
data-theme="blue"         → blue palette
data-theme-mode="light"   → light surfaces (default)
data-theme-mode="dark"    → dark surfaces
```

Selections are persisted to `localStorage` (`asgardeo-playground-theme` / `asgardeo-playground-mode`) so they survive page reloads.

### Swap the palette globally (build-time)

Change the active `@import` in `assets/css/main.css`:

```css
/* current default */
@import './themes/orange.css';

/* switch to blue */
/* @import './themes/blue.css'; */
```

Both theme files are always imported (they scope their rules to `[data-theme]` selectors), but changing the default import here sets which palette is active before `useThemeMode` hydrates from `localStorage`.

### Add a new theme in 3 steps

1. **Copy** `assets/css/themes/orange.css` → `assets/css/themes/myteam.css`.
2. **Edit** the CSS variable values under the `[data-theme="orange"]` selector — change the selector name to `[data-theme="myteam"]` and tweak the `--color-accent-*` and surface tokens.
3. **Register** the new theme name in `composables/useThemeMode.ts`:

```ts
// composables/useThemeMode.ts
export type ThemeName = 'orange' | 'blue' | 'myteam';   // add here
```

   Then add an import in `assets/css/main.css`:

```css
@import './themes/myteam.css';
```

   The Theme Switcher will offer the new palette immediately — no component changes needed.

### Dark mode

`themes/orange.css` (and `blue.css`) export a `[data-theme-mode="dark"]` selector that overrides only the neutral surface and text tokens — the accent color stays the same. Call `useThemeMode().toggleMode()` from any component to flip it:

```ts
const { toggleMode } = useThemeMode();
```

---

## Add a new demo in 3 minutes

Every demo page is a **self-contained leaf** — no shared stores, no cross-page state. Adding one is:

### 1. Copy the template page

```bash
cp pages/apis/asgardeo.vue pages/apis/my-new-api.vue
```

`pages/apis/asgardeo.vue` is the reference template. It shows the canonical structure:
- `<LayoutPageHeader>` at the top
- One or more `<LayoutSectionCard>` blocks (each wraps a feature)
- A `<SharedResultPanel>` wired to a `$fetch` call
- A `<LayoutCodeBlock>` at the bottom with the copy-pasteable snippet

### 2. Add a nav entry

Open `components/layout/Sidebar.vue` and add one object to the relevant `children` array:

```ts
// Inside the 'Public APIs' navItem children:
{ path: '/apis/my-new-api', label: 'myNewComposable' },
```

Nuxt's file-based routing picks up the new page automatically — no `router.ts` to edit.

### 3. (Optional) Add a backing server route

If the demo needs a Nitro handler, create `server/api/demo/my-new.get.ts`:

```ts
// server/api/demo/my-new.get.ts
// Server utilities (useServerSession, getValidAccessToken) are auto-imported.
export default defineEventHandler(async (event) => {
  const session = await useServerSession(event);
  if (!session) throw createError({ statusCode: 401, statusMessage: 'Not signed in' });
  return { message: 'Hello from Nitro', sub: session.sub };
});
```

Then call it from the page:

```ts
// pages/apis/my-new-api.vue  <script setup>
const result = ref(null);
async function fetchData() {
  result.value = await $fetch('/api/demo/my-new');
}
```

That's the full recipe — one file, one nav entry, optional server route.
