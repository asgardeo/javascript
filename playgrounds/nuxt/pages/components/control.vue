<script setup lang="ts">
import { computed, ref } from 'vue';
import ComponentCard from '~/components/components/ComponentCard.vue';
import ComponentTabNav from '~/components/components/ComponentTabNav.vue';
import SlotInspection from '~/components/components/SlotInspection.vue';
import { componentCategories, type ComponentSpec } from '~/utils/components-manifest';

interface ControlSlotPreset {
  defaultText: string;
  fallbackText: string;
  defaultBadge?: boolean;
  showSpinner?: boolean;
}

const { isSignedIn, isLoading, isInitialized } = useAsgardeo();

const controlCategory = computed(() => componentCategories.find((category) => category.key === 'control'));
const controlComponents = computed<ComponentSpec[]>(() => controlCategory.value?.components ?? []);

const activeComponentName = ref<string>(controlComponents.value[0]?.name ?? '');
const activeSpec = computed<ComponentSpec | undefined>(
  () => controlComponents.value.find((c) => c.name === activeComponentName.value) ?? controlComponents.value[0],
);

const isControlSlotPreset = (value: unknown): value is ControlSlotPreset => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return typeof (value as ControlSlotPreset).defaultText === 'string' && typeof (value as ControlSlotPreset).fallbackText === 'string';
};

const resolveControlSlotPreset = (spec: ComponentSpec, slotVariantKey: string): ControlSlotPreset => {
  const selected = spec.slotVariants?.find((variant) => variant.key === slotVariantKey) ?? spec.slotVariants?.[0];
  const fallback: ControlSlotPreset = {
    defaultText: 'Default slot content.',
    fallbackText: 'Fallback slot content.',
  };

  if (!selected) {
    return fallback;
  }

  const payload = selected.render({});
  return isControlSlotPreset(payload) ? payload : fallback;
};

const activeSlotForControl = (componentName: string): 'default' | 'fallback' | 'none' => {
  if (componentName === 'AsgardeoSignedIn') {
    return isSignedIn.value ? 'default' : 'fallback';
  }

  if (componentName === 'AsgardeoSignedOut') {
    return isSignedIn.value ? 'fallback' : 'default';
  }

  if (componentName === 'AsgardeoLoading') {
    return isLoading.value ? 'default' : 'fallback';
  }

  return 'none';
};
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="Control Components"
      description="Manifest-driven control wrappers with live slot inspection."
    />

    <div class="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface-muted px-4 py-3 text-sm">
      <span class="font-medium text-text">Current state:</span>
      <SharedStatusBadge
        :status="isLoading ? 'warning' : 'success'"
        :label="isLoading ? 'Loading SDK state' : 'SDK ready'"
      />
      <SharedStatusBadge
        :status="isInitialized ? 'success' : 'neutral'"
        :label="isInitialized ? 'Initialized' : 'Not initialized'"
      />
      <SharedStatusBadge
        :status="isSignedIn ? 'success' : 'neutral'"
        :label="isSignedIn ? 'Signed In' : 'Signed Out'"
      />
      <span class="ml-auto text-xs text-text-muted">Slot inspection updates in real time as these values change.</span>
    </div>

    <div class="space-y-4">
      <ComponentTabNav :components="controlComponents" v-model="activeComponentName" />

      <ComponentCard
        v-if="activeSpec"
        :key="activeSpec.name"
        :spec="activeSpec"
      >
        <template #preview="{ slotVariantKey }">
          <div class="space-y-3">
            <div class="rounded-md border border-border bg-surface p-3">
              <AsgardeoSignedIn v-if="activeSpec.name === 'AsgardeoSignedIn'">
                <template #default>
                  <div class="inline-flex items-center gap-2 text-sm text-success">
                    <SharedStatusBadge
                      v-if="resolveControlSlotPreset(activeSpec, slotVariantKey).defaultBadge"
                      status="success"
                      label="Authenticated"
                    />
                    <span>{{ resolveControlSlotPreset(activeSpec, slotVariantKey).defaultText }}</span>
                  </div>
                </template>
                <template #fallback>
                  <p class="text-sm text-text-muted">{{ resolveControlSlotPreset(activeSpec, slotVariantKey).fallbackText }}</p>
                </template>
              </AsgardeoSignedIn>

              <AsgardeoSignedOut v-else-if="activeSpec.name === 'AsgardeoSignedOut'">
                <template #default>
                  <p class="text-sm text-text-muted">{{ resolveControlSlotPreset(activeSpec, slotVariantKey).defaultText }}</p>
                </template>
                <template #fallback>
                  <p class="text-sm text-success">{{ resolveControlSlotPreset(activeSpec, slotVariantKey).fallbackText }}</p>
                </template>
              </AsgardeoSignedOut>

              <AsgardeoLoading v-else-if="activeSpec.name === 'AsgardeoLoading'">
                <template #default>
                  <div class="inline-flex items-center gap-2 text-sm text-warning">
                    <svg
                      v-if="resolveControlSlotPreset(activeSpec, slotVariantKey).showSpinner"
                      class="h-4 w-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>{{ resolveControlSlotPreset(activeSpec, slotVariantKey).defaultText }}</span>
                  </div>
                </template>
                <template #fallback>
                  <p class="text-sm text-success">{{ resolveControlSlotPreset(activeSpec, slotVariantKey).fallbackText }}</p>
                </template>
              </AsgardeoLoading>
            </div>

            <SlotInspection
              :component-name="activeSpec.name"
              :active-slot="activeSlotForControl(activeSpec.name)"
            />
          </div>
        </template>
      </ComponentCard>
    </div>
  </div>
</template>
