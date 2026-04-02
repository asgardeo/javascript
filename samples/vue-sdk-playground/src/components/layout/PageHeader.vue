<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-on-surface">{{ title }}</h1>
    <p v-if="description" class="text-on-surface-secondary mt-1">{{ description }}</p>
  </div>
</template>
