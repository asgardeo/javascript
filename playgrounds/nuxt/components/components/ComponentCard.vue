<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { ComponentSpec } from '~/utils/components-manifest';
import { buildPropsDefaults } from '~/utils/components-manifest';
import PreviewCanvas from '~/components/components/PreviewCanvas.vue';
import PreviewSignInGate from '~/components/components/PreviewSignInGate.vue';
import PropsCustomizer from '~/components/components/customizer/PropsCustomizer.vue';
import SlotVariantPicker from '~/components/components/customizer/SlotVariantPicker.vue';

const props = defineProps<{
  spec: ComponentSpec;
  hideCustomizer?: boolean;
}>();

const { isSignedIn } = useAsgardeo();

const propsState = ref<Record<string, unknown>>(buildPropsDefaults(props.spec.props));
const slotVariantKey = ref<string>(props.spec.slotVariants?.[0]?.key ?? '');

watch(
  () => props.spec,
  (nextSpec) => {
    propsState.value = buildPropsDefaults(nextSpec.props);
    slotVariantKey.value = nextSpec.slotVariants?.[0]?.key ?? '';
  },
);

const kindLabel = computed(() => {
  if (props.spec.kind === 'ui') {
    return 'UI';
  }

  if (props.spec.kind === 'control') {
    return 'Control';
  }

  if (props.spec.kind === 'data') {
    return 'Data';
  }

  return 'Behavioural';
});

const kindBadgeClass = computed(() => {
  if (props.spec.kind === 'ui') {
    return 'bg-accent-50 text-accent-700 border-accent-100';
  }

  if (props.spec.kind === 'control') {
    return 'bg-warning/10 text-warning border-warning/30';
  }

  if (props.spec.kind === 'data') {
    return 'bg-success/10 text-success border-success/30';
  }

  return 'bg-surface-muted text-text-muted border-border';
});

const bodyLayoutClass = computed(() =>
  props.hideCustomizer
    ? 'grid-cols-1'
    : props.spec.layout === 'stacked'
    ? 'grid-cols-1'
    : 'grid-cols-1 md:grid-cols-[minmax(0,1fr)_22rem]',
);

const shouldShowSignInGate = computed(() => Boolean(props.spec.requiresSignIn) && !isSignedIn.value);
</script>

<template>
  <article class="rounded-lg border border-border bg-surface shadow-sm min-h-[calc(100vh-300px)] flex flex-col">
    <header class="border-b border-border px-4 py-3 flex-shrink-0">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h3 class="font-mono text-sm font-semibold text-text">&lt;{{ spec.name }}&nbsp;/&gt;</h3>
          <p class="mt-1 text-xs text-text-muted">{{ spec.description }}</p>
        </div>

        <span
          class="inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-wide"
          :class="kindBadgeClass"
        >
          {{ kindLabel }}
        </span>
      </div>
    </header>

    <div class="grid gap-0 divide-x divide-border flex-1 overflow-hidden" :class="bodyLayoutClass">
      <PreviewCanvas class="p-4 overflow-auto">
        <PreviewSignInGate v-if="shouldShowSignInGate" />

        <slot
          v-else
          name="preview"
          :props-state="propsState"
          :slot-variant-key="slotVariantKey"
          :spec="spec"
        >
          <div class="h-full min-h-[12rem] flex items-center justify-center text-sm text-text-muted">
            Preview not configured for this component yet.
          </div>
        </slot>
      </PreviewCanvas>

      <div v-if="!hideCustomizer" class="p-4 overflow-auto space-y-3">
        <PropsCustomizer :props="spec.props" v-model="propsState" />

        <SlotVariantPicker
          v-if="(spec.slotVariants?.length ?? 0) > 0"
          v-model="slotVariantKey"
          :variants="spec.slotVariants"
        />
      </div>
    </div>
  </article>
</template>
