---
'@asgardeo/javascript': patch
'@asgardeo/browser': patch
'@asgardeo/node': patch
---

fix multiple audiences in ID token validation.Change audience parameter from string to array to support tokens with
multiple audiences
