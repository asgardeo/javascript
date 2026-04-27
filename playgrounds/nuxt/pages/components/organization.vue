<script setup lang="ts">
import { computed, ref } from 'vue';
import ComponentCard from '~/components/components/ComponentCard.vue';
import ComponentTabNav from '~/components/components/ComponentTabNav.vue';
import SlotInspection from '~/components/components/SlotInspection.vue';
import { componentCategories, type ComponentSpec } from '~/utils/components-manifest';

interface OrganizationSlotPreset {
  mode: 'name-only' | 'name-id' | 'raw-json' | 'nested-signed-in';
}

const { currentOrganization, myOrganizations } = useOrganization();

const organizationCategory = computed(() => componentCategories.find((category) => category.key === 'organization'));
const organizationComponents = computed<ComponentSpec[]>(() => organizationCategory.value?.components ?? []);

const activeComponentName = ref<string>(organizationComponents.value[0]?.name ?? '');
const activeSpec = computed<ComponentSpec | undefined>(
  () => organizationComponents.value.find((c) => c.name === activeComponentName.value) ?? organizationComponents.value[0],
);

const isOrganizationSlotPreset = (value: unknown): value is OrganizationSlotPreset => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const mode = (value as OrganizationSlotPreset).mode;
  return mode === 'name-only' || mode === 'name-id' || mode === 'raw-json' || mode === 'nested-signed-in';
};

const resolveOrganizationSlotPreset = (spec: ComponentSpec, slotVariantKey: string): OrganizationSlotPreset => {
  const selected = spec.slotVariants?.find((variant) => variant.key === slotVariantKey) ?? spec.slotVariants?.[0];

  if (!selected) {
    return {mode: 'name-only'};
  }

  const payload = selected.render({});
  return isOrganizationSlotPreset(payload) ? payload : {mode: 'name-only'};
};

const getOrganizationName = (value: unknown): string => {
  if (!value || typeof value !== 'object') {
    return 'Unknown organization';
  }

  const data = value as Record<string, unknown>;
  return String(data['name'] ?? 'Unknown organization');
};

const getOrganizationId = (value: unknown): string | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const data = value as Record<string, unknown>;
  const id = data['id'];

  return typeof id === 'string' && id.length > 0 ? id : null;
};

const activeSlotForOrganization = (): 'default' | 'fallback' => (currentOrganization.value ? 'default' : 'fallback');

const organizationListProps = (propsState: Record<string, unknown>) => ({
  className: typeof propsState['className'] === 'string' ? propsState['className'] : '',
});

const organizationProfileProps = (propsState: Record<string, unknown>) => ({
  className: typeof propsState['className'] === 'string' ? propsState['className'] : '',
  editable: Boolean(propsState['editable']),
  title: typeof propsState['title'] === 'string' ? propsState['title'] : 'Organization Profile',
});

const organizationSwitcherProps = (propsState: Record<string, unknown>) => ({
  className: typeof propsState['className'] === 'string' ? propsState['className'] : '',
});

const createOrganizationProps = (propsState: Record<string, unknown>) => ({
  className: typeof propsState['className'] === 'string' ? propsState['className'] : '',
  title: typeof propsState['title'] === 'string' ? propsState['title'] : 'Create Organization',
  description:
    typeof propsState['description'] === 'string' ? propsState['description'] : 'Create a new sub-organization.',
});
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="Organization Components"
      description="Manifest-driven cards for organization data and organization management surfaces."
    />

    <div class="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface-muted px-4 py-3 text-sm">
      <span class="font-medium text-text">Current organization:</span>
      <SharedStatusBadge
        :status="currentOrganization ? 'success' : 'neutral'"
        :label="currentOrganization ? getOrganizationName(currentOrganization) : 'None selected'"
      />
      <span class="ml-auto text-xs text-text-muted">{{ myOrganizations?.length ?? 0 }} organization(s) available.</span>
    </div>

    <div class="space-y-4">
      <ComponentTabNav :components="organizationComponents" v-model="activeComponentName" />

      <ComponentCard
        v-if="activeSpec"
        :key="activeSpec.name"
        :spec="activeSpec"
      >
        <template #preview="{ propsState, slotVariantKey }">
          <div v-if="activeSpec.name === 'AsgardeoOrganization'" class="space-y-3">
            <div class="rounded-md border border-border bg-surface p-3">
              <AsgardeoOrganization>
                <template #default="{ organization }">
                  <p v-if="resolveOrganizationSlotPreset(activeSpec, slotVariantKey).mode === 'name-only'" class="text-sm text-text">
                    {{ getOrganizationName(organization) }}
                  </p>

                  <div v-else-if="resolveOrganizationSlotPreset(activeSpec, slotVariantKey).mode === 'name-id'" class="space-y-1">
                    <p class="text-sm font-medium text-text">{{ getOrganizationName(organization) }}</p>
                    <p class="text-xs font-mono text-text-muted">{{ getOrganizationId(organization) ?? 'No org ID' }}</p>
                  </div>

                  <SharedJsonViewer v-else-if="resolveOrganizationSlotPreset(activeSpec, slotVariantKey).mode === 'raw-json'" :data="organization" />

                  <AsgardeoSignedIn v-else>
                    <template #default>
                      <p class="text-sm text-text">Signed in and organization context is available.</p>
                    </template>
                    <template #fallback>
                      <p class="text-sm text-text-muted">Sign in to use this nested rendering preset.</p>
                    </template>
                  </AsgardeoSignedIn>
                </template>

                <template #fallback>
                  <p class="text-sm text-text-muted">No organization selected for the current session.</p>
                </template>
              </AsgardeoOrganization>
            </div>

            <SlotInspection
              :component-name="activeSpec.name"
              :active-slot="activeSlotForOrganization()"
              :scoped-payload="currentOrganization ? { organization: currentOrganization } : undefined"
            />
          </div>

          <div v-else-if="activeSpec.name === 'AsgardeoOrganizationList'" class="space-y-3">
            <AsgardeoOrganizationList v-bind="organizationListProps(propsState)" />
          </div>

          <div v-else-if="activeSpec.name === 'AsgardeoOrganizationProfile'" class="space-y-3">
            <AsgardeoOrganizationProfile v-bind="organizationProfileProps(propsState)" />
            <p
              v-if="organizationProfileProps(propsState).editable"
              class="rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning"
            >
              Editable mode can trigger organization updates. Use a non-production tenant while testing.
            </p>
          </div>

          <div v-else-if="activeSpec.name === 'AsgardeoOrganizationSwitcher'" class="h-full min-h-[12rem] flex items-center justify-center">
            <AsgardeoOrganizationSwitcher v-bind="organizationSwitcherProps(propsState)" />
          </div>

          <div v-else-if="activeSpec.name === 'AsgardeoCreateOrganization'" class="w-full max-w-md mx-auto">
            <AsgardeoCreateOrganization v-bind="createOrganizationProps(propsState)" />
          </div>

          <p v-else class="text-sm text-text-muted">Preview unavailable for this organization component.</p>
        </template>
      </ComponentCard>
    </div>
  </div>
</template>
