<script setup lang="ts">

import {toRaw} from 'vue';

const {profile, flattenedProfile, schemas} = useUser();

const updateViaPhoneNumbers = async () => {
    const res = await $fetch('/api/auth/user/profile', {
        method: 'PATCH',
        body: {
            payload: {
                phoneNumbers: [{ type: 'mobile', value: '32536' }],
            },
        },
    });
    console.log('phoneNumbers update result:', res);
};

const updateViaCustomSchema = async () => {
    const res = await $fetch('/api/auth/user/profile', {
        method: 'PATCH',
        body: {
            payload: {
                'urn:scim:schemas:extension:custom:User': { mobileNumbers: ['00032536'] },
            },
        },
    });
    console.log('custom schema update result:', res);
};

const updateGivenName = async () => {
    // Sanity check on a known-writable core attribute
    const res = await $fetch('/api/auth/user/profile', {
        method: 'PATCH',
        body: {
            payload: {
                name: { givenName: 'KavindaTest' },
            },
        },
    });
    console.log('givenName update result:', res);
};

  // Snapshot copies — show the value at log time, no Proxy noise
  console.log('[test] profile:',           structuredClone(toRaw(profile.value)));
//   console.log('[test] flattenedProfile:',  structuredClone(toRaw(flattenedProfile.value)));
//   console.log('[test] schemas:',           structuredClone(toRaw(schemas.value)));

  // Flat table view of the most useful object
//   console.table(toRaw(flattenedProfile.value));
</script>

<template>
    <div class="flex flex-col gap-4">
        <button @click="updateViaPhoneNumbers">Update via phoneNumbers (core SCIM)</button>
        <button @click="updateViaCustomSchema">Update via custom schema</button>
        <button @click="updateGivenName">Update givenName (sanity check)</button>
    </div>
</template>
