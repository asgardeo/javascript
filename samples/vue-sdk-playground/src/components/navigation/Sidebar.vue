<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { XIcon } from '@asgardeo/vue';
import ThemeSwitcher from '../shared/ThemeSwitcher.vue';

type NavItemChild = { path: string; label: string; internal?: boolean };

type NavItemWithoutChildren = { path: string; label: string; icon: string };
type NavItemWithChildren = { path: string; label: string; icon: string; children: NavItemChild[] };

type NavItem = NavItemWithoutChildren | NavItemWithChildren;

const sidebarOpen = ref(false);
const expandedItems = ref<Set<string>>(new Set());
const route = useRoute();
const router = useRouter();

const navItems: NavItem[] = [
  { path: '/', label: 'Overview', icon: 'home' },
  { path: '/auth-flows', label: 'Auth Flows', icon: 'key' },
  {
    path: '/components',
    label: 'Components',
    icon: 'box',
    children: [
      { path: '/components/primitives', label: 'Primitives', internal: true },
      { path: '/components/actions', label: 'Actions' },
      { path: '/components/control', label: 'Control' },
      { path: '/components/presentation', label: 'Presentation' },
      { path: '/components/social', label: 'Social Logins', internal: true },
    ],
  },
  {
    path: '/public-apis',
    label: 'Public APIs',
    icon: 'code',
    children: [
      { path: '/public-apis/asgardeo', label: 'useAsgardeo' },
      { path: '/public-apis/user', label: 'useUser', internal: true },
      { path: '/public-apis/organization', label: 'useOrganization', internal: true },
      { path: '/public-apis/flow', label: 'useFlow', internal: true },
      { path: '/public-apis/flowMeta', label: 'useFlowMeta', internal: true },
      { path: '/public-apis/theme', label: 'useTheme', internal: true },
      { path: '/public-apis/branding', label: 'useBranding', internal: true },
      { path: '/public-apis/i18n', label: 'useI18n', internal: true },
    ],
  },
];

const hasChildren = (item: NavItem): item is NavItemWithChildren => 'children' in item;

const isExpanded = (path: string) => expandedItems.value.has(path);
const toggleExpanded = (path: string) => {
  if (expandedItems.value.has(path)) {
    expandedItems.value.delete(path);
  } else {
    expandedItems.value.add(path);
  }
};

const isParentActive = (item: NavItem) => route.path.startsWith(item.path) && item.path !== '/';
const isActive = (path: string) => route.path === path;

const navigate = (path: string) => {
  router.push(path);
  sidebarOpen.value = false;
};

const navigateToParent = (item: NavItem) => {
  if (hasChildren(item)) {
    router.push(item.children[0]?.path ?? item.path);
    if (!expandedItems.value.has(item.path)) {
      expandedItems.value.add(item.path);
    }
  } else {
    router.push(item.path);
  }
  sidebarOpen.value = false;
};

// Auto-expand parent items when the current route is a child item
const expandParentForCurrentRoute = () => {
  for (const item of navItems) {
    if (hasChildren(item)) {
      const isChildActive = item.children.some(child => route.path === child.path);
      if (isChildActive && !isExpanded(item.path)) {
        expandedItems.value.add(item.path);
      }
    }
  }
};

onMounted(() => {
  expandParentForCurrentRoute();
});

watch(() => route.path, () => {
  expandParentForCurrentRoute();
});
</script>

<template>
  <div>
    <!-- Sidebar -->
    <div
      class="fixed inset-y-0 left-0 z-50 w-64 bg-sidebar-bg shadow-lg transform transition-transform duration-300 ease-in-out flex flex-col"
      :class="{ 'translate-x-0': sidebarOpen, '-translate-x-full md:translate-x-0': !sidebarOpen }"
    >
      <!-- Header -->
      <div class="flex items-center justify-between h-16 px-4 bg-sidebar-header-bg shrink-0">
        <h1 class="text-lg font-semibold text-sidebar-active-text">Vue SDK Playground</h1>
        <button @click="sidebarOpen = false" class="md:hidden text-sidebar-active-text">
          <XIcon class="h-6 w-6" />
        </button>
      </div>
      
      <!-- Navigation - scrollable content -->
      <nav class="mt-4 flex-1 overflow-y-auto">
        <div class="px-2 space-y-1">
          <template v-for="item in navItems" :key="item.path">
            <!-- Parent nav item -->
            <button
              @click="navigateToParent(item)"
              class="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="
                item.path === '/'
                  ? isActive(item.path)
                    ? 'bg-sidebar-active-bg text-sidebar-active-text'
                    : 'text-sidebar-text hover:bg-sidebar-hover-bg'
                  : isParentActive(item)
                    ? 'bg-sidebar-active-bg text-sidebar-active-text'
                    : 'text-sidebar-text hover:bg-sidebar-hover-bg'
              "
            >
              <!-- Home icon -->
              <svg v-if="item.icon === 'home'" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <!-- Key icon -->
              <svg v-else-if="item.icon === 'key'" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <!-- Box icon -->
              <svg v-else-if="item.icon === 'box'" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <!-- Code icon -->
              <svg v-else-if="item.icon === 'code'" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span class="flex-1">{{ item.label }}</span>
              
              <!-- Expand/collapse arrow for items with children -->
              <button
                v-if="hasChildren(item)"
                @click.stop="toggleExpanded(item.path)"
                class="ml-auto p-1 rounded hover:bg-sidebar-hover-bg transition-colors"
              >
                <!-- Right arrow (collapsed) -->
                <svg v-if="!isExpanded(item.path)" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
                <!-- Down arrow (expanded) -->
                <svg v-else class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 9l7 7 7-7" />
                </svg>
              </button>
            </button>

            <!-- Second-level children (shown when expanded or when parent is active) -->
            <div
              v-if="hasChildren(item) && isExpanded(item.path)"
              class="ml-4 mt-1 space-y-0.5 border-l border-sidebar-hover-bg pl-3"
            >
              <button
                v-for="child in item.children"
                :key="child.path"
                @click="navigate(child.path)"
                class="w-full text-left px-2 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5"
                :class="
                  isActive(child.path)
                    ? 'text-accent-500 bg-sidebar-hover-bg'
                    : 'text-sidebar-text hover:bg-sidebar-hover-bg'
                "
              >
                <span class="flex-1">{{ child.label }}</span>
                <span
                  v-if="child.internal"
                  class="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold leading-none bg-status-warning-bg text-status-warning-text border border-border"
                >Internal</span>
              </button>
            </div>
          </template>
        </div>
      </nav>
      
      <!-- Theme Switcher at bottom -->
      <div class="border-t border-sidebar-hover-bg p-4 shrink-0">
        <ThemeSwitcher />
      </div>
    </div>

    <!-- Mobile menu toggle button -->
    <div class="fixed top-4 left-4 z-40 md:hidden">
      <button @click="sidebarOpen = !sidebarOpen" class="bg-surface-secondary p-2 rounded-md shadow-md">
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>

    <!-- Mobile overlay -->
    <div
      v-if="sidebarOpen"
      @click="sidebarOpen = false"
      class="fixed inset-0 z-30 bg-black/25 md:hidden"
    ></div>
  </div>
</template>
