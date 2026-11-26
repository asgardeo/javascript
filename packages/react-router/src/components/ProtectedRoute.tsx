/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import {AsgardeoRuntimeError, navigate, useAsgardeo} from '@asgardeo/react';
import {FC, MutableRefObject, ReactElement, ReactNode, useEffect, useRef, useState} from 'react';
import {Navigate} from 'react-router';

/**
 * Props for the ProtectedRoute component.
 */
export interface ProtectedRouteProps {
  /**
   * The element to render when the user is authenticated.
   */
  children: ReactElement;
  /**
   * Custom fallback element to render when the user is not authenticated.
   * If provided, this takes precedence over redirectTo.
   */
  fallback?: ReactElement;
  /**
   * Custom loading element to render while authentication status is being determined.
   */
  loader?: ReactNode;
  /**
   * Custom sign-in function to override the default behavior.
   * If provided, this function will be called instead of the default signIn method
   * when the user is not authenticated and no fallback or redirectTo is specified.
   * This allows you to pass additional parameters or implement custom sign-in logic.
   *
   * @param defaultSignIn - The default signIn method from useAsgardeo hook
   * @param signInOptions - Merged sign-in options (context + component props)
   */
  onSignIn?: (defaultSignIn: (options?: Record<string, any>) => void, signInOptions?: Record<string, any>) => void;
  /**
   * URL to redirect to when the user is not authenticated.
   * Without `redirectTo` or `fallback`, the component starts sign-in itself.
   */
  redirectTo?: string;
  /**
   * Additional parameters to pass to the authorize request.
   * These will be merged with the default signInOptions from the Asgardeo context.
   * Common options include:
   * - prompt: "login" | "none" | "consent" | "select_account"
   * - fidp: Federation Identity Provider identifier
   * - kc_idp_hint: Keycloak identity provider hint
   * - login_hint: Hint to help with the username/identifier in the login form
   * - max_age: Maximum authentication age in seconds
   * - ui_locales: End-user's preferred languages and scripts for the user interface
   *
   * @example
   * ```tsx
   * signInOptions={{
   *   prompt: "login",
   *   fidp: "OrganizationSSO",
   *   login_hint: "user@example.com"
   * }}
   * ```
   */
  signInOptions?: Record<string, any>;
}

/**
 * A protected route component that requires authentication to access.
 *
 * This component should be used as the element prop of a Route component.
 * It checks authentication status and either renders the protected content,
 * shows a loading state, redirects, or shows a fallback.
 *
 * For signed-out users it renders `fallback`, or redirects to `redirectTo`. Without either, it starts sign-in
 * (through `signInUrl`, `onSignIn` or the SDK's `signIn`) and renders `loader` until the browser leaves the page.
 *
 * @example Basic usage with redirect
 * ```tsx
 * <Route
 *   path="/dashboard"
 *   element={
 *     <ProtectedRoute redirectTo="/signin">
 *       <Dashboard />
 *     </ProtectedRoute>
 *   }
 * />
 * ```
 *
 * @example With custom fallback
 * ```tsx
 * <Route
 *   path="/admin"
 *   element={
 *     <ProtectedRoute fallback={<div>Access denied</div>}>
 *       <AdminPanel />
 *     </ProtectedRoute>
 *   }
 * />
 * ```
 *
 * @example With custom sign-in parameters
 * ```tsx
 * <Route
 *   path="/secure"
 *   element={
 *     <ProtectedRoute signInOptions={{ prompt: "login", fidp: "OrganizationSSO" }}>
 *       <SecureContent />
 *     </ProtectedRoute>
 *   }
 * />
 * ```
 *
 * @example With custom sign-in handler
 * ```tsx
 * <Route
 *   path="/custom"
 *   element={
 *     <ProtectedRoute
 *       onSignIn={(defaultSignIn, options) => {
 *         // Custom logic before sign-in
 *         console.log('Initiating custom sign-in');
 *         defaultSignIn({ ...options, prompt: "login" });
 *       }}
 *       signInOptions={{ fidp: "CustomIDP" }}
 *     >
 *       <CustomContent />
 *     </ProtectedRoute>
 *   }
 * />
 * ```
 */
const ProtectedRoute: FC<ProtectedRouteProps> = ({
  children,
  fallback,
  redirectTo,
  loader = null,
  onSignIn,
  signInOptions: overriddenSignInOptions,
}: ProtectedRouteProps) => {
  const {isSignedIn, isLoading, signIn, signInOptions, signInUrl} = useAsgardeo();
  const [signInError, setSignInError] = useState<AsgardeoRuntimeError | null>(null);
  const hasStartedSignIn: MutableRefObject<boolean> = useRef<boolean>(false);

  const shouldStartSignIn: boolean = !isLoading && !isSignedIn && !fallback && !redirectTo;

  // Start sign-in after render, and only once, instead of as a side effect of rendering.
  useEffect(() => {
    if (!shouldStartSignIn || hasStartedSignIn.current) {
      return;
    }

    hasStartedSignIn.current = true;

    const resolvedSignInOptions: Record<string, any> = {...signInOptions, ...overriddenSignInOptions};

    if (signInUrl) {
      navigate(signInUrl);

      return;
    }

    if (onSignIn) {
      onSignIn(signIn, resolvedSignInOptions);

      return;
    }

    (async (): Promise<void> => {
      try {
        await signIn(resolvedSignInOptions);
      } catch (error) {
        setSignInError(
          new AsgardeoRuntimeError(
            'Sign-in failed in ProtectedRoute.',
            'ProtectedRoute-SignInError-001',
            'react-router',
            `An error occurred during sign-in: ${(error as Error)?.message}`,
          ),
        );
      }
    })();
  }, [shouldStartSignIn, signInUrl, onSignIn, signIn, signInOptions, overriddenSignInOptions]);

  // Surface a failed sign-in to the nearest error boundary.
  if (signInError) {
    throw signInError;
  }

  // Always wait for loading to finish before making authentication decisions
  if (isLoading) {
    return loader;
  }

  if (isSignedIn) {
    return children;
  }

  if (fallback) {
    return fallback;
  }

  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  // Sign-in has started (see the effect above); keep showing the loader until the browser leaves the page.
  return loader;
};

export default ProtectedRoute;
