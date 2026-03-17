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
- `SignedIn` - Renders children only when user is authenticated
- `SignedOut` - Renders children only when user is not authenticated
- `SignInButton` - Pre-styled sign-in button
- `SignOutButton` - Pre-styled sign-out button
- `SignUpButton` - Pre-styled sign-up button
- `User` - Access user information with render prop pattern
- `UserProfile` - Display user profile information
- `Organization` - Manage organization/workspace selection
- `Callback` - Handle OAuth callback redirect

### Social Login Adapters
- Google
- Facebook
- GitHub
- Microsoft

## Examples

Check out our [example applications](../../samples/) to see the Vue SDK in action:
- [Test Vue SDK](../../samples/test-vue-sdk/) - Basic example application

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





Write a readme and QUICKSTART md files for vuejs sdk similar to the react sdk properly. But these should be specific to the Vue.js SDK.