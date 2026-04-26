export interface StateRow {
  name: string;
  type: string;
  description: string;
}

export interface FunctionParam {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'json' | 'select';
  description: string;
  options?: Array<{label: string; value: string}>;
  default?: unknown;
  required?: boolean;
}

export interface FunctionSpec {
  name: string;
  signature: string;
  description: string;
  params: FunctionParam[];
  formatResult?: (raw: unknown) => unknown;
}

export interface ComposableSpec {
  name: string;
  path: string;
  description: string;
  importSnippet: string;
  state: StateRow[];
  functions: FunctionSpec[];
}

export const composableSpecs: ComposableSpec[] = [
  {
    name: 'useAsgardeo',
    path: '/composables/asgardeo',
    description: 'Core authentication state and actions, plus token and HTTP helpers.',
    importSnippet: `const {
  isSignedIn,
  isLoading,
  isInitialized,
  clientId,
  baseUrl,
  applicationId,
  signInUrl,
  signUpUrl,
  instanceId,
  user,
  organization,
  organizationHandle,
  platform,
  meta,
  signIn,
  signOut,
  signUp,
  signInSilently,
  getAccessToken,
  getIdToken,
  getDecodedIdToken,
  exchangeToken,
  switchOrganization,
  clearSession,
  reInitialize,
  http,
  resolveFlowTemplateLiterals,
} = useAsgardeo();`,
    state: [
      {name: 'isSignedIn', type: 'Ref<boolean>', description: 'Whether an authenticated session is currently available.'},
      {name: 'isLoading', type: 'Ref<boolean>', description: 'True while auth state is initializing or mutating.'},
      {name: 'isInitialized', type: 'Ref<boolean>', description: 'True when provider bootstrapping has completed.'},
      {name: 'clientId', type: 'Ref<string>', description: 'Configured OAuth client ID.'},
      {name: 'baseUrl', type: 'Ref<string>', description: 'Asgardeo tenant base URL.'},
      {name: 'applicationId', type: 'Ref<string | undefined>', description: 'Optional application ID used for redirect helpers.'},
      {name: 'signInUrl', type: 'Ref<string | undefined>', description: 'Optional custom sign-in route override.'},
      {name: 'signUpUrl', type: 'Ref<string | undefined>', description: 'Optional custom sign-up route override.'},
      {name: 'instanceId', type: 'Ref<string | undefined>', description: 'Provider instance identifier.'},
      {name: 'user', type: 'Ref<User | null>', description: 'Signed-in user payload.'},
      {name: 'organization', type: 'Ref<Organization | null>', description: 'Currently active organization.'},
      {name: 'organizationHandle', type: 'Ref<string | null>', description: 'Current organization handle, if available.'},
      {name: 'platform', type: 'Ref<string | null>', description: 'Resolved platform mode for this SDK runtime.'},
      {name: 'meta', type: 'Ref<FlowMeta | null>', description: 'Flow metadata surfaced from FlowMetaProvider.'},
    ],
    functions: [
      {
        name: 'signIn',
        signature: '(options?: { returnTo?: string }) => Promise<void>',
        description: 'Starts redirect sign-in flow.',
        params: [
          {
            name: 'options',
            type: 'json',
            description: 'Optional redirect options. Supports returnTo.',
            required: false,
            default: {returnTo: '/composables/asgardeo'},
          },
        ],
      },
      {
        name: 'signOut',
        signature: '() => Promise<void>',
        description: 'Starts redirect sign-out flow.',
        params: [],
      },
      {
        name: 'signUp',
        signature: '() => Promise<void>',
        description: 'Starts redirect sign-up flow.',
        params: [],
      },
      {
        name: 'signInSilently',
        signature: '() => Promise<TokenResponse>',
        description: 'Performs silent sign-in and returns token payload.',
        params: [],
      },
      {
        name: 'getAccessToken',
        signature: '() => Promise<string>',
        description: 'Returns the current access token.',
        params: [],
      },
      {
        name: 'getIdToken',
        signature: '() => Promise<string>',
        description: 'Returns the current ID token.',
        params: [],
      },
      {
        name: 'getDecodedIdToken',
        signature: '() => Promise<Record<string, unknown>>',
        description: 'Returns decoded ID token claims.',
        params: [],
      },
      {
        name: 'exchangeToken',
        signature: '(config: TokenExchangeRequestConfig) => Promise<TokenResponse>',
        description: 'Performs OAuth token exchange using provided request config.',
        params: [
          {
            name: 'config',
            type: 'json',
            description: 'Token exchange request payload.',
            required: true,
          },
        ],
      },
      {
        name: 'switchOrganization',
        signature: '(organization: Organization) => Promise<void>',
        description: 'Switches active organization using selected organization object.',
        params: [
          {
            name: 'organization',
            type: 'select',
            description: 'Organization selected from myOrganizations.',
            required: true,
          },
        ],
      },
      {
        name: 'clearSession',
        signature: '() => Promise<void>',
        description: 'Clears local session state.',
        params: [],
      },
      {
        name: 'reInitialize',
        signature: '(config: Partial<AsgardeoVueConfig>) => Promise<void>',
        description: 'Re-initializes SDK state with partial runtime config overrides.',
        params: [
          {
            name: 'config',
            type: 'json',
            description: 'Partial Asgardeo config payload.',
            required: true,
          },
        ],
      },
      {
        name: 'http.request',
        signature: '(config: HttpRequestConfig) => Promise<unknown>',
        description: 'Runs a single authenticated HTTP request.',
        params: [
          {
            name: 'url',
            type: 'string',
            description: 'Target URL for request.',
            required: true,
          },
          {
            name: 'method',
            type: 'select',
            description: 'HTTP method.',
            options: [
              {label: 'GET', value: 'GET'},
              {label: 'POST', value: 'POST'},
              {label: 'PUT', value: 'PUT'},
              {label: 'PATCH', value: 'PATCH'},
              {label: 'DELETE', value: 'DELETE'},
            ],
            default: 'GET',
            required: true,
          },
          {
            name: 'body',
            type: 'json',
            description: 'Optional request body for write methods.',
            required: false,
          },
        ],
      },
      {
        name: 'http.requestAll',
        signature: '(requestConfigs: HttpRequestConfig[]) => Promise<unknown[]>',
        description: 'Runs multiple authenticated HTTP requests in a batch.',
        params: [
          {
            name: 'requestConfigs',
            type: 'json',
            description: 'Array of request configs.',
            required: true,
          },
        ],
      },
      {
        name: 'resolveFlowTemplateLiterals',
        signature: '(text: string) => string',
        description: 'Resolves flow template literals from current flow metadata context.',
        params: [
          {
            name: 'text',
            type: 'string',
            description: 'Text containing template placeholders.',
            required: true,
          },
        ],
      },
    ],
  },
  {
    name: 'useUser',
    path: '/composables/user',
    description: 'User profile retrieval, updates, and schema metadata.',
    importSnippet: `const {
  profile,
  flattenedProfile,
  schemas,
  revalidateProfile,
  updateProfile,
} = useUser();`,
    state: [
      {name: 'profile', type: 'Ref<Record<string, unknown> | null>', description: 'SCIM profile object from current session.'},
      {name: 'flattenedProfile', type: 'Ref<Record<string, unknown> | null>', description: 'Normalized profile object for easier UI binding.'},
      {name: 'schemas', type: 'Ref<string[] | null>', description: 'SCIM schema identifiers returned for the profile.'},
    ],
    functions: [
      {
        name: 'revalidateProfile',
        signature: '() => Promise<void>',
        description: 'Re-fetches latest profile data from API.',
        params: [],
      },
      {
        name: 'updateProfile',
        signature: '(requestConfig: UpdateMeProfileConfig, sessionId?: string) => Promise<void>',
        description: 'Updates current user profile using SCIM patch payload.',
        params: [
          {
            name: 'requestConfig',
            type: 'json',
            description: 'SCIM PatchOp request payload.',
            required: true,
          },
          {
            name: 'sessionId',
            type: 'string',
            description: 'Optional session identifier override.',
            required: false,
          },
        ],
      },
    ],
  },
  {
    name: 'useOrganization',
    path: '/composables/organization',
    description: 'Organization listing, switching, and creation helpers.',
    importSnippet: `const {
  currentOrganization,
  myOrganizations,
  isLoading,
  error,
  getAllOrganizations,
  revalidateMyOrganizations,
  switchOrganization,
  createOrganization,
} = useOrganization();`,
    state: [
      {name: 'currentOrganization', type: 'Ref<Organization | null>', description: 'Current active organization context.'},
      {name: 'myOrganizations', type: 'Ref<Organization[]>', description: 'Organizations available for the signed-in user.'},
      {name: 'isLoading', type: 'Ref<boolean>', description: 'True while organization calls are in progress.'},
      {name: 'error', type: 'Ref<string | null>', description: 'Latest organization operation error, if any.'},
    ],
    functions: [
      {
        name: 'getAllOrganizations',
        signature: '() => Promise<Organization[]>',
        description: 'Fetches all organizations visible to current user.',
        params: [],
      },
      {
        name: 'revalidateMyOrganizations',
        signature: '() => Promise<void>',
        description: 'Refreshes myOrganizations from API.',
        params: [],
      },
      {
        name: 'switchOrganization',
        signature: '(organization: Organization) => Promise<void>',
        description: 'Switches active organization for current session.',
        params: [
          {
            name: 'organization',
            type: 'select',
            description: 'Organization selected from myOrganizations.',
            required: true,
          },
        ],
      },
      {
        name: 'createOrganization',
        signature: '(payload: CreateOrganizationPayload, sessionId: string) => Promise<Organization>',
        description: 'Creates organization when context supports this optional capability.',
        params: [
          {
            name: 'payload',
            type: 'json',
            description: 'Organization creation request payload.',
            required: true,
          },
          {
            name: 'sessionId',
            type: 'string',
            description: 'Current session identifier used by backend route.',
            required: true,
          },
        ],
      },
    ],
  },
  {
    name: 'useFlow',
    path: '/composables/flow',
    description: 'Embedded flow state and flow mutation helpers.',
    importSnippet: `const {
  currentStep,
  isLoading,
  error,
  messages,
  title,
  subtitle,
  showBackButton,
  onGoBack,
  navigateToFlow,
  setCurrentStep,
  setTitle,
  setSubtitle,
  setError,
  setIsLoading,
  setShowBackButton,
  setOnGoBack,
  addMessage,
  removeMessage,
  clearMessages,
  reset,
} = useFlow();`,
    state: [
      {name: 'currentStep', type: 'Ref<FlowStep | null>', description: 'Current embedded flow step payload.'},
      {name: 'isLoading', type: 'Ref<boolean>', description: 'Global loading state for flow operations.'},
      {name: 'error', type: 'Ref<string | null>', description: 'Current flow-level error message.'},
      {name: 'messages', type: 'Ref<FlowMessage[]>', description: 'Collection of in-page flow messages.'},
      {name: 'title', type: 'Ref<string | null>', description: 'Optional flow title displayed in UI.'},
      {name: 'subtitle', type: 'Ref<string | null>', description: 'Optional flow subtitle displayed in UI.'},
      {name: 'showBackButton', type: 'Ref<boolean>', description: 'Controls visibility of back navigation affordance.'},
      {name: 'onGoBack', type: 'Ref<(() => void) | null>', description: 'Optional callback invoked when user goes back.'},
    ],
    functions: [
      {
        name: 'navigateToFlow',
        signature: '(flowType: string, title?: string, subtitle?: string, metadata?: Record<string, unknown>) => void',
        description: 'Navigates to a new flow type with optional heading and metadata.',
        params: [
          {name: 'flowType', type: 'select', description: 'Target flow type identifier.', required: true},
          {name: 'title', type: 'string', description: 'Optional flow title.', required: false},
          {name: 'subtitle', type: 'string', description: 'Optional flow subtitle.', required: false},
          {name: 'metadata', type: 'json', description: 'Optional metadata map.', required: false},
        ],
      },
      {
        name: 'setCurrentStep',
        signature: '(step: FlowStep) => void',
        description: 'Sets current embedded flow step payload.',
        params: [
          {name: 'step', type: 'json', description: 'Flow step object.', required: true},
        ],
      },
      {
        name: 'setTitle',
        signature: '(title: string) => void',
        description: 'Sets flow title text.',
        params: [
          {name: 'title', type: 'string', description: 'Title value.', required: true},
        ],
      },
      {
        name: 'setSubtitle',
        signature: '(subtitle?: string) => void',
        description: 'Sets flow subtitle text.',
        params: [
          {name: 'subtitle', type: 'string', description: 'Subtitle value.', required: false},
        ],
      },
      {
        name: 'setError',
        signature: '(error: string | null) => void',
        description: 'Sets or clears current flow error.',
        params: [
          {name: 'error', type: 'json', description: 'Error message string or null.', required: true},
        ],
      },
      {
        name: 'setIsLoading',
        signature: '(loading: boolean) => void',
        description: 'Sets flow loading state.',
        params: [
          {name: 'loading', type: 'boolean', description: 'Loading flag value.', required: true, default: false},
        ],
      },
      {
        name: 'setShowBackButton',
        signature: '(show: boolean) => void',
        description: 'Sets visibility of flow back button.',
        params: [
          {name: 'show', type: 'boolean', description: 'Whether back button should be shown.', required: true, default: false},
        ],
      },
      {
        name: 'setOnGoBack',
        signature: '(handler: () => void) => void',
        description: 'Registers callback fired when back action is requested.',
        params: [],
      },
      {
        name: 'addMessage',
        signature: '(message: string, type: "success" | "error" | "warning" | "info", id?: string, dismissible?: boolean) => void',
        description: 'Appends a flow message to messages list.',
        params: [
          {name: 'message', type: 'string', description: 'Message text.', required: true},
          {
            name: 'type',
            type: 'select',
            description: 'Message visual intent.',
            required: true,
            options: [
              {label: 'success', value: 'success'},
              {label: 'error', value: 'error'},
              {label: 'warning', value: 'warning'},
              {label: 'info', value: 'info'},
            ],
            default: 'info',
          },
          {name: 'id', type: 'string', description: 'Optional custom message ID.', required: false},
          {name: 'dismissible', type: 'boolean', description: 'Whether user can dismiss this message.', required: false, default: true},
        ],
      },
      {
        name: 'removeMessage',
        signature: '(messageId: string) => void',
        description: 'Removes a message by ID.',
        params: [
          {name: 'messageId', type: 'select', description: 'Existing message ID to remove.', required: true},
        ],
      },
      {
        name: 'clearMessages',
        signature: '() => void',
        description: 'Clears all flow messages.',
        params: [],
      },
      {
        name: 'reset',
        signature: '() => void',
        description: 'Resets flow state to defaults.',
        params: [],
      },
    ],
  },
  {
    name: 'useTheme',
    path: '/composables/theme',
    description: 'Theme state and theme toggling helper.',
    importSnippet: `const {
  colorScheme,
  direction,
  inheritFromBranding,
  isBrandingLoading,
  brandingError,
  theme,
  toggleTheme,
} = useTheme();`,
    state: [
      {name: 'colorScheme', type: 'Ref<"light" | "dark">', description: 'Current resolved color scheme.'},
      {name: 'direction', type: 'Ref<"ltr" | "rtl">', description: 'Current text direction.'},
      {name: 'inheritFromBranding', type: 'Ref<boolean>', description: 'Whether theme inherits from branding API values.'},
      {name: 'isBrandingLoading', type: 'Ref<boolean>', description: 'Branding fetch loading indicator used by theme context.'},
      {name: 'brandingError', type: 'Ref<Error | null>', description: 'Branding fetch error surfaced through theme context.'},
      {name: 'theme', type: 'Ref<Record<string, unknown>>', description: 'Fully resolved theme object.'},
    ],
    functions: [
      {
        name: 'toggleTheme',
        signature: '() => void',
        description: 'Toggles between light and dark color scheme.',
        params: [],
      },
    ],
  },
  {
    name: 'useBranding',
    path: '/composables/branding',
    description: 'Branding preference state and refetch helpers.',
    importSnippet: `const {
  activeTheme,
  brandingPreference,
  error,
  isLoading,
  theme,
  fetchBranding,
  refetch,
} = useBranding();`,
    state: [
      {name: 'activeTheme', type: 'Ref<string | null>', description: 'Active theme name resolved from branding preference.'},
      {name: 'brandingPreference', type: 'Ref<Record<string, unknown> | null>', description: 'Raw branding preference response payload.'},
      {name: 'error', type: 'Ref<string | null>', description: 'Latest branding operation error.'},
      {name: 'isLoading', type: 'Ref<boolean>', description: 'True while branding data is being fetched.'},
      {name: 'theme', type: 'Ref<Record<string, unknown> | null>', description: 'Resolved theme map derived from branding preference.'},
    ],
    functions: [
      {
        name: 'fetchBranding',
        signature: '() => Promise<void>',
        description: 'Fetches branding preference from server.',
        params: [],
      },
      {
        name: 'refetch',
        signature: '() => Promise<void>',
        description: 'Alias for refreshing branding preference state.',
        params: [],
      },
    ],
  },
  {
    name: 'useAsgardeoI18n',
    path: '/composables/i18n',
    description: 'Localized bundle state, language selection, and translation helper.',
    importSnippet: `const {
  bundles,
  currentLanguage,
  fallbackLanguage,
  t,
  setLanguage,
  injectBundles,
} = useAsgardeoI18n();`,
    state: [
      {name: 'bundles', type: 'Ref<Record<string, unknown>>', description: 'Loaded language bundles keyed by locale.'},
      {name: 'currentLanguage', type: 'Ref<string>', description: 'Currently active language code.'},
      {name: 'fallbackLanguage', type: 'string', description: 'Fallback language used when active translation key is missing.'},
    ],
    functions: [
      {
        name: 't',
        signature: '(key: string, params?: Record<string, string | number>) => string',
        description: 'Resolves translated string for a key and optional interpolation params.',
        params: [
          {name: 'key', type: 'string', description: 'Translation key.', required: true},
          {name: 'params', type: 'json', description: 'Optional interpolation map.', required: false},
        ],
      },
      {
        name: 'setLanguage',
        signature: '(language: string) => void',
        description: 'Sets active language from available bundles.',
        params: [
          {name: 'language', type: 'select', description: 'Language key from Object.keys(bundles).', required: true},
        ],
      },
      {
        name: 'injectBundles',
        signature: '(bundles: Record<string, I18nBundle>) => void',
        description: 'Merges additional language bundles into current dictionary.',
        params: [
          {name: 'bundles', type: 'json', description: 'Language bundle map.', required: true},
        ],
      },
    ],
  },
  {
    name: 'useFlowMeta',
    path: '/composables/flow-meta',
    description: 'Flow metadata state and localization controls for embedded flows.',
    importSnippet: `const {
  meta,
  isLoading,
  error,
  fetchFlowMeta,
  switchLanguage,
} = useFlowMeta();`,
    state: [
      {name: 'meta', type: 'Ref<Record<string, unknown> | null>', description: 'Current flow metadata payload.'},
      {name: 'isLoading', type: 'Ref<boolean>', description: 'True while flow metadata is being requested.'},
      {name: 'error', type: 'Ref<string | null>', description: 'Latest flow metadata error message.'},
    ],
    functions: [
      {
        name: 'fetchFlowMeta',
        signature: '() => Promise<void>',
        description: 'Fetches metadata for the active flow language.',
        params: [],
      },
      {
        name: 'switchLanguage',
        signature: '(language: string) => Promise<void>',
        description: 'Switches flow metadata language and refreshes meta payload.',
        params: [
          {name: 'language', type: 'string', description: 'Language code (for example: en-US, fr-FR).', required: true},
        ],
      },
    ],
  },
];

export const composableSpecByPath = Object.fromEntries(
  composableSpecs.map((spec) => [spec.path, spec]),
) as Record<string, ComposableSpec>;

export const composableSpecByName = Object.fromEntries(
  composableSpecs.map((spec) => [spec.name, spec]),
) as Record<string, ComposableSpec>;
