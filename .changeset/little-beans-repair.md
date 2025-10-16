---
'@asgardeo/tanstack-router': major
---

Add TanStack Router integration package with protected route support

Introduce `@asgardeo/tanstack-router` - a new integration package that provides seamless authentication support for TanStack Router applications.

**Key Features:**
- `<ProtectedRoute>` component for auth-guarded routes
- Automatic redirect to sign-in for unauthenticated users
- Integration with Asgardeo authentication context
- Type-safe route protection

**Usage:**

```tsx
import { ProtectedRoute } from '@asgardeo/tanstack-router';

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