<script setup lang="ts">
import { computed, ref } from 'vue';

definePageMeta({ middleware: ['auth'] });

const {
  myOrganizations,
  currentOrganization,
  switchOrganization,
  isLoading,
  error,
} = useOrganization();

const switchingOrgId = ref<string | null>(null);
const switchingError = ref<string | null>(null);

const organizations = computed(() => myOrganizations.value ?? []);
const activeOrgId = computed(() => currentOrganization.value?.id);

function organizationSubtitle(organization: { id: string; name?: string }): string {
  const candidate = organization as Record<string, unknown>;
  return String(candidate.ref ?? candidate.code ?? organization.id);
}

async function handleSwitch(organizationId: string): Promise<void> {
  const next = organizations.value.find((org) => org.id === organizationId);
  if (!next) {
    return;
  }

  switchingOrgId.value = organizationId;
  switchingError.value = null;

  try {
    await switchOrganization(next);
  } catch (switchError) {
    switchingError.value = switchError instanceof Error ? switchError.message : String(switchError);
  } finally {
    switchingOrgId.value = null;
  }
}
</script>

<template>
  <section>
    <h1 class="text-3xl font-bold mb-6">Organizations</h1>

    <div v-if="isLoading" class="border border-gray-200 rounded-lg p-4 bg-white">
      Loading organizations...
    </div>

    <div v-else class="border border-gray-200 rounded-lg p-6 bg-white">
      <p v-if="error" class="text-red-700 mb-4">{{ String(error) }}</p>
      <p v-if="switchingError" class="text-red-700 mb-4">{{ switchingError }}</p>

      <p v-if="organizations.length === 0" class="text-gray-600">
        You do not belong to any organizations yet.
      </p>

      <ul v-else class="space-y-3">
        <li v-for="organization in organizations" :key="organization.id" class="flex items-center justify-between gap-4 border border-gray-200 rounded p-4">
          <div>
            <strong class="text-gray-900 block">{{ organization.name || organization.id }}</strong>
            <p class="text-sm text-gray-600 mt-1">{{ organizationSubtitle(organization) }}</p>
          </div>

          <div class="flex items-center gap-3">
            <span v-if="activeOrgId === organization.id" class="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full">
              Active
            </span>
            <button
              class="px-3 py-2 text-sm rounded border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="activeOrgId === organization.id || switchingOrgId === organization.id"
              @click="handleSwitch(organization.id)"
            >
              {{ switchingOrgId === organization.id ? 'Switching...' : 'Switch' }}
            </button>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>
