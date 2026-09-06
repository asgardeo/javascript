---
'@asgardeo/nextjs': patch
---

Ship a working CommonJS build. The `require` entry (`dist/cjs/index.js`, used by Jest and other CommonJS consumers) only contained the three entry files and failed with `Cannot find module './AsgardeoNextClient'`; the ESM build only worked because `tsc` re-emitted every file on top of it. Every source file is now transpiled on its own for both formats (a bundle cannot keep the per-module `'use client'` / `'use server'` directives), `dist/cjs` carries a `package.json` with `"type": "commonjs"`, `tsc` only emits the declarations, the type-only re-exports of the client entry are marked as such, and the package's `types`, `homepage` and `repository` fields point at the right paths.
