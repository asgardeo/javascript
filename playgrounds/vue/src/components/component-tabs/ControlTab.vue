<script setup lang="ts">
import { ref } from 'vue';
import { useAsgardeo, SignedIn, SignedOut, Loading, Spinner } from '@asgardeo/vue';
import TabGroup from '../layout/TabGroup.vue';
import ComponentCard from '../layout/ComponentCard.vue';

const { isSignedIn, isLoading } = useAsgardeo();

const tabs = [
  { key: 'signedIn',  label: '<SignedIn/>'  },
  { key: 'signedOut', label: '<SignedOut/>' },
  { key: 'loading',   label: '<Loading/>'   },
];
const activeTab = ref(tabs[0]?.key ?? 'signedIn');
</script>

<template>
  <TabGroup class="h-full" :tabs="tabs" v-model="activeTab">

      <template #signedIn>
        <ComponentCard name="SignedIn" :badges="['Control']">
          <template #preview>
            <SignedIn>
              <template #default>
                <div class="rounded-md bg-status-success-bg border border-border px-4 py-2 text-sm text-status-success-text">
                  Signed in — default slot rendered
                </div>
              </template>
              <template #fallback>
                <div class="rounded-md bg-surface-secondary border border-border px-4 py-2 text-sm text-on-surface-muted">
                  Not signed in — fallback slot rendered
                </div>
              </template>
            </SignedIn>
          </template>
        </ComponentCard>
      </template>

      <template #signedOut>
        <ComponentCard name="SignedOut" :badges="['Control']">
          <template #preview>
            <SignedOut>
              <template #default>
                <div class="rounded-md bg-status-info-bg border border-border px-4 py-2 text-sm text-status-info-text">
                  Signed out — default slot rendered
                </div>
              </template>
              <template #fallback>
                <div class="rounded-md bg-surface-secondary border border-border px-4 py-2 text-sm text-on-surface-muted">
                  Signed in — fallback slot rendered
                </div>
              </template>
            </SignedOut>
          </template>
        </ComponentCard>
      </template>

      <template #loading>
        <ComponentCard name="Loading" :badges="['Control']">
          <template #preview>
            <Loading>
              <template #default>
                <div class="flex items-center gap-2 rounded-md bg-status-warning-bg border border-border px-4 py-2 text-sm text-status-warning-text">
                  <Spinner class="h-4 w-4" />
                  SDK initializing — default slot
                </div>
              </template>
              <template #fallback>
                <div class="rounded-md bg-status-success-bg border border-border px-4 py-2 text-sm text-status-success-text">
                  SDK ready — fallback slot
                </div>
              </template>
            </Loading>
          </template>
        </ComponentCard>
      </template>

    </TabGroup>
  <!-- </div> -->
</template>
