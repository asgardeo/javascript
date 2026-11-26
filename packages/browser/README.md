<p align="center" style="color: #343a40">
  <h1 align="center">@asgardeo/browser</h1>
</p>
<p align="center" style="font-size: 1.2rem;">Browser-based SDK for Asgardeo</p>
<div align="center">
  <img alt="npm (scoped)" src="https://img.shields.io/npm/v/@asgardeo/browser">
  <img alt="npm" src="https://img.shields.io/npm/dw/@asgardeo/browser">
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg" alt="License"></a>
</div>

## Installation

```bash
# Using npm
npm install @asgardeo/browser

# or using pnpm
pnpm add @asgardeo/browser

# or using yarn
yarn add @asgardeo/browser
```

## Quick Start

```javascript
import {AsgardeoAuthClient} from '@asgardeo/browser';

// Initialize the auth client
const authClient = new AsgardeoAuthClient({
  afterSignInUrl: 'https://localhost:3000',
  clientId: '<your_client_id>',
  baseUrl: 'https://api.asgardeo.io/t/<org_name>',
});

// Sign in
authClient.signIn();

// Get user info after authentication
const userInfo = await authClient.getUser();

// Sign out
authClient.signOut();
```

## License

Licenses this source under the Apache License, Version 2.0 [LICENSE](./LICENSE), You may not use this file except in
compliance with the License.
