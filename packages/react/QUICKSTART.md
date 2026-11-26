# `@asgardeo/react` Quickstart

This guide will help you quickly integrate Asgardeo authentication into your React application.

## Prerequisites

- [Node.js](https://nodejs.org/en/download) (version 16 or later. LTS version recommended)
- An [Asgardeo account](https://wso2.com/asgardeo/docs/get-started/create-asgardeo-account/)

## Step 1: Configure an Application in Asgardeo

1. **Sign in to Asgardeo Console**
   - Go to [Asgardeo Console](https://console.asgardeo.io/)
   - Sign in with your Asgardeo account

2. **Create a New Application**
   - Click **Applications** in the left sidebar
   - Click **+ New Application**
   - Choose **Single Page Application (SPA)**
   - Enter your application name (e.g., "Teamspace")

3. **Note Down Your Credentials from the `Quickstart` tab**
   - Copy the **Client ID** from the application details
   - Note your **Base URL** (ex: `https://api.asgardeo.io/t/<your-organization-name>`)

4. **Configure Application Settings from the `Protocol` tab**
   - **Authorized redirect URLs**: Add your application URLs
     - `https://localhost:5173`
   - **Allowed origins**: Add the same URLs as above
   - Click **Update** to save the configuration

## Step 2: Create a React Application

If you don't have a React application set up yet, you can create one using Vite:

```bash
# Using npm
npm create vite@latest react-sample --template react

# Using pnpm
pnpm create vite@latest react-sample --template react

# Using yarn
yarn create vite react-sample --template react
```

## Step 3: Install the SDK

Install the Asgardeo React SDK in your project:

```bash
# Using npm
npm install @asgardeo/react

# Using pnpm
pnpm add @asgardeo/react

# Using yarn
yarn add @asgardeo/react
```

## Step 4: Configure the Provider

Wrap your application with the `AsgardeoProvider` in your main entry file i.e. `src/main.tsx`:

```tsx
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import {AsgardeoProvider} from '@asgardeo/react';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AsgardeoProvider baseUrl="<your-organization-base-url>" clientId="<your-app-client-id>">
      <App />
    </AsgardeoProvider>
  </StrictMode>,
);
```

Replace:

- `<your-organization-base-url>` with the Base URL you noted in Step 1 (e.g.,
  `https://api.asgardeo.io/t/<your-organization-name>`)
- `<your-app-client-id>` with the Client ID from Step 1

## Step 5: Add Sign-in & Sign-out to Your App

Update your `App.tsx` to include sign-in and sign-out functionality:

```tsx
import {SignedIn, SignedOut, SignInButton, SignOutButton} from '@asgardeo/react';
import './App.css';

function App() {
  return (
    <>
      <SignedIn>
        <SignOutButton />
      </SignedIn>
      <SignedOut>
        <SignInButton />
      </SignedOut>
    </>
  );
}

export default App;
```

## Step 6: Display User Information

You can also display user information by using the `User` component & the `UserProfile` component:

```tsx
import {SignedIn, SignedOut, SignInButton, SignOutButton, User, UserProfile} from '@asgardeo/react';
import './App.css';

function App() {
  return (
    <>
      <SignedIn>
        <User>
          {({user}) => (
            <div>
              <h1>Welcome, {user.username}</h1>
            </div>
          )}
        </User>
        <UserProfile />
        <SignOutButton />
      </SignedIn>
      <SignedOut>
        <SignInButton />
      </SignedOut>
    </>
  );
}

export default App;
```

## Step 7: Try Login

Run your application and test the sign-in functionality. You should see a "Sign In" button when you're not signed in,
and clicking it will redirect you to the Asgardeo sign-in page.

```bash
# Using npm
npm run dev

# Using pnpm
pnpm dev

# Using yarn
yarn dev
```

## Next Steps

🎉 **Congratulations!** You've successfully integrated Asgardeo authentication into your React app.

### What to explore next:

- **[Complete Guide](./COMPLETE%20GUIDE.md)** - Learn about advanced features and customization
- **[API Documentation](./API.md)** - Explore all available components and hooks
- **Custom Styling** - Customize the appearance of authentication components
- **Protected Routes** - Implement route-level authentication
- **User Profile Management** - Access and manage user profile data

### Common Issues

- **Redirect URL Mismatch**: Ensure your redirect URLs in Asgardeo match your local/production URLs exactly
- **CORS Errors**: Make sure to add your domain to the "Allowed Origins" in your Asgardeo application settings
- **Client ID Issues**: Double-check that you're using the correct Client ID from your Asgardeo application

For more help, visit the [Asgardeo Documentation](https://wso2.com/asgardeo/docs/) or check out our
[examples](../../examples/).
