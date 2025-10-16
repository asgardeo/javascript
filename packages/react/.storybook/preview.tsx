/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import type {Preview} from '@storybook/react';
import ThemeProvider from '../src/contexts/Theme/ThemeProvider';
import I18nProvider from '../src/contexts/I18n/I18nProvider';
import {en_US, fr_FR, hi_IN, si_LK} from '@asgardeo/i18n';
import './preview-styles.css';

export const globalTypes = {
  locale: {
    name: 'Locale',
    description: 'Internationalization locale',
    toolbar: {
      title: 'Locale',
      icon: 'globe',
      items: [
        {value: 'en-US', title: 'English'},
        {value: 'fr-FR', title: 'French'},
        {value: 'hi-IN', title: 'Hindi'},
        {value: 'si-LK', title: 'Sinhala'},
      ],
      showName: true,
      dynamicTitle: true,
    },
  },
};

const preview: Preview = {
  parameters: {
    actions: {argTypesRegex: '^on[A-Z].*'},
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const locale = context.globals['locale'];

      // Create custom bundles that include all available languages for Storybook
      const storybookBundles = {
        'en-US': en_US,
        'fr-FR': fr_FR,
        'hi-IN': hi_IN,
        'si-LK': si_LK,
      };

      return (
        <ThemeProvider mode="light" inheritFromBranding={false}>
          <I18nProvider preferences={{bundles: storybookBundles, language: locale}}>
            <Story />
          </I18nProvider>
        </ThemeProvider>
      );
    },
  ],
};

export default preview;
