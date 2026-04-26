<!--
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
-->

<!--
  Callback page for embedded (app-native) authentication flows.

  When Asgardeo redirects back after an embedded authenticator step
  (e.g. social login prompt, MFA), it sends an authorization code to
  the registered callbackUrl.

  <AsgardeoCallback> reads the query-string parameters, posts them to
  POST /api/auth/callback, and redirects the user to afterSignInUrl on
  success — all without a full page reload.

  Register this page as the callbackUrl in nuxt.config.ts:
    asgardeo: {
      callbackUrl: '/callback'   // must match the registered redirect URI
    }
-->
<template>
  <AsgardeoCallback
    @error="onError"
  />
</template>

<script setup lang="ts">
function onError(err: unknown) {
  const message = err instanceof Error ? err.message : String(err ?? 'Callback error');
  console.error('[AsgardeoCallback]', message);
  navigateTo('/');
}
</script>
