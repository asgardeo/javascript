<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { FieldFactory, FieldType } from '@asgardeo/vue';
import TabGroup from '../layout/TabGroup.vue';
import ComponentCard from '../layout/ComponentCard.vue';
import PropControl from '../layout/PropControl.vue';

const tabs = [{ key: 'fieldFactory', label: '<FieldFactory/>' }];
const activeTab = ref(tabs[0]?.key ?? 'fieldFactory');

type FieldTypeKey = 'Text' | 'Email' | 'Password' | 'Select' | 'Checkbox';

const fieldTypeKey   = ref<FieldTypeKey>('Text');
const fieldLabel     = ref('Username');
const fieldPlaceholder = ref('Enter value');
const fieldRequired  = ref(false);
const fieldValue     = ref<string | boolean>('');

const fieldTypeOptions: FieldTypeKey[] = ['Text', 'Email', 'Password', 'Select', 'Checkbox'];

const fieldTypeMap: Record<FieldTypeKey, FieldType> = {
  Text:     FieldType.Text,
  Email:    FieldType.Email,
  Password: FieldType.Password,
  Select:   FieldType.Select,
  Checkbox: FieldType.Checkbox,
};

const currentFieldType = computed(() => fieldTypeMap[fieldTypeKey.value]);

const selectOptions = [
  { label: 'Admin',  value: 'admin'  },
  { label: 'Editor', value: 'editor' },
  { label: 'Viewer', value: 'viewer' },
];

watch(fieldTypeKey, (key) => {
  fieldValue.value = key === 'Checkbox' ? false : '';
});

function handleChange(val: string | boolean) {
  fieldValue.value = val;
}
</script>

<template>
  <TabGroup class="h-full" :tabs="tabs" v-model="activeTab">

      <template #fieldFactory>
        <ComponentCard name="FieldFactory" :badges="['Factories']">
          <template #preview>
            <div class="w-full max-w-xs">
              <FieldFactory
                :type="currentFieldType"
                name="demo-field"
                :label="fieldLabel"
                :value="fieldValue"
                :required="fieldRequired"
                :placeholder="fieldTypeKey !== 'Checkbox' ? fieldPlaceholder : undefined"
                :options="fieldTypeKey === 'Select' ? selectOptions : undefined"
                @change="handleChange"
              />
            </div>
          </template>
          <template #controls>
            <PropControl label="type"        type="select" :options="fieldTypeOptions" v-model="fieldTypeKey" />
            <PropControl label="label"       v-model="fieldLabel" />
            <PropControl v-if="fieldTypeKey !== 'Checkbox'" label="placeholder" v-model="fieldPlaceholder" />
            <PropControl label="required"    type="toggle" v-model="fieldRequired" />
          </template>
        </ComponentCard>
      </template>

  </TabGroup>
</template>
