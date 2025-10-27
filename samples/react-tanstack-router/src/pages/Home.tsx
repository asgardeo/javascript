import {Link} from '@tanstack/react-router';
import {useAsgardeo, SignInButton} from '@asgardeo/react';

export default function Home() {
  const {isSignedIn, signOut} = useAsgardeo();

  return (
    <div>
      <nav className="nav">
        <div>
          <h2>Asgardeo + TanStack Router</h2>
        </div>
        <div className="nav-links">
          <Link to="/">Home</Link>
          {isSignedIn ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <button onClick={() => signOut()}>Sign Out</button>
            </>
          ) : (
            <SignInButton>
              {({isLoading}) => <button disabled={isLoading}>{isLoading ? 'Loading...' : 'Sign In'}</button>}
            </SignInButton>
          )}
        </div>
      </nav>

      <div className="hero">
        <h1>Welcome to Asgardeo TanStack Router Sample</h1>
        <p>
          This is a sample application demonstrating the integration of Asgardeo authentication with TanStack Router.
        </p>

        {!isSignedIn && (
          <div>
            <SignInButton>
              {({isLoading}) => <button disabled={isLoading}>{isLoading ? 'Loading...' : 'Get Started'}</button>}
            </SignInButton>
          </div>
        )}

        {isSignedIn && (
          <div>
            <Link to="/dashboard">
              <button>Go to Dashboard</button>
            </Link>
          </div>
        )}
      </div>

      <div className="container">
        <div className="grid">
          <div className="stat-card">
            <h3>🔐</h3>
            <h4>Secure Authentication</h4>
            <p>Powered by Asgardeo</p>
          </div>
          <div className="stat-card">
            <h3>🚀</h3>
            <h4>Fast Routing</h4>
            <p>Built with TanStack Router</p>
          </div>
          <div className="stat-card">
            <h3>⚡</h3>
            <h4>Protected Routes</h4>
            <p>Easy route protection</p>
          </div>
        </div>

        <div className="card">
          <h2>About This Sample</h2>
          <p>
            This sample demonstrates how to use the <code>@asgardeo/tanstack-router</code> package to protect routes in
            your TanStack Router application. The Dashboard page is protected and requires authentication to access.
          </p>
          <p>
            Try signing in and navigating to the Dashboard to see the <code>ProtectedRoute</code> component in action!
          </p>
        </div>
      </div>
    </div>
  );
}
