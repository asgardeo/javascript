<script setup lang="ts">
import { computed, ref } from 'vue';
import ComponentCard from '~/components/components/ComponentCard.vue';
import ComponentTabNav from '~/components/components/ComponentTabNav.vue';
import { componentCategories, type ComponentSpec } from '~/utils/components-manifest';

interface ButtonSlotPreset {
  className: string;
  label: string;
  showSpinner?: boolean;
}

const actionsCategory = computed(() => componentCategories.find((category) => category.key === 'actions'));
const actionComponents = computed<ComponentSpec[]>(() => actionsCategory.value?.components ?? []);

const activeComponentName = ref<string>(actionComponents.value[0]?.name ?? '');
const activeSpec = computed<ComponentSpec | undefined>(
  () => actionComponents.value.find((c) => c.name === activeComponentName.value) ?? actionComponents.value[0],
);

const isButtonSlotPreset = (value: unknown): value is ButtonSlotPreset => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return typeof (value as ButtonSlotPreset).className === 'string' && typeof (value as ButtonSlotPreset).label === 'string';
};

const resolveButtonSlotPreset = (spec: ComponentSpec, slotVariantKey: string, isLoading: boolean): ButtonSlotPreset => {
  const selected = spec.slotVariants?.find((variant) => variant.key === slotVariantKey) ?? spec.slotVariants?.[0];
  const fallback: ButtonSlotPreset = {
    className: 'px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md',
    label: isLoading ? 'Working...' : 'Action',
  };

  if (!selected) {
    return fallback;
  }

  const payload = selected.render({isLoading});
  return isButtonSlotPreset(payload) ? payload : fallback;
};

const resolveSignInOptions = (propsState: Record<string, unknown>): Record<string, unknown> | undefined => {
  const value = propsState['signInOptions'];

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }

  return value as Record<string, unknown>;
};
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="Action Components"
      description="Manifest-driven action button cards with one live preview per component and built-in customizers."
    />

    <div class="space-y-4">
      <ComponentTabNav :components="actionComponents" v-model="activeComponentName" />

      <ComponentCard
        v-if="activeSpec"
        :key="activeSpec.name"
        :spec="activeSpec"
      >
        <template #preview="{ propsState, slotVariantKey }">
          <div class="h-full min-h-[12rem] flex items-center justify-center">
            <AsgardeoSignInButton
              v-if="activeSpec.name === 'AsgardeoSignInButton'"
              :sign-in-options="resolveSignInOptions(propsState)"
              :class="resolveButtonSlotPreset(activeSpec, slotVariantKey, false).className"
              v-slot="{ isLoading }"
            >
              <svg
                v-if="resolveButtonSlotPreset(activeSpec, slotVariantKey, isLoading).showSpinner && isLoading"
                class="h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>{{ resolveButtonSlotPreset(activeSpec, slotVariantKey, isLoading).label }}</span>
            </AsgardeoSignInButton>

            <AsgardeoSignOutButton
              v-else-if="activeSpec.name === 'AsgardeoSignOutButton'"
              :class="resolveButtonSlotPreset(activeSpec, slotVariantKey, false).className"
              v-slot="{ isLoading }"
            >
              <svg
                v-if="resolveButtonSlotPreset(activeSpec, slotVariantKey, isLoading).showSpinner && isLoading"
                class="h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>{{ resolveButtonSlotPreset(activeSpec, slotVariantKey, isLoading).label }}</span>
            </AsgardeoSignOutButton>

            <AsgardeoSignUpButton
              v-else-if="activeSpec.name === 'AsgardeoSignUpButton'"
              :class="resolveButtonSlotPreset(activeSpec, slotVariantKey, false).className"
              v-slot="{ isLoading }"
            >
              <svg
                v-if="resolveButtonSlotPreset(activeSpec, slotVariantKey, isLoading).showSpinner && isLoading"
                class="h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>{{ resolveButtonSlotPreset(activeSpec, slotVariantKey, isLoading).label }}</span>
            </AsgardeoSignUpButton>

            <p v-else class="text-sm text-text-muted">Preview unavailable for this action component.</p>
          </div>
        </template>
      </ComponentCard>
    </div>
  </div>
</template>
