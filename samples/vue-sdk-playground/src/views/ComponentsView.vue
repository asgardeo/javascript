<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PageHeader from '../components/layout/PageHeader.vue';
import TabGroup from '../components/layout/TabGroup.vue';
import PrimitivesTab from '../components/component-tabs/PrimitivesTab.vue';
import ActionsTab from '../components/component-tabs/ActionsTab.vue';
import ControlTab from '../components/component-tabs/ControlTab.vue';
import PresentationTab from '../components/component-tabs/PresentationTab.vue';
import SocialLoginsTab from '../components/component-tabs/SocialLoginsTab.vue';

const route = useRoute();
const router = useRouter();

const validTabs = ['primitives', 'actions', 'control', 'presentation', 'social'];

const activeTab = computed({
  get() {
    const tab = route.params.tab as string;
    return validTabs.includes(tab) ? tab : 'primitives';
  },
  set(tab: string) {
    router.push(`/components/${tab}`);
  },
});

const tabs = [
  { key: 'primitives', label: 'Primitives', internal: true },
  { key: 'actions', label: 'Actions' },
  { key: 'control', label: 'Control' },
  { key: 'presentation', label: 'Presentation' },
  { key: 'social', label: 'Social Logins', internal: true },
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
