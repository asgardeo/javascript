<template>
  <div>
    <section style="background: white; border-radius: 8px; padding: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <h2 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem;">Protected Page</h2>

      <div style="padding: 1rem; background: #e8f5e9; border-radius: 4px; margin-bottom: 1.5rem;">
        <h3 style="font-weight: 600; color: #2e7d32; margin-bottom: 0.5rem;">✅ Welcome, {{ user?.username || user?.given_name || 'User' }}!</h3>
        <p>This page is protected by the <code>auth</code> middleware. Unauthenticated users are automatically redirected to sign in.</p>
      </div>

      <div style="padding: 1rem; background: #e3f2fd; border-radius: 4px; margin-bottom: 1.5rem;">
        <h4 style="font-weight: 600; color: #1565c0; margin-bottom: 0.5rem;">How it works</h4>
        <p style="margin-bottom: 0.5rem;">This page uses <code>definePageMeta({ middleware: ['auth'] })</code> to enforce authentication.</p>
        <p>If you sign out, the middleware will redirect you to sign in and bring you back here after authentication (via <code>returnTo</code>).</p>
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
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({middleware: ['auth']});

const {user} = useAsgardeo();

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
