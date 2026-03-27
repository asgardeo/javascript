<script setup lang="ts">
import { ref } from 'vue'
import PageHeader from '../components/layout/PageHeader.vue'
import TabGroup from '../components/layout/TabGroup.vue'
import AsgardeoApiSection from './apis/AsgardeoApiSection.vue'
import UserApiSection from './apis/UserApiSection.vue'
import OrganizationApiSection from './apis/OrganizationApiSection.vue'
import FlowApiSection from './apis/FlowApiSection.vue'
import FlowMetaApiSection from './apis/FlowMetaApiSection.vue'
import ThemeApiSection from './apis/ThemeApiSection.vue'
import BrandingApiSection from './apis/BrandingApiSection.vue'
import I18nApiSection from './apis/I18nApiSection.vue'

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
      <template #asgardeo><AsgardeoApiSection /></template>
      <template #user><UserApiSection /></template>
      <template #organization><OrganizationApiSection /></template>
      <template #flow><FlowApiSection /></template>
      <template #flowMeta><FlowMetaApiSection /></template>
      <template #theme><ThemeApiSection /></template>
      <template #branding><BrandingApiSection /></template>
      <template #i18n><I18nApiSection /></template>
    </TabGroup>
  </div>
</template>
