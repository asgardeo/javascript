<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  text: string;
}>();

const copied = ref(false);

async function copy() {
  await navigator.clipboard.writeText(props.text);
  copied.value = true;
  setTimeout(() => { copied.value = false; }, 2000);
}
</script>

<template>
  <button
    type="button"
    class="shrink-0 text-xs text-accent-600 hover:text-accent-700 transition-colors"
    :aria-label="copied ? 'Copied' : 'Copy'"
    @click="copy"
  >
    {{ copied ? 'Copied!' : 'Copy' }}
  </button>
</template>
