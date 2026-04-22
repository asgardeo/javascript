# Nuxt SDK Playground

A demo application for testing the `@asgardeo/nuxt` SDK.

## Setup

1. Copy `.env.local.example` to `.env` and fill in your Asgardeo app credentials.
2. Install dependencies: `pnpm install`
3. Run the dev server: `pnpm dev`

## Environment Variables

| Variable | Description |
|---|---|
| `NUXT_PUBLIC_ASGARDEO_BASE_URL` | Asgardeo organization URL (e.g., `https://api.asgardeo.io/t/your-org`) |
| `NUXT_PUBLIC_ASGARDEO_CLIENT_ID` | OAuth client ID from Asgardeo |
| `ASGARDEO_CLIENT_SECRET` | OAuth client secret (server-side only) |
| `ASGARDEO_SESSION_SECRET` | Secret for signing session JWTs (min 32 chars) |

## Redirect URLs

Configure these in your Asgardeo application:
- **Authorized redirect URL:** `http://localhost:3000/api/auth/callback`
- **Allowed origins:** `http://localhost:3000`
