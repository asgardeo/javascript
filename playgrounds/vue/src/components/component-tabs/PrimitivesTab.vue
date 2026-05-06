<script setup lang="ts">
import { ref } from 'vue';
import {
  Button, TextField, PasswordField, Select, Checkbox, DatePicker, OtpField,
  Card, Alert, Typography, Spinner, Logo, Divider,
  UserIcon, EyeIcon, EyeOffIcon, ChevronDownIcon, CheckIcon,
  CircleAlertIcon, CircleCheckIcon, InfoIcon, TriangleAlertIcon,
  XIcon, PlusIcon, LogOutIcon, ArrowLeftRightIcon, BuildingIcon, GlobeIcon, PencilIcon,
} from '@asgardeo/vue';
import TabGroup from '../layout/TabGroup.vue';
import ComponentCard from '../layout/ComponentCard.vue';
import PropControl from '../layout/PropControl.vue';

const tabs = [
  { key: 'button',        label: '<Button/>' },
  { key: 'textField',     label: '<TextField/>' },
  { key: 'passwordField', label: '<PasswordField/>' },
  { key: 'select',        label: '<Select/>' },
  { key: 'checkbox',      label: '<Checkbox/>' },
  { key: 'datePicker',    label: '<DatePicker/>' },
  { key: 'otpField',      label: '<OtpField/>' },
  { key: 'card',          label: '<Card/>' },
  { key: 'alert',         label: '<Alert/>' },
  { key: 'typography',    label: '<Typography/>' },
  { key: 'spinner',       label: '<Spinner/>' },
  { key: 'logo',          label: '<Logo/>' },
  { key: 'divider',       label: '<Divider/>' },
  { key: 'icons',         label: '<Icons/>' },
];
const activeTab = ref(tabs[0]?.key ?? 'button');

// ── Button ──
const btnVariant  = ref<'solid' | 'outline' | 'ghost' | 'text'>('solid');
const btnColor    = ref<'primary' | 'secondary' | 'danger'>('primary');
const btnSize     = ref<'small' | 'medium' | 'large'>('medium');
const btnDisabled = ref(false);
const btnLoading  = ref(false);
const btnFullWidth = ref(false);

// ── TextField ──
const tfValue       = ref('');
const tfType        = ref<'text' | 'email' | 'number' | 'tel' | 'url'>('text');
const tfPlaceholder = ref('Enter value');
const tfError       = ref('');
const tfRequired    = ref(false);
const tfDisabled    = ref(false);

// ── PasswordField ──
const pfValue       = ref('');
const pfPlaceholder = ref('Enter password');
const pfRequired    = ref(false);
const pfDisabled    = ref(false);

// ── Select ──
const selValue       = ref('');
const selPlaceholder = ref('Choose an option');
const selRequired    = ref(false);
const selDisabled    = ref(false);
const selOptions     = [
  { value: 'vue',     label: 'Vue'     },
  { value: 'react',   label: 'React'   },
  { value: 'angular', label: 'Angular' },
];

// ── Checkbox ──
const cbChecked  = ref(false);
const cbLabel    = ref('I agree to the terms');
const cbRequired = ref(false);
const cbDisabled = ref(false);

// ── DatePicker ──
const dpValue    = ref('');
const dpLabel    = ref('Select date');
const dpRequired = ref(false);
const dpDisabled = ref(false);

// ── OtpField ──
const otpValue    = ref('');
const otpLength   = ref(6);
const otpRequired = ref(false);
const otpDisabled = ref(false);

// ── Card ──
const cardVariant = ref<'elevated' | 'outlined' | 'flat'>('elevated');

// ── Alert ──
const alertSeverity    = ref<'success' | 'error' | 'warning' | 'info'>('info');
const alertDismissible = ref(false);
const alertText        = ref('This is an alert message.');
const alertVisible     = ref(true);

// ── Typography ──
const typoVariant = ref<
  'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' |
  'body1' | 'body2' | 'subtitle1' | 'subtitle2' | 'caption' | 'overline'
>('body1');

// ── Spinner ──
const spinnerSize = ref<'small' | 'medium' | 'large'>('medium');

// ── Logo ──
const logoSrc = ref('https://wso2.cachefly.net/wso2/sites/images/brand/downloads/wso2-logo.png');
const logoAlt = ref('Logo');

const icons = [
  { name: 'UserIcon',          component: UserIcon },
  { name: 'EyeIcon',           component: EyeIcon },
  { name: 'EyeOffIcon',        component: EyeOffIcon },
  { name: 'ChevronDownIcon',   component: ChevronDownIcon },
  { name: 'CheckIcon',         component: CheckIcon },
  { name: 'CircleAlertIcon',   component: CircleAlertIcon },
  { name: 'CircleCheckIcon',   component: CircleCheckIcon },
  { name: 'InfoIcon',          component: InfoIcon },
  { name: 'TriangleAlertIcon', component: TriangleAlertIcon },
  { name: 'XIcon',             component: XIcon },
  { name: 'PlusIcon',          component: PlusIcon },
  { name: 'LogOutIcon',        component: LogOutIcon },
  { name: 'ArrowLeftRightIcon',component: ArrowLeftRightIcon },
  { name: 'BuildingIcon',      component: BuildingIcon },
  { name: 'GlobeIcon',         component: GlobeIcon },
  { name: 'PencilIcon',        component: PencilIcon },
];
</script>

<template>
  <TabGroup class="h-full" :tabs="tabs" v-model="activeTab">

      <template #button>
        <ComponentCard name="Button" :badges="['Primitives']">
          <template #preview>
            <Button :variant="btnVariant" :color="btnColor" :size="btnSize"
              :disabled="btnDisabled" :loading="btnLoading" :full-width="btnFullWidth">
              Click Me
            </Button>
          </template>
          <template #controls>
            <PropControl label="variant"   type="select" :options="['solid','outline','ghost','text']"    v-model="btnVariant" />
            <PropControl label="color"     type="select" :options="['primary','secondary','danger']"      v-model="btnColor" />
            <PropControl label="size"      type="select" :options="['small','medium','large']"            v-model="btnSize" />
            <PropControl label="disabled"  type="toggle" v-model="btnDisabled" />
            <PropControl label="loading"   type="toggle" v-model="btnLoading" />
            <PropControl label="fullWidth" type="toggle" v-model="btnFullWidth" />
          </template>
        </ComponentCard>
      </template>

      <template #textField>
        <ComponentCard name="TextField" :badges="['Primitives']">
          <template #preview>
            <TextField v-model="tfValue" name="demo-tf" label="Label"
              :type="tfType" :placeholder="tfPlaceholder"
              :required="tfRequired" :disabled="tfDisabled"
              :error="tfError || undefined" class="w-full max-w-xs" />
          </template>
          <template #controls>
            <PropControl label="type"        type="select" :options="['text','email','number','tel','url']" v-model="tfType" />
            <PropControl label="placeholder" v-model="tfPlaceholder" />
            <PropControl label="error"       v-model="tfError" />
            <PropControl label="required"    type="toggle" v-model="tfRequired" />
            <PropControl label="disabled"    type="toggle" v-model="tfDisabled" />
          </template>
        </ComponentCard>
      </template>

      <template #passwordField>
        <ComponentCard name="PasswordField" :badges="['Primitives']">
          <template #preview>
            <PasswordField v-model="pfValue" name="demo-pf" label="Password"
              :placeholder="pfPlaceholder" :required="pfRequired" :disabled="pfDisabled"
              class="w-full max-w-xs" />
          </template>
          <template #controls>
            <PropControl label="placeholder" v-model="pfPlaceholder" />
            <PropControl label="required"    type="toggle" v-model="pfRequired" />
            <PropControl label="disabled"    type="toggle" v-model="pfDisabled" />
          </template>
        </ComponentCard>
      </template>

      <template #select>
        <ComponentCard name="Select" :badges="['Primitives']">
          <template #preview>
            <Select v-model="selValue" name="demo-select" label="Framework"
              :options="selOptions" :placeholder="selPlaceholder"
              :required="selRequired" :disabled="selDisabled" class="w-full max-w-xs" />
          </template>
          <template #controls>
            <PropControl label="placeholder" v-model="selPlaceholder" />
            <PropControl label="required"    type="toggle" v-model="selRequired" />
            <PropControl label="disabled"    type="toggle" v-model="selDisabled" />
          </template>
        </ComponentCard>
      </template>

      <template #checkbox>
        <ComponentCard name="Checkbox" :badges="['Primitives']">
          <template #preview>
            <Checkbox v-model="cbChecked" name="demo-cb"
              :label="cbLabel" :required="cbRequired" :disabled="cbDisabled" />
          </template>
          <template #controls>
            <PropControl label="label"    v-model="cbLabel" />
            <PropControl label="required" type="toggle" v-model="cbRequired" />
            <PropControl label="disabled" type="toggle" v-model="cbDisabled" />
          </template>
        </ComponentCard>
      </template>

      <template #datePicker>
        <ComponentCard name="DatePicker" :badges="['Primitives']">
          <template #preview>
            <DatePicker v-model="dpValue" name="demo-dp"
              :label="dpLabel" :required="dpRequired" :disabled="dpDisabled"
              class="w-full max-w-xs" />
          </template>
          <template #controls>
            <PropControl label="label"    v-model="dpLabel" />
            <PropControl label="required" type="toggle" v-model="dpRequired" />
            <PropControl label="disabled" type="toggle" v-model="dpDisabled" />
          </template>
        </ComponentCard>
      </template>

      <template #otpField>
        <ComponentCard name="OtpField" :badges="['Primitives']">
          <template #preview>
            <OtpField v-model="otpValue" name="demo-otp" label="Enter OTP"
              :length="otpLength" :required="otpRequired" :disabled="otpDisabled" />
          </template>
          <template #controls>
            <PropControl label="length"   type="number" :min="4" :max="8" v-model="otpLength" />
            <PropControl label="required" type="toggle" v-model="otpRequired" />
            <PropControl label="disabled" type="toggle" v-model="otpDisabled" />
          </template>
        </ComponentCard>
      </template>

      <template #card>
        <ComponentCard name="Card" :badges="['Primitives']">
          <template #preview>
            <Card :variant="cardVariant" class="w-full max-w-xs">
              <p class="text-sm text-on-surface p-1">Sample card content goes here.</p>
            </Card>
          </template>
          <template #controls>
            <PropControl label="variant" type="select" :options="['elevated','outlined','flat']" v-model="cardVariant" />
          </template>
        </ComponentCard>
      </template>

      <template #alert>
        <ComponentCard name="Alert" :badges="['Primitives']">
          <template #preview>
            <Alert v-if="alertVisible" :severity="alertSeverity" :dismissible="alertDismissible"
              @dismiss="alertVisible = false" class="w-full max-w-sm">
              {{ alertText }}
            </Alert>
            <button v-else class="text-xs text-accent-600 underline" @click="alertVisible = true">Reset</button>
          </template>
          <template #controls>
            <PropControl label="severity"    type="select" :options="['info','success','warning','error']" v-model="alertSeverity" />
            <PropControl label="text"        v-model="alertText" />
            <PropControl label="dismissible" type="toggle" v-model="alertDismissible" />
          </template>
        </ComponentCard>
      </template>

      <template #typography>
        <ComponentCard name="Typography" :badges="['Primitives']">
          <template #preview>
            <div class="overflow-hidden max-w-sm text-center">
              <Typography :variant="typoVariant">The quick brown fox</Typography>
            </div>
          </template>
          <template #controls>
            <PropControl label="variant" type="select"
              :options="['h1','h2','h3','h4','h5','h6','body1','body2','subtitle1','subtitle2','caption','overline']"
              v-model="typoVariant" />
          </template>
        </ComponentCard>
      </template>

      <template #spinner>
        <ComponentCard name="Spinner" :badges="['Primitives']">
          <template #preview>
            <Spinner :size="spinnerSize" />
          </template>
          <template #controls>
            <PropControl label="size" type="select" :options="['small','medium','large']" v-model="spinnerSize" />
          </template>
        </ComponentCard>
      </template>

      <template #logo>
        <ComponentCard name="Logo" :badges="['Primitives']">
          <template #preview>
            <Logo :src="logoSrc" :alt="logoAlt" />
          </template>
          <template #controls>
            <PropControl label="src" v-model="logoSrc" />
            <PropControl label="alt" v-model="logoAlt" />
          </template>
        </ComponentCard>
      </template>

      <template #divider>
        <ComponentCard name="Divider" :badges="['Primitives']">
          <template #preview>
            <div class="w-full max-w-xs">
              <p class="text-xs text-on-surface-muted mb-3">Content above</p>
              <Divider />
              <p class="text-xs text-on-surface-muted mt-3">Content below</p>
            </div>
          </template>
        </ComponentCard>
      </template>

      <template #icons>
        <ComponentCard name="Icons" :badges="['Primitives']">
          <template #preview>
            <div class="grid grid-cols-4 sm:grid-cols-6 gap-4">
              <div v-for="icon in icons" :key="icon.name"
                class="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-surface-secondary transition-colors">
                <component :is="icon.component" class="h-5 w-5 text-on-surface" />
                <span class="text-[10px] text-on-surface-muted text-center">{{ icon.name.replace('Icon', '') }}</span>
              </div>
            </div>
          </template>
        </ComponentCard>
      </template>

  </TabGroup>
</template>
