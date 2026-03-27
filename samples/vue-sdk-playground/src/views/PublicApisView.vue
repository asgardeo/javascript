<script setup lang="ts">
import { ref } from 'vue'
import PageHeader from '../components/layout/PageHeader.vue'
import TabGroup from '../components/layout/TabGroup.vue'
import AsgardeoTab from '../components/public-apis/AsgardeoTab.vue'
import UserTab from '../components/public-apis/UserTab.vue'
import OrganizationTab from '../components/public-apis/OrganizationTab.vue'
import FlowTab from '../components/public-apis/FlowTab.vue'
import FlowMetaTab from '../components/public-apis/FlowMetaTab.vue'
import ThemeTab from '../components/public-apis/ThemeTab.vue'
import BrandingTab from '../components/public-apis/BrandingTab.vue'
import I18nTab from '../components/public-apis/I18nTab.vue'

const activeTab = ref('asgardeo')

const tabs = [
  { key: 'asgardeo', label: 'useAsgardeo()' },
  { key: 'user', label: 'useUser()' },
  { key: 'organization', label: 'useOrganization()' },
  { key: 'flow', label: 'useFlow()' },
  { key: 'flowMeta', label: 'useFlowMeta()' },
  { key: 'theme', label: 'useTheme()' },
  { key: 'branding', label: 'useBranding()' },
  { key: 'i18n', label: 'useI18n()' },
]
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Public APIs"
      description="Interactive playground for every composable method exposed by the SDK."
    />

    <TabGroup :tabs="tabs" v-model="activeTab">
      <template #asgardeo><AsgardeoTab /></template>
      <template #user><UserTab /></template>
      <template #organization><OrganizationTab /></template>
      <template #flow><FlowTab /></template>
      <template #flowMeta><FlowMetaTab /></template>
      <template #theme><ThemeTab /></template>
      <template #branding><BrandingTab /></template>
      <template #i18n><I18nTab /></template>
    </TabGroup>
  </div>
</template>
