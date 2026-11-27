---
'@asgardeo/javascript': patch
'@asgardeo/browser': patch
'@asgardeo/node': patch
'@asgardeo/express': patch
'@asgardeo/i18n': patch
'@asgardeo/react': patch
'@asgardeo/react-router': patch
'@asgardeo/tanstack-router': patch
'@asgardeo/vue': patch
---

Fix the published packages for CommonJS and `nodenext` consumers: `require()` threw "module is not defined in ES module
scope", and with `moduleResolution: node16`/`nodenext` every type resolved to `any`. The CommonJS build is now marked as
CommonJS, the type declarations use explicit file extensions, and `exports` has a `types` condition.
