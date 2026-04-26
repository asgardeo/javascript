# Contributing to the Nuxt SDK Playground

This playground is the live documentation for [`@asgardeo/nuxt`](../../packages/nuxt/).
Every item a developer sees in the sidebar maps 1:1 to something the SDK exports or a route
it auto-registers. When you add a new SDK export, add it here too.

## The 15-minute rule

Adding a playground page for a new SDK export should take under 15 minutes. If it takes
longer, something in the pipeline is wrong — tell us, don't work around it.

## Where things live

```
pages/
  auth-flows/              Redirect + embedded end-to-end journeys
  components/              Component demos (one .vue per group)
  composables/             One .vue per composable
  middleware/              One .vue per middleware helper
  srv/                     ← Server pages live here (see note below)
    index.vue              Server overview  →  URL /server
    routes/                One .vue per /api/auth/* route  →  URL /server/routes/*
    utilities/             useServerSession, getValidAccessToken, AsgardeoNuxtClient  →  URL /server/utilities/*
  reference/               Non-composable utilities + errors
  playground/              Playground-only tools (state dump, preferences)

utils/
  sdk-manifest.ts          SINGLE SOURCE OF TRUTH for everything the SDK exposes
  sdkRoutes.ts             Typed $fetch helpers for /api/auth/* routes

components/
  layout/                  Page-chrome primitives (PageHeader, SectionCard, CodeBlock, TabGroup, Sidebar)
  shared/                  Demo primitives (CopyButton, ConfigRow, JsonViewer, ResultPanel, StatusBadge)
```

## Adding a demo page for a new SDK export

1. **Edit [`utils/sdk-manifest.ts`](utils/sdk-manifest.ts)** — add an entry to the group
   that matches your export's surface (`componentGroups`, `composables`, `middleware`,
   `serverRoutes`, `serverUtilities`, `referenceUtilities`, or `referenceErrors`).
2. **Create the page** at the `path` you declared in the manifest, using the
   existing neighbour pages as the template. Stick to this skeleton:
   - `LayoutPageHeader` — title + one-line description
   - `LayoutSectionCard` with `LayoutCodeBlock` — the import / usage snippet
   - A live demo — the component mounted or the composable's state rendered
   - (optional) Cross-links to related pages via `<NuxtLink>`
3. **Done.** The sidebar and the section overview pages read from the manifest, so they
   update automatically. No sidebar edits needed.

### Why `pages/srv/` instead of `pages/server/`?

Nuxt's `impound` plugin blocks the Vue layer from importing any file whose path
contains the `/server/` segment — that name is reserved for Nitro (server-only)
code. We keep the folder as `srv/` on disk and remap the URLs back to `/server/*`
via a `pages:extend` hook in [nuxt.config.ts](nuxt.config.ts). When you look up a
page by URL (`/server/routes/session/signin`), its file is at
`pages/srv/routes/session/signin.vue`. Every internal link in the app still uses
the `/server/*` URL.

### Why the `@asgardeo/nuxt/errors` / `@asgardeo/nuxt/utils/log` subpath imports?

The same `impound` plugin also blocks the Vue layer from importing the Nuxt
module's **top-level entry** — `import … from '@asgardeo/nuxt'` — because that
entry is the build-time module definition, not a runtime surface. Anything the
SDK intends for client code goes through either:

- **Auto-imports** (preferred): `useAsgardeo()`, `createRouteMatcher()`, component
  tags like `<AsgardeoSignedIn>`. These are registered by the module's `setup()`
  — no `import` needed in your page.
- **Subpath exports**: `import { AsgardeoError, ErrorCode } from '@asgardeo/nuxt/errors'`
  or `import { maskToken, createLogger } from '@asgardeo/nuxt/utils/log'`. The
  subpaths are declared in the SDK's [package.json](../../packages/nuxt/package.json)
  `exports` map.

If you add a new SDK export that pages need, either auto-import it in
`packages/nuxt/src/module.ts` or expose it as a subpath in the SDK's
`package.json` — do not add `import … from '@asgardeo/nuxt'` to a Vue file.

## Conventions

- **No wrapper composables.** If you want to demo `useUser()`, call it directly in the
  page — the whole point of the playground is to show SDK usage verbatim. Don't add
  helpers in `composables/` that shield the SDK's shape.
- **One way to do each thing.** Use `LayoutCodeBlock` for snippets, `LayoutSectionCard`
  for panels, `LayoutTabGroup` for per-export tabs. If you feel like introducing a second
  pattern, migrate the existing ones instead.
- **No "coming soon" pages.** If a page is not built, it is not in the manifest.
- **No playground-only wrapper types.** If the SDK ships a type, import it. Don't mirror
  it for "convenience".

## Keeping the manifest honest

When the SDK renames, removes, or adds an export:

- Rename / delete / add the manifest entry. Search for the old name across the repo to
  catch any stragglers in page copy.
- If the SDK registers a new `/api/auth/*` route, add both the entry in
  [`serverRoutes`](utils/sdk-manifest.ts) **and** a `$fetch` helper in
  [`utils/sdkRoutes.ts`](utils/sdkRoutes.ts).

## Running the playground

```
pnpm install
pnpm dev
```

Then visit <http://localhost:3000>.

## Out of scope for this project

- **SDK surface changes.** If a playground page would require an SDK export that doesn't
  exist, land the SDK change first, then add the page.
- **Styling redesigns.** Keep to the existing Tailwind utility classes and the current
  theme tokens in [`assets/css/main.css`](assets/css/main.css).
- **i18n for the playground UI itself.** The `useAsgardeoI18n` page demonstrates SDK i18n;
  the playground chrome stays English-only.
