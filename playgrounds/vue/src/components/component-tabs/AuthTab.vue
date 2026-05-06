<script setup lang="ts">
import { ref } from 'vue';
import { Callback, SignIn, SignUp, SignedIn, SignedOut } from '@asgardeo/vue';
import TabGroup from '../layout/TabGroup.vue';
import ComponentCard from '../layout/ComponentCard.vue';
import PropControl from '../layout/PropControl.vue';

const tabs = [
  { key: 'signIn',   label: '<SignIn/>'   },
  { key: 'signUp',   label: '<SignUp/>'   },
  { key: 'callback', label: '<Callback/>' },
];
const activeTab = ref(tabs[0]?.key ?? 'callback');

const signInSize    = ref<'small' | 'medium' | 'large'>('medium');
const signInVariant = ref<'elevated' | 'outlined' | 'flat'>('outlined');
</script>

<template>
  <TabGroup class="h-full" :tabs="tabs" v-model="activeTab">

      <template #callback>
        <ComponentCard name="Callback" :badges="['Auth']">
          <template #preview>
            <div class="flex flex-col items-center gap-2 text-center">
              <div class="rounded-full bg-surface-secondary border border-border p-3">
                <svg class="h-5 w-5 text-on-surface-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p class="text-xs text-on-surface-muted max-w-[200px]">
                Headless — processes OAuth callback parameters. No visible UI output.
              </p>
              <Callback />
            </div>
          </template>
        </ComponentCard>
      </template>

      <template #signIn>
        <ComponentCard name="SignIn" :badges="['Auth']">
          <template #preview>
            <div class="w-full flex items-center justify-center">
              <SignedOut>
                <SignIn :size="signInSize" :variant="signInVariant" />
              </SignedOut>
              <SignedIn>
                <p class="text-sm text-on-surface-muted italic">Sign out to preview SignIn.</p>
              </SignedIn>
            </div>
          </template>
          <template #controls>
            <PropControl label="size"    type="select" :options="['small','medium','large']"          v-model="signInSize" />
            <PropControl label="variant" type="select" :options="['elevated','outlined','flat']" v-model="signInVariant" />
          </template>
        </ComponentCard>
      </template>

      <template #signUp>
        <ComponentCard name="SignUp" :badges="['Auth']">
          <template #preview>
            <div class="w-full flex items-center justify-center">
              <SignedOut>
                <SignUp />
              </SignedOut>
              <SignedIn>
                <p class="text-sm text-on-surface-muted italic">Sign out to preview SignUp.</p>
              </SignedIn>
            </div>
          </template>
        </ComponentCard>
      </template>

  </TabGroup>
</template>
