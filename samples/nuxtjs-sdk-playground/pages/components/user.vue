<script setup lang="ts">
import { ref } from 'vue';

const { user } = useAsgardeo();
const { flattenedProfile } = useUser();

const activeTab = ref('user');
const tabs = [
  { key: 'user',         label: 'AsgardeoUser' },
  { key: 'user-profile', label: 'AsgardeoUserProfile' },
  { key: 'user-dropdown', label: 'AsgardeoUserDropdown' },
];

// Helper: safe profile field access without `as` casts in template
function profileField(field: string): unknown {
  const p = flattenedProfile.value as Record<string, unknown> | null;
  return p?.[field] ?? '—';
}

// ── Code snippets ──────────────────────────────────────────────────────────
const userCode = `<!-- Scoped slot exposes the raw user object -->
<AsgardeoUser>
  <template #default="{ user }">
    <p>Hello, {{ user?.givenName ?? user?.username }}</p>
  </template>
  <template #fallback>
    <p>Sign in to see your name.</p>
  </template>
</AsgardeoUser>`;

const userProfileCode = `<!-- Pre-built profile card, read-only -->
<AsgardeoUserProfile />

<!-- Editable fields (inline edit mode) -->
<AsgardeoUserProfile :editable="true" />`;

const userDropdownCode = `<!-- Avatar + dropdown — place in top navigation -->
<AsgardeoUserDropdown />

<!-- Custom class on the container -->
<AsgardeoUserDropdown class-name="my-dropdown" />`;
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="User Components"
      description="AsgardeoUser (scoped slot), AsgardeoUserProfile (pre-built card), AsgardeoUserDropdown (avatar + menu)."
    />

    <LayoutTabGroup :tabs="tabs" v-model="activeTab">

      <!-- ─── AsgardeoUser tab ─── -->
      <template #user>
        <div class="space-y-5">
          <LayoutSectionCard
            title="AsgardeoUser"
            description="Exposes the current user object via a scoped slot. Renders #fallback when signed out."
          >
            <div class="grid md:grid-cols-2 gap-6">
              <div class="space-y-4">
                <!-- Default slot only -->
                <div>
                  <p class="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Scoped slot with user data</p>
                  <div class="rounded-lg border border-border bg-surface-muted p-4 min-h-14">
                    <AsgardeoUser>
                      <template #default="{ user: u }">
                        <div class="space-y-1 text-sm">
                          <p class="font-medium text-text">{{ (u as Record<string, unknown>)?.['givenName'] ?? (u as Record<string, unknown>)?.['username'] ?? 'User' }}</p>
                          <p v-if="(u as Record<string, unknown>)?.['email']" class="text-text-muted text-xs">
                            {{ (u as Record<string, unknown>)['email'] }}
                          </p>
                        </div>
                      </template>
                      <template #fallback>
                        <p class="text-sm text-text-muted italic">Sign in to see the user slot.</p>
                      </template>
                    </AsgardeoUser>
                  </div>
                </div>

                <!-- Raw user dump -->
                <div>
                  <p class="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Raw user object</p>
                  <div class="rounded-lg border border-border bg-surface-muted p-3 max-h-40 overflow-y-auto">
                    <AsgardeoUser>
                      <template #default="{ user: u }">
                        <SharedJsonViewer :data="u" />
                      </template>
                      <template #fallback>
                        <p class="text-xs text-text-muted/60 font-mono">null — not signed in</p>
                      </template>
                    </AsgardeoUser>
                  </div>
                </div>
              </div>

              <div class="space-y-2">
                <p class="text-xs text-text-muted">
                  <code class="bg-surface-muted px-1 rounded font-mono">&lt;AsgardeoUser&gt;</code> injects the current
                  user via the <code class="bg-surface-muted px-1 rounded font-mono">#default="{ user }"</code> scoped slot.
                  The <code class="bg-surface-muted px-1 rounded font-mono">#fallback</code> slot renders when no user
                  is signed in. The user object is the raw value from
                  <code class="bg-surface-muted px-1 rounded font-mono">useAsgardeo().user</code>.
                </p>
              </div>
            </div>
          </LayoutSectionCard>

          <LayoutCodeBlock :code="userCode" language="vue" />
        </div>
      </template>

      <!-- ─── AsgardeoUserProfile tab ─── -->
      <template #user-profile>
        <div class="space-y-5">
          <LayoutSectionCard
            title="AsgardeoUserProfile"
            description="Pre-built profile card displaying the signed-in user's fields. Add :editable='true' for inline editing."
          >
            <AsgardeoSignedIn>
              <template #default>
                <div class="space-y-5">
                  <div>
                    <p class="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Read-only</p>
                    <AsgardeoUserProfile />
                  </div>
                  <div>
                    <p class="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Editable</p>
                    <p class="text-xs text-text-muted mb-2">
                      Add <code class="bg-surface-muted px-1 rounded font-mono">:editable="true"</code> to enable inline field editing with save/cancel actions.
                    </p>
                    <AsgardeoUserProfile :editable="true" />
                  </div>
                </div>
              </template>
              <template #fallback>
                <div class="rounded-lg border border-border bg-surface-muted p-8 text-center">
                  <p class="text-sm text-text-muted italic">Sign in to see AsgardeoUserProfile.</p>
                  <AsgardeoSignInButton
                    class="mt-3 px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors"
                  />
                </div>
              </template>
            </AsgardeoSignedIn>
          </LayoutSectionCard>

          <LayoutCodeBlock :code="userProfileCode" language="vue" />
        </div>
      </template>

      <!-- ─── AsgardeoUserDropdown tab ─── -->
      <template #user-dropdown>
        <div class="space-y-5">
          <LayoutSectionCard
            title="AsgardeoUserDropdown"
            description="Avatar button that opens a dropdown with user info and a sign-out action. Typically placed in a top nav bar."
          >
            <AsgardeoSignedIn>
              <template #default>
                <div class="flex items-center gap-4 p-4 rounded-lg bg-surface-muted border border-border">
                  <AsgardeoUserDropdown />
                  <p class="text-xs text-text-muted">Click the avatar to open the dropdown.</p>
                </div>
              </template>
              <template #fallback>
                <div class="rounded-lg border border-border bg-surface-muted p-8 text-center">
                  <p class="text-sm text-text-muted italic">Sign in to see AsgardeoUserDropdown.</p>
                  <AsgardeoSignInButton
                    class="mt-3 px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors"
                  />
                </div>
              </template>
            </AsgardeoSignedIn>
          </LayoutSectionCard>

          <!-- Flattened profile fields for reference -->
          <LayoutSectionCard title="Flattened Profile Data" :collapsible="true">
            <p class="text-xs text-text-muted mb-3">
              Use <code class="bg-surface-muted px-1 rounded font-mono">useUser().flattenedProfile</code> to access individual user fields.
            </p>
            <dl class="divide-y divide-border">
              <SharedConfigRow
                v-for="field in ['userName', 'givenName', 'familyName', 'email', 'phoneNumbers']"
                :key="field"
                :label="field"
                :value="profileField(field)"
                mono
              />
            </dl>
          </LayoutSectionCard>

          <LayoutCodeBlock :code="userDropdownCode" language="vue" />
        </div>
      </template>

    </LayoutTabGroup>
  </div>
</template>
