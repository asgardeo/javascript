# `@asgardeo/vue` Quickstart

This guide will help you quickly integrate Asgardeo authentication into your Vue.js application.

## Prerequisites

- [Node.js](https://nodejs.org/en/download) (version 16 or later. LTS version recommended)
- An [Asgardeo account](https://wso2.com/asgardeo/docs/get-started/create-asgardeo-account/)
- Basic knowledge of Vue 3 and the Composition API

## Step 1: Configure an Application in Asgardeo

1. **Sign in to Asgardeo Console**
   - Go to [Asgardeo Console](https://console.asgardeo.io/)
   - Sign in with your Asgardeo account

2. **Create a New Application**
   - Click **Applications** in the left sidebar
   - Click **+ New Application**
   - Choose **Single Page Application (SPA)**
   - Enter your application name (e.g., "My Vue App")

3. **Note Down Your Credentials from the `Quickstart` tab**
   - Copy the **Client ID** from the application details
   - Note your **Base URL** (ex: `https://api.asgardeo.io/t/<your-organization-name>`)

4. **Configure Application Settings from the `Protocol` tab**
   - **Authorized redirect URLs**: Add your application URLs
     - `https://localhost:5173`
   - **Allowed origins**: Add the same URLs as above
   - Click **Update** to save the configuration

## Step 2: Create a Vue Application

If you don't have a Vue application set up yet, you can create one using `create-vue`:

```bash
# Using npm
npm create vue@latest vue-sample

# Using pnpm
pnpm create vue@latest vue-sample

# Using yarn
yarn create vue vue-sample
```

When prompted, enable TypeScript for a better development experience.

Alternatively, using Vite:

```bash
# Using npm
npm create vite@latest vue-sample --template vue-ts

# Using pnpm
pnpm create vite@latest vue-sample --template vue-ts

# Using yarn
yarn create vite vue-sample --template vue-ts
```

Navigate to your project:

```bash
cd vue-sample
```

## Step 3: Install the SDK

Install the Asgardeo Vue SDK in your project:

```bash
# Using npm
npm install @asgardeo/vue

# Using pnpm
pnpm add @asgardeo/vue

# Using yarn
yarn add @asgardeo/vue
```

## Step 4: Configure the Provider

Register the Asgardeo plugin and wrap your application with the `AsgardeoProvider` in your main entry file (`src/main.ts`):

```ts
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { AsgardeoPlugin, AsgardeoProvider } from '@asgardeo/vue'

const app = createApp(App)

app.use(AsgardeoPlugin, {
  baseUrl: '<your-organization-base-url>',
  clientId: '<your-app-client-id>',
})

app.mount('#app')
```

Replace:
- `<your-organization-base-url>` with the Base URL you noted in Step 1 (e.g., `https://api.asgardeo.io/t/<your-organization-name>`)
- `<your-app-client-id>` with the Client ID from Step 1

Then wrap your app component with the `AsgardeoProvider` in `src/App.vue`:

```vue
<script setup>
import { AsgardeoProvider } from '@asgardeo/vue'
</script>

<template>
  <AsgardeoProvider>
    <!-- Your application content goes here -->
  </AsgardeoProvider>
</template>
```

## Step 5: Add Sign-in & Sign-out to Your App

Update your `src/App.vue` to include sign-in and sign-out functionality:

```vue
<script setup lang="ts">
import { SignedIn, SignedOut, SignInButton, SignOutButton } from '@asgardeo/vue'
</script>

<template>
  <div>
    <SignedIn>
      <SignOutButton />
    </SignedIn>
    <SignedOut>
      <SignInButton />
    </SignedOut>
  </div>
</template>

<style scoped>
/* Your custom styles */
</style>
```

## Step 6: Display User Information

You can also display user information by using the `User` component and the `useUser` composable:

```vue
<script setup lang="ts">
import { SignedIn, SignedOut, SignInButton, SignOutButton, User } from '@asgardeo/vue'
import { useUser } from '@asgardeo/vue'

const { user, isLoading } = useUser()
</script>

<template>
  <div>
    <SignedIn>
      <div v-if="!isLoading" class="user-info">
        <h1>Welcome, {{ user?.username }}</h1>
        <p>Email: {{ user?.email }}</p>
      </div>
      <div v-else>
        Loading user information...
      </div>
      <SignOutButton />
    </SignedIn>
    <SignedOut>
      <SignInButton />
    </SignedOut>
  </div>
</template>

<style scoped>
.user-info {
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 1rem;
}

h1 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

p {
  margin: 0;
  color: #666;
}
</style>
```

### Using the User Render Function Pattern

Alternatively, you can use the `User` component with a render function:

```vue
<script setup lang="ts">
import { SignedIn, SignedOut, SignInButton, SignOutButton, User } from '@asgardeo/vue'
</script>

<template>
  <div>
    <SignedIn>
      <User v-slot="{ user, isLoading }">
        <div v-if="!isLoading" class="user-info">
          <h1>Welcome, {{ user.username }}</h1>
          <p>Email: {{ user.email }}</p>
        </div>
        <div v-else>
          Loading user information...
        </div>
      </User>
      <SignOutButton />
    </SignedIn>
    <SignedOut>
      <SignInButton />
    </SignedOut>
  </div>
</template>
```

## Step 7: Try Login

Run your application and test the sign-in functionality. You should see a "Sign In" button when you're not signed in, and clicking it will redirect you to the Asgardeo sign-in page.

```bash
# Using npm
npm run dev

# Using pnpm
pnpm dev

# Using yarn
yarn dev
```

Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal). Click the "Sign In" button to test the authentication flow.

## Step 8: Handle Callback

The SDK automatically handles the OAuth callback redirect. Make sure your application loads correctly after returning from Asgardeo. For custom callback handling, you can use the `Callback` component:

```vue
<script setup lang="ts">
import { Callback } from '@asgardeo/vue'
</script>

<template>
  <div>
    <Callback />
  </div>
</template>
```

## Next Steps

🎉 **Congratulations!** You've successfully integrated Asgardeo authentication into your Vue app.

### What to explore next:

- **[API Documentation](https://wso2.com/asgardeo/docs/sdks/vue/overview)** - Learn about all available composables and components
- **[Composables Guide](https://wso2.com/asgardeo/docs/sdks/vue/composables)** - Master the composable API (`useUser`, `useOrganization`, etc.)
- **[Custom Styling](https://wso2.com/asgardeo/docs/sdks/vue/customization/styling)** - Customize the appearance of authentication components
- **[Protected Routes](https://wso2.com/asgardeo/docs/sdks/vue/protected-routes)** - Implement route-level authentication
- **[Organizations/Workspaces](https://wso2.com/asgardeo/docs/sdks/vue/organizations)** - Implement multi-tenancy features
- **[User Profile Management](https://wso2.com/asgardeo/docs/sdks/vue/user-profile)** - Access and manage user profile data
- **[Social Login](https://wso2.com/asgardeo/docs/sdks/vue/social-login)** - Enable sign-in with Google, GitHub, Microsoft, and Facebook

## Common Issues

### Redirect URL Mismatch
- **Problem**: Getting errors about redirect URI not matching
- **Solution**: Ensure your redirect URLs in Asgardeo match your local/production URLs exactly (including protocol and port)

### CORS Errors
- **Problem**: Getting CORS-related errors in the console
- **Solution**: Make sure to add your domain to the "Allowed Origins" in your Asgardeo application settings

### Client ID Not Found
- **Problem**: Authentication fails with "Client ID is invalid"
- **Solution**: Double-check that you're using the correct Client ID from your Asgardeo application and that it's properly configured in the plugin options

### Plugin Not Registered
- **Problem**: Vue warns about plugin not being registered
- **Solution**: Make sure you've called `app.use(AsgardeoPlugin, { ... })` before mounting your app

### State Not Updating
- **Problem**: User state doesn't update after sign-in
- **Solution**: Ensure you're using the composable (`useUser`) inside a component wrapped with `AsgardeoProvider`

## More Resources

- [Asgardeo Documentation](https://wso2.com/asgardeo/docs/)
- [Vue.js Documentation](https://vuejs.org/)
- [SDK Examples](../../samples/)
- [GitHub Repository](https://github.com/asgardeo/asgardeo-auth-vue-sdk)

## Getting Help

If you encounter issues:
1. Check the [FAQs](https://wso2.com/asgardeo/docs/faq/)
2. Search [GitHub Issues](https://github.com/asgardeo/asgardeo-auth-vue-sdk/issues)
3. Ask on the [WSO2 Community Forum](https://wso2.com/community/)
4. Contact [Asgardeo Support](https://wso2.com/asgardeo/support/)
