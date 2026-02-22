/**
 * Base Playwright fixture that extends the default test with shared test data.
 */

import {test as base} from '@playwright/test';
import {TEST_USER, getSampleApp, getSampleAppTarget, type SampleAppTarget} from '../setup/constants';

export type E2EFixtures = {
  testUser: typeof TEST_USER;
  sampleApp: ReturnType<typeof getSampleApp>;
  sampleAppTarget: SampleAppTarget;
};

export const test = base.extend<E2EFixtures>({
  testUser: async ({}, use) => {
    await use(TEST_USER);
  },
  sampleApp: async ({}, use) => {
    await use(getSampleApp());
  },
  sampleAppTarget: async ({}, use) => {
    await use(getSampleAppTarget());
  },
});

export {expect} from '@playwright/test';
