<script setup lang="ts">
import { ref } from 'vue';

const activeTab = ref('signin');
const tabs = [
  { key: 'signin',   label: 'AsgardeoSignIn'   },
  { key: 'signup',   label: 'AsgardeoSignUp'   },
  { key: 'callback', label: 'AsgardeoCallback' },
];

// ── Code snippets ──────────────────────────────────────────────────────────
const signInCode = `<!-- Drop the full Asgardeo sign-in screen inline on a page -->
<AsgardeoSignIn />

<!-- With custom layout around the component -->
<div class="mx-auto max-w-md py-12">
  <AsgardeoSignIn />
</div>`;

const signUpCode = `<!-- Drop the full Asgardeo sign-up screen inline on a page -->
<AsgardeoSignUp />`;

const callbackCode = `<!-- pages/auth/callback.vue -->
<!-- The callback page completes the redirect flow. -->
<AsgardeoCallback />`;
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="Auth Components"
      description="Full-page auth primitives — SignIn, SignUp, and the post-redirect Callback handler."
    />
    <div class="flex items-center gap-2 -mt-2">
      <SharedStatusBadge status="info" label="Auto-imported" />
      <span class="text-xs text-text-muted">from <code class="font-mono">@asgardeo/nuxt</code></span>
    </div>

    <LayoutTabGroup v-model="activeTab" :tabs="tabs" />

    <!-- ── AsgardeoSignIn ──────────────────────────────────────────────── -->
    <section v-if="activeTab === 'signin'" class="space-y-4">
      <LayoutSectionCard title="Live preview">
        <p class="text-sm text-text-muted mb-3">
          <code class="font-mono">&lt;AsgardeoSignIn&gt;</code> renders the same sign-in UI the
          redirect flow uses, but inline — handy for embedded flows.
        </p>
        <div class="rounded-md border border-border bg-surface-muted p-4">
          <AsgardeoSignIn />
        </div>
      </LayoutSectionCard>

      <LayoutSectionCard title="Usage">
        <LayoutCodeBlock :code="signInCode" language="vue" />
      </LayoutSectionCard>

      <LayoutSectionCard title="Related">
        <p class="text-sm text-text-muted">
          For the full redirect-based journey, see
          <NuxtLink to="/auth-flows" class="text-accent-600 hover:underline">Auth Flows → Redirect</NuxtLink>.
          For the embedded variant, see
          <NuxtLink to="/auth-flows/embedded" class="text-accent-600 hover:underline">Auth Flows → Embedded</NuxtLink>.
        </p>
      </LayoutSectionCard>
    </section>

    <!-- ── AsgardeoSignUp ──────────────────────────────────────────────── -->
    <section v-else-if="activeTab === 'signup'" class="space-y-4">
      <LayoutSectionCard title="Live preview">
        <p class="text-sm text-text-muted mb-3">
          <code class="font-mono">&lt;AsgardeoSignUp&gt;</code> renders the sign-up screen inline
          when self-registration is enabled on the Asgardeo tenant.
        </p>
        <div class="rounded-md border border-border bg-surface-muted p-4">
          <AsgardeoSignUp />
        </div>
      </LayoutSectionCard>

      <LayoutSectionCard title="Usage">
        <LayoutCodeBlock :code="signUpCode" language="vue" />
      </LayoutSectionCard>
    </section>

    <!-- ── AsgardeoCallback ────────────────────────────────────────────── -->
    <section v-else class="space-y-4">
      <LayoutSectionCard title="What it does">
        <p class="text-sm text-text-muted">
          <code class="font-mono">&lt;AsgardeoCallback&gt;</code> completes the OAuth2 redirect
          by handing the authorization code back to the SDK. Mount it on whatever page you
          configured as the <code class="font-mono">redirect_uri</code> on your Asgardeo
          application.
        </p>
      </LayoutSectionCard>

      <LayoutSectionCard title="Usage">
        <LayoutCodeBlock :code="callbackCode" language="vue" />
      </LayoutSectionCard>

      <LayoutSectionCard title="Related">
        <p class="text-sm text-text-muted">
          The callback page pairs with the server route
          <NuxtLink to="/server/routes/session/callback" class="text-accent-600 hover:underline">
            GET /api/auth/callback
          </NuxtLink>
          that performs the token exchange.
        </p>
      </LayoutSectionCard>
    </section>
  </div>
</template>
