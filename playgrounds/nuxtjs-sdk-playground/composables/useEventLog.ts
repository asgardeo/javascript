/**
 * useEventLog — append-only event log for demo pages.
 * Shows auth state transitions, method call results, and errors.
 */
import { ref } from 'vue';

export interface LogEntry {
  id: number;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

let _counter = 0;

export function useEventLog() {
  const entries = ref<LogEntry[]>([]);

  function log(message: string, type: LogEntry['type'] = 'info') {
    entries.value.unshift({
      id: ++_counter,
      timestamp: new Date().toLocaleTimeString(),
      message,
      type,
    });
    // Keep last 50 entries
    if (entries.value.length > 50) {
      entries.value = entries.value.slice(0, 50);
    }
  }

  function clear() {
    entries.value = [];
  }

  return { entries, log, clear };
}
