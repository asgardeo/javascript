<script setup lang="ts">
import { useAsgardeo, SignedIn, SignedOut, Loading, Spinner, UserComponent, OrganizationComponent } from '@asgardeo/vue';
import SectionCard from '../../components/layout/SectionCard.vue';
import ResultPanel from '../../components/shared/ResultPanel.vue';

const { isSignedIn, isLoading } = useAsgardeo();

const signedInCode = `<!-- Default slot only -->
<SignedIn>
  <div>You are signed in!</div>
</SignedIn>

<!-- With fallback slot -->
<SignedIn>
  <template #default>
    <div>Welcome back!</div>
  </template>
  <template #fallback>
    <p>Please sign in</p>
  </template>
</SignedIn>`;

const signedOutCode = `<!-- Default slot only -->
<SignedOut>
  <p>You are signed out.</p>
</SignedOut>

<!-- With fallback slot -->
<SignedOut>
  <template #default>
    <p>Not authenticated</p>
  </template>
  <template #fallback>
    <p>Already signed in!</p>
  </template>
</SignedOut>`;

const loadingCode = `<Loading>
  <template #default>
    <Spinner /> <!-- shown while isLoading = true -->
  </template>
  <template #fallback>
    SDK Ready  <!-- shown after SDK is ready -->
  </template>
</Loading>`;

const userComponentCode = `<UserComponent>
  <template #default="{ user }">
    {{ user?.flattenedProfile?.givenName }}
  </template>
  <template #fallback>Not signed in</template>
</UserComponent>`;

const orgComponentCode = `<OrganizationComponent>
  <template #default="{ organization }">
    {{ organization?.name }}
  </template>
  <template #fallback>No organization</template>
</OrganizationComponent>`;

const nestedCode = `<SignedIn>
  <template #default>
    <UserComponent>
      <template #default="{ user }">
        <p>Hello, {{ user?.flattenedProfile?.givenName }}</p>
        <OrganizationComponent>
          <template #default="{ organization }">
            <p>Org: {{ organization?.name }}</p>
          </template>
          <template #fallback>No org selected.</template>
        </OrganizationComponent>
      </template>
    </UserComponent>
  </template>
  <template #fallback>
    Sign in to see your profile.
  </template>
</SignedIn>
<SignedOut>
  <p>Sign in to see your profile.</p>
</SignedOut>`;
</script>

<template>
  <div class="space-y-6">

    <!-- Current auth state banner -->
    <div class="flex items-center gap-3 rounded-lg border border-border bg-surface-muted px-4 py-3 text-sm">
      <span class="font-medium text-on-surface">Current state:</span>
      <span v-if="isLoading" class="inline-flex items-center gap-1.5 rounded-full bg-status-warning-bg px-2.5 py-0.5 text-xs font-medium text-status-warning-text">
        <Spinner class="h-3 w-3" /> Loading
      </span>
      <span v-else-if="isSignedIn" class="inline-flex items-center gap-1.5 rounded-full bg-status-success-bg px-2.5 py-0.5 text-xs font-medium text-status-success-text">
        ● Signed In
      </span>
      <span v-else class="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-on-surface-secondary">
        ● Signed Out
      </span>
      <span class="text-on-surface-muted text-xs ml-auto">Control components react to this state in real time.</span>
    </div>

    <!-- Conditional Rendering -->
    <SectionCard title="Conditional Rendering" description="Gate content based on authentication state. All components support a #fallback slot for the opposite case.">
      <div class="space-y-6">

        <!-- SignedIn -->
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-on-surface">&lt;SignedIn&gt;</h3>
          <div class="grid md:grid-cols-2 gap-4">
            <div class="space-y-3">
              <div>
                <p class="text-xs text-on-surface-muted mb-1">Default slot only — renders when authenticated:</p>
                <div class="rounded-lg border border-border bg-surface-muted p-4 min-h-[56px] flex items-center">
                  <SignedIn>
                    <div class="flex items-center gap-2 rounded-md bg-status-success-bg border border-border px-3 py-2 text-sm text-status-success-text">
                      <svg class="h-4 w-4 text-status-success-text" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                      You are signed in!
                    </div>
                  </SignedIn>
                </div>
              </div>
              <div>
                <p class="text-xs text-on-surface-muted mb-1">With <code class="bg-surface-muted px-1 rounded font-mono">#fallback</code> slot:</p>
                <div class="rounded-lg border border-border bg-surface-muted p-4 min-h-[56px] flex items-center">
                  <SignedIn>
                    <template #default>
                      <UserComponent>
                        <template #default="{ user }">
                          <span class="text-sm text-status-success-text font-medium">
                            Welcome, {{ user?.flattenedProfile?.givenName ?? user?.flattenedProfile?.username ?? 'User' }}!
                          </span>
                        </template>
                      </UserComponent>
                    </template>
                    <template #fallback>
                      <span class="text-sm text-on-surface-muted italic">Please sign in to see your greeting.</span>
                    </template>
                  </SignedIn>
                </div>
              </div>
            </div>
            <div class="rounded-lg bg-code-bg text-code-text p-4 text-xs font-mono overflow-x-auto">
              <pre class="whitespace-pre-wrap">{{ signedInCode }}</pre>
            </div>
          </div>
        </div>

        <hr class="border-border-divider" />

        <!-- SignedOut -->
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-on-surface">&lt;SignedOut&gt;</h3>
          <div class="grid md:grid-cols-2 gap-4">
            <div class="space-y-3">
              <div>
                <p class="text-xs text-on-surface-muted mb-1">Default slot only — renders when not authenticated:</p>
                <div class="rounded-lg border border-border bg-surface-muted p-4 min-h-[56px] flex items-center">
                  <SignedOut>
                    <div class="flex items-center gap-2 rounded-md bg-status-info-bg border border-border px-3 py-2 text-sm text-status-info-text">
                      <svg class="h-4 w-4 text-status-info-text" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      You are signed out.
                    </div>
                  </SignedOut>
                </div>
              </div>
              <div>
                <p class="text-xs text-on-surface-muted mb-1">With <code class="bg-surface-muted px-1 rounded font-mono">#fallback</code> slot:</p>
                <div class="rounded-lg border border-border bg-surface-muted p-4 min-h-[56px] flex items-center">
                  <SignedOut>
                    <template #default>
                      <span class="text-sm text-on-surface">You are not authenticated.</span>
                    </template>
                    <template #fallback>
                      <span class="text-sm text-status-success-text font-medium">You are currently signed in.</span>
                    </template>
                  </SignedOut>
                </div>
              </div>
            </div>
            <div class="rounded-lg bg-code-bg text-code-text p-4 text-xs font-mono overflow-x-auto">
              <pre class="whitespace-pre-wrap">{{ signedOutCode }}</pre>
            </div>
          </div>
        </div>

        <hr class="border-border-divider" />

        <!-- Loading -->
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-on-surface">&lt;Loading&gt;</h3>
          <div class="grid md:grid-cols-2 gap-4">
            <div class="space-y-3">
              <div>
                <p class="text-xs text-on-surface-muted mb-1">Default slot — renders while SDK is initializing:</p>
                <div class="rounded-lg border border-border bg-surface-muted p-4 min-h-[56px] flex items-center">
                  <Loading>
                    <template #default>
                      <div class="flex items-center gap-2 text-sm text-on-surface-secondary">
                        <Spinner class="h-4 w-4" />
                        SDK initializing…
                      </div>
                    </template>
                    <template #fallback>
                      <span class="text-sm text-on-surface">SDK Ready ✓</span>
                    </template>
                  </Loading>
                </div>
              </div>
            </div>
            <div class="rounded-lg bg-code-bg text-code-text p-4 text-xs font-mono overflow-x-auto">
              <pre class="whitespace-pre-wrap">{{ loadingCode }}</pre>
            </div>
          </div>
        </div>

      </div>
    </SectionCard>

    <!-- Data Access Components -->
    <SectionCard title="Data Access Components" description="Scoped-slot components that expose SDK data to your template without composables.">
      <div class="space-y-6">

        <!-- UserComponent -->
        <div class="space-y-2">
          <h3 class="text-sm font-semibold text-on-surface">&lt;UserComponent&gt;</h3>
          <p class="text-xs text-on-surface-muted">
            Exposes <code class="bg-surface-muted px-1 rounded font-mono">{ user }</code> in the default scoped slot when signed in.
            Renders the <code class="bg-surface-muted px-1 rounded font-mono">#fallback</code> slot when no user is available.
          </p>
          <div class="grid md:grid-cols-2 gap-4">
            <div class="rounded-lg border border-border bg-surface-muted p-4 min-h-[56px]">
              <UserComponent>
                <template #default="{ user }">
                  <p class="text-sm font-medium text-on-surface">
                    {{ user?.flattenedProfile?.givenName ?? user?.flattenedProfile?.username ?? 'Authenticated user' }}
                  </p>
                </template>
                <template #fallback>
                  <p class="text-sm text-on-surface-muted italic">No user — sign in to see data here.</p>
                </template>
              </UserComponent>
            </div>
            <div>
              <p class="text-xs text-on-surface-muted mb-1">Raw user object:</p>
              <UserComponent>
                <template #default="{ user }">
                  <ResultPanel :result="user" />
                </template>
                <template #fallback>
                  <ResultPanel :result="null" />
                </template>
              </UserComponent>
            </div>
          </div>
          <div class="rounded-lg bg-code-bg text-code-text p-3 text-xs font-mono">
            <pre class="whitespace-pre-wrap">{{ userComponentCode }}</pre>
          </div>
        </div>

        <hr class="border-border-divider" />

        <!-- OrganizationComponent -->
        <div class="space-y-2">
          <h3 class="text-sm font-semibold text-on-surface">&lt;OrganizationComponent&gt;</h3>
          <p class="text-xs text-on-surface-muted">
            Exposes <code class="bg-surface-muted px-1 rounded font-mono">{ organization }</code> (the current organization) in the default scoped slot.
            Renders the <code class="bg-surface-muted px-1 rounded font-mono">#fallback</code> slot when no current organization is set.
          </p>
          <div class="grid md:grid-cols-2 gap-4">
            <div class="rounded-lg border border-border bg-surface-muted p-4 min-h-[56px]">
              <OrganizationComponent>
                <template #default="{ organization }">
                  <p class="text-sm font-medium text-on-surface">{{ organization?.name ?? 'Current organization' }}</p>
                </template>
                <template #fallback>
                  <p class="text-sm text-on-surface-muted italic">No current organization set.</p>
                </template>
              </OrganizationComponent>
            </div>
            <div>
              <p class="text-xs text-on-surface-muted mb-1">Raw organization object:</p>
              <OrganizationComponent>
                <template #default="{ organization }">
                  <ResultPanel :result="organization" />
                </template>
                <template #fallback>
                  <ResultPanel :result="null" />
                </template>
              </OrganizationComponent>
            </div>
          </div>
          <div class="rounded-lg bg-code-bg text-code-text p-3 text-xs font-mono">
            <pre class="whitespace-pre-wrap">{{ orgComponentCode }}</pre>
          </div>
        </div>

      </div>
    </SectionCard>

    <!-- Nested Composition -->
    <SectionCard title="Nested Composition" description="Control components compose naturally — nest them to build complex conditional UI.">
      <div class="grid md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <p class="text-xs text-on-surface-muted mb-3">Live output:</p>
          <div class="rounded-lg border border-border bg-surface-muted p-4 min-h-[80px] space-y-1">
            <SignedIn>
              <template #default>
                <UserComponent>
                  <template #default="{ user }">
                    <p class="text-sm font-medium text-on-surface">
                      Hello, {{ user?.flattenedProfile?.givenName ?? user?.flattenedProfile?.username ?? 'there' }}!
                    </p>
                    <OrganizationComponent>
                      <template #default="{ organization }">
                        <p class="text-sm text-on-surface-secondary">Org: {{ organization?.name }}</p>
                      </template>
                      <template #fallback>
                        <p class="text-sm text-on-surface-muted italic">No organization selected.</p>
                      </template>
                    </OrganizationComponent>
                  </template>
                </UserComponent>
              </template>
              <template #fallback>
                <p class="text-sm text-on-surface-muted italic">Sign in to see your profile.</p>
              </template>
            </SignedIn>
            <SignedOut>
              <p class="text-sm text-on-surface">Sign in to see your profile.</p>
            </SignedOut>
          </div>
        </div>
        <div class="rounded-lg bg-code-bg text-code-text p-4 text-xs font-mono overflow-x-auto">
          <pre class="whitespace-pre-wrap">{{ nestedCode }}</pre>
        </div>
      </div>
    </SectionCard>

  </div>
</template>
