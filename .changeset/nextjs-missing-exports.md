---
'@asgardeo/nextjs': patch
---

Complete the package's entry points. `@asgardeo/nextjs` now exports the `Loading` and `OrganizationList` components, and re-exports the hooks of the React SDK (`useUser`, `useOrganization`, `useTranslation`, `useTheme`, `useBrandingContext`, `useBranding`, `useFlow`, `useI18n`, `useForm`) so applications do not need to depend on `@asgardeo/react` themselves. `@asgardeo/nextjs/server` exports the server actions (`clearSession`, `isSignedIn`, `getSessionPayload`, `getUser`, `getUserProfile`, `httpRequest`, `signOut`, `switchOrganization`, the organization actions and more) for Server Components and Route Handlers, and the `asgardeo()` helper gained `isSignedIn`, `getSession`, `getUser`, `getUserProfile`, `signOut` and `clearSession`.
