<script setup lang="ts">
import { ref } from 'vue';

const { isSignedIn, isLoading, isInitialized } = useAsgardeo();

const activeTab = ref('signed-in');
const tabs = [
  { key: 'signed-in',  label: 'AsgardeoSignedIn' },
  { key: 'signed-out', label: 'AsgardeoSignedOut' },
  { key: 'loading',    label: 'AsgardeoLoading' },
];

// ── Code snippets ──────────────────────────────────────────────────────────
const signedInCode = `<!-- Default slot: renders only when authenticated -->
<AsgardeoSignedIn>
  <p>Welcome back!</p>
</AsgardeoSignedIn>

<!-- With fallback slot for the opposite case -->
<AsgardeoSignedIn>
  <template #default>
    <p>You are signed in!</p>
  </template>
  <template #fallback>
    <p>Please sign in to continue.</p>
  </template>
</AsgardeoSignedIn>`;

const signedOutCode = `<!-- Default slot: renders only when NOT authenticated -->
<AsgardeoSignedOut>
  <p>Please sign in to continue.</p>
</AsgardeoSignedOut>

<!-- With fallback for the authenticated case -->
<AsgardeoSignedOut>
  <template #default>
    <p>You are not signed in.</p>
  </template>
  <template #fallback>
    <p>You are signed in!</p>
  </template>
</AsgardeoSignedOut>`;

const loadingCode = `<!-- Renders while the SDK is initialising (isLoading = true) -->
<AsgardeoLoading>
  <template #default>
    <!-- shown while loading -->
    <div class="animate-spin h-6 w-6 border-2 border-accent-500 rounded-full border-t-transparent" />
  </template>
  <template #fallback>
    <!-- shown once SDK is ready -->
    <p>SDK ready!</p>
  </template>
</AsgardeoLoading>`;

const nestedCode = `<!-- Compose control components for conditional layouts -->
<AsgardeoLoading>
  <template #default>
    <Spinner />
  </template>
  <template #fallback>
    <AsgardeoSignedIn>
      <template #default>
        <p>Authenticated content here</p>
      </template>
      <template #fallback>
        <AsgardeoSignedOut>
          <AsgardeoSignInButton />
        </AsgardeoSignedOut>
      </template>
    </AsgardeoSignedIn>
  </template>
</AsgardeoLoading>`;
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="Control Components"
      description="Gate content on authentication state — AsgardeoSignedIn, AsgardeoSignedOut, AsgardeoLoading."
    />
    <div class="flex items-center gap-2 -mt-2">
      <SharedStatusBadge status="info" label="Auto-imported" />
      <span class="text-xs text-text-muted">from <code class="font-mono">@asgardeo/nuxt</code></span>
    </div>

    <!-- Current state banner -->
    <div class="flex flex-wrap items-center gap-3 px-4 py-3 rounded-lg bg-surface-muted border border-border text-sm">
      <span class="font-medium text-text">Current state:</span>
      <SharedStatusBadge
        v-if="isLoading"
        status="warning"
        label="Loading…"
      />
      <template v-else>
        <SharedStatusBadge
          :status="isInitialized ? 'success' : 'neutral'"
          :label="isInitialized ? 'Initialized' : 'Not initialized'"
        />
        <SharedStatusBadge
          :status="isSignedIn ? 'success' : 'neutral'"
          :label="isSignedIn ? 'Signed In' : 'Signed Out'"
        />
      </template>
      <span class="ml-auto text-xs text-text-muted">Components below react to this state in real time.</span>
    </div>

    <LayoutTabGroup :tabs="tabs" v-model="activeTab">

      <!-- ─── SignedIn tab ─── -->
      <template #signed-in>
        <div class="space-y-5">
          <LayoutSectionCard
            title="AsgardeoSignedIn"
            description="Renders its default slot when the user is authenticated. Renders the #fallback slot otherwise."
          >
            <div class="space-y-5">
              <!-- Default slot only -->
              <div>
                <p class="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Default slot only</p>
                <div class="rounded-lg border border-border bg-surface-muted p-4 min-h-14 flex items-center">
                  <AsgardeoSignedIn>
                    <div class="flex items-center gap-2 px-3 py-2 rounded-md bg-success/10 border border-success/30 text-sm text-success">
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      You are signed in!
                    </div>
                  </AsgardeoSignedIn>
                </div>
                <p class="mt-1.5 text-xs text-text-muted">Nothing renders when signed out.</p>
              </div>

              <!-- With fallback -->
              <div>
                <p class="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">With #fallback slot</p>
                <div class="rounded-lg border border-border bg-surface-muted p-4 min-h-14 flex items-center">
                  <AsgardeoSignedIn>
                    <template #default>
                      <div class="flex items-center gap-2 px-3 py-2 rounded-md bg-success/10 border border-success/30 text-sm text-success">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Welcome back, authenticated user!
                      </div>
                    </template>
                    <template #fallback>
                      <p class="text-sm text-text-muted italic">Not signed in — this is the fallback.</p>
                    </template>
                  </AsgardeoSignedIn>
                </div>
              </div>
            </div>
          </LayoutSectionCard>

          <LayoutCodeBlock :code="signedInCode" language="vue" />
        </div>
      </template>

      <!-- ─── SignedOut tab ─── -->
      <template #signed-out>
        <div class="space-y-5">
          <LayoutSectionCard
            title="AsgardeoSignedOut"
            description="Renders its default slot when the user is NOT authenticated. Renders the #fallback slot when they are."
          >
            <div class="space-y-5">
              <!-- Default slot only -->
              <div>
                <p class="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Default slot only</p>
                <div class="rounded-lg border border-border bg-surface-muted p-4 min-h-14 flex items-center">
                  <AsgardeoSignedOut>
                    <p class="text-sm text-text-muted italic">You are not signed in.</p>
                  </AsgardeoSignedOut>
                </div>
                <p class="mt-1.5 text-xs text-text-muted">Nothing renders when signed in.</p>
              </div>

              <!-- With fallback -->
              <div>
                <p class="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">With #fallback slot</p>
                <div class="rounded-lg border border-border bg-surface-muted p-4 min-h-14 flex items-center">
                  <AsgardeoSignedOut>
                    <template #default>
                      <div class="flex items-center gap-2 px-3 py-2 rounded-md bg-surface-hover border border-border text-sm text-text">
                        <svg class="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Guest user — please sign in.
                      </div>
                    </template>
                    <template #fallback>
                      <p class="text-sm text-success italic">Already signed in — fallback visible.</p>
                    </template>
                  </AsgardeoSignedOut>
                </div>
              </div>
            </div>
          </LayoutSectionCard>

          <LayoutCodeBlock :code="signedOutCode" language="vue" />
        </div>
      </template>

      <!-- ─── Loading tab ─── -->
      <template #loading>
        <div class="space-y-5">
          <LayoutSectionCard
            title="AsgardeoLoading"
            description="Renders its default slot while the SDK is initialising (isLoading = true). Shows the #fallback slot once the SDK is ready."
          >
            <div class="space-y-5">
              <!-- With fallback -->
              <div>
                <p class="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Default + fallback</p>
                <div class="rounded-lg border border-border bg-surface-muted p-4 min-h-14 flex items-center">
                  <AsgardeoLoading>
                    <template #default>
                      <div class="flex items-center gap-2 text-sm text-warning">
                        <svg class="animate-spin h-4 w-4 text-warning" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        SDK is loading…
                      </div>
                    </template>
                    <template #fallback>
                      <div class="flex items-center gap-2 text-sm text-success">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        SDK is ready!
                      </div>
                    </template>
                  </AsgardeoLoading>
                </div>
                <p class="mt-1.5 text-xs text-text-muted">
                  SDK is currently <code class="bg-surface-muted px-1 rounded font-mono">{{ isLoading ? 'loading' : 'ready' }}</code>
                  — the {{ isLoading ? 'spinner' : 'fallback' }} is visible above.
                </p>
              </div>
            </div>
          </LayoutSectionCard>

          <LayoutCodeBlock :code="loadingCode" language="vue" />

          <!-- Nested composition -->
          <LayoutSectionCard title="Composing Control Components" :collapsible="true">
            <p class="text-sm text-text-muted mb-4">
              Nest the three components for complete conditional layouts — loading gate, then auth gate, then signed-out fallback.
            </p>
            <LayoutCodeBlock :code="nestedCode" language="vue" />
          </LayoutSectionCard>
        </div>
      </template>

    </LayoutTabGroup>
  </div>
</template>
