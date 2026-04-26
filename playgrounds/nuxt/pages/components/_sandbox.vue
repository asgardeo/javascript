<script setup lang="ts">
import { computed } from 'vue';
import ComponentCard from '~/components/components/ComponentCard.vue';
import {
  componentCategories,
  type ComponentSpec,
} from '~/utils/components-manifest';

interface ButtonSlotPreset {
  className: string;
  label: string;
  showSpinner?: boolean;
}

const actionsCategory = componentCategories.find((category) => category.key === 'actions');

const signInButtonSpec = computed<ComponentSpec | null>(() => {
  if (!actionsCategory) {
    return null;
  }

  return actionsCategory.components.find((item) => item.name === 'AsgardeoSignInButton') ?? null;
});

const isButtonSlotPreset = (value: unknown): value is ButtonSlotPreset => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return typeof (value as ButtonSlotPreset).className === 'string' && typeof (value as ButtonSlotPreset).label === 'string';
};

const resolveSlotPreset = (
  spec: ComponentSpec,
  slotVariantKey: string,
  scope: Record<string, unknown>,
): ButtonSlotPreset => {
  const variant = spec.slotVariants?.find((item) => item.key === slotVariantKey) ?? spec.slotVariants?.[0];

  if (!variant) {
    return {
      className: 'px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md',
      label: 'Log in',
    };
  }

  const payload = variant.render(scope);

  if (!isButtonSlotPreset(payload)) {
    return {
      className: 'px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md',
      label: 'Log in',
    };
  }

  return payload;
};

const extractSignInOptions = (propsState: Record<string, unknown>): Record<string, unknown> | undefined => {
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
      title="Components Sandbox"
      description="Step-5 validation page for the new component-card infrastructure."
    />

    <ComponentCard v-if="signInButtonSpec" :spec="signInButtonSpec">
      <template #preview="{ propsState, slotVariantKey, spec }">
        <div class="h-full min-h-[12rem] flex items-center justify-center">
          <AsgardeoSignInButton
            :sign-in-options="extractSignInOptions(propsState)"
            :class="resolveSlotPreset(spec, slotVariantKey, { isLoading: false }).className"
            v-slot="{ isLoading }"
          >
            <template v-if="resolveSlotPreset(spec, slotVariantKey, { isLoading }).showSpinner && isLoading">
              <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </template>
            <span>{{ resolveSlotPreset(spec, slotVariantKey, { isLoading }).label }}</span>
          </AsgardeoSignInButton>
        </div>
      </template>
    </ComponentCard>

    <LayoutSectionCard v-else title="Missing manifest seed">
      <p class="text-sm text-text-muted">Actions category seed data was not found in the component manifest.</p>
    </LayoutSectionCard>
  </div>
</template>
