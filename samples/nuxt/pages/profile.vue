<script setup lang="ts">
import { computed } from 'vue';

definePageMeta({ middleware: ['auth'] });

const { flattenedProfile } = useUser();

const profile = computed<Record<string, unknown>>(() => (flattenedProfile.value as Record<string, unknown>) ?? {});

const fullName = computed(() => {
  const givenName = String(profile.value.givenName ?? '').trim();
  const familyName = String(profile.value.familyName ?? '').trim();
  const displayName = String(profile.value.displayName ?? '').trim();

  return `${givenName} ${familyName}`.trim() || displayName || String(profile.value.username ?? profile.value.userName ?? 'User');
});

const avatarInitials = computed(() => {
  const parts = fullName.value.split(' ').filter(Boolean);
  return (parts[0]?.charAt(0) ?? 'U').concat(parts[1]?.charAt(0) ?? '').toUpperCase();
});

function readField(...keys: string[]): string {
  for (const key of keys) {
    const value = profile.value[key];
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value);
    }
  }

  return '-';
}
</script>

<template>
  <section>
    <h1 class="text-3xl font-bold mb-6">Profile</h1>
    <div class="border border-gray-200 rounded-lg p-6 bg-white">
      <div class="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
        <div class="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xl text-gray-700">
          {{ avatarInitials }}
        </div>
        <div>
          <strong class="text-lg text-gray-900">{{ fullName }}</strong>
          <p class="text-sm text-gray-600 mt-1">Authenticated user details from useUser().flattenedProfile</p>
        </div>
      </div>

      <dl class="grid grid-cols-2 gap-4 md:grid-cols-2">
        <div>
          <dt class="text-xs uppercase text-gray-500 mb-1 font-semibold">Full name</dt>
          <dd class="text-gray-900 font-medium">{{ fullName }}</dd>
        </div>
        <div>
          <dt class="text-xs uppercase text-gray-500 mb-1 font-semibold">Email</dt>
          <dd class="text-gray-900 font-medium">{{ readField('emails', 'email') }}</dd>
        </div>
        <div>
          <dt class="text-xs uppercase text-gray-500 mb-1 font-semibold">Username</dt>
          <dd class="text-gray-900 font-medium">{{ readField('username', 'userName', 'preferredUsername') }}</dd>
        </div>
        <div>
          <dt class="text-xs uppercase text-gray-500 mb-1 font-semibold">Phone</dt>
          <dd class="text-gray-900 font-medium">{{ readField('phoneNumbers', 'phoneNumber') }}</dd>
        </div>
      </dl>
    </div>
  </section>
</template>
