<script setup lang="ts">
import { ref } from 'vue';
import { useEventLog } from '~/composables/useEventLog';

const activeTab = ref('sign-in');
const tabs = [
  { key: 'sign-in',  label: 'AsgardeoSignInButton' },
  { key: 'sign-out', label: 'AsgardeoSignOutButton' },
  { key: 'sign-up',  label: 'AsgardeoSignUpButton' },
];

// Separate event logs per button family
const signInLog  = useEventLog();
const signOutLog = useEventLog();
const signUpLog  = useEventLog();

// ── Code snippets ──────────────────────────────────────────────────────────
const signInCode = `<!-- Default styled button -->
<AsgardeoSignInButton />

<!-- Custom slot — access isLoading -->
<AsgardeoSignInButton v-slot="{ isLoading }">
  <span>{{ isLoading ? 'Redirecting…' : 'Log in' }}</span>
</AsgardeoSignInButton>

<!-- With signInOptions prop -->
<AsgardeoSignInButton :sign-in-options="{ prompt: 'login' }" />`;

const signOutCode = `<!-- Default styled button -->
<AsgardeoSignOutButton />

<!-- Custom slot -->
<AsgardeoSignOutButton v-slot="{ isLoading }">
  {{ isLoading ? 'Logging out…' : 'Sign out' }}
</AsgardeoSignOutButton>`;

const signUpCode = `<!-- Default styled button -->
<AsgardeoSignUpButton />

<!-- Custom slot -->
<AsgardeoSignUpButton v-slot="{ isLoading }">
  {{ isLoading ? 'Redirecting…' : 'Create account' }}
</AsgardeoSignUpButton>`;
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="Action Components"
      description="Sign-in, sign-out, and sign-up buttons — pre-styled and unstyled variants, with custom slot support."
    />

    <LayoutTabGroup :tabs="tabs" v-model="activeTab">

      <!-- ─── SignInButton tab ─── -->
      <template #sign-in>
        <div class="space-y-5">
          <LayoutSectionCard
            title="AsgardeoSignInButton"
            description="Pre-styled button that triggers a redirect to /api/auth/signin. Use v-slot for custom content."
          >
            <div class="grid md:grid-cols-2 gap-6">
              <!-- Left: variants -->
              <div class="space-y-4">
                <div>
                  <p class="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Default</p>
                  <AsgardeoSignInButton
                    class="px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors"
                  />
                </div>

                <div>
                  <p class="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Custom slot</p>
                  <AsgardeoSignInButton
                    class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors"
                    v-slot="{ isLoading: loading }"
                  >
                    <svg v-if="loading" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>{{ loading ? 'Redirecting…' : 'Log in with Asgardeo' }}</span>
                  </AsgardeoSignInButton>
                </div>

                <div>
                  <p class="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Outlined variant</p>
                  <AsgardeoSignInButton
                    class="px-4 py-2 text-sm font-medium bg-surface border-2 border-accent-600 text-accent-600 rounded-md hover:bg-accent-50 transition-colors"
                    v-slot="{ isLoading: loading }"
                  >
                    {{ loading ? 'Redirecting…' : 'Sign in' }}
                  </AsgardeoSignInButton>
                </div>
              </div>

              <!-- Right: description + log -->
              <div class="space-y-3">
                <p class="text-xs text-text-muted">
                  <code class="bg-surface-muted px-1 rounded font-mono">&lt;AsgardeoSignInButton&gt;</code> renders a
                  button that navigates to <code class="bg-surface-muted px-1 rounded font-mono">/api/auth/signin</code>.
                  Use <code class="bg-surface-muted px-1 rounded font-mono">v-slot</code> to access
                  <code class="bg-surface-muted px-1 rounded font-mono">isLoading</code> for custom content or loading
                  states. Pass <code class="bg-surface-muted px-1 rounded font-mono">:sign-in-options</code> for extra
                  OAuth hints.
                </p>
                <!-- Event log -->
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <p class="text-xs font-semibold text-text-muted uppercase tracking-wide">Event log</p>
                    <button type="button" class="text-xs text-text-muted underline hover:text-text" @click="signInLog.clear()">Clear</button>
                  </div>
                  <div class="rounded border border-border bg-surface-muted p-2 max-h-32 overflow-y-auto font-mono text-xs space-y-1">
                    <p v-if="signInLog.entries.value.length === 0" class="text-text-muted/60">No events yet.</p>
                    <p
                      v-for="e in signInLog.entries.value"
                      :key="e.id"
                      class="truncate"
                      :class="e.type === 'error' ? 'text-danger' : 'text-text-muted'"
                    >
                      <span class="text-text-muted/50 mr-1">{{ e.timestamp }}</span>{{ e.message }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </LayoutSectionCard>

          <LayoutCodeBlock :code="signInCode" language="vue" />
        </div>
      </template>

      <!-- ─── SignOutButton tab ─── -->
      <template #sign-out>
        <div class="space-y-5">
          <LayoutSectionCard
            title="AsgardeoSignOutButton"
            description="Pre-styled button that triggers /api/auth/signout and clears the session."
          >
            <div class="grid md:grid-cols-2 gap-6">
              <!-- Left: variants -->
              <div class="space-y-4">
                <div>
                  <p class="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Default</p>
                  <AsgardeoSignOutButton
                    class="px-4 py-2 text-sm font-medium bg-surface border border-border text-text rounded-md hover:bg-surface-muted transition-colors"
                  />
                </div>

                <div>
                  <p class="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Custom slot</p>
                  <AsgardeoSignOutButton
                    class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-danger/10 text-danger border border-danger/30 rounded-md hover:bg-danger/20 transition-colors"
                    v-slot="{ isLoading: loading }"
                  >
                    <svg v-if="loading" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {{ loading ? 'Signing out…' : '→ Sign out' }}
                  </AsgardeoSignOutButton>
                </div>
              </div>

              <!-- Right: description + log -->
              <div class="space-y-3">
                <p class="text-xs text-text-muted">
                  <code class="bg-surface-muted px-1 rounded font-mono">&lt;AsgardeoSignOutButton&gt;</code> clears the
                  session and redirects to <code class="bg-surface-muted px-1 rounded font-mono">afterSignOutUrl</code>.
                  Use <code class="bg-surface-muted px-1 rounded font-mono">v-slot</code> to show a loading state during sign-out.
                </p>
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <p class="text-xs font-semibold text-text-muted uppercase tracking-wide">Event log</p>
                    <button type="button" class="text-xs text-text-muted underline hover:text-text" @click="signOutLog.clear()">Clear</button>
                  </div>
                  <div class="rounded border border-border bg-surface-muted p-2 max-h-32 overflow-y-auto font-mono text-xs space-y-1">
                    <p v-if="signOutLog.entries.value.length === 0" class="text-text-muted/60">No events yet.</p>
                    <p
                      v-for="e in signOutLog.entries.value"
                      :key="e.id"
                      class="truncate"
                      :class="e.type === 'error' ? 'text-danger' : 'text-text-muted'"
                    >
                      <span class="text-text-muted/50 mr-1">{{ e.timestamp }}</span>{{ e.message }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </LayoutSectionCard>

          <LayoutCodeBlock :code="signOutCode" language="vue" />
        </div>
      </template>

      <!-- ─── SignUpButton tab ─── -->
      <template #sign-up>
        <div class="space-y-5">
          <LayoutSectionCard
            title="AsgardeoSignUpButton"
            description="Pre-styled button that redirects to the Asgardeo self-registration page."
          >
            <div class="grid md:grid-cols-2 gap-6">
              <!-- Left: variants -->
              <div class="space-y-4">
                <div>
                  <p class="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Default</p>
                  <AsgardeoSignUpButton
                    class="px-4 py-2 text-sm font-medium bg-surface border border-border text-text rounded-md hover:bg-surface-muted transition-colors"
                  />
                </div>

                <div>
                  <p class="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Custom slot</p>
                  <AsgardeoSignUpButton
                    class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-success/10 text-success border border-success/30 rounded-md hover:bg-success/20 transition-colors"
                    v-slot="{ isLoading: loading }"
                  >
                    {{ loading ? 'Redirecting…' : 'Create an account' }}
                  </AsgardeoSignUpButton>
                </div>
              </div>

              <!-- Right: description + log -->
              <div class="space-y-3">
                <p class="text-xs text-text-muted">
                  <code class="bg-surface-muted px-1 rounded font-mono">&lt;AsgardeoSignUpButton&gt;</code> initiates
                  the self-registration redirect. Works identically to
                  <code class="bg-surface-muted px-1 rounded font-mono">useAsgardeo().signUp()</code> but as a
                  declarative component.
                </p>
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <p class="text-xs font-semibold text-text-muted uppercase tracking-wide">Event log</p>
                    <button type="button" class="text-xs text-text-muted underline hover:text-text" @click="signUpLog.clear()">Clear</button>
                  </div>
                  <div class="rounded border border-border bg-surface-muted p-2 max-h-32 overflow-y-auto font-mono text-xs space-y-1">
                    <p v-if="signUpLog.entries.value.length === 0" class="text-text-muted/60">No events yet.</p>
                    <p
                      v-for="e in signUpLog.entries.value"
                      :key="e.id"
                      class="truncate"
                      :class="e.type === 'error' ? 'text-danger' : 'text-text-muted'"
                    >
                      <span class="text-text-muted/50 mr-1">{{ e.timestamp }}</span>{{ e.message }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </LayoutSectionCard>

          <LayoutCodeBlock :code="signUpCode" language="vue" />
        </div>
      </template>

    </LayoutTabGroup>
  </div>
</template>
