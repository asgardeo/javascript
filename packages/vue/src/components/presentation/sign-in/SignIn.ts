/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import {
  AsgardeoRuntimeError,
  EmbeddedFlowComponentV2 as EmbeddedFlowComponent,
  EmbeddedFlowType,
  EmbeddedSignInFlowRequestV2,
  EmbeddedSignInFlowResponseV2,
  EmbeddedSignInFlowStatusV2,
  EmbeddedSignInFlowTypeV2,
  FlowMetadataResponse,
} from '@asgardeo/browser';
import {
  type Component,
  type PropType,
  type Ref,
  type SetupContext,
  type VNode,
  defineComponent,
  h,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from 'vue';
import useAsgardeo from '../../../composables/useAsgardeo';
import useFlowMeta from '../../../composables/useFlowMeta';
import useI18n from '../../../composables/useI18n';
import {initiateOAuthRedirect} from '../../../utils/oauth';
import {normalizeFlowResponse} from '../../../utils/v2/flowTransformer';
import {handlePasskeyAuthentication, handlePasskeyRegistration} from '../../../utils/v2/passkey';
import BaseSignIn from './BaseSignIn';

const FLOW_ID_STORAGE_KEY = 'asgardeo_flow_id';
const AUTH_ID_STORAGE_KEY = 'asgardeo_auth_id';

interface PasskeyState {
  actionId: string | null;
  challenge: string | null;
  creationOptions: string | null;
  error: Error | null;
  flowId: string | null;
  isActive: boolean;
}

/**
 * Render props passed to the default scoped slot for custom UI rendering.
 */
export interface SignInRenderProps {
  additionalData?: Record<string, any>;
  components: EmbeddedFlowComponent[];
  error: Error | null;
  initialize: () => Promise<void>;
  isInitialized: boolean;
  isLoading: boolean;
  isTimeoutDisabled?: boolean;
  meta: FlowMetadataResponse | null;
  onSubmit: (payload: EmbeddedSignInFlowRequestV2) => Promise<void>;
}

/**
 * SignIn — app-native sign-in component with full flow lifecycle management.
 *
 * Initializes the authentication flow, handles passkey authentication/registration,
 * OAuth redirect flows, and renders the UI via `BaseSignIn` or a scoped slot.
 *
 * @example
 * ```vue
 * <!-- Default UI -->
 * <SignIn
 *   @success="(data) => console.log('Authenticated:', data)"
 *   @error="(err) => console.error('Auth failed:', err)"
 * />
 *
 * <!-- Custom UI via scoped slot -->
 * <SignIn v-slot="{ components, onSubmit, isLoading, error }">
 *   <!-- your custom sign-in UI here -->
 * </SignIn>
 * ```
 */
const SignIn: Component = defineComponent({
  emits: ['error', 'success'],
  name: 'SignIn',
  props: {
    className: {default: '', type: String},
    size: {
      default: 'medium',
      type: String as PropType<'small' | 'medium' | 'large'>,
    },
    variant: {
      default: 'outlined',
      type: String as PropType<'elevated' | 'outlined' | 'flat'>,
    },
  },
  setup(
    props: Readonly<{className: string; size: 'small' | 'medium' | 'large'; variant: 'elevated' | 'outlined' | 'flat'}>,
    {slots, emit, attrs}: SetupContext,
  ): () => VNode | null {
    const {applicationId, afterSignInUrl, signIn, isInitialized, isLoading: sdkLoading} = useAsgardeo();
    const {meta: flowMeta} = useFlowMeta();
    const {t} = useI18n();

    // Flow state
    const components: Ref<EmbeddedFlowComponent[]> = ref([]);
    const additionalData: Ref<Record<string, any>> = ref({});
    const currentFlowId: Ref<string | null> = ref(null);
    const isFlowInitialized: Ref<boolean> = ref(false);
    const flowError: Ref<Error | null> = ref(null);
    const isSubmitting: Ref<boolean> = ref(false);
    const isTimeoutDisabled: Ref<boolean> = ref(false);
    const passkeyState: Ref<PasskeyState> = ref({
      actionId: null,
      challenge: null,
      creationOptions: null,
      error: null,
      flowId: null,
      isActive: false,
    });

    // Track one-time initialization and OAuth processing
    let initializationAttempted = false;
    let oauthCodeProcessed = false;
    let passkeyProcessed = false;

    // ── Helpers ──────────────────────────────────────────────────────────

    const persistFlowId = (flowId: string | null): void => {
      currentFlowId.value = flowId;
      if (flowId) {
        sessionStorage.setItem(FLOW_ID_STORAGE_KEY, flowId);
      } else {
        sessionStorage.removeItem(FLOW_ID_STORAGE_KEY);
      }
    };

    const clearFlowState = (): void => {
      persistFlowId(null);
      isFlowInitialized.value = false;
      sessionStorage.removeItem(AUTH_ID_STORAGE_KEY);
      isTimeoutDisabled.value = false;
      oauthCodeProcessed = false;
    };

    interface UrlParams {
      applicationId: string | null;
      authId: string | null;
      code: string | null;
      error: string | null;
      errorDescription: string | null;
      flowId: string | null;
      nonce: string | null;
      state: string | null;
    }

    const getUrlParams = (): UrlParams => {
      const params = new URLSearchParams(window?.location?.search ?? '');
      return {
        applicationId: params.get('applicationId'),
        authId: params.get('authId'),
        code: params.get('code'),
        error: params.get('error'),
        errorDescription: params.get('error_description'),
        flowId: params.get('flowId'),
        nonce: params.get('nonce'),
        state: params.get('state'),
      };
    };

    const cleanupOAuthUrlParams = (): void => {
      if (!window?.location?.href) return;
      const url = new URL(window.location.href);
      ['error', 'error_description', 'code', 'state', 'nonce'].forEach((p) => url.searchParams.delete(p));
      window.history.replaceState({}, '', url.toString());
    };

    const cleanupFlowUrlParams = (): void => {
      if (!window?.location?.href) return;
      const url = new URL(window.location.href);
      ['flowId', 'authId', 'applicationId'].forEach((p) => url.searchParams.delete(p));
      window.history.replaceState({}, '', url.toString());
    };

    const setError = (error: Error): void => {
      flowError.value = error;
      isFlowInitialized.value = true;
      emit('error', error);
    };

    // ── Flow initialization ───────────────────────────────────────────────

    const initializeFlow = async (): Promise<void> => {
      const urlParams = getUrlParams();

      oauthCodeProcessed = false;

      if (urlParams.authId) {
        sessionStorage.setItem(AUTH_ID_STORAGE_KEY, urlParams.authId);
      }

      const effectiveApplicationId = (applicationId as string | undefined) || urlParams.applicationId;

      if (!urlParams.flowId && !effectiveApplicationId) {
        const err = new AsgardeoRuntimeError(
          'Either flowId or applicationId is required for authentication',
          'SIGN_IN_ERROR',
          'vue',
        );
        setError(err);
        throw err;
      }

      try {
        flowError.value = null;

        let response: EmbeddedSignInFlowResponseV2;

        if (urlParams.flowId) {
          response = (await signIn({flowId: urlParams.flowId})) as EmbeddedSignInFlowResponseV2;
        } else {
          response = (await signIn({
            applicationId: effectiveApplicationId,
            flowType: EmbeddedFlowType.Authentication,
          })) as EmbeddedSignInFlowResponseV2;
        }

        // Handle OAuth redirect types
        if (response.type === EmbeddedSignInFlowTypeV2.Redirection) {
          const redirectURL = (response.data as any)?.redirectURL || (response as any)?.redirectURL;
          if (redirectURL && window?.location) {
            if (response.flowId) persistFlowId(response.flowId);
            if (urlParams.authId) sessionStorage.setItem(AUTH_ID_STORAGE_KEY, urlParams.authId);
            initiateOAuthRedirect(redirectURL);
            return;
          }
        }

        const {
          flowId: normalizedFlowId,
          components: normalizedComponents,
          additionalData: normalizedAdditionalData,
        } = normalizeFlowResponse(response, t, {resolveTranslations: false}, flowMeta.value);

        if (normalizedFlowId && normalizedComponents) {
          persistFlowId(normalizedFlowId);
          components.value = normalizedComponents;
          additionalData.value = normalizedAdditionalData ?? {};
          isFlowInitialized.value = true;
          isTimeoutDisabled.value = false;
          cleanupFlowUrlParams();
        }
      } catch (error: unknown) {
        const err = error as any;
        clearFlowState();
        const errorMessage = err?.failureReason || (err instanceof Error ? err.message : String(err));
        setError(new Error(errorMessage));
        initializationAttempted = false;
      }
    };

    // ── Submit handler ────────────────────────────────────────────────────

    const handleSubmit = async (payload: EmbeddedSignInFlowRequestV2): Promise<void> => {
      const effectiveFlowId = payload.flowId || currentFlowId.value;

      if (!effectiveFlowId) {
        throw new Error('No active flow ID');
      }

      const processedInputs: Record<string, any> = {...payload.inputs};

      // Auto-compile consent decisions if on a consent prompt step
      if (additionalData.value?.['consentPrompt']) {
        try {
          const consentRaw = additionalData.value['consentPrompt'];
          const purposes: any[] =
            typeof consentRaw === 'string' ? JSON.parse(consentRaw) : consentRaw.purposes || consentRaw;

          let isDeny = false;
          if (payload.action) {
            const findAction = (comps: any[]): any => {
              if (!comps?.length) return null;
              const found = comps.find((c: any) => c.id === payload.action);
              if (found) return found;
              return comps.reduce((acc: any, c: any) => (acc ? acc : c.components ? findAction(c.components) : null), null);
            };
            const submitAction = findAction(components.value as any[]);
            if (submitAction && submitAction.variant?.toLowerCase() !== 'primary') {
              isDeny = true;
            }
          }

          const decisions = {
            purposes: purposes.map((p: any) => ({
              approved: !isDeny,
              elements: [
                ...(p.essential || []).map((attr: string) => ({approved: !isDeny, name: attr})),
                ...(p.optional || []).map((attr: string) => {
                  const key = `__consent_opt__${p.purpose_id}__${attr}`;
                  return {approved: isDeny ? false : processedInputs[key] !== 'false', name: attr};
                }),
              ],
              purpose_name: p.purpose_name,
            })),
          };
          processedInputs['consent_decisions'] = JSON.stringify(decisions);

          Object.keys(processedInputs).forEach((key: string) => {
            if (key.startsWith('__consent_opt__')) delete processedInputs[key];
          });
        } catch {
          // Ignore consent construction failures
        }
      }

      try {
        isSubmitting.value = true;
        flowError.value = null;

        const response = (await signIn({
          flowId: effectiveFlowId,
          ...payload,
          inputs: processedInputs,
        })) as EmbeddedSignInFlowResponseV2;

        // Handle OAuth redirect
        if (response.type === EmbeddedSignInFlowTypeV2.Redirection) {
          const redirectURL = (response.data as any)?.redirectURL || (response as any)?.redirectURL;
          if (redirectURL && window?.location) {
            if (response.flowId) persistFlowId(response.flowId);
            const urlParams = getUrlParams();
            if (urlParams.authId) sessionStorage.setItem(AUTH_ID_STORAGE_KEY, urlParams.authId);
            initiateOAuthRedirect(redirectURL);
            return;
          }
        }

        // Handle passkey challenge in response
        if (
          response.data?.additionalData?.['passkeyChallenge'] ||
          response.data?.additionalData?.['passkeyCreationOptions']
        ) {
          const {passkeyChallenge, passkeyCreationOptions} = response.data.additionalData as any;
          passkeyProcessed = false;
          passkeyState.value = {
            actionId: 'submit',
            challenge: passkeyChallenge || null,
            creationOptions: passkeyCreationOptions || null,
            error: null,
            flowId: response.flowId || effectiveFlowId,
            isActive: true,
          };
          isSubmitting.value = false;
          return;
        }

        const {
          flowId: normalizedFlowId,
          components: normalizedComponents,
          additionalData: normalizedAdditionalData,
        } = normalizeFlowResponse(response, t, {resolveTranslations: false}, flowMeta.value);

        // Handle error flow status
        if (response.flowStatus === EmbeddedSignInFlowStatusV2.Error) {
          clearFlowState();
          const failureReason = (response as any)?.failureReason || 'Authentication flow failed. Please try again.';
          const err = new Error(failureReason);
          setError(err);
          cleanupFlowUrlParams();
          throw err;
        }

        // Handle flow completion
        if (response.flowStatus === EmbeddedSignInFlowStatusV2.Complete) {
          const redirectUrl = (response as any)?.redirectUrl || (response as any)?.redirect_uri;
          const finalRedirectUrl = redirectUrl || afterSignInUrl;

          isSubmitting.value = false;
          persistFlowId(null);
          isFlowInitialized.value = false;
          sessionStorage.removeItem(AUTH_ID_STORAGE_KEY);
          cleanupOAuthUrlParams();

          emit('success', {
            redirectUrl: finalRedirectUrl,
            ...(response.data || {}),
          });

          if (finalRedirectUrl && window?.location) {
            window.location.href = finalRedirectUrl;
          }
          return;
        }

        // Update flow state for next step
        if (normalizedFlowId && normalizedComponents) {
          persistFlowId(normalizedFlowId);
          components.value = normalizedComponents;
          additionalData.value = normalizedAdditionalData ?? {};
          isTimeoutDisabled.value = false;
          isFlowInitialized.value = true;
          cleanupFlowUrlParams();

          if ((response as any)?.failureReason) {
            flowError.value = new Error((response as any).failureReason);
          }
        }
      } catch (error: unknown) {
        const err = error as any;
        if (err instanceof Error && flowError.value === err) {
          // Already set; re-throw
          throw err;
        }
        clearFlowState();
        const errorMessage = err?.failureReason || (err instanceof Error ? err.message : String(err));
        setError(new Error(errorMessage));
      } finally {
        isSubmitting.value = false;
      }
    };

    // ── Step timeout ──────────────────────────────────────────────────────

    let timeoutHandle: ReturnType<typeof setTimeout> | null = null;

    const scheduleTimeout = (timeoutMs: number): void => {
      if (timeoutHandle) clearTimeout(timeoutHandle);
      if (timeoutMs <= 0 || !isFlowInitialized.value) {
        isTimeoutDisabled.value = false;
        return;
      }
      const remaining = Math.max(0, Math.floor((timeoutMs - Date.now()) / 1000));
      if (remaining <= 0) {
        isTimeoutDisabled.value = true;
        setError(new Error(t('errors.signin.timeout') || 'Time allowed to complete the step has expired.'));
        return;
      }
      timeoutHandle = setTimeout(() => {
        isTimeoutDisabled.value = true;
        setError(new Error(t('errors.signin.timeout') || 'Time allowed to complete the step has expired.'));
      }, remaining * 1000);
    };

    watch(
      () => [additionalData.value?.['stepTimeout'], isFlowInitialized.value] as [number | undefined, boolean],
      ([timeoutMs]: [number | undefined, boolean]) => {
        scheduleTimeout(Number(timeoutMs) || 0);
      },
    );

    onUnmounted(() => {
      if (timeoutHandle) clearTimeout(timeoutHandle);
    });

    // ── Passkey processing ────────────────────────────────────────────────

    watch(
      () => passkeyState.value,
      async (state: PasskeyState) => {
        if (!state.isActive || (!state.challenge && !state.creationOptions) || !state.flowId) return;
        if (passkeyProcessed) return;
        passkeyProcessed = true;

        try {
          let inputs: Record<string, string>;

          if (state.challenge) {
            const passkeyResponse = await handlePasskeyAuthentication(state.challenge);
            const obj = JSON.parse(passkeyResponse);
            inputs = {
              authenticatorData: obj.response.authenticatorData,
              clientDataJSON: obj.response.clientDataJSON,
              credentialId: obj.id,
              signature: obj.response.signature,
              userHandle: obj.response.userHandle,
            };
          } else if (state.creationOptions) {
            const passkeyResponse = await handlePasskeyRegistration(state.creationOptions);
            const obj = JSON.parse(passkeyResponse);
            inputs = {
              attestationObject: obj.response.attestationObject,
              clientDataJSON: obj.response.clientDataJSON,
              credentialId: obj.id,
            };
          } else {
            throw new Error('No passkey challenge or creation options available');
          }

          await handleSubmit({flowId: state.flowId!, inputs});

          passkeyState.value = {
            actionId: null,
            challenge: null,
            creationOptions: null,
            error: null,
            flowId: null,
            isActive: false,
          };
        } catch (error: unknown) {
          const err = error as Error;
          passkeyState.value = {...passkeyState.value, error: err, isActive: false};
          flowError.value = err;
          emit('error', err);
        }
      },
      {deep: true},
    );

    // ── OAuth callback ────────────────────────────────────────────────────

    const processOAuthCallback = async (): Promise<void> => {
      if (!isInitialized.value || isSubmitting.value || oauthCodeProcessed) return;

      const urlParams = getUrlParams();

      if (urlParams.error) {
        oauthCodeProcessed = true;
        const err = new Error(urlParams.errorDescription || urlParams.error || 'OAuth authentication failed');
        clearFlowState();
        setError(err);
        cleanupOAuthUrlParams();
        return;
      }

      if (!urlParams.code) return;

      const storedFlowId = sessionStorage.getItem(FLOW_ID_STORAGE_KEY);
      const flowIdToUse = currentFlowId.value || storedFlowId || urlParams.flowId || urlParams.state || null;

      if (!flowIdToUse) {
        oauthCodeProcessed = true;
        setError(new Error('Invalid flow. Missing flowId.'));
        cleanupOAuthUrlParams();
        return;
      }

      oauthCodeProcessed = true;
      if (!currentFlowId.value) persistFlowId(flowIdToUse);

      try {
        await handleSubmit({
          flowId: flowIdToUse,
          inputs: {
            code: urlParams.code,
            ...(urlParams.nonce ? {nonce: urlParams.nonce} : {}),
          },
        });
      } catch {
        // Error already handled in handleSubmit
      } finally {
        cleanupOAuthUrlParams();
      }
    };

    // ── Lifecycle ─────────────────────────────────────────────────────────

    onMounted(() => {
      const urlParams = getUrlParams();

      if (urlParams.error) {
        clearFlowState();
        const err = new Error(urlParams.errorDescription || urlParams.error || 'OAuth error');
        setError(err);
        return;
      }

      if (urlParams.authId) {
        sessionStorage.setItem(AUTH_ID_STORAGE_KEY, urlParams.authId);
      }
    });

    // Initialize flow when SDK is ready
    watch(
      () => [isInitialized.value, sdkLoading.value, isFlowInitialized.value, currentFlowId.value, isSubmitting.value] as [boolean, boolean, boolean, string | null, boolean],
      ([initialized, loading, flowInit, flowId, submitting]: [boolean, boolean, boolean, string | null, boolean]) => {
        const urlParams = getUrlParams();
        const hasOAuthCode = !!urlParams.code;
        const hasOAuthState = !!urlParams.state;

        // Process OAuth callback when SDK is ready and we have a code
        if (initialized && !loading && (hasOAuthCode || hasOAuthState) && !oauthCodeProcessed && !submitting) {
          processOAuthCallback();
          return;
        }

        // Initialize flow when SDK is ready and no flow is active
        if (
          initialized &&
          !loading &&
          !flowInit &&
          !initializationAttempted &&
          !flowId &&
          !hasOAuthCode &&
          !hasOAuthState &&
          !submitting &&
          !oauthCodeProcessed
        ) {
          initializationAttempted = true;
          initializeFlow();
        }
      },
    );

    // ── Render ────────────────────────────────────────────────────────────

    return (): VNode | null => {
      const combinedIsLoading = sdkLoading.value || isSubmitting.value || !isInitialized.value;

      // Scoped slot / render props pattern
      if (slots['default']) {
        const renderProps: SignInRenderProps = {
          additionalData: additionalData.value,
          components: components.value,
          error: flowError.value,
          initialize: initializeFlow,
          isInitialized: isFlowInitialized.value,
          isLoading: combinedIsLoading,
          isTimeoutDisabled: isTimeoutDisabled.value,
          meta: flowMeta.value,
          onSubmit: handleSubmit,
        };
        return h('div', {}, slots['default'](renderProps));
      }

      // Default BaseSignIn rendering
      return h(BaseSignIn, {
        ...attrs,
        additionalData: additionalData.value,
        class: props.className,
        components: components.value,
        error: flowError.value,
        isLoading: combinedIsLoading || !isFlowInitialized.value,
        isTimeoutDisabled: isTimeoutDisabled.value,
        size: props.size,
        variant: props.variant,
        onError: (err: Error) => emit('error', err),
        onSubmit: handleSubmit,
      });
    };
  },
});

export default SignIn;
