<script setup lang="ts">
import { ref } from 'vue'

withDefaults(defineProps<{
  code: string
  language?: string
}>(), {
  language: 'vue',
})

const copied = ref(false)

async function copyCode(code: string) {
  await navigator.clipboard.writeText(code)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>

<template>
  <div class="relative">
    <div class="flex items-center justify-between bg-code-header-bg text-code-header-text text-xs px-4 py-2 rounded-t-lg">
      <span>{{ language }}</span>
      <button
        type="button"
        class="hover:text-code-text transition-colors"
        @click="copyCode(code)"
      >
        {{ copied ? 'Copied!' : 'Copy' }}
      </button>
    </div>
    <pre class="bg-code-bg text-code-text p-4 rounded-b-lg font-mono text-sm overflow-x-auto"><code>{{ code }}</code></pre>
  </div>
</template>
