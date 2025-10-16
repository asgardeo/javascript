import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {RouterProvider, createRouter, createRootRoute, createRoute} from '@tanstack/react-router';
import {AsgardeoProvider} from '@asgardeo/react';
import {ProtectedRoute} from '@asgardeo/tanstack-router';
import './index.css';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';

const rootRoute = createRootRoute();

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: () => (
    <ProtectedRoute redirectTo="/">
      <Dashboard />
    </ProtectedRoute>
  ),
});

const routeTree = rootRoute.addChildren([indexRoute, dashboardRoute]);
const router = createRouter({routeTree});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AsgardeoProvider
      baseUrl={import.meta.env.VITE_ASGARDEO_BASE_URL}
      clientId={import.meta.env.VITE_ASGARDEO_CLIENT_ID}
      signInUrl="/signin"
      signUpUrl="/signup"
      scopes="openid profile email"
    >
      <RouterProvider router={router} />
    </AsgardeoProvider>
  </StrictMode>,
);
