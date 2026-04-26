<script setup lang="ts">
import { ref } from 'vue';
import {
  Button,
  TextField,
  PasswordField,
  Select,
  Checkbox,
  DatePicker,
  OtpField,
  Card,
  Alert,
  Typography,
  Spinner,
  Logo,
  Divider,
  UserIcon,
  EyeIcon,
  EyeOffIcon,
  ChevronDownIcon,
  CheckIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  XIcon,
  PlusIcon,
  LogOutIcon,
  ArrowLeftRightIcon,
  BuildingIcon,
  GlobeIcon,
  PencilIcon,
} from '@asgardeo/vue';
import SectionCard from '../layout/SectionCard.vue';

// ── Button ──
const btnVariant = ref<'solid' | 'outline' | 'ghost' | 'text'>('solid');
const btnColor = ref<'primary' | 'secondary' | 'danger'>('primary');
const btnSize = ref<'small' | 'medium' | 'large'>('medium');
const btnDisabled = ref(false);
const btnLoading = ref(false);
const btnFullWidth = ref(false);

// ── TextField ──
const tfValue = ref('');
const tfType = ref<'text' | 'email' | 'number' | 'tel' | 'url'>('text');
const tfPlaceholder = ref('Enter value');
const tfRequired = ref(false);
const tfDisabled = ref(false);
const tfError = ref('');

// ── PasswordField ──
const pfValue = ref('');
const pfPlaceholder = ref('Enter password');
const pfRequired = ref(false);
const pfDisabled = ref(false);

// ── Select ──
const selValue = ref('');
const selPlaceholder = ref('Choose an option');
const selRequired = ref(false);
const selDisabled = ref(false);
const selOptions = [
  { value: 'vue', label: 'Vue' },
  { value: 'react', label: 'React' },
  { value: 'angular', label: 'Angular' },
];

// ── Checkbox ──
const cbChecked = ref(false);
const cbLabel = ref('I agree to the terms');
const cbRequired = ref(false);
const cbDisabled = ref(false);

// ── DatePicker ──
const dpValue = ref('');
const dpLabel = ref('Select date');
const dpRequired = ref(false);
const dpDisabled = ref(false);

// ── OtpField ──
const otpValue = ref('');
const otpLength = ref(6);
const otpRequired = ref(false);
const otpDisabled = ref(false);

// ── Card ──
const cardVariant = ref<'elevated' | 'outlined' | 'flat'>('elevated');

// ── Alert ──
const alertSeverity = ref<'success' | 'error' | 'warning' | 'info'>('info');
const alertDismissible = ref(false);
const alertText = ref('This is an alert message.');
const alertVisible = ref(true);

// ── Typography ──
const typoVariant = ref<'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'subtitle1' | 'subtitle2' | 'caption' | 'overline'>('body1');

// ── Spinner ──
const spinnerSize = ref<'small' | 'medium' | 'large'>('medium');

// ── Logo ──
const logoSrc = ref('https://wso2.cachefly.net/wso2/sites/images/brand/downloads/wso2-logo.png');
const logoAlt = ref('Logo');

const controlClass = 'w-full rounded border border-border-hover bg-surface-secondary px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-accent-500';

const icons = [
  { name: 'UserIcon', component: UserIcon },
  { name: 'EyeIcon', component: EyeIcon },
  { name: 'EyeOffIcon', component: EyeOffIcon },
  { name: 'ChevronDownIcon', component: ChevronDownIcon },
  { name: 'CheckIcon', component: CheckIcon },
  { name: 'CircleAlertIcon', component: CircleAlertIcon },
  { name: 'CircleCheckIcon', component: CircleCheckIcon },
  { name: 'InfoIcon', component: InfoIcon },
  { name: 'TriangleAlertIcon', component: TriangleAlertIcon },
  { name: 'XIcon', component: XIcon },
  { name: 'PlusIcon', component: PlusIcon },
  { name: 'LogOutIcon', component: LogOutIcon },
  { name: 'ArrowLeftRightIcon', component: ArrowLeftRightIcon },
  { name: 'BuildingIcon', component: BuildingIcon },
  { name: 'GlobeIcon', component: GlobeIcon },
  { name: 'PencilIcon', component: PencilIcon },
];
</script>

<template>
  <div class="space-y-6">

    <!-- Button -->
    <SectionCard title="Button">
      <div class="grid md:grid-cols-2 gap-6">
        <div class="flex items-center justify-center min-h-[80px] bg-surface-muted rounded-lg p-6">
          <Button
            :variant="btnVariant"
            :color="btnColor"
            :size="btnSize"
            :disabled="btnDisabled"
            :loading="btnLoading"
            :fullWidth="btnFullWidth"
          >
            Click Me
          </Button>
        </div>
        <div class="space-y-2">
          <label class="block text-xs text-on-surface-muted">variant
            <select v-model="btnVariant" :class="controlClass">
              <option>solid</option><option>outline</option><option>ghost</option><option>text</option>
            </select>
          </label>
          <label class="block text-xs text-on-surface-muted">color
            <select v-model="btnColor" :class="controlClass">
              <option>primary</option><option>secondary</option><option>danger</option>
            </select>
          </label>
          <label class="block text-xs text-on-surface-muted">size
            <select v-model="btnSize" :class="controlClass">
              <option>small</option><option>medium</option><option>large</option>
            </select>
          </label>
          <label class="flex items-center gap-2 text-xs text-on-surface-muted cursor-pointer">
            <input type="checkbox" v-model="btnDisabled" /> disabled
          </label>
          <label class="flex items-center gap-2 text-xs text-on-surface-muted cursor-pointer">
            <input type="checkbox" v-model="btnLoading" /> loading
          </label>
          <label class="flex items-center gap-2 text-xs text-on-surface-muted cursor-pointer">
            <input type="checkbox" v-model="btnFullWidth" /> fullWidth
          </label>
        </div>
      </div>
    </SectionCard>

    <!-- TextField -->
    <SectionCard title="TextField">
      <div class="grid md:grid-cols-2 gap-6">
        <div class="flex items-center justify-center min-h-[80px] bg-surface-muted rounded-lg p-6">
          <TextField
            v-model="tfValue"
            name="demo-tf"
            label="Label"
            :type="tfType"
            :placeholder="tfPlaceholder"
            :required="tfRequired"
            :disabled="tfDisabled"
            :error="tfError || undefined"
            class="w-full"
          />
        </div>
        <div class="space-y-2">
          <label class="block text-xs text-on-surface-muted">type
            <select v-model="tfType" :class="controlClass">
              <option>text</option><option>email</option><option>number</option><option>tel</option><option>url</option>
            </select>
          </label>
          <label class="block text-xs text-on-surface-muted">placeholder
            <input v-model="tfPlaceholder" type="text" :class="controlClass" />
          </label>
          <label class="block text-xs text-on-surface-muted">error text
            <input v-model="tfError" type="text" :class="controlClass" placeholder="Leave empty for none" />
          </label>
          <label class="flex items-center gap-2 text-xs text-on-surface-muted cursor-pointer">
            <input type="checkbox" v-model="tfRequired" /> required
          </label>
          <label class="flex items-center gap-2 text-xs text-on-surface-muted cursor-pointer">
            <input type="checkbox" v-model="tfDisabled" /> disabled
          </label>
        </div>
      </div>
    </SectionCard>

    <!-- PasswordField -->
    <SectionCard title="PasswordField">
      <div class="grid md:grid-cols-2 gap-6">
        <div class="flex items-center justify-center min-h-[80px] bg-surface-muted rounded-lg p-6">
          <PasswordField
            v-model="pfValue"
            name="demo-pf"
            label="Password"
            :placeholder="pfPlaceholder"
            :required="pfRequired"
            :disabled="pfDisabled"
            class="w-full"
          />
        </div>
        <div class="space-y-2">
          <label class="block text-xs text-on-surface-muted">placeholder
            <input v-model="pfPlaceholder" type="text" :class="controlClass" />
          </label>
          <label class="flex items-center gap-2 text-xs text-on-surface-muted cursor-pointer">
            <input type="checkbox" v-model="pfRequired" /> required
          </label>
          <label class="flex items-center gap-2 text-xs text-on-surface-muted cursor-pointer">
            <input type="checkbox" v-model="pfDisabled" /> disabled
          </label>
        </div>
      </div>
    </SectionCard>

    <!-- Select -->
    <SectionCard title="Select">
      <div class="grid md:grid-cols-2 gap-6">
        <div class="flex items-center justify-center min-h-[80px] bg-surface-muted rounded-lg p-6">
          <Select
            v-model="selValue"
            name="demo-select"
            label="Framework"
            :options="selOptions"
            :placeholder="selPlaceholder"
            :required="selRequired"
            :disabled="selDisabled"
            class="w-full"
          />
        </div>
        <div class="space-y-2">
          <label class="block text-xs text-on-surface-muted">placeholder
            <input v-model="selPlaceholder" type="text" :class="controlClass" />
          </label>
          <label class="flex items-center gap-2 text-xs text-on-surface-muted cursor-pointer">
            <input type="checkbox" v-model="selRequired" /> required
          </label>
          <label class="flex items-center gap-2 text-xs text-on-surface-muted cursor-pointer">
            <input type="checkbox" v-model="selDisabled" /> disabled
          </label>
        </div>
      </div>
    </SectionCard>

    <!-- Checkbox -->
    <SectionCard title="Checkbox">
      <div class="grid md:grid-cols-2 gap-6">
        <div class="flex items-center justify-center min-h-[80px] bg-surface-muted rounded-lg p-6">
          <Checkbox
            v-model="cbChecked"
            name="demo-cb"
            :label="cbLabel"
            :required="cbRequired"
            :disabled="cbDisabled"
          />
        </div>
        <div class="space-y-2">
          <label class="block text-xs text-on-surface-muted">label
            <input v-model="cbLabel" type="text" :class="controlClass" />
          </label>
          <label class="flex items-center gap-2 text-xs text-on-surface-muted cursor-pointer">
            <input type="checkbox" v-model="cbRequired" /> required
          </label>
          <label class="flex items-center gap-2 text-xs text-on-surface-muted cursor-pointer">
            <input type="checkbox" v-model="cbDisabled" /> disabled
          </label>
        </div>
      </div>
    </SectionCard>

    <!-- DatePicker -->
    <SectionCard title="DatePicker">
      <div class="grid md:grid-cols-2 gap-6">
        <div class="flex items-center justify-center min-h-[80px] bg-surface-muted rounded-lg p-6">
          <DatePicker
            v-model="dpValue"
            name="demo-dp"
            :label="dpLabel"
            :required="dpRequired"
            :disabled="dpDisabled"
            class="w-full"
          />
        </div>
        <div class="space-y-2">
          <label class="block text-xs text-on-surface-muted">label
            <input v-model="dpLabel" type="text" :class="controlClass" />
          </label>
          <label class="flex items-center gap-2 text-xs text-on-surface-muted cursor-pointer">
            <input type="checkbox" v-model="dpRequired" /> required
          </label>
          <label class="flex items-center gap-2 text-xs text-on-surface-muted cursor-pointer">
            <input type="checkbox" v-model="dpDisabled" /> disabled
          </label>
        </div>
      </div>
    </SectionCard>

    <!-- OtpField -->
    <SectionCard title="OtpField">
      <div class="grid md:grid-cols-2 gap-6">
        <div class="flex items-center justify-center min-h-[80px] bg-surface-muted rounded-lg p-6">
          <OtpField
            v-model="otpValue"
            name="demo-otp"
            label="Enter OTP"
            :length="otpLength"
            :required="otpRequired"
            :disabled="otpDisabled"
          />
        </div>
        <div class="space-y-2">
          <label class="block text-xs text-on-surface-muted">length
            <input v-model.number="otpLength" type="number" min="4" max="8" :class="controlClass" />
          </label>
          <label class="flex items-center gap-2 text-xs text-on-surface-muted cursor-pointer">
            <input type="checkbox" v-model="otpRequired" /> required
          </label>
          <label class="flex items-center gap-2 text-xs text-on-surface-muted cursor-pointer">
            <input type="checkbox" v-model="otpDisabled" /> disabled
          </label>
        </div>
      </div>
    </SectionCard>

    <!-- Card -->
    <SectionCard title="Card">
      <div class="grid md:grid-cols-2 gap-6">
        <div class="flex items-center justify-center min-h-[80px] bg-surface-muted rounded-lg p-6">
          <Card :variant="cardVariant" class="w-full">
            <p class="text-sm text-on-surface">Card content goes here. This is a sample card using the SDK's Card primitive.</p>
          </Card>
        </div>
        <div class="space-y-2">
          <label class="block text-xs text-on-surface-muted">variant
            <select v-model="cardVariant" :class="controlClass">
              <option>elevated</option><option>outlined</option><option>flat</option>
            </select>
          </label>
        </div>
      </div>
    </SectionCard>

    <!-- Alert -->
    <SectionCard title="Alert">
      <div class="grid md:grid-cols-2 gap-6">
        <div class="flex items-center justify-center min-h-[80px] bg-surface-muted rounded-lg p-6">
          <Alert
            v-if="alertVisible"
            :severity="alertSeverity"
            :dismissible="alertDismissible"
            @dismiss="alertVisible = false"
            class="w-full"
          >
            {{ alertText }}
          </Alert>
          <button v-else type="button" class="text-sm text-accent-600 underline" @click="alertVisible = true">
            Reset
          </button>
        </div>
        <div class="space-y-2">
          <label class="block text-xs text-on-surface-muted">severity
            <select v-model="alertSeverity" :class="controlClass">
              <option>success</option><option>error</option><option>warning</option><option>info</option>
            </select>
          </label>
          <label class="block text-xs text-on-surface-muted">text
            <input v-model="alertText" type="text" :class="controlClass" />
          </label>
          <label class="flex items-center gap-2 text-xs text-on-surface-muted cursor-pointer">
            <input type="checkbox" v-model="alertDismissible" /> dismissible
          </label>
        </div>
      </div>
    </SectionCard>

    <!-- Typography -->
    <SectionCard title="Typography">
      <div class="grid md:grid-cols-2 gap-6">
        <div class="flex items-center justify-center min-h-[80px] bg-surface-muted rounded-lg p-6 overflow-hidden">
          <Typography :variant="typoVariant">The quick brown fox jumps over the lazy dog</Typography>
        </div>
        <div class="space-y-2">
          <label class="block text-xs text-on-surface-muted">variant
            <select v-model="typoVariant" :class="controlClass">
              <option>h1</option><option>h2</option><option>h3</option><option>h4</option>
              <option>h5</option><option>h6</option><option>body1</option><option>body2</option>
              <option>subtitle1</option><option>subtitle2</option><option>caption</option><option>overline</option>
            </select>
          </label>
        </div>
      </div>
    </SectionCard>

    <!-- Spinner -->
    <SectionCard title="Spinner">
      <div class="grid md:grid-cols-2 gap-6">
        <div class="flex items-center justify-center min-h-[80px] bg-surface-muted rounded-lg p-6">
          <Spinner :size="spinnerSize" />
        </div>
        <div class="space-y-2">
          <label class="block text-xs text-on-surface-muted">size
            <select v-model="spinnerSize" :class="controlClass">
              <option>small</option><option>medium</option><option>large</option>
            </select>
          </label>
        </div>
      </div>
    </SectionCard>

    <!-- Logo -->
    <SectionCard title="Logo">
      <div class="grid md:grid-cols-2 gap-6">
        <div class="flex items-center justify-center min-h-[80px] bg-surface-muted rounded-lg p-6">
          <Logo :src="logoSrc" :alt="logoAlt" />
        </div>
        <div class="space-y-2">
          <label class="block text-xs text-on-surface-muted">src
            <input v-model="logoSrc" type="url" :class="controlClass" />
          </label>
          <label class="block text-xs text-on-surface-muted">alt
            <input v-model="logoAlt" type="text" :class="controlClass" />
          </label>
        </div>
      </div>
    </SectionCard>

    <!-- Divider -->
    <SectionCard title="Divider">
      <div class="bg-surface-muted rounded-lg p-6">
        <p class="text-sm text-on-surface-secondary mb-3">Content above</p>
        <Divider />
        <p class="text-sm text-on-surface-secondary mt-3">Content below</p>
      </div>
    </SectionCard>

    <!-- Icons -->
    <SectionCard title="Icons" description="All 16 available icons from @asgardeo/vue.">
      <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
        <div
          v-for="icon in icons"
          :key="icon.name"
          class="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-surface-muted transition-colors"
        >
          <component :is="icon.component" class="h-5 w-5 text-on-surface" />
          <span class="text-xs text-on-surface-muted text-center break-all">{{ icon.name.replace('Icon', '') }}</span>
        </div>
      </div>
    </SectionCard>

  </div>
</template>
