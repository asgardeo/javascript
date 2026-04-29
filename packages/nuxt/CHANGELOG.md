# @asgardeo/nuxt

## 0.1.2

### Patch Changes

- [#483](https://github.com/asgardeo/javascript/pull/483)
  [`519fa74`](https://github.com/asgardeo/javascript/commit/519fa746c2dace5446368ad9043e3aec0d152514) Thanks
  [@kavindadimuthu](https://github.com/kavindadimuthu)! - Fix SSR compatibility and module bundling issues

  - **Browser:** Fixed Node.js ESM import resolution by changing directory imports (`'buffer/'`) to explicit file paths
    (`'buffer/index.js'`)
  - **Nuxt:** Fixed Rollup bundling by centralizing module augmentations in `module.ts` and removing `.d.ts` file from
    dist

- Updated dependencies
  [[`519fa74`](https://github.com/asgardeo/javascript/commit/519fa746c2dace5446368ad9043e3aec0d152514)]:
  - @asgardeo/browser@0.7.2
  - @asgardeo/vue@0.3.5

## 0.1.1

### Patch Changes

- [#481](https://github.com/asgardeo/javascript/pull/481)
  [`0d11c55`](https://github.com/asgardeo/javascript/commit/0d11c550ef8d3d87b5b2b98cd17a9416a1566a83) Thanks
  [@kavindadimuthu](https://github.com/kavindadimuthu)! - Exclude augments.d.ts from published nuxt npm package

## 0.1.0

### Minor Changes

- [#479](https://github.com/asgardeo/javascript/pull/479)
  [`f5044b9`](https://github.com/asgardeo/javascript/commit/f5044b918504af125e955a63e49e774d708384ad) Thanks
  [@kavindadimuthu](https://github.com/kavindadimuthu)! - Launch Nuxt SDK with comprehensive authentication and identity
  management integration including composables, components, middleware, and server utilities. Enhance Vue components
  with improved type definitions and update JavaScript SDK utility functions.

### Patch Changes

- Updated dependencies
  [[`f5044b9`](https://github.com/asgardeo/javascript/commit/f5044b918504af125e955a63e49e774d708384ad)]:
  - @asgardeo/vue@0.3.4
  - @asgardeo/browser@0.7.1
  - @asgardeo/node@0.0.76

## 0.0.1

### Patch Changes

- [#56](https://github.com/asgardeo/javascript/pull/56)
  [`74afcc5`](https://github.com/asgardeo/javascript/commit/74afcc5bbf3dcfd8a2ec0c0026b709eafbe609a1) Thanks
  [@3nethz](https://github.com/3nethz)! - initial release
