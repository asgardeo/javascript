<script setup lang="ts">
import { computed, ref } from 'vue';
import ComponentCard from '~/components/components/ComponentCard.vue';
import ComponentTabNav from '~/components/components/ComponentTabNav.vue';
import { componentCategories, type ComponentSpec } from '~/utils/components-manifest';

const authCategory = computed(() => componentCategories.find((category) => category.key === 'auth'));
const authComponents = computed<ComponentSpec[]>(() => authCategory.value?.components ?? []);

const activeComponentName = ref<string>(authComponents.value[0]?.name ?? '');
const activeSpec = computed<ComponentSpec | undefined>(
  () => authComponents.value.find((c) => c.name === activeComponentName.value) ?? authComponents.value[0],
);

const signInProps = (propsState: Record<string, unknown>) => ({
  className: typeof propsState['className'] === 'string' ? propsState['className'] : '',
  size: typeof propsState['size'] === 'string' ? propsState['size'] : 'medium',
  variant: typeof propsState['variant'] === 'string' ? propsState['variant'] : 'outlined',
});

const signUpProps = (propsState: Record<string, unknown>) => ({
  afterSignUpUrl: typeof propsState['afterSignUpUrl'] === 'string' && propsState['afterSignUpUrl'].length > 0
    ? propsState['afterSignUpUrl']
    : undefined,
  className: typeof propsState['className'] === 'string' ? propsState['className'] : '',
  buttonClassName: typeof propsState['buttonClassName'] === 'string' ? propsState['buttonClassName'] : '',
  inputClassName: typeof propsState['inputClassName'] === 'string' ? propsState['inputClassName'] : '',
  errorClassName: typeof propsState['errorClassName'] === 'string' ? propsState['errorClassName'] : '',
  messageClassName: typeof propsState['messageClassName'] === 'string' ? propsState['messageClassName'] : '',
  shouldRedirectAfterSignUp: Boolean(propsState['shouldRedirectAfterSignUp']),
  showSubtitle: Boolean(propsState['showSubtitle']),
  showTitle: Boolean(propsState['showTitle']),
  size: typeof propsState['size'] === 'string' ? propsState['size'] : 'medium',
  variant: typeof propsState['variant'] === 'string' ? propsState['variant'] : 'outlined',
});
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="Auth Components"
      description="Component cards for embedded sign-in, embedded sign-up, and callback lifecycle guidance."
    />

    <div class="space-y-4">
      <ComponentTabNav :components="authComponents" v-model="activeComponentName" />

      <ComponentCard
        v-if="activeSpec"
        :key="activeSpec.name"
        :spec="activeSpec"
        :hide-customizer="activeSpec.kind === 'behavioural'"
      >
        <template #preview="{ propsState }">
          <div v-if="activeSpec.name === 'AsgardeoSignIn'" class="mx-auto w-full max-w-4xl">
            <AsgardeoSignIn v-bind="signInProps(propsState)" />
          </div>

          <div v-else-if="activeSpec.name === 'AsgardeoSignUp'" class="mx-auto w-full max-w-4xl">
            <AsgardeoSignUp v-bind="signUpProps(propsState)" />
          </div>

          <div v-else-if="activeSpec.name === 'AsgardeoCallback'" class="space-y-4 rounded-md border border-border bg-surface p-4">
            <div>
              <h4 class="text-sm font-semibold text-text">Where to mount this component</h4>
              <p class="mt-1 text-sm text-text-muted">
                Mount callback on the route you configured as the OAuth redirect URI. It validates state and forwards
                code/error parameters to the original path.
              </p>
            </div>

            <div class="rounded-md border border-border bg-surface-muted p-3">
              <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Callback lifecycle</p>
              <div class="grid gap-2 md:grid-cols-3">
                <div class="rounded-md border border-border bg-surface px-3 py-2 text-xs text-text">1. Identity provider redirects to callback route.</div>
                <div class="rounded-md border border-border bg-surface px-3 py-2 text-xs text-text">2. Component validates state and extracts code/error.</div>
                <div class="rounded-md border border-border bg-surface px-3 py-2 text-xs text-text">3. Component navigates back to the originating route.</div>
              </div>
            </div>

            <p class="text-xs text-text-muted">
              Related route:
              <NuxtLink to="/server/routes/session/callback" class="text-accent-600 hover:underline">
                GET /api/auth/callback
              </NuxtLink>
            </p>
          </div>

          <p v-else class="text-sm text-text-muted">Preview unavailable for this auth component.</p>
        </template>
      </ComponentCard>
    </div>
  </div>
</template>
