/**
 * Copyright (c) 2022-2023, WSO2 LLC. (https://www.wso2.com).
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

const fs = require('fs');
const path = require('path');

/**
 * @fileoverview ESLint config to be used in React based projects.
 */

const LICENSE_HEADER_PATTERN_OVERRIDE_FILE_NAME = 'license-header-override.js';

/**
 * Check if an override license header file is defined , if so,
 * return that else return the default license header pattern.
 *
 * @example
 * Here's a simple example of overriding the license header pattern.:
 * ```
 * // create a `license-header-override.js` at the same level of `.eslintrc.js`
 * module.exports = [
 *     " * New Company.",
       " * Copyright 2022.",
 * ];
 * ```
 *
 * @returns License Header Pattern.
 */
const getLicenseHeaderPattern = () => {
  const LICENSE_HEADER_DEFAULT_PATTERN = [
    '*',
    {
      pattern: ' Copyright \\(c\\) \\b(2019|202[0-6])(?:-(202[0-6]))?, WSO2 LLC. \\(https://www.wso2.com\\).',
      template: ` * Copyright (c) {{year}}, WSO2 LLC. (https://www.wso2.com).`,
    },
    ' *',
    ' * WSO2 LLC. licenses this file to you under the Apache License,',
    ' * Version 2.0 (the "License"); you may not use this file except',
    ' * in compliance with the License.',
    ' * You may obtain a copy of the License at',
    ' *',
    ' *     http://www.apache.org/licenses/LICENSE-2.0',
    ' *',
    ' * Unless required by applicable law or agreed to in writing,',
    ' * software distributed under the License is distributed on an',
    ' * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY',
    ' * KIND, either express or implied. See the License for the',
    ' * specific language governing permissions and limitations',
    ' * under the License.',
    ' ',
  ];

  if (!fs.existsSync(path.resolve(__dirname, LICENSE_HEADER_PATTERN_OVERRIDE_FILE_NAME))) {
    return LICENSE_HEADER_DEFAULT_PATTERN;
  }

  // eslint-disable-next-line import/no-dynamic-require, global-require
  return require(path.resolve(__dirname, LICENSE_HEADER_PATTERN_OVERRIDE_FILE_NAME));
};

module.exports = {
  plugins: ['header'],
  rules: {
    // Enforce WSO2 license header on files.
    // https://github.com/Stuk/eslint-plugin-header
    'header/header': ['warn', 'block', getLicenseHeaderPattern(), 2],
  },
};
