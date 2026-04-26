<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { formatHHMMSS, humanizeOffset } from '~/utils/timeFormat';

const props = defineProps<{
  expiresAt: number;
  issuedAt?: number;
}>();

const CIRCUMFERENCE = 2 * Math.PI * 28;

const tick = ref(0);
const displayMode = ref<'circle' | 'digital'>('circle');
let timer: ReturnType<typeof setInterval> | null = null;

const currentUnix = computed(() => {
  void tick.value;
  return Math.floor(Date.now() / 1000);
});

const secondsRemaining = computed(() => props.expiresAt - currentUnix.value);

const totalTtl = computed(() => {
  const baseline = props.issuedAt ?? (props.expiresAt - 3600);
  return Math.max(props.expiresAt - baseline, 1);
});

const fraction = computed(() => {
  const remaining = Math.max(secondsRemaining.value, 0);
  return Math.min(Math.max(remaining / totalTtl.value, 0), 1);
});

const isExpired = computed(() => secondsRemaining.value <= 0);

const colorClass = computed(() => {
  if (isExpired.value || fraction.value < 0.1) {
    return 'text-danger';
  }

  if (fraction.value < 0.3) {
    return 'text-warning';
  }

  return 'text-success';
});

const centerLabel = computed(() => {
  if (isExpired.value) {
    return 'EXPIRED';
  }

  return humanizeOffset(secondsRemaining.value);
});

const dashOffset = computed(() => CIRCUMFERENCE * (1 - fraction.value));

function stopTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function startTimer() {
  stopTimer();

  if (props.expiresAt <= Math.floor(Date.now() / 1000)) {
    return;
  }

  timer = setInterval(() => {
    tick.value += 1;

    if (props.expiresAt <= Math.floor(Date.now() / 1000)) {
      stopTimer();
    }
  }, 1000);
}

function toggleDisplayMode() {
  displayMode.value = displayMode.value === 'circle' ? 'digital' : 'circle';
}

watch(() => props.expiresAt, startTimer, { immediate: true });

onMounted(startTimer);
onUnmounted(stopTimer);
</script>

<template>
  <button
    type="button"
    class="self-start rounded-lg border border-border/70 bg-surface-muted/30 p-2 transition-colors hover:bg-surface-muted/50"
    :aria-label="displayMode === 'circle' ? 'Switch to full countdown timer' : 'Switch to circle countdown timer'"
    @click="toggleDisplayMode"
  >
    <div v-if="displayMode === 'circle'" class="relative flex h-16 w-16 items-center justify-center">
      <svg class="h-16 w-16 -rotate-90" viewBox="0 0 64 64" aria-hidden="true">
        <circle
          cx="32"
          cy="32"
          r="28"
          fill="none"
          class="stroke-current text-border/60"
          stroke-width="6"
        />
        <circle
          cx="32"
          cy="32"
          r="28"
          fill="none"
          :class="['stroke-current', colorClass]"
          stroke-width="6"
          stroke-linecap="round"
          :stroke-dasharray="CIRCUMFERENCE"
          :stroke-dashoffset="dashOffset"
          style="transition: stroke-dashoffset 1s linear"
        />
      </svg>
      <span
        class="absolute inset-0 flex items-center justify-center text-[10px] font-semibold uppercase tracking-wide"
        :class="colorClass"
      >
        {{ centerLabel }}
      </span>
    </div>

    <div v-else class="flex h-16 min-w-[112px] items-center justify-center px-2">
      <p class="font-mono text-base tabular-nums tracking-wider" :class="colorClass">
        {{ formatHHMMSS(secondsRemaining) }}
      </p>
    </div>
  </button>
</template>