# Asgardeo TanStack Router Sample Application

This is a sample application demonstrating how to integrate [Asgardeo](https://wso2.com/asgardeo/) authentication with [TanStack Router](https://tanstack.com/router) using the `@asgardeo/tanstack-router` package.

## Features

- ✅ Authentication with Asgardeo
- ✅ Protected routes using `ProtectedRoute` component
- ✅ TanStack Router integration
- ✅ TypeScript support
- ✅ Vite for fast development

## Prerequisites

- Node.js (v18 or higher)
- pnpm
- An Asgardeo account and application

## Getting Started

### 1. Set up Asgardeo

1. Create an account at [Asgardeo](https://wso2.com/asgardeo/)
2. Create a new Single Page Application (SPA)
3. Note down your:
   - Organization name
   - Client ID
4. Configure the following in your Asgardeo application:
   - **Authorized redirect URLs**: `https://localhost:5173`
   - **Allowed origins**: `https://localhost:5173`

### 2. Configure Environment Variables

Create a `.env.local` file in the root of this sample directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Asgardeo credentials:

```bash
VITE_ASGARDEO_BASE_URL='https://api.asgardeo.io/t/<your_organization_name>'
VITE_ASGARDEO_CLIENT_ID='<your_client_id>'
```

### 3. Install Dependencies

From the root of the monorepo, run:

```bash
pnpm install
```

### 4. Run the Application

```bash
cd samples/react-tanstack-router
pnpm dev
```

The application will be available at `https://localhost:5173`

## Project Structure

```
src/
├── pages/
│   ├── Home.tsx          # Unprotected home page
│   └── Dashboard.tsx     # Protected dashboard page
├── main.tsx              # App entry point with router configuration
├── index.css             # Global styles
└── vite-env.d.ts        # Vite type definitions
```

## Key Implementation Details

### Protected Routes

The Dashboard page is protected using the `ProtectedRoute` component from `@asgardeo/tanstack-router`:

```tsx
import {ProtectedRoute} from '@asgardeo/tanstack-router';
import Dashboard from './pages/Dashboard';

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: () => (
    <ProtectedRoute redirectTo="/">
      <Dashboard />
    </ProtectedRoute>
  ),
});
```

### Router Setup

The application uses TanStack Router's imperative API to create routes:

```tsx
import {createRouter, createRootRoute, createRoute} from '@tanstack/react-router';

const rootRoute = createRootRoute();
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

const routeTree = rootRoute.addChildren([indexRoute, dashboardRoute]);
const router = createRouter({routeTree});
```

### Asgardeo Provider

The app is wrapped with `AsgardeoProvider` in `main.tsx`:

```tsx
<AsgardeoProvider
  baseUrl={import.meta.env.VITE_ASGARDEO_BASE_URL}
  clientId={import.meta.env.VITE_ASGARDEO_CLIENT_ID}
  signInUrl="/signin"
  signUpUrl="/signup"
  scopes="openid profile email"
>
  <RouterProvider router={router} />
</AsgardeoProvider>
```

## Authentication Flow

1. User visits the home page (unprotected)
2. User clicks "Sign In" button
3. User is redirected to Asgardeo for authentication
4. After successful authentication, user is redirected back to the application
5. User can now access protected routes like the Dashboard
6. Attempting to access protected routes without authentication redirects to the home page

## Learn More

- [Asgardeo Documentation](https://wso2.com/asgardeo/docs/)
- [TanStack Router Documentation](https://tanstack.com/router/latest)
- [@asgardeo/react Documentation](https://github.com/asgardeo/asgardeo-auth-react-sdk)
- [@asgardeo/tanstack-router Package](../../packages/tanstack-router)

## License

Apache-2.0
