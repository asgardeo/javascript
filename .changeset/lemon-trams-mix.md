---
'@asgardeo/browser': patch
'@asgardeo/nuxt': patch
---

Fix SSR compatibility and module bundling issues

- **Browser:** Fixed Node.js ESM import resolution by changing directory imports (`'buffer/'`) to explicit file paths (`'buffer/index.js'`)
- **Nuxt:** Fixed Rollup bundling by centralizing module augmentations in `module.ts` and removing `.d.ts` file from dist
