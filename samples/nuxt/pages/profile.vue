<script setup lang="ts">
definePageMeta({ middleware: ['auth'] });
</script>

<template>
  <section>
    <h1 class="text-3xl font-bold mb-6">Profile</h1>
    <AsgardeoUser>
      <template #default="{ user }">
        <div class="border border-gray-200 rounded-lg p-6 bg-white">
          <div class="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
            <div class="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xl text-gray-700">
              {{ String(user.givenName ?? '').charAt(0) }}{{ String(user.familyName ?? '').charAt(0) }}
            </div>
            <div>
              <strong class="text-lg text-gray-900">{{ user.givenName }} {{ user.familyName }}</strong>
              <p class="text-sm text-gray-600 mt-1">{{ user.username ?? user.userName }}</p>
            </div>
          </div>

          <dl class="grid grid-cols-2 gap-4">
            <div>
              <dt class="text-xs uppercase text-gray-500 mb-1 font-semibold">Given name</dt>
              <dd class="text-gray-900 font-medium">{{ user.givenName ?? '-' }}</dd>
            </div>
            <div>
              <dt class="text-xs uppercase text-gray-500 mb-1 font-semibold">Family name</dt>
              <dd class="text-gray-900 font-medium">{{ user.familyName ?? '-' }}</dd>
            </div>
            <div>
              <dt class="text-xs uppercase text-gray-500 mb-1 font-semibold">Email</dt>
              <dd class="text-gray-900 font-medium">{{ user.email ?? user.emails ?? '-' }}</dd>
            </div>
            <div>
              <dt class="text-xs uppercase text-gray-500 mb-1 font-semibold">Username</dt>
              <dd class="text-gray-900 font-medium">{{ user.username ?? user.userName ?? '-' }}</dd>
            </div>
          </dl>
        </div>
      </template>
    </AsgardeoUser>
  </section>
</template>
