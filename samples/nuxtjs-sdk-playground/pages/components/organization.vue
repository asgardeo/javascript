<script setup lang="ts">
import { ref } from 'vue';

const { currentOrganization, myOrganizations } = useOrganization();

const activeTab = ref('organization');
const tabs = [
  { key: 'organization',         label: 'AsgardeoOrganization' },
  { key: 'organization-list',    label: 'AsgardeoOrganizationList' },
  { key: 'org-switcher',         label: 'AsgardeoOrganizationSwitcher' },
  { key: 'org-profile',          label: 'AsgardeoOrganizationProfile' },
  { key: 'create-org',           label: 'AsgardeoCreateOrganization' },
];

// ── Code snippets ──────────────────────────────────────────────────────────
const organizationCode = `<!-- Scoped slot exposes the current organization -->
<AsgardeoOrganization>
  <template #default="{ organization }">
    <p>Current org: {{ organization.name }}</p>
  </template>
  <template #fallback>
    <p>No organization selected.</p>
  </template>
</AsgardeoOrganization>`;

const orgListCode = `<!-- Renders a list of all organizations the user belongs to -->
<!-- Clicking an org switches the current organization context -->
<AsgardeoSignedIn>
  <AsgardeoOrganizationList />
</AsgardeoSignedIn>`;

const orgSwitcherCode = `<!-- Compact dropdown to switch between organizations -->
<AsgardeoSignedIn>
  <AsgardeoOrganizationSwitcher />
</AsgardeoSignedIn>`;

const orgProfileCode = `<!-- Pre-built organization profile card -->
<AsgardeoSignedIn>
  <AsgardeoOrganization>
    <template #default>
      <AsgardeoOrganizationProfile />
    </template>
    <template #fallback>
      <p>No organization selected.</p>
    </template>
  </AsgardeoOrganization>
</AsgardeoSignedIn>`;

const createOrgCode = `<!-- Form to create a new sub-organization -->
<AsgardeoSignedIn>
  <AsgardeoCreateOrganization
    @success="(org) => console.log('Created:', org)"
    @error="(err) => console.error(err)"
  />
</AsgardeoSignedIn>`;
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="Organization Components"
      description="AsgardeoOrganization (control), AsgardeoOrganizationList, AsgardeoOrganizationSwitcher, AsgardeoOrganizationProfile, AsgardeoCreateOrganization."
    />

    <!-- Current org banner -->
    <div class="flex flex-wrap items-center gap-3 px-4 py-3 rounded-lg bg-surface-muted border border-border text-sm">
      <span class="font-medium text-text">Current organization:</span>
      <SharedStatusBadge
        v-if="currentOrganization"
        status="success"
        :label="(currentOrganization as Record<string, unknown>)?.['name'] as string || 'Selected'"
      />
      <SharedStatusBadge
        v-else
        status="neutral"
        label="None selected"
      />
      <span class="ml-auto text-xs text-text-muted">
        {{ myOrganizations?.length ?? 0 }} organization(s) in myOrganizations
      </span>
    </div>

    <LayoutTabGroup :tabs="tabs" v-model="activeTab">

      <!-- ─── AsgardeoOrganization tab ─── -->
      <template #organization>
        <div class="space-y-5">
          <LayoutSectionCard
            title="AsgardeoOrganization"
            description="Control component — exposes the current organization via a scoped slot. Renders #fallback when no org is selected."
          >
            <div class="grid md:grid-cols-2 gap-6">
              <div class="space-y-4">
                <div>
                  <p class="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Scoped slot</p>
                  <div class="rounded-lg border border-border bg-surface-muted p-4 min-h-14">
                    <AsgardeoOrganization>
                      <template #default="{ organization: org }">
                        <div class="space-y-1 text-sm">
                          <p class="font-medium text-text">{{ (org as Record<string, unknown>)?.['name'] ?? 'Organization' }}</p>
                          <p v-if="(org as Record<string, unknown>)?.['id']" class="text-xs text-text-muted font-mono">
                            {{ (org as Record<string, unknown>)['id'] }}
                          </p>
                        </div>
                      </template>
                      <template #fallback>
                        <p class="text-sm text-text-muted italic">No organization selected.</p>
                      </template>
                    </AsgardeoOrganization>
                  </div>
                </div>

                <!-- Nested with user -->
                <div>
                  <p class="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Nested with AsgardeoSignedIn</p>
                  <div class="rounded-lg border border-border bg-surface-muted p-4 min-h-14">
                    <AsgardeoSignedIn>
                      <template #default>
                        <AsgardeoOrganization>
                          <template #default="{ organization: org }">
                            <p class="text-sm text-text">
                              Signed in + org context:
                              <span class="font-mono">{{ (org as Record<string, unknown>)?.['name'] }}</span>
                            </p>
                          </template>
                          <template #fallback>
                            <p class="text-sm text-text-muted italic">Signed in but no org context.</p>
                          </template>
                        </AsgardeoOrganization>
                      </template>
                      <template #fallback>
                        <p class="text-sm text-text-muted italic">Sign in first.</p>
                      </template>
                    </AsgardeoSignedIn>
                  </div>
                </div>
              </div>

              <p class="text-xs text-text-muted self-start">
                <code class="bg-surface-muted px-1 rounded font-mono">&lt;AsgardeoOrganization&gt;</code> reads from
                <code class="bg-surface-muted px-1 rounded font-mono">useOrganization().currentOrganization</code>.
                It renders its <code class="bg-surface-muted px-1 rounded font-mono">#fallback</code> slot when no
                organization is selected — useful for "select an org" prompts.
              </p>
            </div>
          </LayoutSectionCard>

          <LayoutCodeBlock :code="organizationCode" language="vue" />
        </div>
      </template>

      <!-- ─── AsgardeoOrganizationList tab ─── -->
      <template #organization-list>
        <div class="space-y-5">
          <LayoutSectionCard
            title="AsgardeoOrganizationList"
            description="Displays all organizations the signed-in user belongs to. Clicking one switches the org context."
          >
            <AsgardeoSignedIn>
              <template #default>
                <AsgardeoOrganizationList />
              </template>
              <template #fallback>
                <div class="rounded-lg border border-border bg-surface-muted p-8 text-center">
                  <p class="text-sm text-text-muted italic">Sign in to see AsgardeoOrganizationList.</p>
                  <AsgardeoSignInButton
                    class="mt-3 px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors"
                  />
                </div>
              </template>
            </AsgardeoSignedIn>
          </LayoutSectionCard>

          <LayoutCodeBlock :code="orgListCode" language="vue" />
        </div>
      </template>

      <!-- ─── AsgardeoOrganizationSwitcher tab ─── -->
      <template #org-switcher>
        <div class="space-y-5">
          <LayoutSectionCard
            title="AsgardeoOrganizationSwitcher"
            description="Compact dropdown to switch between organizations — ideal for top navigation bars."
          >
            <AsgardeoSignedIn>
              <template #default>
                <div class="flex items-center gap-4 p-4 rounded-lg bg-surface-muted border border-border">
                  <AsgardeoOrganizationSwitcher />
                  <p class="text-xs text-text-muted">Select an organization to switch context.</p>
                </div>
              </template>
              <template #fallback>
                <div class="rounded-lg border border-border bg-surface-muted p-8 text-center">
                  <p class="text-sm text-text-muted italic">Sign in to see AsgardeoOrganizationSwitcher.</p>
                  <AsgardeoSignInButton
                    class="mt-3 px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors"
                  />
                </div>
              </template>
            </AsgardeoSignedIn>
          </LayoutSectionCard>

          <LayoutCodeBlock :code="orgSwitcherCode" language="vue" />
        </div>
      </template>

      <!-- ─── AsgardeoOrganizationProfile tab ─── -->
      <template #org-profile>
        <div class="space-y-5">
          <LayoutSectionCard
            title="AsgardeoOrganizationProfile"
            description="Pre-built organization profile card — renders details of the currently selected organization."
          >
            <AsgardeoSignedIn>
              <template #default>
                <AsgardeoOrganization>
                  <template #default>
                    <AsgardeoOrganizationProfile />
                  </template>
                  <template #fallback>
                    <p class="text-sm text-text-muted italic p-4">No organization selected. Use the Organization Switcher to select one.</p>
                  </template>
                </AsgardeoOrganization>
              </template>
              <template #fallback>
                <div class="rounded-lg border border-border bg-surface-muted p-8 text-center">
                  <p class="text-sm text-text-muted italic">Sign in to see AsgardeoOrganizationProfile.</p>
                  <AsgardeoSignInButton
                    class="mt-3 px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors"
                  />
                </div>
              </template>
            </AsgardeoSignedIn>
          </LayoutSectionCard>

          <LayoutCodeBlock :code="orgProfileCode" language="vue" />
        </div>
      </template>

      <!-- ─── AsgardeoCreateOrganization tab ─── -->
      <template #create-org>
        <div class="space-y-5">
          <LayoutSectionCard
            title="AsgardeoCreateOrganization"
            description="Form to create a new sub-organization under the current tenant."
          >
            <AsgardeoSignedIn>
              <template #default>
                <AsgardeoCreateOrganization />
              </template>
              <template #fallback>
                <div class="rounded-lg border border-border bg-surface-muted p-8 text-center">
                  <p class="text-sm text-text-muted italic">Sign in to see AsgardeoCreateOrganization.</p>
                  <AsgardeoSignInButton
                    class="mt-3 px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors"
                  />
                </div>
              </template>
            </AsgardeoSignedIn>
          </LayoutSectionCard>

          <LayoutCodeBlock :code="createOrgCode" language="vue" />
        </div>
      </template>

    </LayoutTabGroup>
  </div>
</template>
