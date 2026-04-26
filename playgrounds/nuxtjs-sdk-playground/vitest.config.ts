import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // The @asgardeo/nuxt subpaths point to compiled dist files (workspace:*)
    // which are built before these tests run.
    passWithNoTests: false,
  },
});
