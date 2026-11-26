---
'@asgardeo/react-router': patch
---

Fix `ProtectedRoute` without `fallback` or `redirectTo` always throwing a misconfiguration error. It now starts sign-in
once after rendering and shows `loader` meanwhile. Its `signInOptions` are now merged with the provider's.
