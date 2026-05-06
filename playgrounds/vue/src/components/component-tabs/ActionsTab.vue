<script setup lang="ts">
import { ref } from 'vue';
import { SignInButton, SignOutButton, SignUpButton } from '@asgardeo/vue';
import TabGroup from '../layout/TabGroup.vue';
import ComponentCard from '../layout/ComponentCard.vue';

const tabs = [
  { key: 'signInButton',  label: '<SignInButton/>'  },
  { key: 'signOutButton', label: '<SignOutButton/>' },
  { key: 'signUpButton',  label: '<SignUpButton/>'  },
];
const activeTab = ref(tabs[0]?.key ?? 'signInButton');
</script>

<template>
  <TabGroup class="h-full" :tabs="tabs" v-model="activeTab">

      <template #signInButton>
        <ComponentCard name="SignInButton" :badges="['Actions']">
          <template #preview>
            <SignInButton />
          </template>
        </ComponentCard>
      </template>

      <template #signOutButton>
        <ComponentCard name="SignOutButton" :badges="['Actions']">
          <template #preview>
            <SignOutButton />
          </template>
        </ComponentCard>
      </template>

      <template #signUpButton>
        <ComponentCard name="SignUpButton" :badges="['Actions']">
          <template #preview>
            <SignUpButton />
          </template>
        </ComponentCard>
      </template>

  </TabGroup>
</template>
