/**
 * Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com).
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

import {RuleTester} from 'eslint';
import {afterAll, describe, it} from 'vitest';
import copyrightHeaderRule, {DEFAULT_COPYRIGHT_HEADER} from '../copyright-header';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester: RuleTester = new RuleTester();

const LEGACY_HEADER = `/**
 * Copyright (c) 2019-2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
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
 */`;

ruleTester.run('copyright-header', copyrightHeaderRule, {
  invalid: [
    {
      code: 'const a = 1;\n',
      errors: [{messageId: 'missingHeader'}],
      output: `${DEFAULT_COPYRIGHT_HEADER}\n\nconst a = 1;\n`,
    },
    {
      code: '// @ts-check\nconst a = 1;\n',
      errors: [{messageId: 'missingHeader'}],
      output: `${DEFAULT_COPYRIGHT_HEADER}\n\n// @ts-check\nconst a = 1;\n`,
    },
    {
      code: '#!/usr/bin/env node\nconst a = 1;\n',
      errors: [{messageId: 'missingHeader'}],
      output: `#!/usr/bin/env node\n\n${DEFAULT_COPYRIGHT_HEADER}\nconst a = 1;\n`,
    },
    {
      code: '/**\n * Copyright (c) 2020, Some Company. All rights reserved.\n */\nconst a = 1;\n',
      errors: [{messageId: 'incorrectHeader'}],
      output: `${DEFAULT_COPYRIGHT_HEADER}\nconst a = 1;\n`,
    },
    {
      code: `const a = 1;\n\n${DEFAULT_COPYRIGHT_HEADER}\n`,
      errors: [{messageId: 'missingHeader'}],
      output: `${DEFAULT_COPYRIGHT_HEADER}\n\nconst a = 1;\n\n${DEFAULT_COPYRIGHT_HEADER}\n`,
    },
  ],
  valid: [
    `${DEFAULT_COPYRIGHT_HEADER}\n\nconst a = 1;\n`,
    `${LEGACY_HEADER}\n\nconst a = 1;\n`,
    `#!/usr/bin/env node\n\n${DEFAULT_COPYRIGHT_HEADER}\n\nconst a = 1;\n`,
    {
      code: 'const a = 1;\n',
      filename: 'src/generated/file.js',
      options: [{excludePatterns: ['/generated/']}],
    },
  ],
});
