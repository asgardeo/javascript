<script setup lang="ts">
import { ref } from 'vue';
import {
  GoogleButton,
  GitHubButton,
  MicrosoftButton,
  FacebookButton,
  Card,
  Divider,
  TextField,
  PasswordField,
} from '@asgardeo/vue';
import SectionCard from '../../components/layout/SectionCard.vue';
import EventLog from '../../components/shared/EventLog.vue';

type LogEvent = { timestamp: string; type: string; data?: unknown };
const events = ref<LogEvent[]>([]);

function logEvent(provider: string) {
  events.value.unshift({
    timestamp: new Date().toLocaleTimeString(),
    type: 'info',
    data: `${provider} button clicked`,
  });
}

// Combined panel demo state
const demoEmail = ref('');
const demoPassword = ref('');
</script>

<template>
  <div class="space-y-6">

    <!-- Social Login Buttons -->
    <SectionCard
      title="Social Login Buttons"
      description="Pre-styled brand buttons for the four major OAuth providers. Each button handles loading state and fires a @click event."
    >
      <div class="grid grid-cols-2 gap-4">
        <GoogleButton @click="logEvent('google')" />
        <GitHubButton @click="logEvent('github')" />
        <MicrosoftButton @click="logEvent('microsoft')" />
        <FacebookButton @click="logEvent('facebook')" />
      </div>
    </SectionCard>

    <!-- Custom Slot Rendering -->
    <SectionCard
      title="Custom Slot Rendering"
      description="Use the default scoped slot to override button label text. The slot exposes { isLoading } so you can show a custom loading message."
    >
      <div class="grid grid-cols-2 gap-4">
        <GoogleButton v-slot="{ isLoading }" @click="logEvent('google-custom')">
          {{ isLoading ? 'Connecting to Google...' : 'Continue with Google' }}
        </GoogleButton>
        <GitHubButton v-slot="{ isLoading }" @click="logEvent('github-custom')">
          {{ isLoading ? 'Connecting to GitHub...' : 'Continue with GitHub' }}
        </GitHubButton>
        <MicrosoftButton v-slot="{ isLoading }" @click="logEvent('microsoft-custom')">
          {{ isLoading ? 'Connecting to Microsoft...' : 'Continue with Microsoft' }}
        </MicrosoftButton>
        <FacebookButton v-slot="{ isLoading }" @click="logEvent('facebook-custom')">
          {{ isLoading ? 'Connecting to Facebook...' : 'Continue with Facebook' }}
        </FacebookButton>
      </div>
    </SectionCard>

    <!-- Combined Social Login Panel -->
    <SectionCard
      title="Combined Social Login Panel"
      description="Real-world composition pattern: social buttons stacked above a Divider, followed by an email/password form."
    >
      <div class="flex justify-center">
        <Card class="w-full max-w-sm">
          <div class="space-y-3 p-1">
            <p class="text-sm font-semibold text-on-surface text-center mb-1">Sign in with</p>
            <GoogleButton class="w-full" @click="logEvent('panel-google')" />
            <GitHubButton class="w-full" @click="logEvent('panel-github')" />
            <MicrosoftButton class="w-full" @click="logEvent('panel-microsoft')" />
            <FacebookButton class="w-full" @click="logEvent('panel-facebook')" />
            <Divider label="or" />
            <TextField
              name="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              :model-value="demoEmail"
              @update:model-value="demoEmail = $event"
            />
            <PasswordField
              name="password"
              label="Password"
              placeholder="••••••••"
              :model-value="demoPassword"
              @update:model-value="demoPassword = $event"
            />
          </div>
        </Card>
      </div>
    </SectionCard>

    <!-- Event Log -->
    <SectionCard title="Event Log" description="All social button click events are captured here.">
      <EventLog :events="events" />
    </SectionCard>

  </div>
</template>
