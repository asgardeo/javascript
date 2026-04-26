<p align="center" style="color: #343a40">
  <h1 align="center">@asgardeo/vue</h1>
</p>
<p align="center" style="font-size: 1.2rem;">Vue.js SDK for Asgardeo</p>
<div align="center">
  <img alt="npm (scoped)" src="https://img.shields.io/npm/v/@asgardeo/vue">
  <img alt="npm" src="https://img.shields.io/npm/dw/@asgardeo/vue">
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg" alt="License"></a>
</div>

## Overview

The Asgardeo Vue SDK provides a streamlined way to integrate secure authentication and user management into your Vue.js applications. Built for Vue 3, it offers a comprehensive set of composables, components, and utilities to handle authentication flows, user profiles, and multi-tenancy features.

## Key Features

- **Easy Integration**: Simple setup with the `AsgardeoPlugin` and provider components
- **Composable API**: Vue 3 composables for reactive authentication state management
- **Pre-built Components**: Ready-to-use components for sign-in, sign-up, user profiles, and more
- **Multi-Tenancy Support**: Built-in organization/workspace management capabilities
- **Customizable UI**: Primitive components and styling options for seamless integration
- **International Support**: Multi-language support with easy localization
- **Type-Safe**: Full TypeScript support for better developer experience

## Quick Start

Get started with Asgardeo in your Vue application in minutes. Follow our [Vue Quick Start Guide](./QUICKSTART.md) for step-by-step instructions on integrating authentication into your app.

## Installation

```bash
# Using npm
npm install @asgardeo/vue

# Using pnpm
pnpm add @asgardeo/vue

# Using yarn
yarn add @asgardeo/vue
```

## Basic Usage

```vue
<script setup lang="ts">
import { useUser } from '@asgardeo/vue'

const { user, isLoading } = useUser()
</script>

<template>
  <div>
    <p v-if="isLoading">Loading...</p>
    <p v-else-if="user">Welcome, {{ user.username }}</p>
    <p v-else>Not signed in</p>
  </div>
</template>
```

## API Documentation

For complete API documentation including all components, composables, and customization options, see the [Vue SDK Documentation](https://wso2.com/asgardeo/docs/sdks/vue/overview).

## Supported Features

### Composables
- `useAsgardeo()` - Main SDK client access
- `useUser()` - User profile and authentication state
- `useOrganization()` - Organization/workspace management
- `useI18n()` - Internationalization
- `useTheme()` - Theme customization
- `useBranding()` - Branding customization
- `useFlow()` - Authentication flow control
- `useFlowMeta()` - Flow metadata access

### Components

#### Control
- `SignedIn` - Renders children only when user is authenticated
- `SignedOut` - Renders children only when user is not authenticated
- `Loading` - Renders children while authentication state is loading
- `UserComponent` - Access user information with scoped slot pattern
- `OrganizationComponent` - Access organization context with scoped slot pattern

#### Actions
- `SignInButton` / `BaseSignInButton` - Sign-in button (styled and unstyled)
- `SignOutButton` / `BaseSignOutButton` - Sign-out button (styled and unstyled)
- `SignUpButton` / `BaseSignUpButton` - Sign-up button (styled and unstyled)

#### Presentation
- `SignIn` / `BaseSignIn` - Embedded sign-in form
- `SignUp` / `BaseSignUp` - Embedded sign-up form
- `UserProfileComponent` / `BaseUserProfile` - User profile display
- `UserDropdown` / `BaseUserDropdown` - User menu dropdown
- `OrganizationList` / `BaseOrganizationList` - Organization listing
- `OrganizationSwitcher` / `BaseOrganizationSwitcher` - Organization switcher
- `OrganizationProfile` / `BaseOrganizationProfile` - Organization profile
- `CreateOrganization` / `BaseCreateOrganization` - Organization creation form
- `AcceptInvite` / `BaseAcceptInvite` - Invitation acceptance
- `InviteUser` / `BaseInviteUser` - User invitation form
- `LanguageSwitcher` / `BaseLanguageSwitcher` - Language selection

#### Auth Flow
- `Callback` - Handle OAuth callback redirect

#### Social Login Adapters
- `GoogleButton` - Sign in with Google
- `FacebookButton` - Sign in with Facebook
- `GitHubButton` - Sign in with GitHub
- `MicrosoftButton` - Sign in with Microsoft

#### Primitives
- `Button`, `Card`, `Alert`, `TextField`, `PasswordField`, `Select`, `Checkbox`, `DatePicker`, `OtpField`, `Typography`, `Divider`, `Logo`, `Spinner`

### Utilities
- `createAsgardeoGuard` - Vue Router navigation guard for protected routes
- `createCallbackRoute` - Generate a callback route record for Vue Router
- `handleWebAuthnAuthentication` - WebAuthn/passkey support
- `hasAuthParamsInUrl` - Detect OAuth parameters in URL
- `navigate` - Programmatic navigation helper
- `http` - HTTP client with token management

## Examples

Check out our [example applications](../../samples/) to see the Vue SDK in action:
- [Vue SDK Playground](../../playgrounds/vue-sdk-playground/) - Example application

## Documentation

- [Getting Started](https://wso2.com/asgardeo/docs/get-started/)
- [Vue SDK Guide](https://wso2.com/asgardeo/docs/sdks/vue/)
- [Configuration Options](https://wso2.com/asgardeo/docs/sdks/vue/configuration/)
- [Composables & Components](https://wso2.com/asgardeo/docs/sdks/vue/api/)

## Support

For support and questions:
- [Asgardeo Documentation](https://wso2.com/asgardeo/docs/)
- [GitHub Issues](https://github.com/asgardeo/asgardeo-auth-vue-sdk/issues)
- [WSO2 Community Forum](https://wso2.com/community/)

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](./CONTRIBUTING.md) for more details.

## License

Licenses this source under the Apache License, Version 2.0 [LICENSE](./LICENSE), You may not use this file except in compliance with the License.