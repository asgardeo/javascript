# Asgardeo Nuxt SDK Playground

A sample Nuxt 3 application demonstrating authentication with the [`@asgardeo/nuxt`](../../packages/nuxt) module.

## Prerequisites

- Node.js 18+
- An [Asgardeo](https://wso2.com/asgardeo/) organization with a Single Page Application registered

## Setup

1. Copy the environment template and fill in your Asgardeo application details:

   ```bash
   cp .env.example .env
   ```

2. Install dependencies from the workspace root:

   ```bash
   pnpm install
   ```

3. Start the development server:

   ```bash
   pnpm dev
   ```

   The app will be available at `http://localhost:3000`.

## Environment Variables

| Variable | Description |
|---|---|
| `NUXT_PUBLIC_ASGARDEO_BASE_URL` | Your Asgardeo organization base URL (e.g. `https://<org>.asgardeo.io/t/<tenant>`) |
| `NUXT_PUBLIC_ASGARDEO_CLIENT_ID` | OAuth 2.0 Client ID from your Asgardeo application |
| `ASGARDEO_CLIENT_SECRET` | Client secret from your Asgardeo application |
| `ASGARDEO_SESSION_SECRET` | A random secret (≥32 chars) used to sign JWT sessions |

## Pages

| Route | Description |
|---|---|
| `/` | Public home page with sign-in/out controls |
| `/dashboard` | Protected page — redirects to sign-in if unauthenticated |
