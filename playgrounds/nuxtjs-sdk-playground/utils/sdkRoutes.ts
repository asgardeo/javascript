/**
 * Typed helpers for every built-in SDK route under /api/auth/*.
 * Each page under /routes/... calls one of these instead of inlining the path,
 * so renaming a route costs one line here.
 */

// ── Session / Auth flow ────────────────────────────────────────────────────

/** GET /api/auth/session — returns current session state */
export const getSession = () => $fetch('/api/auth/session');

/** GET /api/auth/token — returns the current access token */
export const getToken = () => $fetch('/api/auth/token');

// ── User ──────────────────────────────────────────────────────────────────

/** GET /api/auth/user — returns basic user info */
export const getUser = () => $fetch('/api/auth/user');

/** GET /api/auth/user/profile — returns the full SCIM2 profile */
export const getUserProfile = () => $fetch('/api/auth/user/profile');

/** PATCH /api/auth/user/profile — updates the user profile via SCIM2 PatchOp */
export const patchUserProfile = (body: unknown) =>
  $fetch('/api/auth/user/profile', { method: 'PATCH', body });

// ── Organizations ─────────────────────────────────────────────────────────

/** GET /api/auth/organizations — list all organizations */
export const getOrganizations = (query?: {
  filter?: string;
  limit?: number;
  after?: string;
  before?: string;
}) => $fetch('/api/auth/organizations', { query });

/** POST /api/auth/organizations — create a new organization */
export const createOrganization = (body: {
  name: string;
  description?: string;
  parentId?: string;
}) => $fetch('/api/auth/organizations', { method: 'POST', body });

/** GET /api/auth/organizations/me — list organizations the current user belongs to */
export const getMyOrganizations = () => $fetch('/api/auth/organizations/me');

/** GET /api/auth/organizations/current — get the currently active organization */
export const getCurrentOrganization = () => $fetch('/api/auth/organizations/current');

/** GET /api/auth/organizations/:id — get a single organization by ID */
export const getOrganizationById = (id: string) =>
  $fetch(`/api/auth/organizations/${id}`);

/** POST /api/auth/organizations/switch — switch the active organization */
export const switchOrganization = (organization: string) =>
  $fetch('/api/auth/organizations/switch', { method: 'POST', body: { organization } });

// ── Branding ──────────────────────────────────────────────────────────────

/** GET /api/auth/branding — fetch the branding preference for the current organization */
export const getBranding = () => $fetch('/api/auth/branding');
