# E2E Tests

End-to-end tests for the `@asgardeo/react` SDK using [Playwright](https://playwright.dev). Tests run against WSO2 Identity
Server and cover both redirect-based OAuth and embedded `<SignIn />` component flows.

## Prerequisites

- **Docker** — used to run the IDP containers
- **pnpm** — workspace package manager
- **Playwright Chromium** — install with `pnpm e2e:install`

## Quick Start

```bash
# 1. Install Playwright browsers
pnpm e2e:install

# 2. Start IDP containers
pnpm e2e:docker:up

# 3. Wait for containers to be healthy, then run tests
pnpm e2e -- --idp is
```

## Running Tests

All e2e tests are run via a single script:

```bash
pnpm e2e -- [--idp is] [--mode redirect|embedded|all] [--headed]
```

| Flag       | Values                        | Default    | Description                |
| ---------- | ----------------------------- | ---------- | -------------------------- |
| `--idp`    | `is`                          | `is`       | Which IDP to test against  |
| `--mode`   | `redirect`, `embedded`, `all` | `redirect` | Sign-in mode to test       |
| `--headed` | _(flag)_                      | off        | Run in headed browser mode |

### Examples

```bash
# IS redirect tests (default)
pnpm e2e

# All modes, headed
pnpm e2e -- --mode all --headed

# IS both modes
pnpm e2e -- --idp is --mode all
```

### Docker Commands

```bash
pnpm e2e:docker:up          # Start the IDP container
pnpm e2e:docker:down        # Stop and remove all containers + volumes
pnpm e2e:docker:up:is       # Start only WSO2 IS
```

## Sign-In Modes

The sample app (`teamspace-react`) supports two sign-in modes, controlled by the presence of the `signInUrl` prop in
`AsgardeoProvider`:

- **Redirect** — No `signInUrl` set. `SignInPage` calls `signIn()` which redirects the browser to the IDP's login page.
  After authentication, the IDP redirects back with an authorization code.
- **Embedded** — `signInUrl` is set (via `VITE_ASGARDEO_SIGN_IN_URL`). `SignInPage` renders the SDK's `<SignIn />`
  component inline, which communicates directly with the IDP without leaving the app.

The e2e launch script (`e2e/setup/launch-dev-server.ts`) writes the `.env` file before starting Vite. For embedded mode,
it includes `VITE_ASGARDEO_SIGN_IN_URL`; for redirect mode, it omits it.

## Project Structure

```
e2e/
├── docker-compose.yml              # IDP container definitions
├── playwright.redirect.config.ts   # Playwright config for redirect tests
├── playwright.embedded.config.ts   # Playwright config for embedded tests
├── scripts/
│   └── run-e2e.sh                  # Test runner script
├── setup/
│   ├── launch-dev-server.ts        # IDP setup + .env writer + Vite launcher
│   ├── constants.ts                # Shared constants (sample app URLs, test user)
│   ├── global-teardown.ts          # Cleanup after test run
│   ├── wait-for-idp.ts             # Health-check poller
│   ├── http-utils.ts               # HTTP helpers for setup APIs
│   └── is/
│       ├── constants.ts            # IS-specific config
│       ├── app-registration.ts     # DCR + Application Management API
│       └── user-provisioning.ts    # SCIM2 test user creation
├── fixtures/
│   └── base.fixture.ts             # Shared Playwright test fixture
├── helpers/
│   ├── auth-helpers.ts             # IDP-agnostic sign-in/sign-out helpers
│   ├── selectors.ts                # Shared UI selectors (SDK components, dashboard)
│   └── is/
│       ├── auth-helpers.ts         # IS login page interaction
│       └── selectors.ts           # IS-specific selectors
├── tests/
│   └── is/
│       ├── redirect/
│       │   ├── sign-in.spec.ts     # IS redirect sign-in tests
│       │   ├── sign-out.spec.ts    # IS sign-out tests
│       │   └── user-profile.spec.ts
│       └── embedded/
│           └── sign-in.spec.ts     # IS embedded sign-in tests
```

## Test Coverage

| Test                                      | IS  |
| ----------------------------------------- | --- |
| Redirect to IDP login page                | Yes |
| Sign in with valid credentials (redirect) | Yes |
| Redirect unauthenticated users to IDP     | Yes |
| Sign out and redirect to landing page     | Yes |
| Block protected routes after sign out     | Yes |
| Render embedded `<SignIn />` component    | Yes |
| Sign in via embedded component            | Yes |
| Display user profile                      | Yes |
| Navigate back from profile                | Yes |

## How It Works

1. **`pnpm e2e`** calls `e2e/scripts/run-e2e.sh` which sets `IDP_TARGET` and picks the right Playwright config.
2. Playwright's `webServer` runs `e2e/setup/launch-dev-server.ts` which:
   - Waits for the IDP container to be healthy
   - Registers an OAuth app via the IDP's management API
   - Provisions a test user
   - Writes `.env` to the sample app directory (with or without `VITE_ASGARDEO_SIGN_IN_URL` based on mode)
   - Starts the Vite dev server
3. Playwright runs the test specs against the sample app.
4. Global teardown cleans up.
