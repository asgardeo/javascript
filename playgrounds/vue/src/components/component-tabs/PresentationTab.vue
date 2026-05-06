<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  SignedIn,
  User,
  Organization,
  UserProfile,
  UserDropdown,
  OrganizationList,
  OrganizationSwitcher,
  OrganizationProfile,
  CreateOrganization,
  InviteUser,
  LanguageSwitcher,
  AcceptInvite,
} from '@asgardeo/vue';
import TabGroup from '../layout/TabGroup.vue';
import ComponentCard from '../layout/ComponentCard.vue';
import PropControl from '../layout/PropControl.vue';

const tabs = [
  { key: 'userProfile',          label: '<UserProfile/>'          },
  { key: 'userDropdown',         label: '<UserDropdown/>'         },
  { key: 'user',                 label: '<User/>'                 },
  { key: 'organizationProfile',  label: '<OrganizationProfile/>'  },
  { key: 'organizationList',     label: '<OrganizationList/>'     },
  { key: 'organizationSwitcher', label: '<OrganizationSwitcher/>' },
  { key: 'organization',         label: '<Organization/>'         },
  { key: 'createOrganization',   label: '<CreateOrganization/>'   },
  { key: 'inviteUser',           label: '<InviteUser/>'           },
  { key: 'languageSwitcher',     label: '<LanguageSwitcher/>'     },
  { key: 'acceptInvite',         label: '<AcceptInvite/>'         },
];
const activeTab = ref(tabs[0]?.key ?? 'user');

const userProfileAvatarSize = ref<'sm' | 'md' | 'lg'>('lg');
const userProfileCardLayout = ref(true);
const userProfileCardVariant = ref<'elevated' | 'outlined' | 'flat'>('elevated');
const userProfileCompact = ref(false);
const userProfileEditable = ref(true);
const userProfileShowAvatar = ref(true);
const userProfileTitle = ref('Profile');
const userProfileHideFieldsInput = ref('');
const userProfileShowFieldsInput = ref('');
const userProfileHideFields = computed(() =>
  userProfileHideFieldsInput.value.split(',').map(f => f.trim()).filter(Boolean)
);
const userProfileShowFields = computed(() =>
  userProfileShowFieldsInput.value.split(',').map(f => f.trim()).filter(Boolean)
);
</script>

<template>
  <TabGroup class="h-full" :tabs="tabs" v-model="activeTab">

      <template #user>
        <ComponentCard name="User" :badges="['Presentation']">
          <template #preview>
            <User>
              <template #default="{ user }">
                <div class="rounded-md bg-status-success-bg border border-border px-4 py-2 text-sm text-status-success-text">
                  {{ user?.flattenedProfile?.givenName ?? user?.flattenedProfile?.username ?? 'Authenticated user' }}
                </div>
              </template>
              <template #fallback>
                <p class="text-sm text-on-surface-muted italic">Sign in to see user data.</p>
              </template>
            </User>
          </template>
        </ComponentCard>
      </template>

      <template #organization>
        <ComponentCard name="Organization" :badges="['Presentation']">
          <template #preview>
            <Organization>
              <template #default="{ organization }">
                <div class="rounded-md bg-status-success-bg border border-border px-4 py-2 text-sm text-status-success-text">
                  {{ organization?.name ?? 'Current organization' }}
                </div>
              </template>
              <template #fallback>
                <p class="text-sm text-on-surface-muted italic">No current organization set.</p>
              </template>
            </Organization>
          </template>
        </ComponentCard>
      </template>

      <template #userProfile>
        <ComponentCard name="UserProfile" :badges="['Presentation']">
          <template #preview>
            <SignedIn>
              <template #default>
                <UserProfile
                  :avatarSize="userProfileAvatarSize"
                  :cardLayout="userProfileCardLayout"
                  :cardVariant="userProfileCardVariant"
                  :compact="userProfileCompact"
                  :editable="userProfileEditable"
                  :hideFields="userProfileHideFields"
                  :showAvatar="userProfileShowAvatar"
                  :showFields="userProfileShowFields"
                  :title="userProfileTitle"
                />
              </template>
              <template #fallback>
                <p class="text-sm text-on-surface-muted italic">Sign in to preview.</p>
              </template>
            </SignedIn>
          </template>
          <template #controls>
            <PropControl label="editable" type="toggle" v-model="userProfileEditable" />
            <PropControl label="showAvatar" type="toggle" v-model="userProfileShowAvatar" />
            <PropControl label="compact" type="toggle" v-model="userProfileCompact" />
            <PropControl label="cardLayout" type="toggle" v-model="userProfileCardLayout" />
            <PropControl label="avatarSize" type="select" :options="['sm', 'md', 'lg']" v-model="userProfileAvatarSize" />
            <PropControl label="cardVariant" type="select" :options="['elevated', 'outlined', 'flat']" v-model="userProfileCardVariant" />
            <PropControl label="title" type="text" v-model="userProfileTitle" />
            <PropControl label="hideFields" type="text" v-model="userProfileHideFieldsInput" />
            <PropControl label="showFields" type="text" v-model="userProfileShowFieldsInput" />
          </template>
        </ComponentCard>
      </template>

      <template #userDropdown>
        <ComponentCard name="UserDropdown" :badges="['Presentation']">
          <template #preview>
            <SignedIn>
              <template #default>
                <UserDropdown />
              </template>
              <template #fallback>
                <p class="text-sm text-on-surface-muted italic">Sign in to preview.</p>
              </template>
            </SignedIn>
          </template>
        </ComponentCard>
      </template>

      <template #organizationList>
        <ComponentCard name="OrganizationList" :badges="['Presentation']">
          <template #preview>
            <SignedIn>
              <template #default>
                <OrganizationList />
              </template>
              <template #fallback>
                <p class="text-sm text-on-surface-muted italic">Sign in to preview.</p>
              </template>
            </SignedIn>
          </template>
        </ComponentCard>
      </template>

      <template #organizationSwitcher>
        <ComponentCard name="OrganizationSwitcher" :badges="['Presentation']">
          <template #preview>
            <SignedIn>
              <template #default>
                <OrganizationSwitcher />
              </template>
              <template #fallback>
                <p class="text-sm text-on-surface-muted italic">Sign in to preview.</p>
              </template>
            </SignedIn>
          </template>
        </ComponentCard>
      </template>

      <template #organizationProfile>
        <ComponentCard name="OrganizationProfile" :badges="['Presentation']">
          <template #preview>
            <SignedIn>
              <template #default>
                <OrganizationProfile />
              </template>
              <template #fallback>
                <p class="text-sm text-on-surface-muted italic">Sign in to preview.</p>
              </template>
            </SignedIn>
          </template>
        </ComponentCard>
      </template>

      <template #createOrganization>
        <ComponentCard name="CreateOrganization" :badges="['Presentation']">
          <template #preview>
            <SignedIn>
              <template #default>
                <CreateOrganization />
              </template>
              <template #fallback>
                <p class="text-sm text-on-surface-muted italic">Sign in to preview.</p>
              </template>
            </SignedIn>
          </template>
        </ComponentCard>
      </template>

      <template #inviteUser>
        <ComponentCard name="InviteUser" :badges="['Presentation']">
          <template #preview>
            <SignedIn>
              <template #default>
                <InviteUser />
              </template>
              <template #fallback>
                <p class="text-sm text-on-surface-muted italic">Sign in to preview.</p>
              </template>
            </SignedIn>
          </template>
        </ComponentCard>
      </template>

      <template #languageSwitcher>
        <ComponentCard name="LanguageSwitcher" :badges="['Presentation']">
          <template #preview>
            <LanguageSwitcher />
          </template>
        </ComponentCard>
      </template>

      <template #acceptInvite>
        <ComponentCard name="AcceptInvite" :badges="['Presentation']">
          <template #preview>
            <AcceptInvite />
          </template>
        </ComponentCard>
      </template>

  </TabGroup>
</template>
