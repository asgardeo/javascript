export type ComponentKind = 'ui' | 'control' | 'data' | 'behavioural';

export type ComponentPropType = 'string' | 'boolean' | 'number' | 'select' | 'string-array' | 'json';

export interface PropSpec {
  name: string;
  type: ComponentPropType;
  description: string;
  default?: unknown;
  options?: Array<{ label: string; value: string }>;
  chipPool?: string[];
}

export interface SlotVariant {
  key: string;
  label: string;
  /**
   * Returns a render payload for the slot preset.
   * The concrete shape is component-specific and interpreted by preview templates.
   */
  render: (scope: Record<string, unknown>) => unknown;
}

export interface ComponentSpec {
  name: string;
  kind: ComponentKind;
  description: string;
  requiresSignIn?: boolean;
  requiresOrganization?: boolean;
  layout?: 'split' | 'stacked';
  props: PropSpec[];
  slotVariants?: SlotVariant[];
  scopedSlotShape?: { default?: string; fallback?: string };
}

export interface ComponentCategorySpec {
  key: string;
  label: string;
  description: string;
  components: ComponentSpec[];
}

const profileFieldPool: string[] = ['userName', 'givenName', 'familyName', 'email', 'phoneNumbers'];

const cloneDefault = (value: unknown): unknown => {
  if (value === undefined || value === null) {
    return value;
  }

  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value)) as unknown;
};

export const buildPropsDefaults = (specs: PropSpec[]): Record<string, unknown> =>
  specs.reduce<Record<string, unknown>>((acc, spec) => {
    acc[spec.name] = cloneDefault(spec.default);
    return acc;
  }, {});

export const componentCategories: ComponentCategorySpec[] = [
  {
    key: 'auth',
    label: 'Auth',
    description: 'Full-page sign-in, sign-up, and callback primitives.',
    components: [
      {
        name: 'AsgardeoSignIn',
        kind: 'ui',
        description: 'Embedded sign-in container for app-native authentication flows.',
        props: [
          {
            name: 'className',
            type: 'string',
            description: 'Additional class name for sign-in container styling.',
            default: '',
          },
          {
            name: 'size',
            type: 'select',
            description: 'Size of the embedded sign-in UI.',
            default: 'medium',
            options: [
              {label: 'Small', value: 'small'},
              {label: 'Medium', value: 'medium'},
              {label: 'Large', value: 'large'},
            ],
          },
          {
            name: 'variant',
            type: 'select',
            description: 'Visual variant applied to the sign-in container.',
            default: 'outlined',
            options: [
              {label: 'Elevated', value: 'elevated'},
              {label: 'Outlined', value: 'outlined'},
              {label: 'Flat', value: 'flat'},
            ],
          },
        ],
      },
      {
        name: 'AsgardeoSignUp',
        kind: 'ui',
        description: 'Embedded sign-up flow with configurable labels, styles, and redirect behavior.',
        props: [
          {
            name: 'afterSignUpUrl',
            type: 'string',
            description: 'External URL used after successful sign-up when redirect is enabled.',
            default: undefined,
          },
          {
            name: 'className',
            type: 'string',
            description: 'Custom wrapper class name for the sign-up component.',
            default: '',
          },
          {
            name: 'buttonClassName',
            type: 'string',
            description: 'Custom class name for action buttons in sign-up UI.',
            default: '',
          },
          {
            name: 'inputClassName',
            type: 'string',
            description: 'Custom class name for form inputs in sign-up UI.',
            default: '',
          },
          {
            name: 'errorClassName',
            type: 'string',
            description: 'Custom class name for error messages.',
            default: '',
          },
          {
            name: 'messageClassName',
            type: 'string',
            description: 'Custom class name for helper and informational messages.',
            default: '',
          },
          {
            name: 'shouldRedirectAfterSignUp',
            type: 'boolean',
            description: 'Whether to redirect automatically after sign-up completion.',
            default: true,
          },
          {
            name: 'showSubtitle',
            type: 'boolean',
            description: 'Whether to show subtitle text in embedded sign-up UI.',
            default: true,
          },
          {
            name: 'showTitle',
            type: 'boolean',
            description: 'Whether to show title text in embedded sign-up UI.',
            default: true,
          },
          {
            name: 'size',
            type: 'select',
            description: 'Size of the embedded sign-up UI.',
            default: 'medium',
            options: [
              {label: 'Small', value: 'small'},
              {label: 'Medium', value: 'medium'},
              {label: 'Large', value: 'large'},
            ],
          },
          {
            name: 'variant',
            type: 'select',
            description: 'Visual variant applied to the sign-up container.',
            default: 'outlined',
            options: [
              {label: 'Elevated', value: 'elevated'},
              {label: 'Outlined', value: 'outlined'},
              {label: 'Flat', value: 'flat'},
            ],
          },
        ],
      },
      {
        name: 'AsgardeoCallback',
        kind: 'behavioural',
        description: 'Headless callback handler that validates OAuth params and forwards auth codes.',
        props: [],
      },
    ],
  },
  {
    key: 'control',
    label: 'Control',
    description: 'Authentication-state wrappers and guards.',
    components: [
      {
        name: 'AsgardeoSignedIn',
        kind: 'control',
        description: 'Renders #default for authenticated users and #fallback for signed-out state.',
        props: [],
        scopedSlotShape: {
          default: 'VNode[]',
          fallback: 'VNode[]',
        },
        slotVariants: [
          {
            key: 'plain-text',
            label: 'Plain text',
            render: () => ({
              defaultText: 'Authenticated content is visible.',
              fallbackText: 'Sign in required to view content.',
            }),
          },
          {
            key: 'status-badge',
            label: 'Status badge',
            render: () => ({
              defaultText: 'Signed in session detected.',
              fallbackText: 'Session unavailable.',
              defaultBadge: true,
            }),
          },
        ],
      },
      {
        name: 'AsgardeoSignedOut',
        kind: 'control',
        description: 'Renders #default while signed out and #fallback for authenticated sessions.',
        props: [],
        scopedSlotShape: {
          default: 'VNode[]',
          fallback: 'VNode[]',
        },
        slotVariants: [
          {
            key: 'plain-text',
            label: 'Plain text',
            render: () => ({
              defaultText: 'Guest-only content is visible.',
              fallbackText: 'Already signed in.',
            }),
          },
          {
            key: 'cta-hint',
            label: 'Call-to-action hint',
            render: () => ({
              defaultText: 'Sign in to unlock protected screens.',
              fallbackText: 'Signed-in users skip this block.',
            }),
          },
        ],
      },
      {
        name: 'AsgardeoLoading',
        kind: 'control',
        description: 'Renders #default while SDK is initializing and #fallback when ready.',
        props: [],
        scopedSlotShape: {
          default: 'VNode[]',
          fallback: 'VNode[]',
        },
        slotVariants: [
          {
            key: 'spinner-fallback',
            label: 'Spinner + fallback',
            render: () => ({
              defaultText: 'Loading SDK state...',
              fallbackText: 'SDK ready.',
              showSpinner: true,
            }),
          },
          {
            key: 'skeleton-fallback',
            label: 'Skeleton + fallback',
            render: () => ({
              defaultText: 'Preparing authentication context...',
              fallbackText: 'Initialization complete.',
            }),
          },
        ],
      },
    ],
  },
  {
    key: 'actions',
    label: 'Actions',
    description: 'Action buttons for sign-in, sign-out, and sign-up.',
    components: [
      {
        name: 'AsgardeoSignInButton',
        kind: 'ui',
        description: 'Triggers redirect sign-in flow with optional sign-in options.',
        props: [
          {
            name: 'signInOptions',
            type: 'json',
            description: 'Optional sign-in options payload forwarded to signIn().',
            default: undefined,
          },
        ],
        slotVariants: [
          {
            key: 'default',
            label: 'Default',
            render: (scope) => ({
              className: 'px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors',
              label: scope['isLoading'] ? 'Redirecting...' : 'Log in',
            }),
          },
          {
            key: 'custom-with-spinner',
            label: 'Custom with spinner',
            render: (scope) => ({
              className: 'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors',
              label: scope['isLoading'] ? 'Redirecting...' : 'Log in with Asgardeo',
              showSpinner: true,
            }),
          },
          {
            key: 'outlined',
            label: 'Outlined',
            render: (scope) => ({
              className: 'px-4 py-2 text-sm font-medium bg-surface border-2 border-accent-600 text-accent-600 rounded-md hover:bg-accent-50 transition-colors',
              label: scope['isLoading'] ? 'Redirecting...' : 'Sign in',
            }),
          },
        ],
      },
      {
        name: 'AsgardeoSignOutButton',
        kind: 'ui',
        description: 'Signs the current user out and clears the session.',
        props: [],
        slotVariants: [
          {
            key: 'default',
            label: 'Default',
            render: (scope) => ({
              className: 'px-4 py-2 text-sm font-medium bg-surface border border-border text-text rounded-md hover:bg-surface-muted transition-colors',
              label: scope['isLoading'] ? 'Signing out...' : 'Sign out',
            }),
          },
          {
            key: 'danger-inline',
            label: 'Danger inline',
            render: (scope) => ({
              className: 'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-danger/10 text-danger border border-danger/30 rounded-md hover:bg-danger/20 transition-colors',
              label: scope['isLoading'] ? 'Signing out...' : '-> Sign out',
              showSpinner: true,
            }),
          },
        ],
      },
      {
        name: 'AsgardeoSignUpButton',
        kind: 'ui',
        description: 'Starts sign-up redirect flow for account creation.',
        props: [],
        slotVariants: [
          {
            key: 'default',
            label: 'Default',
            render: (scope) => ({
              className: 'px-4 py-2 text-sm font-medium bg-surface border border-border text-text rounded-md hover:bg-surface-muted transition-colors',
              label: scope['isLoading'] ? 'Redirecting...' : 'Sign up',
            }),
          },
          {
            key: 'success-inline',
            label: 'Success inline',
            render: (scope) => ({
              className: 'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-success/10 text-success border border-success/30 rounded-md hover:bg-success/20 transition-colors',
              label: scope['isLoading'] ? 'Redirecting...' : 'Create an account',
            }),
          },
        ],
      },
    ],
  },
  {
    key: 'user',
    label: 'User',
    description: 'User data and user-facing profile components.',
    components: [
      {
        name: 'AsgardeoUser',
        kind: 'data',
        description: 'Exposes current user object through scoped #default slot with optional #fallback.',
        props: [],
        scopedSlotShape: {
          default: '{ user: Record<string, unknown> }',
          fallback: 'VNode[]',
        },
        slotVariants: [
          {
            key: 'name-only',
            label: 'Name only',
            render: () => ({mode: 'name-only'}),
          },
          {
            key: 'name-email',
            label: 'Name + email',
            render: () => ({mode: 'name-email'}),
          },
          {
            key: 'raw-json',
            label: 'Raw JSON',
            render: () => ({mode: 'raw-json'}),
          },
        ],
      },
      {
        name: 'AsgardeoUserProfile',
        kind: 'ui',
        description: 'Prebuilt profile card supporting read-only and editable modes.',
        requiresSignIn: true,
        props: [
          {
            name: 'cardLayout',
            type: 'boolean',
            description: 'Render profile in card layout when enabled.',
            default: true,
          },
          {
            name: 'className',
            type: 'string',
            description: 'Additional custom class for the profile container.',
            default: '',
          },
          {
            name: 'editable',
            type: 'boolean',
            description: 'Allow inline profile edits when enabled.',
            default: true,
          },
          {
            name: 'hideFields',
            type: 'string-array',
            description: 'Profile field keys to hide from rendered profile card.',
            default: [],
            chipPool: profileFieldPool,
          },
          {
            name: 'showFields',
            type: 'string-array',
            description: 'Optional whitelist of profile fields to render.',
            default: [],
            chipPool: profileFieldPool,
          },
          {
            name: 'title',
            type: 'string',
            description: 'Title shown above the profile component.',
            default: 'Profile',
          },
        ],
      },
      {
        name: 'AsgardeoUserDropdown',
        kind: 'ui',
        description: 'Avatar dropdown menu with profile and sign-out actions.',
        requiresSignIn: true,
        props: [
          {
            name: 'className',
            type: 'string',
            description: 'Custom class for the dropdown trigger container.',
            default: '',
          },
        ],
      },
    ],
  },
  {
    key: 'organization',
    label: 'Organization',
    description: 'Organization data, list, switching, and creation components.',
    components: [
      {
        name: 'AsgardeoOrganization',
        kind: 'data',
        description: 'Exposes current organization through scoped #default slot and #fallback when unavailable.',
        props: [],
        scopedSlotShape: {
          default: '{ organization: Record<string, unknown> }',
          fallback: 'VNode[]',
        },
        slotVariants: [
          {
            key: 'name-only',
            label: 'Name only',
            render: () => ({mode: 'name-only'}),
          },
          {
            key: 'name-id',
            label: 'Name + ID',
            render: () => ({mode: 'name-id'}),
          },
          {
            key: 'raw-json',
            label: 'Raw JSON',
            render: () => ({mode: 'raw-json'}),
          },
          {
            key: 'nested-signed-in',
            label: 'Nested with SignedIn',
            render: () => ({mode: 'nested-signed-in'}),
          },
        ],
      },
      {
        name: 'AsgardeoOrganizationList',
        kind: 'ui',
        description: 'Displays organizations available to the current signed-in user.',
        requiresSignIn: true,
        props: [
          {
            name: 'className',
            type: 'string',
            description: 'Custom class for list wrapper styling.',
            default: '',
          },
        ],
      },
      {
        name: 'AsgardeoOrganizationProfile',
        kind: 'ui',
        description: 'Renders organization profile details for the active organization.',
        requiresSignIn: true,
        props: [
          {
            name: 'className',
            type: 'string',
            description: 'Custom class for profile container styling.',
            default: '',
          },
          {
            name: 'editable',
            type: 'boolean',
            description: 'Enable editable organization profile mode.',
            default: false,
          },
          {
            name: 'title',
            type: 'string',
            description: 'Profile section title displayed in the component header.',
            default: 'Organization Profile',
          },
        ],
      },
      {
        name: 'AsgardeoOrganizationSwitcher',
        kind: 'ui',
        description: 'Compact organization switcher for navigation bars and headers.',
        requiresSignIn: true,
        props: [
          {
            name: 'className',
            type: 'string',
            description: 'Custom class for switcher wrapper.',
            default: '',
          },
        ],
      },
      {
        name: 'AsgardeoCreateOrganization',
        kind: 'ui',
        description: 'Form for creating a new sub-organization from the playground.',
        requiresSignIn: true,
        props: [
          {
            name: 'className',
            type: 'string',
            description: 'Custom class name for create organization container.',
            default: '',
          },
          {
            name: 'title',
            type: 'string',
            description: 'Heading text displayed in create organization component.',
            default: 'Create Organization',
          },
          {
            name: 'description',
            type: 'string',
            description: 'Description text displayed below the heading.',
            default: 'Create a new sub-organization.',
          },
        ],
      },
    ],
  },
];

export const componentSpecByName: Record<string, ComponentSpec> = componentCategories.reduce<Record<string, ComponentSpec>>(
  (acc, category) => {
    for (const component of category.components) {
      acc[component.name] = component;
    }

    return acc;
  },
  {},
);
