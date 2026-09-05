---
'@asgardeo/nextjs': patch
---

Cross-origin redirects (the identity server's hosted sign-in, sign-up and logout endpoints) are now performed with a full browser navigation instead of the Next.js app router. Handing those URLs to the router made it request them as a React Server Components payload first, which the browser blocked with a CORS error before the router fell back to a normal navigation, leaving "Failed to fetch RSC payload" errors in the console on every sign-out.
