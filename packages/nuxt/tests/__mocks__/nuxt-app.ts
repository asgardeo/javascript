/**
 * Minimal stub for Nuxt's `#app` virtual module.
 * Used so that unit tests can import files that have `from '#app'` without
 * starting a full Nuxt development server.
 *
 * Individual test files can override specific exports with `vi.mock('#app', ...)`.
 */
import {ref} from 'vue';

export const navigateTo = async (_url: string, _opts?: {external?: boolean}): Promise<void> => {};

export const useState = <T>(key: string, init?: () => T): {value: T} => {
  const defaultValue = init ? init() : (undefined as unknown as T);
  return ref<T>(defaultValue) as {value: T};
};

export const defineNuxtRouteMiddleware = (fn: Function): Function => fn;

export const useRuntimeConfig = (): Record<string, unknown> => ({});

export const useNuxtApp = (): Record<string, unknown> => ({});
