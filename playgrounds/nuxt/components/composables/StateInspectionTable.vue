<script setup lang="ts">
import {ref} from 'vue';

export interface StateInspectionRow {
  name: string;
  value: unknown;
  type: string;
  description?: string;
}

defineProps<{
  rows: StateInspectionRow[];
}>();

const expandedRows = ref<Record<string, boolean>>({});

const isInspectable = (value: unknown): boolean =>
  value !== null && typeof value === 'object';

const isExpanded = (name: string): boolean => Boolean(expandedRows.value[name]);

const toggleExpanded = (name: string): void => {
  expandedRows.value[name] = !expandedRows.value[name];
};
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-border text-left">
          <th class="pb-2 pr-6 font-medium text-text-muted">Property</th>
          <th class="pb-2 pr-6 font-medium text-text-muted">Value</th>
          <th class="pb-2 pr-6 font-medium text-text-muted">Type</th>
          <th class="pb-2 font-medium text-text-muted">Description</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-border">
        <tr v-for="row in rows" :key="row.name" class="align-top">
          <td class="py-3 pr-6 font-mono text-xs text-text-muted">{{ row.name }}</td>
          <td class="py-3 pr-6">
            <span v-if="row.value === null || row.value === undefined" class="text-text-muted">-</span>

            <SharedStatusBadge
              v-else-if="typeof row.value === 'boolean'"
              :status="row.value ? 'success' : 'neutral'"
              :label="String(row.value)"
            />

            <div v-else-if="isInspectable(row.value)" class="space-y-2">
              <button
                type="button"
                class="px-2 py-1 rounded border border-border bg-surface text-xs text-text hover:bg-surface-muted transition-colors"
                @click="toggleExpanded(row.name)"
              >
                {{ isExpanded(row.name) ? 'Hide' : 'Inspect' }}
              </button>
              <div v-if="isExpanded(row.name)" class="rounded border border-border bg-surface-muted p-2">
                <SharedJsonViewer :data="row.value" />
              </div>
            </div>

            <code v-else class="font-mono text-xs text-text">{{ String(row.value) }}</code>
          </td>
          <td class="py-3 pr-6 font-mono text-xs text-text">{{ row.type }}</td>
          <td class="py-3 text-xs text-text-muted">{{ row.description || '-' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
