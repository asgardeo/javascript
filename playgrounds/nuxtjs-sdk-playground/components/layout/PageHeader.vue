<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
}>();
</script>

<template>
  <div class="mb-6">
    <h1 class="text-2xl font-bold text-text">{{ title }}</h1>
    <p v-if="description" class="mt-1 text-text-muted">{{ description }}</p>
  </div>
</template>
