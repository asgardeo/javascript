# Nuxt SDK Quick Start Sample

This sample app shows a minimal, production-shaped integration of `@asgardeo/nuxt`.

It is intended as a quick-start reference for developers who want to integrate Asgardeo in a Nuxt application with:

- Redirect-based sign in and sign out
- Protected routes with middleware
- User profile data via `useUser()`
- Organization listing and switching via `useOrganization()`

## Pages

- `/` - Public home page with sign-in/sign-out states
- `/profile` - Protected profile page
- `/organizations` - Protected organizations page with switch action

## Prerequisites

- Node.js 20+
- pnpm 10+
- An Asgardeo application with a valid client ID and secret

## Setup

1. Copy `.env.example` to `.env`.
2. Fill in your Asgardeo tenant and app credentials.
3. From the repository root, install dependencies:

```bash
pnpm install
```

4. Start the sample:

```bash
pnpm --filter @asgardeo/nuxt-sample dev
```

## Environment Variables

```env
NUXT_PUBLIC_ASGARDEO_BASE_URL=https://api.asgardeo.io/t/<your-org>
NUXT_PUBLIC_ASGARDEO_CLIENT_ID=<your-client-id>
ASGARDEO_CLIENT_SECRET=<your-client-secret>
ASGARDEO_SESSION_SECRET=<random-32+-char-string>
```

## Key Files

- `nuxt.config.ts` - Module registration and SDK configuration
- `app.vue` - Root wrapper using `AsgardeoRoot`
- `middleware/auth.ts` - Route protection helper
- `layouts/default.vue` - Shared navigation and auth actions
- `pages/profile.vue` - `useUser()` with flattened profile fields
- `pages/organizations.vue` - `useOrganization()` and `switchOrganization()`

## Expected Flow

1. Open `/` and sign in via the button in the top-right navigation.
2. Visit `/profile` to view your user details.
3. Visit `/organizations` to list your organizations and switch context.
4. Sign out via the button in the top-right navigation.

## Styling

The app uses **Tailwind CSS** for minimal, maintainable styling. No additional UI libraries are included. All Tailwind utility classes are used directly in templates for clean, readable code.
