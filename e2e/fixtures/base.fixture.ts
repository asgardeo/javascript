/**
 * Base Playwright fixture that extends the default test with shared test data.
 */

import {test as base} from '@playwright/test';
import {TEST_USER, SAMPLE_APP} from '../setup/constants';

export type E2EFixtures = {
  testUser: typeof TEST_USER;
  sampleApp: typeof SAMPLE_APP;
};

export const test = base.extend<E2EFixtures>({
  testUser: async ({}, use) => {
    await use(TEST_USER);
  },
  sampleApp: async ({}, use) => {
    await use(SAMPLE_APP);
  },
});

export {expect} from '@playwright/test';
