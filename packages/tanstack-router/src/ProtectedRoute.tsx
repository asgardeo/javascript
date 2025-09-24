import React from 'react';
import type {ReactNode} from 'react';
import {useAuthContext} from '@asgardeo/auth-react';
import {Navigate} from '@tanstack/react-router';

interface ProtectedRouteProps {
  children: ReactNode; // children are required
  redirectTo?: string; // optional, defaults to '/signin'
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({children, redirectTo = '/signin'}) => {
  const {state} = useAuthContext();

  if (!state?.isAuthenticated) {
    return <Navigate to={redirectTo} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
