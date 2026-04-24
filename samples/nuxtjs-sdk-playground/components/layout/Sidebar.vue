<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { useThemeMode } from '~/composables/useThemeMode';
import {
  componentGroups,
  composables,
  middleware,
  serverRoutes,
  serverUtilities,
} from '~/utils/sdk-manifest';

// ── Types ──────────────────────────────────────────────────────────────────

type IconName =
  | 'home' | 'key' | 'box' | 'code' | 'server' | 'shield' | 'bug' | 'route' | 'book';

type NavLeaf = { kind: 'leaf'; path: string; label: string; badge?: string };
type NavDivider = { kind: 'divider'; label: string };
type NavParent = {
  kind: 'parent';
  path: string;
  label: string;
  icon: IconName;
  children: Array<NavLeaf | NavDivider>;
};
type NavSection = { kind: 'section'; label: string };
type NavNode = NavLeaf | NavDivider | NavParent | NavSection;

const route = useRoute();
const sidebarOpen = ref(false);
const expandedItems = ref<Set<string>>(new Set());

// ── Helpers to translate the SDK manifest into sidebar nodes ───────────────

const routeLeafLabel = (method: string, path: string) => {
  // Turn `/api/auth/organizations/:id` into `GET /organizations/:id`.
  const suffix = path.replace(/^\/api\/auth/, '') || '/';
  return `${method} ${suffix}`;
};

const serverRouteChildren: Array<NavLeaf | NavDivider> = serverRoutes.flatMap(
  (domain) => [
    { kind: 'divider' as const, label: domain.label },
    ...domain.routes.map((r) => ({
      kind: 'leaf' as const,
      path: r.page,
      label: routeLeafLabel(r.method, r.path),
    })),
  ],
);

// ── Nav tree ───────────────────────────────────────────────────────────────

const navItems: NavNode[] = [
  { kind: 'section', label: 'Getting Started' },
  { kind: 'parent', path: '/', label: 'Overview', icon: 'home', children: [] },
  {
    kind: 'parent',
    path: '/auth-flows',
    label: 'Auth Flows',
    icon: 'key',
    children: [
      { kind: 'leaf', path: '/auth-flows',          label: 'Redirect Flow' },
      { kind: 'leaf', path: '/auth-flows/embedded', label: 'Embedded' },
    ],
  },

  { kind: 'section', label: 'Client Surface' },
  {
    kind: 'parent',
    path: '/components',
    label: 'Components',
    icon: 'box',
    children: componentGroups.map((g) => ({
      kind: 'leaf' as const,
      path: g.path,
      label: g.label,
    })),
  },
  {
    kind: 'parent',
    path: '/composables',
    label: 'Composables',
    icon: 'code',
    children: composables.map((c) => ({
      kind: 'leaf' as const,
      path: c.path,
      label: c.name,
    })),
  },
  {
    kind: 'parent',
    path: '/middleware',
    label: 'Middleware',
    icon: 'shield',
    children: middleware.map((m) => ({
      kind: 'leaf' as const,
      path: m.path,
      label: m.name,
    })),
  },

  { kind: 'section', label: 'Server Surface' },
  {
    kind: 'parent',
    path: '/server/routes',
    label: 'Routes',
    icon: 'route',
    children: [
      { kind: 'leaf', path: '/server/routes', label: 'Overview' },
      ...serverRouteChildren,
    ],
  },
  {
    kind: 'parent',
    path: '/server/utilities',
    label: 'Utilities',
    icon: 'server',
    children: [
      { kind: 'leaf', path: '/server/utilities', label: 'Overview' },
      ...serverUtilities.map((u) => ({
        kind: 'leaf' as const,
        path: u.path,
        label: u.name,
      })),
    ],
  },

  { kind: 'section', label: 'Reference' },
  { kind: 'parent', path: '/reference/utilities', label: 'Utilities', icon: 'book', children: [] },
  { kind: 'parent', path: '/reference/errors',    label: 'Errors',    icon: 'book', children: [] },
  {
    kind: 'parent',
    path: '/playground',
    label: 'Playground Tools',
    icon: 'bug',
    children: [
      { kind: 'leaf', path: '/playground/state',       label: 'State dump' },
      { kind: 'leaf', path: '/playground/preferences', label: 'Preferences' },
    ],
  },
];

// Overview is a leaf — simplify by stripping its empty children.
const renderedNav = computed(() =>
  navItems.map((n) =>
    n.kind === 'parent' && n.children.length === 0
      ? ({ kind: 'leaf', path: n.path, label: n.label, icon: n.icon } as const)
      : n,
  ),
);

const isActive = (path: string) => route.path === path;
const isParentActive = (item: NavParent) =>
  item.path !== '/' && route.path.startsWith(item.path);

const toggleExpanded = (path: string) => {
  if (expandedItems.value.has(path)) expandedItems.value.delete(path);
  else expandedItems.value.add(path);
};

const closeSidebar = () => { sidebarOpen.value = false; };

const expandActiveParent = () => {
  for (const item of navItems) {
    if (item.kind !== 'parent' || item.children.length === 0) continue;
    const childActive = item.children.some(
      (c) => c.kind === 'leaf' && route.path === c.path,
    );
    if ((childActive || isParentActive(item)) && !expandedItems.value.has(item.path)) {
      expandedItems.value.add(item.path);
    }
  }
};

onMounted(expandActiveParent);
watch(() => route.path, expandActiveParent);

// ── Settings popup ────────────────────────────────────────────────────────

const { theme, mode, setTheme, setMode } = useThemeMode();

const settingsOpen          = ref(false);
const activeSubmenu         = ref<'mode' | 'palette' | null>(null);
const settingsContainerRef  = ref<HTMLElement | null>(null);

let closeSubmenuTimer: ReturnType<typeof setTimeout> | null = null;

const themes = [
  { id: 'orange' as const, label: 'Orange', color: '#f97316' },
  { id: 'blue'   as const, label: 'Blue',   color: '#3b82f6' },
];

const modes = [
  { id: 'light' as const, label: 'Light' },
  { id: 'dark'  as const, label: 'Dark'  },
];

function openSubmenu(id: 'mode' | 'palette') {
  if (closeSubmenuTimer) { clearTimeout(closeSubmenuTimer); closeSubmenuTimer = null; }
  activeSubmenu.value = id;
}

function scheduleCloseSubmenu() {
  closeSubmenuTimer = setTimeout(() => { activeSubmenu.value = null; }, 150);
}

function handleSettingsClickOutside(e: MouseEvent) {
  if (!settingsContainerRef.value?.contains(e.target as Node)) {
    settingsOpen.value = false;
    activeSubmenu.value = null;
  }
}

onMounted(() => document.addEventListener('mousedown', handleSettingsClickOutside));
onUnmounted(() => {
  document.removeEventListener('mousedown', handleSettingsClickOutside);
  if (closeSubmenuTimer) clearTimeout(closeSubmenuTimer);
});
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
      <template v-for="(item, idx) in renderedNav" :key="item.kind + idx">
        <!-- Section heading -->
        <p
          v-if="item.kind === 'section'"
          class="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted first:pt-0"
        >
          {{ item.label }}
        </p>

        <!-- Leaf (flat, no children) -->
        <NuxtLink
          v-else-if="item.kind === 'leaf'"
          :to="item.path"
          class="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          :class="isActive(item.path)
            ? 'bg-sidebar-active-bg text-sidebar-text-active'
            : 'text-sidebar-text hover:bg-sidebar-hover'"
          @click="closeSidebar"
        >
          <SidebarIcon :name="(item as any).icon ?? 'home'" />
          <span class="flex-1">{{ item.label }}</span>
        </NuxtLink>

        <!-- Parent with children -->
        <template v-else-if="item.kind === 'parent'">
          <button
            type="button"
            class="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            :class="isParentActive(item)
              ? 'bg-sidebar-active-bg text-sidebar-text-active'
              : 'text-sidebar-text hover:bg-sidebar-hover'"
            @click="toggleExpanded(item.path)"
          >
            <SidebarIcon :name="item.icon" />
            <span class="flex-1">{{ item.label }}</span>
            <svg
              class="h-4 w-4 shrink-0 transition-transform duration-200"
              :class="expandedItems.has(item.path) ? 'rotate-90' : ''"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div
            v-if="expandedItems.has(item.path)"
            class="ml-4 pl-3 border-l border-border space-y-0.5"
          >
            <template v-for="(child, cidx) in item.children" :key="child.kind + cidx">
              <!-- Non-clickable domain divider inside a parent -->
              <p
                v-if="child.kind === 'divider'"
                class="mt-2 mb-0.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted"
              >
                {{ child.label }}
              </p>
              <NuxtLink
                v-else
                :to="child.path"
                class="block px-2 py-1.5 rounded-md text-xs font-medium transition-colors"
                :class="isActive(child.path)
                  ? 'text-accent-600 bg-sidebar-active-bg font-semibold'
                  : 'text-sidebar-text hover:bg-sidebar-hover'"
                @click="closeSidebar"
              >
                {{ child.label }}
              </NuxtLink>
            </template>
          </div>
        </template>
      </template>
    </nav>

    <!-- Settings: icon button + flyout popup -->
    <div ref="settingsContainerRef" class="relative border-t border-border px-3 py-2 shrink-0 flex items-center justify-end">
      <button
        type="button"
        class="p-1.5 rounded-md transition-colors"
        :class="settingsOpen ? 'bg-sidebar-hover text-text' : 'text-text-muted hover:text-text hover:bg-sidebar-hover'"
        aria-label="Settings"
        @click="settingsOpen = !settingsOpen"
      >
        <!-- Gear icon -->
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      <!-- Settings popup -->
      <div
        v-if="settingsOpen"
        class="absolute bottom-full right-0 mb-1.5 w-48 rounded-lg border border-border bg-surface py-1 shadow-lg z-[60]"
      >
        <!-- ─ Mode row ──────────────────────────────────────────────────── -->
        <div
          class="relative"
          @mouseenter="openSubmenu('mode')"
          @mouseleave="scheduleCloseSubmenu()"
        >
          <div class="flex cursor-default select-none items-center gap-2.5 rounded-md mx-1 px-3 py-2.5 text-sm text-text hover:bg-sidebar-hover">
            <!-- Sun icon -->
            <svg class="h-4 w-4 shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span class="flex-1">Mode</span>
            <svg class="h-3.5 w-3.5 shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>

          <!-- Mode sub-panel -->
          <div
            v-if="activeSubmenu === 'mode'"
            class="absolute top-0 left-full w-36 rounded-lg border border-border bg-surface py-1 shadow-lg z-[70]"
            @mouseenter="openSubmenu('mode')"
            @mouseleave="scheduleCloseSubmenu()"
          >
            <div
              v-for="m in modes"
              :key="m.id"
              class="flex cursor-pointer items-center gap-2 rounded-md mx-1 px-3 py-2 text-sm text-text hover:bg-sidebar-hover"
              @click="setMode(m.id); settingsOpen = false; activeSubmenu = null"
            >
              <!-- Checkmark if active -->
              <svg
                v-if="mode === m.id"
                class="h-3.5 w-3.5 shrink-0 text-accent-600"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <span v-else class="inline-block h-3.5 w-3.5 shrink-0" />
              <!-- Sun / Moon icon per option -->
              <svg v-if="m.id === 'light'" class="h-3.5 w-3.5 shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <svg v-else class="h-3.5 w-3.5 shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              {{ m.label }}
            </div>
          </div>
        </div>

        <!-- ─ Color Palette row ─────────────────────────────────────────── -->
        <div
          class="relative"
          @mouseenter="openSubmenu('palette')"
          @mouseleave="scheduleCloseSubmenu()"
        >
          <div class="flex cursor-default select-none items-center gap-2.5 rounded-md mx-1 px-3 py-2.5 text-sm text-text hover:bg-sidebar-hover">
            <!-- Swatch icon -->
            <svg class="h-4 w-4 shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            <span class="flex-1">Color Palette</span>
            <svg class="h-3.5 w-3.5 shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>

          <!-- Palette sub-panel -->
          <div
            v-if="activeSubmenu === 'palette'"
            class="absolute top-0 left-full w-40 rounded-lg border border-border bg-surface py-1 shadow-lg z-[70]"
            @mouseenter="openSubmenu('palette')"
            @mouseleave="scheduleCloseSubmenu()"
          >
            <div
              v-for="t in themes"
              :key="t.id"
              class="flex cursor-pointer items-center gap-2 rounded-md mx-1 px-3 py-2 text-sm text-text hover:bg-sidebar-hover"
              @click="setTheme(t.id); settingsOpen = false; activeSubmenu = null"
            >
              <!-- Checkmark if active -->
              <svg
                v-if="theme === t.id"
                class="h-3.5 w-3.5 shrink-0 text-accent-600"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <span v-else class="inline-block h-3.5 w-3.5 shrink-0" />
              <!-- Color swatch dot -->
              <span
                class="inline-block h-3 w-3 shrink-0 rounded-full border border-border"
                :style="{ backgroundColor: t.color }"
              />
              {{ t.label }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>
