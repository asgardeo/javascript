<template>
  <div>
    <section style="background: white; border-radius: 8px; padding: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <h2 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem;">Protected Page</h2>

      <div v-if="isLoading" style="padding: 1rem; background: #f0f0f0; border-radius: 4px;">
        Checking authentication...
      </div>

      <div v-else-if="!isSignedIn" style="padding: 1rem; background: #ffebee; border-radius: 4px;">
        <h3 style="font-weight: 600; color: #c62828; margin-bottom: 0.5rem;">Access Denied</h3>
        <p style="margin-bottom: 1rem;">You need to be signed in to view this page.</p>
        <button
          style="background: #ff6b00; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; font-weight: 600;"
          @click="signIn"
        >
          Sign In
        </button>
      </div>

      <div v-else>
        <div style="padding: 1rem; background: #e8f5e9; border-radius: 4px; margin-bottom: 1.5rem;">
          <h3 style="font-weight: 600; color: #2e7d32; margin-bottom: 0.5rem;">✅ Welcome, {{ user?.username || user?.given_name || 'User' }}!</h3>
          <p>This is a protected page. You can see it because you are authenticated.</p>
        </div>

        <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.75rem;">Your Profile</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tbody>
            <tr v-for="(value, key) in userDisplay" :key="key" style="border-bottom: 1px solid #eee;">
              <td style="padding: 0.5rem; font-weight: 600; width: 200px; color: #555;">{{ key }}</td>
              <td style="padding: 0.5rem;">{{ value }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const {isSignedIn, isLoading, user, signIn} = useAsgardeo();

const userDisplay = computed(() => {
  if (!user.value) return {};
  const display: Record<string, string> = {};
  for (const [key, value] of Object.entries(user.value)) {
    if (value !== undefined && value !== null && value !== '') {
      display[key] = String(value);
    }
  }
  return display;
});
</script>
