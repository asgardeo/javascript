/**
 * Single source of truth for everything the `@asgardeo/nuxt` module exposes.
 *
 * Both the sidebar and the section overview pages read from this file. When the
 * SDK adds, renames, or removes an export, edit ONE entry here and every
 * navigation item + overview row updates automatically.
 *
 * Grouping mirrors the plan in
 * docs/developer/nuxtjs-sdk-playground-navigation-restructure-plan.md.
 */

// ── Shared types ───────────────────────────────────────────────────────────

export type Surface =
  | 'component'
  | 'composable'
  | 'middleware'
  | 'server-route'
  | 'server-utility'
  | 'utility'
  | 'error'
  | 'type';

export interface SdkExport {
  /** Identifier as it appears in `import { X } from '@asgardeo/nuxt'`. */
  name: string;
  /** One-line description — shown on sidebar and overview cards. */
  description: string;
  /** Playground page that demos this export. */
  path: string;
}

export interface SdkGroup<T = SdkExport> {
  key: string;
  label: string;
  description: string;
  path: string;
  items: T[];
}

// ── Components ─────────────────────────────────────────────────────────────

export const componentGroups: SdkGroup[] = [
  {
    key: 'auth',
    label: 'Auth',
    description: 'Full-page sign-in / sign-up / callback primitives.',
    path: '/components/auth',
    items: [
      { name: 'SignIn',   description: 'Renders the Asgardeo sign-in screen inline.',  path: '/components/auth#signin'   },
      { name: 'SignUp',   description: 'Renders the Asgardeo sign-up screen inline.',  path: '/components/auth#signup'   },
      { name: 'Callback', description: 'Handles the post-redirect callback exchange.', path: '/components/auth#callback' },
    ],
  },
  {
    key: 'control',
    label: 'Control',
    description: 'Gate content on authentication state.',
    path: '/components/control',
    items: [
      { name: 'SignedIn',  description: 'Renders its slot only when the user is signed in.', path: '/components/control#signedin'  },
      { name: 'SignedOut', description: 'Renders its slot only when the user is signed out.', path: '/components/control#signedout' },
      { name: 'Loading',   description: 'Renders its slot while the SDK initializes.',       path: '/components/control#loading'   },
    ],
  },
  {
    key: 'actions',
    label: 'Actions',
    description: 'Pre-wired buttons for sign-in / sign-up / sign-out.',
    path: '/components/actions',
    items: [
      { name: 'SignInButton',  description: 'Button that triggers the redirect sign-in flow.',  path: '/components/actions#signin'  },
      { name: 'SignUpButton',  description: 'Button that triggers the redirect sign-up flow.',  path: '/components/actions#signup'  },
      { name: 'SignOutButton', description: 'Button that triggers the sign-out flow.',          path: '/components/actions#signout' },
    ],
  },
  {
    key: 'user',
    label: 'User',
    description: 'Display and edit the signed-in user.',
    path: '/components/user',
    items: [
      { name: 'User',         description: 'Headless / slot-based access to the current user.', path: '/components/user#user'         },
      { name: 'UserProfile',  description: 'Renders the user profile form.',                     path: '/components/user#profile'      },
      { name: 'UserDropdown', description: 'Avatar + menu for the current user.',                path: '/components/user#dropdown'     },
    ],
  },
  {
    key: 'organization',
    label: 'Organization',
    description: 'Multi-tenant organization UI.',
    path: '/components/organization',
    items: [
      { name: 'Organization',         description: 'Current organization context wrapper.', path: '/components/organization#organization'     },
      { name: 'OrganizationList',     description: 'Lists organizations the user belongs to.', path: '/components/organization#list'           },
      { name: 'OrganizationProfile',  description: 'Renders an organization profile view.', path: '/components/organization#profile'           },
      { name: 'OrganizationSwitcher', description: 'Switch the active organization.',        path: '/components/organization#switcher'          },
      { name: 'CreateOrganization',   description: 'Form to create a new organization.',     path: '/components/organization#create'            },
    ],
  },
];

// ── Composables ────────────────────────────────────────────────────────────

export const composables: SdkExport[] = [
  { name: 'useAsgardeo',     description: 'Core auth state and actions — isSignedIn, signIn, signOut, tokens.', path: '/composables/asgardeo'     },
  { name: 'useUser',         description: 'User profile data and updates.',                                      path: '/composables/user'         },
  { name: 'useOrganization', description: 'Organization context and switching.',                                 path: '/composables/organization' },
  { name: 'useFlow',         description: 'Authentication flow UI state.',                                       path: '/composables/flow'         },
  { name: 'useTheme',        description: 'Theme and color-scheme control.',                                     path: '/composables/theme'        },
  { name: 'useBranding',     description: 'Asgardeo branding preferences.',                                      path: '/composables/branding'     },
  { name: 'useAsgardeoI18n', description: 'Internationalization helpers.',                                       path: '/composables/i18n'         },
];

// ── Middleware ─────────────────────────────────────────────────────────────

export const middleware: SdkExport[] = [
  { name: 'auth (named)',             description: 'Named middleware — protects a page from unauthenticated access.',                                   path: '/middleware/protected' },
  { name: 'defineAsgardeoMiddleware', description: 'Factory for typed route middleware with requireOrganization / requireScopes options.',              path: '/middleware/factory'   },
  { name: 'Global middleware',        description: 'createRouteMatcher pattern — protect all routes matching a pattern from a single global middleware.', path: '/middleware/global'    },
];

// ── Server: built-in /api/auth/* routes ────────────────────────────────────

export interface ServerRoute {
  method: 'GET' | 'POST' | 'PATCH';
  path: string;
  description: string;
  /** Playground page demonstrating the route in isolation. */
  page: string;
  /** Composable that typically invokes this route, if any. */
  composable?: string;
}

export interface ServerRouteDomain {
  key: 'session' | 'user' | 'organizations' | 'branding';
  label: string;
  description: string;
  routes: ServerRoute[];
}

export const serverRoutes: ServerRouteDomain[] = [
  {
    key: 'session',
    label: 'Session',
    description: 'Auth flow and session / token endpoints.',
    routes: [
      { method: 'GET',  path: '/api/auth/signin',   description: 'Start the redirect sign-in flow.',        page: '/server/routes/session/signin',   composable: 'useAsgardeo().signIn()'  },
      { method: 'GET',  path: '/api/auth/callback', description: 'OAuth callback — exchanges the code.',    page: '/server/routes/session/callback', composable: '(called by Asgardeo)'    },
      { method: 'POST', path: '/api/auth/signout',  description: 'Clear the session cookie.',               page: '/server/routes/session/signout',  composable: 'useAsgardeo().signOut()' },
      { method: 'GET',  path: '/api/auth/session',  description: 'Return the decoded session payload.',     page: '/server/routes/session/session',  composable: 'useAsgardeo().isSignedIn' },
      { method: 'GET',  path: '/api/auth/token',    description: 'Return a fresh access token.',            page: '/server/routes/session/token',    composable: 'getValidAccessToken()'   },
    ],
  },
  {
    key: 'user',
    label: 'User',
    description: 'Current-user info and profile management.',
    routes: [
      { method: 'GET',   path: '/api/auth/user',          description: 'Basic user info from the session.',    page: '/server/routes/user/user',          composable: 'useUser().profile'           },
      { method: 'GET',   path: '/api/auth/user/profile',  description: 'Full SCIM2 profile.',                   page: '/server/routes/user/profile-get',   composable: 'useUser().revalidateProfile()' },
      { method: 'PATCH', path: '/api/auth/user/profile',  description: 'Update the profile via SCIM2 PatchOp.', page: '/server/routes/user/profile-patch', composable: 'useUser().updateProfile()'   },
    ],
  },
  {
    key: 'organizations',
    label: 'Organizations',
    description: 'Multi-tenant organization endpoints.',
    routes: [
      { method: 'GET',  path: '/api/auth/organizations',         description: 'List all organizations.',                  page: '/server/routes/organizations/list',    composable: 'useOrganization().getAllOrganizations()' },
      { method: 'POST', path: '/api/auth/organizations',         description: 'Create a new organization.',                page: '/server/routes/organizations/create',  composable: 'useOrganization().createOrganization()'  },
      { method: 'GET',  path: '/api/auth/organizations/me',      description: 'Organizations the current user belongs to.', page: '/server/routes/organizations/me',     composable: 'useOrganization().myOrganizations'       },
      { method: 'GET',  path: '/api/auth/organizations/current', description: 'The currently active organization.',         page: '/server/routes/organizations/current', composable: 'useOrganization().currentOrganization'   },
      { method: 'GET',  path: '/api/auth/organizations/:id',     description: 'Get a single organization by ID.',           page: '/server/routes/organizations/by-id',   composable: '—' },
      { method: 'POST', path: '/api/auth/organizations/switch',  description: 'Switch the active organization.',            page: '/server/routes/organizations/switch',  composable: 'useOrganization().onOrganizationSwitch()'  },
    ],
  },
  {
    key: 'branding',
    label: 'Branding',
    description: 'Organization branding preferences.',
    routes: [
      { method: 'GET', path: '/api/auth/branding', description: 'Current branding preference.', page: '/server/routes/branding', composable: 'useBranding().revalidateBranding()' },
    ],
  },
];

// ── Server utilities ──────────────────────────────────────────────────────

export const serverUtilities: SdkExport[] = [
  { name: 'useServerSession',     description: 'Read the signed session cookie inside a Nitro handler.',                 path: '/server/utilities/session'         },
  { name: 'requireServerSession', description: 'Assert the session exists; throws 401 if not signed in.',                path: '/server/utilities/require-session' },
  { name: 'getValidAccessToken',  description: 'Return a guaranteed-fresh access token (silent refresh).',               path: '/server/utilities/token'   },
  { name: 'getAsgardeoContext',   description: 'Typed accessor for event.context.asgardeo — session, isSignedIn, ssr.', path: '/server/utilities/context' },
];

// ── Reference — errors ──────────────────────────────────────────────────

export const referenceErrors: SdkExport[] = [
  { name: 'AsgardeoError', description: 'Base error class thrown by the SDK.',    path: '/reference/errors#AsgardeoError' },
  { name: 'ErrorCode',     description: 'Enum of every error code the SDK emits.', path: '/reference/errors#ErrorCode'     },
];
