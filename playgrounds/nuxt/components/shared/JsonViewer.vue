<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  data: unknown;
  depth?: number;
}>();

const isCollapsed = ref((props.depth ?? 0) > 1);

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const isArray = (v: unknown): v is unknown[] => Array.isArray(v);

const isPrimitive = (v: unknown) => !isObject(v) && !isArray(v);

function stringify(v: unknown): string {
  if (typeof v === 'string') return `"${v}"`;
  if (v === null) return 'null';
  return String(v);
}

function typeColor(v: unknown): string {
  if (v === null) return 'text-text-muted';
  if (typeof v === 'string') return 'text-success';
  if (typeof v === 'number') return 'text-accent-500';
  if (typeof v === 'boolean') return 'text-warning';
  return 'text-text';
}
</script>

<template>
  <span>
    <!-- Primitive -->
    <span v-if="isPrimitive(data)" :class="typeColor(data)" class="font-mono text-sm">
      {{ stringify(data) }}
    </span>

    <!-- Object / Array -->
    <span v-else>
      <button
        type="button"
        class="font-mono text-sm text-text-muted hover:text-text transition-colors"
        @click="isCollapsed = !isCollapsed"
      >
        {{ isCollapsed ? (isArray(data) ? '[…]' : '{…}') : (isArray(data) ? '[' : '{') }}
      </button>
      <span v-if="!isCollapsed" class="block pl-4 border-l border-border">
        <template v-if="isArray(data)">
          <div v-for="(item, idx) in (data as unknown[])" :key="idx" class="py-0.5">
            <span class="text-text-muted text-xs">{{ idx }}:</span>
            <SharedJsonViewer :data="item" :depth="(depth ?? 0) + 1" />
          </div>
        </template>
        <template v-else-if="isObject(data)">
          <div v-for="[key, val] in Object.entries(data as Record<string, unknown>)" :key="key" class="py-0.5">
            <span class="text-accent-600 text-xs font-mono">{{ key }}: </span>
            <SharedJsonViewer :data="val" :depth="(depth ?? 0) + 1" />
          </div>
        </template>
        <span class="text-text-muted font-mono text-sm">{{ isArray(data) ? ']' : '}' }}</span>
      </span>
    </span>
  </span>
</template>
