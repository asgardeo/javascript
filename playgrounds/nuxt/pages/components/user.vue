<script setup lang="ts">
import { computed, ref } from 'vue';
import ComponentCard from '~/components/components/ComponentCard.vue';
import ComponentTabNav from '~/components/components/ComponentTabNav.vue';
import SlotInspection from '~/components/components/SlotInspection.vue';
import { componentCategories, type ComponentSpec } from '~/utils/components-manifest';

interface DataSlotPreset {
  mode: 'name-only' | 'name-email' | 'raw-json';
}

const { user } = useAsgardeo();

const userCategory = computed(() => componentCategories.find((category) => category.key === 'user'));
const userComponents = computed<ComponentSpec[]>(() => userCategory.value?.components ?? []);

const activeComponentName = ref<string>(userComponents.value[0]?.name ?? '');
const activeSpec = computed<ComponentSpec | undefined>(
  () => userComponents.value.find((c) => c.name === activeComponentName.value) ?? userComponents.value[0],
);

const isDataSlotPreset = (value: unknown): value is DataSlotPreset => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const mode = (value as DataSlotPreset).mode;
  return mode === 'name-only' || mode === 'name-email' || mode === 'raw-json';
};

const resolveDataSlotPreset = (spec: ComponentSpec, slotVariantKey: string): DataSlotPreset => {
  const selected = spec.slotVariants?.find((variant) => variant.key === slotVariantKey) ?? spec.slotVariants?.[0];
  if (!selected) {
    return {mode: 'name-only'};
  }

  const payload = selected.render({});
  return isDataSlotPreset(payload) ? payload : {mode: 'name-only'};
};

const getUserName = (value: unknown): string => {
  if (!value || typeof value !== 'object') {
    return 'Unknown user';
  }

  const data = value as Record<string, unknown>;
  return String(data['givenName'] ?? data['username'] ?? data['displayName'] ?? 'Unknown user');
};

const getUserEmail = (value: unknown): string | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const data = value as Record<string, unknown>;
  const email = data['email'];

  return typeof email === 'string' && email.length > 0 ? email : null;
};

const userProfileProps = (propsState: Record<string, unknown>) => ({
  cardLayout: Boolean(propsState['cardLayout']),
  className: typeof propsState['className'] === 'string' ? propsState['className'] : '',
  editable: Boolean(propsState['editable']),
  hideFields: Array.isArray(propsState['hideFields']) ? (propsState['hideFields'] as string[]) : [],
  showFields: Array.isArray(propsState['showFields']) ? (propsState['showFields'] as string[]) : [],
  title: typeof propsState['title'] === 'string' ? propsState['title'] : 'Profile',
});

const userDropdownProps = (propsState: Record<string, unknown>) => ({
  className: typeof propsState['className'] === 'string' ? propsState['className'] : '',
});
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="User Components"
      description="Self-contained cards for user data, profile editing, and dropdown behavior."
    />

    <div class="space-y-4">
      <ComponentTabNav :components="userComponents" v-model="activeComponentName" />

      <ComponentCard
        v-if="activeSpec"
        :key="activeSpec.name"
        :spec="activeSpec"
      >
        <template #preview="{ propsState, slotVariantKey }">
          <div v-if="activeSpec.name === 'AsgardeoUser'" class="space-y-3">
            <div class="rounded-md border border-border bg-surface p-3">
              <AsgardeoUser>
                <template #default="{ user: slotUser }">
                  <div v-if="resolveDataSlotPreset(activeSpec, slotVariantKey).mode === 'name-only'" class="text-sm text-text">
                    {{ getUserName(slotUser) }}
                  </div>

                  <div v-else-if="resolveDataSlotPreset(activeSpec, slotVariantKey).mode === 'name-email'" class="space-y-1">
                    <p class="text-sm font-medium text-text">{{ getUserName(slotUser) }}</p>
                    <p class="text-xs text-text-muted">{{ getUserEmail(slotUser) ?? 'No email claim' }}</p>
                  </div>

                  <SharedJsonViewer v-else :data="slotUser" />
                </template>

                <template #fallback>
                  <p class="text-sm text-text-muted">Sign in to populate the user scoped slot.</p>
                </template>
              </AsgardeoUser>
            </div>

            <SlotInspection
              :component-name="activeSpec.name"
              :active-slot="user ? 'default' : 'fallback'"
              :scoped-payload="user ? { user } : undefined"
            />
          </div>

          <div v-else-if="activeSpec.name === 'AsgardeoUserProfile'" class="space-y-3">
            <AsgardeoUserProfile v-bind="userProfileProps(propsState)" />

            <p
              v-if="userProfileProps(propsState).editable"
              class="rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning"
            >
              Editable mode updates profile data on the configured tenant. Use playground tenants only.
            </p>
          </div>

          <div v-else-if="activeSpec.name === 'AsgardeoUserDropdown'" class="h-full min-h-[12rem] flex items-center justify-center">
            <AsgardeoUserDropdown v-bind="userDropdownProps(propsState)" />
          </div>

          <p v-else class="text-sm text-text-muted">Preview unavailable for this user component.</p>
        </template>
      </ComponentCard>
    </div>
  </div>
</template>
