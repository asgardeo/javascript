<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '../components/layout/PageHeader.vue'
import AsgardeoTab from '../components/public-apis/AsgardeoTab.vue'
import UserTab from '../components/public-apis/UserTab.vue'
import OrganizationTab from '../components/public-apis/OrganizationTab.vue'
import FlowTab from '../components/public-apis/FlowTab.vue'
import FlowMetaTab from '../components/public-apis/FlowMetaTab.vue'
import ThemeTab from '../components/public-apis/ThemeTab.vue'
import BrandingTab from '../components/public-apis/BrandingTab.vue'
import I18nTab from '../components/public-apis/I18nTab.vue'

const route = useRoute()
const router = useRouter()

const tabComponents: Record<string, any> = {
  asgardeo: AsgardeoTab,
  user: UserTab,
  organization: OrganizationTab,
  flow: FlowTab,
  flowMeta: FlowMetaTab,
  theme: ThemeTab,
  branding: BrandingTab,
  i18n: I18nTab,
}

const validTabs = Object.keys(tabComponents)

const activeTab = computed(() => {
  const tab = route.params.tab as string
  return validTabs.includes(tab) ? tab : 'asgardeo'
})

watch(
  () => route.params.tab,
  (tab) => {
    if (!validTabs.includes(tab as string)) {
      router.replace('/composables/asgardeo')
    }
  }
)

const activeComponent = computed(() => tabComponents[activeTab.value])
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Composables"
      description="Interactive playground for every composable method exposed by the SDK."
    />

    <component :is="activeComponent" />
  </div>
</template>
