<script setup lang="ts">
import { ref } from 'vue';
import { GoogleButton, GitHubButton, MicrosoftButton, FacebookButton } from '@asgardeo/vue';
import TabGroup from '../layout/TabGroup.vue';
import ComponentCard from '../layout/ComponentCard.vue';

const tabs = [
  { key: 'google',    label: '<GoogleButton/>'    },
  { key: 'github',    label: '<GitHubButton/>'    },
  { key: 'microsoft', label: '<MicrosoftButton/>' },
  { key: 'facebook',  label: '<FacebookButton/>'  },
];
const activeTab = ref(tabs[0]?.key ?? 'google');
</script>

<template>
  <TabGroup class="h-full" :tabs="tabs" v-model="activeTab">

      <template #google>
        <ComponentCard name="GoogleButton" :badges="['Social Logins']">
          <template #preview>
            <GoogleButton />
          </template>
        </ComponentCard>
      </template>

      <template #github>
        <ComponentCard name="GitHubButton" :badges="['Social Logins']">
          <template #preview>
            <GitHubButton />
          </template>
        </ComponentCard>
      </template>

      <template #microsoft>
        <ComponentCard name="MicrosoftButton" :badges="['Social Logins']">
          <template #preview>
            <MicrosoftButton />
          </template>
        </ComponentCard>
      </template>

      <template #facebook>
        <ComponentCard name="FacebookButton" :badges="['Social Logins']">
          <template #preview>
            <FacebookButton />
          </template>
        </ComponentCard>
      </template>

  </TabGroup>
</template>
