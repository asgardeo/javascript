import {Link} from '@tanstack/react-router';
import {useAsgardeo, User} from '@asgardeo/react';

export default function Dashboard() {
  const {signOut} = useAsgardeo();

  return (
    <div>
      <nav className="nav">
        <div>
          <h2>Asgardeo + TanStack Router</h2>
        </div>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
          <button onClick={() => signOut()}>Sign Out</button>
        </div>
      </nav>

      <div className="container">
        <div className="page-header">
          <h1>Dashboard</h1>
          <p>This is a protected page. You can only see this because you're authenticated!</p>
        </div>

        <div className="card">
          <h2>User Information</h2>
          <User>
            {user => (
              <div>
                {user ? (
                  <div className="user-info">
                    <div>
                      <p>
                        <strong>Name:</strong>{' '}
                        {user?.givenName || user?.name?.givenName || user?.given_name}{' '}
                        {user?.name?.familyName || user?.familyName || user?.family_name || ''}
                      </p>
                      <p>
                        <strong>Email:</strong> {user?.email || 'N/A'}
                      </p>
                      <p>
                        <strong>Username:</strong> {user?.username || 'N/A'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p>Loading user information...</p>
                )}
              </div>
            )}
          </User>
        </div>

        <div className="grid">
          <div className="stat-card">
            <h3>24</h3>
            <p>Active Projects</p>
          </div>
          <div className="stat-card">
            <h3>152</h3>
            <p>Tasks Completed</p>
          </div>
          <div className="stat-card">
            <h3>8</h3>
            <p>Team Members</p>
          </div>
          <div className="stat-card">
            <h3>98%</h3>
            <p>Success Rate</p>
          </div>
        </div>

        <div className="card">
          <h2>About Protected Routes</h2>
          <p>
            This Dashboard page is wrapped with the <code>ProtectedRoute</code> component from{' '}
            <code>@asgardeo/tanstack-router</code>. This ensures that only authenticated users can access this page.
          </p>
          <p>
            If an unauthenticated user tries to access this route, they will be redirected to the home page
            automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
