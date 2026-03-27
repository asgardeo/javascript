<script setup lang="ts">
import { ref } from 'vue';
import {
  SignInButton,
  BaseSignInButton,
  SignOutButton,
  BaseSignOutButton,
  SignUpButton,
  BaseSignUpButton,
} from '@asgardeo/vue';
import SectionCard from '../../components/layout/SectionCard.vue';
import EventLog from '../../components/shared/EventLog.vue';

type LogEvent = { timestamp: string; type: string; data?: unknown };

const signInEvents = ref<LogEvent[]>([]);
const signOutEvents = ref<LogEvent[]>([]);
const signUpEvents = ref<LogEvent[]>([]);

function log(target: LogEvent[], type: string, data?: unknown) {
  target.unshift({ timestamp: new Date().toLocaleTimeString(), type, data });
}
</script>

<template>
  <div class="space-y-6">

    <!-- SignInButton -->
    <SectionCard title="SignInButton" description="Styled and base variants of the sign-in action button.">
      <div class="grid md:grid-cols-2 gap-6">
        <div class="space-y-4">
          <div>
            <p class="text-xs font-medium text-on-surface-muted uppercase tracking-wide mb-2">Default</p>
            <SignInButton @click="log(signInEvents, 'info', 'SignInButton clicked')" @error="log(signInEvents, 'error', $event)" />
          </div>
          <div>
            <p class="text-xs font-medium text-on-surface-muted uppercase tracking-wide mb-2">Custom Slot</p>
            <SignInButton v-slot="{ isLoading }" @click="log(signInEvents, 'info', 'custom slot clicked')" @error="log(signInEvents, 'error', $event)">
              {{ isLoading ? 'Signing in...' : 'Custom Sign In' }}
            </SignInButton>
          </div>
          <div>
            <p class="text-xs font-medium text-on-surface-muted uppercase tracking-wide mb-2">Base (Unstyled)</p>
            <BaseSignInButton
              class="px-4 py-2 bg-accent-100 text-accent-800 rounded-md text-sm font-medium hover:bg-accent-50 transition-colors"
              @click="log(signInEvents, 'info', 'BaseSignInButton clicked')"
            >
              Custom styled sign in
            </BaseSignInButton>
          </div>
        </div>
        <div class="space-y-2">
          <p class="text-xs text-on-surface-muted">
            <code class="bg-surface-muted px-1 rounded font-mono">&lt;SignInButton&gt;</code> renders a pre-styled button that triggers the SDK sign-in flow.
            Use <code class="bg-surface-muted px-1 rounded font-mono">v-slot</code> to access <code class="bg-surface-muted px-1 rounded font-mono">isLoading</code> for custom content.
            <code class="bg-surface-muted px-1 rounded font-mono">&lt;BaseSignInButton&gt;</code> is completely unstyled — apply your own classes.
          </p>
          <EventLog :events="signInEvents" />
        </div>
      </div>
    </SectionCard>

    <!-- SignOutButton -->
    <SectionCard title="SignOutButton" description="Styled and base variants of the sign-out action button.">
      <div class="grid md:grid-cols-2 gap-6">
        <div class="space-y-4">
          <div>
            <p class="text-xs font-medium text-on-surface-muted uppercase tracking-wide mb-2">Default</p>
            <SignOutButton @click="log(signOutEvents, 'info', 'SignOutButton clicked')" @error="log(signOutEvents, 'error', $event)" />
          </div>
          <div>
            <p class="text-xs font-medium text-on-surface-muted uppercase tracking-wide mb-2">Custom Slot</p>
            <SignOutButton v-slot="{ isLoading }" @click="log(signOutEvents, 'info', 'custom slot clicked')" @error="log(signOutEvents, 'error', $event)">
              {{ isLoading ? 'Signing out...' : 'Custom Sign Out' }}
            </SignOutButton>
          </div>
          <div>
            <p class="text-xs font-medium text-on-surface-muted uppercase tracking-wide mb-2">Base (Unstyled)</p>
            <BaseSignOutButton
              class="px-4 py-2 bg-status-error-bg text-status-error-text rounded-md text-sm font-medium transition-colors"
              @click="log(signOutEvents, 'info', 'BaseSignOutButton clicked')"
            >
              Custom styled sign out
            </BaseSignOutButton>
          </div>
        </div>
        <div class="space-y-2">
          <p class="text-xs text-on-surface-muted">
            <code class="bg-surface-muted px-1 rounded font-mono">&lt;SignOutButton&gt;</code> triggers the SDK sign-out flow and clears the session.
            Use <code class="bg-surface-muted px-1 rounded font-mono">v-slot</code> to show a loading state during sign-out.
            <code class="bg-surface-muted px-1 rounded font-mono">&lt;BaseSignOutButton&gt;</code> provides the same behaviour without any styling.
          </p>
          <EventLog :events="signOutEvents" />
        </div>
      </div>
    </SectionCard>

    <!-- SignUpButton -->
    <SectionCard title="SignUpButton" description="Styled and base variants of the sign-up action button.">
      <div class="grid md:grid-cols-2 gap-6">
        <div class="space-y-4">
          <div>
            <p class="text-xs font-medium text-on-surface-muted uppercase tracking-wide mb-2">Default</p>
            <SignUpButton @click="log(signUpEvents, 'info', 'SignUpButton clicked')" @error="log(signUpEvents, 'error', $event)" />
          </div>
          <div>
            <p class="text-xs font-medium text-on-surface-muted uppercase tracking-wide mb-2">Custom Slot</p>
            <SignUpButton v-slot="{ isLoading }" @click="log(signUpEvents, 'info', 'custom slot clicked')" @error="log(signUpEvents, 'error', $event)">
              {{ isLoading ? 'Redirecting...' : 'Custom Sign Up' }}
            </SignUpButton>
          </div>
          <div>
            <p class="text-xs font-medium text-on-surface-muted uppercase tracking-wide mb-2">Base (Unstyled)</p>
            <BaseSignUpButton
              class="px-4 py-2 bg-status-success-bg text-status-success-text rounded-md text-sm font-medium transition-colors"
              @click="log(signUpEvents, 'info', 'BaseSignUpButton clicked')"
            >
              Custom styled sign up
            </BaseSignUpButton>
          </div>
        </div>
        <div class="space-y-2">
          <p class="text-xs text-on-surface-muted">
            <code class="bg-surface-muted px-1 rounded font-mono">&lt;SignUpButton&gt;</code> redirects the user to the Asgardeo registration page.
            Use <code class="bg-surface-muted px-1 rounded font-mono">v-slot</code> to customise content based on loading state.
            <code class="bg-surface-muted px-1 rounded font-mono">&lt;BaseSignUpButton&gt;</code> is fully unstyled for complete design freedom.
          </p>
          <EventLog :events="signUpEvents" />
        </div>
      </div>
    </SectionCard>

  </div>
</template>
