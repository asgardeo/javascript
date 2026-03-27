<script setup lang="ts">
import { ref } from 'vue';
import PageHeader from '../components/layout/PageHeader.vue';
import TabGroup from '../components/layout/TabGroup.vue';
import PrimitivesTab from './components/PrimitivesTab.vue';
import ActionsTab from './components/ActionsTab.vue';
import ControlTab from './components/ControlTab.vue';
import PresentationTab from './components/PresentationTab.vue';
import SocialLoginsTab from './components/SocialLoginsTab.vue';

const activeTab = ref('primitives');
const tabs = [
  { key: 'primitives', label: 'Primitives' },
  { key: 'actions', label: 'Actions' },
  { key: 'control', label: 'Control' },
  { key: 'presentation', label: 'Presentation' },
  { key: 'social', label: 'Social Logins' },
];
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Components"
      description="Interactive catalog of all SDK components: primitives, actions, control, presentation, and social logins."
    />
    <TabGroup :tabs="tabs" v-model="activeTab">
      <template #primitives><PrimitivesTab /></template>
      <template #actions><ActionsTab /></template>
      <template #control><ControlTab /></template>
      <template #presentation><PresentationTab /></template>
      <template #social><SocialLoginsTab /></template>
    </TabGroup>
  </div>
</template>
