---
'@asgardeo/nextjs': patch
---

`protectRoute()` in the middleware no longer produces redirect loops. Without a configured `signInUrl` it redirected unauthenticated requests to the same-origin referer, and because browsers keep the referer of the page that started the navigation across a redirect chain, a protected page whose referer was itself (for example after the session expired while browsing protected pages) bounced until `ERR_TOO_MANY_REDIRECTS`. The referer is now only used when it is a different page, and when the resolved target is the protected route itself (the sign-in page covered by the protected matcher, or `/` protected without a `signInUrl`) the middleware answers `401` with a hint instead of redirecting. The JSDoc no longer mentions a `defaultRedirect` option that never existed.
