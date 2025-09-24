import React from 'react';
import {useAuthContext} from '@asgardeo/auth-react';
import {Navigate} from '@tanstack/react-router';
/**
 * ProtectedRoute wrapper for TanStack Router.
 * Automatically redirects unauthenticated users.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.redirectTo - Path to redirect if unauthenticated
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({children, redirectTo = '/signin'}: ProtectedRouteProps) {
  const {state} = useAuthContext();
  if (!state?.isAuthenticated) {
    return <Navigate to={redirectTo} />;
  }
  return <>{children}</>;
}
