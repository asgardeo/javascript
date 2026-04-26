<script setup lang="ts">
import { computed } from 'vue';
import type { Component } from 'vue';
import {
  buildPropsDefaults,
  type PropSpec,
  type ComponentPropType,
} from '~/utils/components-manifest';
import BooleanControl from '~/components/components/customizer/controls/BooleanControl.vue';
import ChipMultiSelectControl from '~/components/components/customizer/controls/ChipMultiSelectControl.vue';
import JsonControl from '~/components/components/customizer/controls/JsonControl.vue';
import SelectControl from '~/components/components/customizer/controls/SelectControl.vue';
import StringControl from '~/components/components/customizer/controls/StringControl.vue';

const componentProps = defineProps<{
  props: PropSpec[];
  modelValue: Record<string, unknown>;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: Record<string, unknown>): void;
}>();

const controlByType: Record<ComponentPropType, Component> = {
  string: StringControl,
  number: StringControl,
  boolean: BooleanControl,
  select: SelectControl,
  'string-array': ChipMultiSelectControl,
  json: JsonControl,
};

const hasProps = computed(() => componentProps.props.length > 0);

const resolveControl = (type: ComponentPropType): Component => controlByType[type] ?? StringControl;

const updateValue = (name: string, value: unknown): void => {
  emit('update:modelValue', {
    ...componentProps.modelValue,
    [name]: value,
  });
};

const resetToDefaults = (): void => {
  emit('update:modelValue', buildPropsDefaults(componentProps.props));
};
</script>

<template>
  <section class="rounded-lg border border-border bg-surface p-4 shadow-sm">
    <div class="mb-3 flex items-center justify-between">
      <h4 class="text-xs font-semibold uppercase tracking-wide text-text-muted">Props</h4>
      <button
        type="button"
        class="text-xs font-medium text-accent-600 hover:text-accent-700"
        @click="resetToDefaults"
      >
        Reset
      </button>
    </div>

    <p v-if="!hasProps" class="text-sm text-text-muted">This component does not expose configurable props.</p>

    <div v-else class="space-y-4">
      <div
        v-for="propSpec in componentProps.props"
        :key="propSpec.name"
        class="space-y-1"
      >
        <label class="block text-xs font-semibold text-text">
          <span class="font-mono">{{ propSpec.name }}</span>
        </label>
        <p class="text-xs text-text-muted">{{ propSpec.description }}</p>

        <component
          :is="resolveControl(propSpec.type)"
          :spec="propSpec"
          :model-value="componentProps.modelValue[propSpec.name]"
          @update:model-value="(value: unknown) => updateValue(propSpec.name, value)"
        />
      </div>
    </div>
  </section>
</template>
