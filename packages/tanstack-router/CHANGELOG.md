# @asgardeo/tanstack-router

## 0.1.1

### Patch Changes

- Updated dependencies
  [[`2bf7be4`](https://github.com/asgardeo/javascript/commit/2bf7be42f298273fb6888bd55cf55e5eba3476a9)]:
  - @asgardeo/react@0.5.31

## 0.1.0

### Minor Changes

- [#176](https://github.com/asgardeo/javascript/pull/176)
  [`966a562`](https://github.com/asgardeo/javascript/commit/966a562f008fd4bd213ac7102816ec289ec0afe6) Thanks
  [@d3varaja](https://github.com/d3varaja)! - Add TanStack Router integration package with protected route support

  Introduce `@asgardeo/tanstack-router` - a new integration package that provides seamless authentication support for
  TanStack Router applications.

  **Key Features:**

  - `<ProtectedRoute>` component for auth-guarded routes
  - Automatic redirect to sign-in for unauthenticated users
  - Integration with Asgardeo authentication context
  - Type-safe route protection

  **Usage:**

  ```tsx
  import {ProtectedRoute} from '@asgardeo/tanstack-router';

  const Route = createFileRoute('/dashboard')({
    component: () => (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  });
  ```

  **Installation:**

  ```bash
  npm install @asgardeo/tanstack-router
  ```

  This is the initial release of the TanStack Router integration package.

### Patch Changes

- Updated dependencies
  [[`218f930`](https://github.com/asgardeo/javascript/commit/218f930c5f32b779c12af6c1a9fd0c5ea6879525)]:
  - @asgardeo/react@0.5.30

## 0.0.1

### Patch Changes

- Initial implementation of TanStack Router integration for Asgardeo React SDK. This package provides a `ProtectedRoute`
  component that enables route protection with authentication checks for applications using TanStack Router. The
  component supports redirects, fallback rendering, and loading states.
