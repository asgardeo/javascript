<script setup lang="ts">
import { reactive } from 'vue';
import {
  SignedIn,
  UserProfile,
  BaseUserProfile,
  UserDropdown,
  OrganizationList,
  OrganizationSwitcher,
  OrganizationProfile,
  CreateOrganization,
  InviteUser,
  LanguageSwitcher,
  FieldFactory,
  AcceptInvite,
  FieldType,
} from '@asgardeo/vue';
import SectionCard from '../layout/SectionCard.vue';
import ResultPanel from '../shared/ResultPanel.vue';

// FieldFactory demo — individual field values
const fieldValues = reactive({
  username: '',
  email: '',
  password: '',
  role: '',
  newsletter: '',
});
const roleOptions = [
  { label: 'Admin', value: 'admin' },
  { label: 'Editor', value: 'editor' },
  { label: 'Viewer', value: 'viewer' },
];
</script>

<template>
  <div class="space-y-8">

    <!-- ── User Components ── -->
    <div>
      <h2
        class="text-base font-semibold text-on-surface uppercase tracking-wide mb-4 pb-2 border-b border-border-divider">
        User Components
      </h2>
      <div class="space-y-6">

        <!-- UserProfile -->
        <SectionCard title="UserProfile"
          description="Pre-built user profile card. Displays the signed-in user's info and supports inline field editing via the editable prop.">
          <SignedIn>
            <template #default>
              <div class="flex flex-col gap-4">
                <UserProfile />
                <p class="text-xs text-on-surface-muted">
                  Add <code class="bg-surface-muted px-1 rounded font-mono">:editable="true"</code> to enable inline
                  profile field editing.
                </p>
              </div>
            </template>
            <template #fallback>
              <p class="text-sm text-on-surface-muted italic">Sign in to see the UserProfile component.</p>
            </template>
          </SignedIn>
        </SectionCard>

        <!-- BaseUserProfile -->
        <SectionCard title="BaseUserProfile"
          description="Unstyled base variant — use the default scoped slot to render a fully custom profile layout.">
          <SignedIn>
            <template #default>
              <BaseUserProfile>
                <template #default="{ profile, isLoading }">
                  <div v-if="isLoading" class="text-sm text-on-surface-muted italic">Loading profile…</div>
                  <div v-else class="rounded-lg border border-accent-100 bg-accent-50 p-4 space-y-1">
                    <p class="text-sm font-semibold text-accent-800">
                      {{ profile?.givenName ?? profile?.username ?? 'User' }}
                      <span v-if="profile?.familyName" class="ml-1">{{ profile.familyName }}</span>
                    </p>
                    <p v-if="profile?.email" class="text-xs text-accent-600">{{ profile.email }}</p>
                    <ResultPanel :result="profile" />
                  </div>
                </template>
              </BaseUserProfile>
            </template>
            <template #fallback>
              <p class="text-sm text-on-surface-muted italic">Sign in to see the BaseUserProfile component.</p>
            </template>
          </SignedIn>
        </SectionCard>

        <!-- UserDropdown -->
        <SectionCard title="UserDropdown"
          description="Avatar button that opens a dropdown with user info and a sign-out action. Typically placed in a top navigation bar.">
          <SignedIn>
            <template #default>
              <div class="flex items-center gap-4">
                <UserDropdown />
                <p class="text-xs text-on-surface-muted">Click the avatar to open the dropdown.</p>
              </div>
            </template>
            <template #fallback>
              <p class="text-sm text-on-surface-muted italic">Sign in to see the UserDropdown component.</p>
            </template>
          </SignedIn>
        </SectionCard>

      </div>
    </div>

    <!-- ── Organization Components ── -->
    <div>
      <h2
        class="text-base font-semibold text-on-surface uppercase tracking-wide mb-4 pb-2 border-b border-border-divider">
        Organization Components
      </h2>
      <div class="space-y-6">

        <!-- OrganizationList -->
        <SectionCard title="OrganizationList"
          description="Displays all organizations the signed-in user belongs to. Clicking an org switches the current context.">
          <SignedIn>
            <template #default>
              <OrganizationList />
            </template>
            <template #fallback>
              <p class="text-sm text-on-surface-muted italic">Sign in to see the OrganizationList component.</p>
            </template>
          </SignedIn>
        </SectionCard>

        <!-- OrganizationSwitcher -->
        <SectionCard title="OrganizationSwitcher"
          description="Compact dropdown for switching between organizations without leaving the current page.">
          <SignedIn>
            <template #default>
              <div class="flex items-center gap-4">
                <OrganizationSwitcher />
                <p class="text-xs text-on-surface-muted">Select an organization to switch context.</p>
              </div>
            </template>
            <template #fallback>
              <p class="text-sm text-on-surface-muted italic">Sign in to see the OrganizationSwitcher component.</p>
            </template>
          </SignedIn>
        </SectionCard>

        <!-- OrganizationProfile -->
        <SectionCard title="OrganizationProfile"
          description="Shows the current organization's details. Requires an active organization context.">
          <SignedIn>
            <template #default>
              <OrganizationProfile />
            </template>
            <template #fallback>
              <p class="text-sm text-on-surface-muted italic">Sign in to see the OrganizationProfile component.</p>
            </template>
          </SignedIn>
        </SectionCard>

        <!-- CreateOrganization -->
        <SectionCard title="CreateOrganization"
          description="Form component for creating a new organization under the authenticated user's account.">
          <SignedIn>
            <template #default>
              <CreateOrganization />
            </template>
            <template #fallback>
              <p class="text-sm text-on-surface-muted italic">Sign in to see the CreateOrganization component.</p>
            </template>
          </SignedIn>
        </SectionCard>

        <!-- InviteUser -->
        <SectionCard title="InviteUser"
          description="Form for inviting a user to the current organization by email address.">
          <SignedIn>
            <template #default>
              <InviteUser />
            </template>
            <template #fallback>
              <p class="text-sm text-on-surface-muted italic">Sign in to see the InviteUser component.</p>
            </template>
          </SignedIn>
        </SectionCard>

      </div>
    </div>

    <!-- ── Utility Components ── -->
    <div>
      <h2
        class="text-base font-semibold text-on-surface uppercase tracking-wide mb-4 pb-2 border-b border-border-divider">
        Utility Components
      </h2>
      <div class="space-y-6">

        <!-- LanguageSwitcher -->
        <SectionCard title="LanguageSwitcher"
          description="Dropdown that lists available locales from the i18n configuration and switches the active language.">
          <div class="flex items-center gap-4">
            <LanguageSwitcher />
            <p class="text-xs text-on-surface-muted">Locales are determined by your i18n provider configuration.</p>
          </div>
        </SectionCard>

        <!-- FieldFactory -->
        <SectionCard title="FieldFactory"
          description="Dynamically renders a styled form field from a FieldConfig object — supports text, email, password, select, and checkbox field types.">
          <div class="grid md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <FieldFactory :type="FieldType.Text" name="username" label="Username" :value="fieldValues.username"
                :required="true" placeholder="Enter your username" @change="fieldValues.username = $event" />
              <FieldFactory :type="FieldType.Email" name="email" label="Email Address" :value="fieldValues.email"
                :required="true" placeholder="you@example.com" @change="fieldValues.email = $event" />
              <FieldFactory :type="FieldType.Password" name="password" label="Password" :value="fieldValues.password"
                :required="true" placeholder="••••••••" @change="fieldValues.password = $event" />
              <FieldFactory :type="FieldType.Select" name="role" label="Role" :value="fieldValues.role"
                :required="false" :options="roleOptions" @change="fieldValues.role = $event" />
              <FieldFactory :type="FieldType.Checkbox" name="newsletter" label="Subscribe to newsletter"
                :value="fieldValues.newsletter" :required="false" @change="fieldValues.newsletter = $event" />
            </div>
            <div class="space-y-2">
              <p class="text-xs font-medium text-on-surface-muted uppercase tracking-wide">Current form values</p>
              <ResultPanel :result="fieldValues" />
            </div>
          </div>
        </SectionCard>

        <!-- AcceptInvite -->
        <SectionCard title="AcceptInvite"
          description="Renders the accept-invite flow. Typically shown on a dedicated /accept-invite route when a user arrives via an invitation link.">
          <div class="space-y-3">
            <p class="text-xs text-on-surface-muted">
              Mount <code class="bg-surface-muted px-1 rounded font-mono">&lt;AcceptInvite /&gt;</code> on the route
              that
              handles
              your invitation links (e.g. <code class="bg-surface-muted px-1 rounded font-mono">/accept-invite</code>).
              The component reads the invitation token from the URL and renders the appropriate confirmation UI.
            </p>
            <AcceptInvite />
          </div>
        </SectionCard>

      </div>
    </div>

  </div>
</template>
