# 09 — Organization & Profile Management

## Organization Management

Per IAM SDK Specification §6.7, the SDK must support multi-organization scenarios.

### Operations

| Operation | Composable Method | Server Route | Asgardeo API |
|-----------|-------------------|--------------|--------------|
| List all organizations | `getAllOrganizations()` | `GET /api/auth/organizations` | `GET /o/organizations` |
| List user's organizations | `getMyOrganizations()` | `GET /api/auth/organizations/mine` | `GET /o/organizations?filter=userId eq {sub}` |
| Get current organization | `getCurrentOrganization()` | `GET /api/auth/organizations/current` | Derived from session claims |
| Switch organization | `switchOrganization(id)` | `POST /api/auth/organizations/switch` | Token exchange (RFC 8693 variant) |
| Create organization | `createOrganization(data)` | `POST /api/auth/organizations` | `POST /o/organizations` |

### Server Routes

```typescript
// src/runtime/server/routes/auth/organizations/index.get.ts

import { defineEventHandler, createError } from 'h3'
import { useAsgardeoServer } from '../../../utils/asgardeo-server'
import { getValidAccessToken } from '../../../utils/token-refresh'

export default defineEventHandler(async (event) => {
  const client = useAsgardeoServer()
  const accessToken = await getValidAccessToken(event, client, client.sessionManager)
  
  if (!accessToken) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }
  
  return client.getAllOrganizations(accessToken)
})
```

```typescript
// src/runtime/server/routes/auth/organizations/switch.post.ts

import { defineEventHandler, readBody, createError } from 'h3'
import { useAsgardeoServer } from '../../../utils/asgardeo-server'

export default defineEventHandler(async (event) => {
  const client = useAsgardeoServer()
  const session = await client.getSession(event)
  
  if (!session) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }
  
  const { organizationId } = await readBody(event)
  
  if (!organizationId) {
    throw createError({ statusCode: 400, message: 'organizationId is required' })
  }
  
  // Perform token exchange for organization switch
  // Uses RFC 8693 with Asgardeo's organization-switch grant type
  const newTokens = await client.switchOrganization(
    session.accessToken,
    organizationId
  )
  
  // Update session with new tokens and organization
  await client.sessionManager.updateSession(event, (s) => ({
    ...s,
    accessToken: newTokens.accessToken,
    refreshToken: newTokens.refreshToken || s.refreshToken,
    accessTokenExpiresAt: Date.now() + (newTokens.expiresIn * 1000),
    organizationId: organizationId,
  }))
  
  return { success: true, organizationId }
})
```

### Client Composable Integration

```typescript
// In useOrganization() composable

export function useOrganization() {
  const { $asgardeo } = useNuxtApp()
  const config = useRuntimeConfig().public.asgardeo
  const api = config.apiRoutePrefix
  
  const currentOrganization = useState<Organization | null>('asgardeo:org', () => null)
  
  async function getAllOrganizations(): Promise<Organization[]> {
    return $fetch<Organization[]>(`${api}/organizations`)
  }
  
  async function getMyOrganizations(): Promise<Organization[]> {
    return $fetch<Organization[]>(`${api}/organizations/mine`)
  }
  
  async function getCurrentOrganization(): Promise<Organization | null> {
    if (currentOrganization.value) return currentOrganization.value
    const org = await $fetch<Organization | null>(`${api}/organizations/current`)
    currentOrganization.value = org
    return org
  }
  
  async function switchOrganization(orgId: string): Promise<void> {
    await $fetch(`${api}/organizations/switch`, {
      method: 'POST',
      body: { organizationId: orgId },
    })
    
    // Refresh organization state
    currentOrganization.value = await $fetch<Organization | null>(`${api}/organizations/current`)
    
    // Trigger page reload to re-hydrate all state for new org context
    await navigateTo(useRoute().fullPath, { external: true })
  }
  
  async function createOrganization(data: CreateOrganizationRequest): Promise<Organization> {
    return $fetch<Organization>(`${api}/organizations`, {
      method: 'POST',
      body: data,
    })
  }
  
  return {
    currentOrganization: readonly(currentOrganization),
    getAllOrganizations,
    getMyOrganizations,
    getCurrentOrganization,
    switchOrganization,
    createOrganization,
  }
}
```

### Organization SSR Hydration

Organization data is resolved during SSR alongside auth state:

```typescript
// In asgardeo.server.ts plugin

if (session?.organizationId) {
  try {
    const org = await client.getCurrentOrganization(session.accessToken)
    useState('asgardeo:org', () => org)
  } catch {
    useState('asgardeo:org', () => null)
  }
}
```

---

## User Profile Management

Per IAM SDK Specification §6.6, the SDK must support SCIM2-based user profile operations.

### Operations

| Operation | Composable Method | Server Route | Asgardeo API |
|-----------|-------------------|--------------|--------------|
| Get basic user claims | `getUser()` | `GET /api/auth/user` | `/oauth2/userinfo` |
| Get full profile (SCIM2) | `getUserProfile()` | `GET /api/auth/user/profile` | `GET /scim2/Me` |
| Update profile | `updateUserProfile(data)` | `PATCH /api/auth/user/profile` | `PATCH /scim2/Me` |
| Change password | `changePassword(data)` | `POST /api/auth/user/password` | Custom endpoint |

### SCIM2 Profile Shape

Per spec §6.6, the SDK must flatten SCIM2's complex schema into a developer-friendly format:

```typescript
// src/runtime/types/user.ts

export interface UserProfile {
  /** SCIM2 user ID */
  id: string
  /** Username */
  userName: string
  /** Display name */
  displayName?: string
  /** Given/first name */
  givenName?: string
  /** Family/last name */
  familyName?: string
  /** Email addresses */
  emails?: Array<{
    value: string
    type?: string
    primary?: boolean
  }>
  /** Phone numbers */
  phoneNumbers?: Array<{
    value: string
    type?: string
  }>
  /** Profile photo URL */
  photoUrl?: string
  /** Locale */
  locale?: string
  /** Timezone */
  timezone?: string
  /** Account status */
  active?: boolean
  /** Custom attributes */
  customAttributes?: Record<string, unknown>
  /** Raw SCIM2 resource (for advanced usage) */
  _raw?: Record<string, unknown>
}

export interface UpdateUserProfileRequest {
  displayName?: string
  givenName?: string
  familyName?: string
  emails?: Array<{ value: string; type?: string; primary?: boolean }>
  phoneNumbers?: Array<{ value: string; type?: string }>
  photoUrl?: string
  locale?: string
  timezone?: string
  customAttributes?: Record<string, unknown>
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}
```

### Server Routes

```typescript
// src/runtime/server/routes/auth/user/profile.get.ts

import { defineEventHandler, createError } from 'h3'
import { useAsgardeoServer } from '../../../utils/asgardeo-server'
import { getValidAccessToken } from '../../../utils/token-refresh'
import { flattenScim2Profile } from '../../../utils/scim2'

export default defineEventHandler(async (event) => {
  const client = useAsgardeoServer()
  const accessToken = await getValidAccessToken(event, client, client.sessionManager)
  
  if (!accessToken) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }
  
  // Fetch SCIM2 profile from Asgardeo
  const rawProfile = await client.getUserProfile(accessToken)
  
  // Flatten the complex SCIM2 structure into a simple object
  return flattenScim2Profile(rawProfile)
})
```

```typescript
// src/runtime/server/routes/auth/user/profile.patch.ts

import { defineEventHandler, readBody, createError } from 'h3'
import { useAsgardeoServer } from '../../../utils/asgardeo-server'
import { getValidAccessToken } from '../../../utils/token-refresh'
import { toScim2PatchOperations } from '../../../utils/scim2'

export default defineEventHandler(async (event) => {
  const client = useAsgardeoServer()
  const accessToken = await getValidAccessToken(event, client, client.sessionManager)
  
  if (!accessToken) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }
  
  const updates = await readBody<UpdateUserProfileRequest>(event)
  
  // Convert flat update to SCIM2 PATCH operations
  const patchOps = toScim2PatchOperations(updates)
  
  const updatedProfile = await client.updateUserProfile(accessToken, patchOps)
  return flattenScim2Profile(updatedProfile)
})
```

### SCIM2 Utilities

```typescript
// src/runtime/server/utils/scim2.ts

/**
 * Flatten a SCIM2 user resource into a simple UserProfile object.
 */
export function flattenScim2Profile(scim2Resource: Record<string, unknown>): UserProfile {
  const name = scim2Resource.name as Record<string, string> | undefined
  
  return {
    id: scim2Resource.id as string,
    userName: scim2Resource.userName as string,
    displayName: scim2Resource.displayName as string | undefined,
    givenName: name?.givenName,
    familyName: name?.familyName,
    emails: scim2Resource.emails as UserProfile['emails'],
    phoneNumbers: scim2Resource.phoneNumbers as UserProfile['phoneNumbers'],
    photoUrl: extractPhotoUrl(scim2Resource),
    locale: scim2Resource.locale as string | undefined,
    timezone: scim2Resource.timezone as string | undefined,
    active: scim2Resource.active as boolean | undefined,
    customAttributes: extractCustomAttributes(scim2Resource),
    _raw: scim2Resource,
  }
}

/**
 * Convert flat update request to SCIM2 PATCH operations.
 */
export function toScim2PatchOperations(
  updates: UpdateUserProfileRequest
): Scim2PatchOperation[] {
  const ops: Scim2PatchOperation[] = []
  
  if (updates.displayName !== undefined) {
    ops.push({ op: 'replace', path: 'displayName', value: updates.displayName })
  }
  
  if (updates.givenName !== undefined || updates.familyName !== undefined) {
    const nameValue: Record<string, string> = {}
    if (updates.givenName !== undefined) nameValue.givenName = updates.givenName
    if (updates.familyName !== undefined) nameValue.familyName = updates.familyName
    ops.push({ op: 'replace', path: 'name', value: nameValue })
  }
  
  if (updates.emails !== undefined) {
    ops.push({ op: 'replace', path: 'emails', value: updates.emails })
  }
  
  if (updates.phoneNumbers !== undefined) {
    ops.push({ op: 'replace', path: 'phoneNumbers', value: updates.phoneNumbers })
  }
  
  if (updates.photoUrl !== undefined) {
    ops.push({
      op: 'replace',
      path: 'urn:scim:wso2:schema:photos',
      value: [{ value: updates.photoUrl, type: 'photo' }],
    })
  }
  
  if (updates.locale !== undefined) {
    ops.push({ op: 'replace', path: 'locale', value: updates.locale })
  }
  
  if (updates.timezone !== undefined) {
    ops.push({ op: 'replace', path: 'timezone', value: updates.timezone })
  }
  
  return ops
}
```

### Client Composable Integration

```typescript
// useUser() composable already provides:

const { user, getUserProfile, updateUserProfile } = useUser()

// Usage in component:
const profile = await getUserProfile()
await updateUserProfile({ displayName: 'New Name', givenName: 'New' })
```

---

## Usage Examples

### Organization Switcher Page

```vue
<!-- pages/switch-org.vue -->
<template>
  <div>
    <h2>Select Organization</h2>
    
    <div v-if="loading">Loading organizations...</div>
    
    <ul v-else>
      <li 
        v-for="org in organizations" 
        :key="org.id"
        :class="{ active: org.id === currentOrganization?.id }"
      >
        <button @click="switchOrganization(org.id)">
          {{ org.name }}
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'asgardeo-auth' })

const { getAllOrganizations, getCurrentOrganization, switchOrganization } = useOrganization()

const loading = ref(true)
const organizations = ref([])

onMounted(async () => {
  try {
    organizations.value = await getAllOrganizations()
    await getCurrentOrganization()
  } finally {
    loading.value = false
  }
})
</script>
```

### Profile Settings Page

```vue
<!-- pages/settings/profile.vue -->
<template>
  <div>
    <h2>Profile Settings</h2>
    
    <!-- Option 1: Use the Vue SDK component -->
    <AsgardeoUserProfile :editable="true" />
    
    <!-- Option 2: Build custom UI -->
    <form v-if="profile" @submit.prevent="saveProfile">
      <input v-model="profile.displayName" placeholder="Display Name" />
      <input v-model="profile.givenName" placeholder="First Name" />
      <input v-model="profile.familyName" placeholder="Last Name" />
      <button type="submit" :disabled="saving">Save</button>
    </form>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'asgardeo-auth' })

const { getUserProfile, updateUserProfile } = useUser()

const profile = ref(null)
const saving = ref(false)

onMounted(async () => {
  profile.value = await getUserProfile()
})

async function saveProfile() {
  saving.value = true
  try {
    await updateUserProfile({
      displayName: profile.value.displayName,
      givenName: profile.value.givenName,
      familyName: profile.value.familyName,
    })
  } finally {
    saving.value = false
  }
}
</script>
```
