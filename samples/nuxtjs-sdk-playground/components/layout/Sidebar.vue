<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';

type NavChild = { path: string; label: string; badge?: string };
type NavItem = {
  path: string;
  label: string;
  icon: 'home' | 'key' | 'box' | 'code' | 'server' | 'shield' | 'bug' | 'route';
  children?: NavChild[];
};

const route = useRoute();
const sidebarOpen = ref(false);
const expandedItems = ref<Set<string>>(new Set());

const navItems: NavItem[] = [
  { path: '/', label: 'Overview', icon: 'home' },
  {
    path: '/auth-flows',
    label: 'Auth Flows',
    icon: 'key',
    children: [
      { path: '/auth-flows', label: 'Redirect Flow' },
      { path: '/auth-flows/embedded', label: 'Embedded' },
    ],
  },
  {
    path: '/components',
    label: 'Components',
    icon: 'box',
    children: [
      { path: '/components/control', label: 'Control' },
      { path: '/components/actions', label: 'Actions' },
      { path: '/components/user', label: 'User' },
      { path: '/components/organization', label: 'Organization' },
    ],
  },
  {
    path: '/apis',
    label: 'Public APIs',
    icon: 'code',
    children: [
      { path: '/apis/asgardeo', label: 'useAsgardeo' },
      { path: '/apis/user', label: 'useUser' },
      { path: '/apis/organization', label: 'useOrganization' },
      { path: '/apis/flow', label: 'useFlow' },
      { path: '/apis/theme', label: 'useTheme' },
      { path: '/apis/branding', label: 'useBranding' },
      { path: '/apis/i18n', label: 'useAsgardeoI18n' },
    ],
  },
  {
    path: '/routes',
    label: 'SDK Routes',
    icon: 'route',
    children: [
      { path: '/routes', label: 'Overview' },
      { path: '/routes/session/signin', label: 'GET /signin' },
      { path: '/routes/session/callback', label: 'GET /callback' },
      { path: '/routes/session/signout', label: 'POST /signout' },
      { path: '/routes/session/session', label: 'GET /session' },
      { path: '/routes/session/token', label: 'GET /token' },
      { path: '/routes/user/user', label: 'GET /user' },
      { path: '/routes/user/profile-get', label: 'GET /user/profile' },
      { path: '/routes/user/profile-patch', label: 'PATCH /user/profile' },
      { path: '/routes/organizations/list', label: 'GET /organizations' },
      { path: '/routes/organizations/create', label: 'POST /organizations' },
      { path: '/routes/organizations/me', label: 'GET /organizations/me' },
      { path: '/routes/organizations/current', label: 'GET /organizations/current' },
      { path: '/routes/organizations/by-id', label: 'GET /organizations/:id' },
      { path: '/routes/organizations/switch', label: 'POST /organizations/switch' },
      { path: '/routes/branding', label: 'GET /branding' },
    ],
  },
  {
    path: '/server',
    label: 'Server Utilities',
    icon: 'server',
    children: [
      { path: '/server/session', label: 'useServerSession' },
      { path: '/server/token', label: 'getValidAccessToken' },
      { path: '/server/userinfo', label: 'AsgardeoNuxtClient' },
    ],
  },
  {
    path: '/middleware',
    label: 'Middleware',
    icon: 'shield',
    children: [
      { path: '/middleware/protected', label: 'auth (named)' },
      { path: '/middleware/org-required', label: 'requireOrganization' },
      { path: '/middleware/scoped', label: 'requireScopes' },
    ],
  },
  {
    path: '/debug',
    label: 'Debug',
    icon: 'bug',
    children: [
      { path: '/debug', label: 'State dump' },
      { path: '/debug/preferences', label: 'Preferences' },
    ],
  },
];

const isActive = (path: string) => route.path === path;
const isParentActive = (item: NavItem) =>
  item.path !== '/' && route.path.startsWith(item.path);

const toggleExpanded = (path: string) => {
  if (expandedItems.value.has(path)) {
    expandedItems.value.delete(path);
  } else {
    expandedItems.value.add(path);
  }
};

const closeSidebar = () => { sidebarOpen.value = false; };

const expandActiveParent = () => {
  for (const item of navItems) {
    if (item.children) {
      const childActive = item.children.some(c => route.path === c.path);
      if ((childActive || isParentActive(item)) && !expandedItems.value.has(item.path)) {
        expandedItems.value.add(item.path);
      }
    }
  }
};

onMounted(expandActiveParent);
watch(() => route.path, expandActiveParent);
</script>

<template>
  <!-- Mobile hamburger overlay -->
  <div
    v-if="sidebarOpen"
    class="fixed inset-0 z-40 bg-black/30 md:hidden"
    @click="closeSidebar"
  />

  <!-- Mobile toggle button -->
  <button
    type="button"
    class="fixed top-4 left-4 z-50 md:hidden p-2 rounded-md bg-surface border border-border shadow-sm text-text"
    aria-label="Open sidebar"
    @click="sidebarOpen = true"
  >
    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  </button>

  <!-- Sidebar panel -->
  <aside
    class="fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-sidebar-bg border-r border-border shadow-lg
           transition-transform duration-300 ease-in-out"
    :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
  >
    <!-- Header -->
    <div class="flex items-center justify-between h-16 px-4 border-b border-border shrink-0">
      <NuxtLink to="/" class="text-base font-semibold text-text leading-tight" @click="closeSidebar">
        Nuxt SDK<br />
        <span class="text-accent-600 text-sm font-bold">Playground</span>
      </NuxtLink>
      <button
        type="button"
        class="md:hidden text-text-muted hover:text-text"
        aria-label="Close sidebar"
        @click="closeSidebar"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Nav — scrollable -->
    <nav class="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
      <template v-for="item in navItems" :key="item.path">
        <!-- Parent / leaf item -->
        <button
          type="button"
          class="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          :class="
            item.path === '/'
              ? isActive(item.path)
                ? 'bg-sidebar-active-bg text-sidebar-text-active'
                : 'text-sidebar-text hover:bg-sidebar-hover'
              : isParentActive(item)
                ? 'bg-sidebar-active-bg text-sidebar-text-active'
                : 'text-sidebar-text hover:bg-sidebar-hover'
          "
          @click="item.children ? toggleExpanded(item.path) : navigateTo(item.path)"
        >
          <!-- Icons -->
          <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path v-if="item.icon === 'home'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            <path v-else-if="item.icon === 'key'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            <path v-else-if="item.icon === 'box'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            <path v-else-if="item.icon === 'code'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            <path v-else-if="item.icon === 'server'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            <path v-else-if="item.icon === 'route'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            <path v-else-if="item.icon === 'shield'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            <path v-else-if="item.icon === 'bug'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>

          <span class="flex-1">{{ item.label }}</span>

          <!-- Chevron for items with children -->
          <svg
            v-if="item.children"
            class="h-4 w-4 shrink-0 transition-transform duration-200"
            :class="expandedItems.has(item.path) ? 'rotate-90' : ''"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <!-- Children -->
        <div
          v-if="item.children && expandedItems.has(item.path)"
          class="ml-4 pl-3 border-l border-border space-y-0.5"
        >
          <NuxtLink
            v-for="child in item.children"
            :key="child.path"
            :to="child.path"
            class="block px-2 py-1.5 rounded-md text-xs font-medium transition-colors"
            :class="
              isActive(child.path)
                ? 'text-accent-600 bg-sidebar-active-bg font-semibold'
                : 'text-sidebar-text hover:bg-sidebar-hover'
            "
            @click="closeSidebar"
          >
            {{ child.label }}
          </NuxtLink>
        </div>
      </template>
    </nav>

    <!-- Theme switcher at bottom -->
    <div class="border-t border-border p-4 shrink-0">
      <SharedThemeSwitcher />
    </div>
  </aside>
</template>
