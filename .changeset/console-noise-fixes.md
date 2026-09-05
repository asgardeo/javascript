---
'@asgardeo/nextjs': patch
'@asgardeo/react': patch
---

- Next.js: cross-origin redirects (the identity server's hosted sign-in, sign-up and logout endpoints) are now performed with a full browser navigation instead of the Next.js app router. Handing those URLs to the router made it request them as a React Server Components payload first, which the browser blocked with a CORS error before the router fell back to a normal navigation, leaving "Failed to fetch RSC payload" errors in the console on every sign-out.
- React: dialogs (for example the popup mode of `<UserProfile />` opened from the user dropdown) now move focus onto the dialog when they open. Previously focus stayed on the trigger, which the focus manager had just hidden from assistive technology with `aria-hidden`, and browsers reported "Blocked aria-hidden on an element because its descendant retained focus".
