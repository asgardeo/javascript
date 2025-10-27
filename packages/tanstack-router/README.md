# @asgardeo/tanstack-router

TanStack Router integration for Asgardeo React SDK with protected routes.

[![npm version](https://img.shields.io/npm/v/@asgardeo/tanstack-router.svg)](https://www.npmjs.com/package/@asgardeo/tanstack-router)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Overview

`@asgardeo/tanstack-router` is a supplementary package that provides seamless integration between Asgardeo authentication and TanStack Router. It offers components to easily protect routes and handle authentication flows in your React applications using TanStack Router.

## Features

- 🛡️ **ProtectedRoute Component**: Drop-in component for TanStack Router with built-in authentication
- ⚡ **TypeScript Support**: Full TypeScript support with comprehensive type definitions
- 🎨 **Customizable**: Flexible configuration options for different use cases
- 🔒 **Authentication Guards**: Built-in authentication checking with loading states
- 🚀 **Lightweight**: Minimal bundle size with essential features only
- 🔄 **API Consistency**: Compatible interface with `@asgardeo/react-router` for easy migration

## Installation

```bash
npm install @asgardeo/tanstack-router
# or
yarn add @asgardeo/tanstack-router
# or
pnpm add @asgardeo/tanstack-router
```

### Peer Dependencies

This package requires the following peer dependencies:

```bash
npm install @asgardeo/react @tanstack/react-router react
```

## Quick Start

### 1. Basic Setup with ProtectedRoute

```tsx
import React from 'react';
import { createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { AsgardeoProvider } from '@asgardeo/react';
import { ProtectedRoute } from '@asgardeo/tanstack-router';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import SignIn from './components/SignIn';

const rootRoute = createRootRoute({
  component: () => <div>Root Layout</div>,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <div>Public Home Page</div>,
});

const signinRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signin',
  component: SignIn,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: () => (
    <ProtectedRoute redirectTo="/signin">
      <Dashboard />
    </ProtectedRoute>
  ),
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: () => (
    <ProtectedRoute redirectTo="/signin">
      <Profile />
    </ProtectedRoute>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  signinRoute,
  dashboardRoute,
  profileRoute,
]);

const router = createRouter({ routeTree });

function App() {
  return (
    <AsgardeoProvider
      baseUrl="https://api.asgardeo.io/t/your-org"
      clientId="your-client-id"
    >
      <RouterProvider router={router} />
    </AsgardeoProvider>
  );
}

export default App;
```

### 2. Custom Fallback and Loading States

```tsx
import { ProtectedRoute } from '@asgardeo/tanstack-router';

// Redirect to custom login page
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: () => (
    <ProtectedRoute redirectTo="/login">
      <Dashboard />
    </ProtectedRoute>
  ),
});

// Custom fallback component
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: () => (
    <ProtectedRoute fallback={
      <div className="auth-required">
        <h2>Please sign in</h2>
        <p>You need to be signed in to access this page.</p>
      </div>
    }>
      <Dashboard />
    </ProtectedRoute>
  ),
});

// Custom loading state
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: () => (
    <ProtectedRoute
      redirectTo="/signin"
      loader={<div className="spinner">Loading...</div>}
    >
      <Dashboard />
    </ProtectedRoute>
  ),
});
```

### 3. Integration with Route Layouts

```tsx
import { ProtectedRoute } from '@asgardeo/tanstack-router';

const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app',
  component: AppLayout,
});

const appDashboardRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/dashboard',
  component: () => (
    <ProtectedRoute redirectTo="/signin">
      <Dashboard />
    </ProtectedRoute>
  ),
});

const appProfileRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/profile',
  component: () => (
    <ProtectedRoute redirectTo="/signin">
      <Profile />
    </ProtectedRoute>
  ),
});

const appSettingsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/settings',
  component: () => (
    <ProtectedRoute redirectTo="/signin">
      <Settings />
    </ProtectedRoute>
  ),
});
```

## API Reference

### Components

#### ProtectedRoute

A component that protects routes based on authentication status. Should be used as the component prop of a TanStack Router route.

```tsx
interface ProtectedRouteProps {
  children: React.ReactElement;
  fallback?: React.ReactElement;
  redirectTo?: string;
  loader?: React.ReactNode;
}
```

**Props:**

- `children` - The component to render when authenticated
- `fallback` - Custom component to render when not authenticated (takes precedence over redirectTo)
- `redirectTo` - URL to redirect to when not authenticated (required unless fallback is provided)
- `loader` - Custom loading component to render while authentication status is being determined

**Note:** Either `fallback` or `redirectTo` must be provided to handle unauthenticated users.

## Migration from @asgardeo/react-router

This package provides the same API as `@asgardeo/react-router`, making migration straightforward:

```tsx
// Before (React Router)
<Route
  path="/dashboard"
  element={
    <ProtectedRoute redirectTo="/signin">
      <Dashboard />
    </ProtectedRoute>
  }
/>

// After (TanStack Router)
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: () => (
    <ProtectedRoute redirectTo="/signin">
      <Dashboard />
    </ProtectedRoute>
  ),
});
```

## Examples

Check out our sample applications in the repository:

- [React TanStack Router Sample](../../samples/react-tanstack-router) - Simple React application demonstrating TanStack Router integration with protected routes

## TypeScript Support

This package is written in TypeScript and provides comprehensive type definitions. All components are fully typed for the best development experience.

```tsx
import type { ProtectedRouteProps } from '@asgardeo/tanstack-router';
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](../../CONTRIBUTING.md) for details.

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.

## Support

- 📖 [Documentation](https://wso2.com/asgardeo/docs/sdks/react/)
- 💬 [Community Forum](https://stackoverflow.com/questions/tagged/asgardeo)
- 🐛 [Issues](https://github.com/asgardeo/javascript/issues)

---

Built with ❤️ by the [Asgardeo](https://wso2.com/asgardeo/) team.