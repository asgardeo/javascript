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

import type {Rule} from 'eslint';
import type {Comment} from 'estree';

interface CopyrightHeaderOptions {
  allowShebang?: boolean;
  excludePatterns?: string[];
  template?: string;
}

const CURRENT_YEAR: number = new Date().getFullYear();

/**
 * The WSO2 Apache 2.0 license header every source file must start with.
 */
export const DEFAULT_COPYRIGHT_HEADER = `/**
 * Copyright (c) ${CURRENT_YEAR}, WSO2 LLC. (https://www.wso2.com).
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

/**
 * Collapses a comment's text into single-spaced words without the leading `*` of JSDoc-style lines, so that headers can
 * be compared regardless of line wrapping.
 */
const normalize = (text: string): string =>
  text
    .split('\n')
    .map((line: string) => line.replace(/^\s*\*+/, ''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * The fragments a header must contain to be accepted. The year is intentionally not validated, so historical years and
 * ranges (e.g. `2020-2025`) pass unchanged.
 */
const REQUIRED_FRAGMENTS: string[] = [
  'WSO2 LLC. (https://www.wso2.com)',
  'WSO2 LLC. licenses this file to you under the Apache License, Version 2.0',
  'http://www.apache.org/licenses/LICENSE-2.0',
];

const copyrightHeaderRule: Rule.RuleModule = {
  meta: {
    docs: {
      description: 'Enforce the WSO2 Apache 2.0 license header at the top of every source file',
    },
    fixable: 'code',
    messages: {
      incorrectHeader: 'The license header does not match the WSO2 Apache 2.0 license header.',
      missingHeader: 'Missing the WSO2 Apache 2.0 license header.',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowShebang: {type: 'boolean'},
          excludePatterns: {items: {type: 'string'}, type: 'array'},
          template: {type: 'string'},
        },
        type: 'object',
      },
    ],
    type: 'layout',
  },
  create(context: Rule.RuleContext): Rule.RuleListener {
    const options: CopyrightHeaderOptions = (context.options[0] as CopyrightHeaderOptions | undefined) ?? {};
    const excludePatterns: string[] = options.excludePatterns ?? [];
    const template: string = options.template ?? DEFAULT_COPYRIGHT_HEADER;
    const allowShebang: boolean = options.allowShebang ?? true;
    const requiredFragments: string[] = options.template ? [normalize(options.template)] : REQUIRED_FRAGMENTS;
    const {filename} = context;

    if (excludePatterns.some((pattern: string) => new RegExp(pattern).test(filename))) {
      return {};
    }

    if (/\.(json|md|ya?ml|xml|txt)$/.test(filename)) {
      return {};
    }

    return {
      Program(node): void {
        const {sourceCode} = context;
        const allComments: Comment[] = sourceCode.getAllComments();

        // A shebang is a separate comment token placed before the header.
        const shebang: Comment | undefined =
          allowShebang && (allComments[0]?.type as string) === 'Shebang' ? allComments[0] : undefined;
        const comments: Comment[] = shebang ? allComments.slice(1) : allComments;

        // The header must be the first thing in the file: anything other than whitespace (or the shebang) before the
        // first comment means the file has no header.
        const firstComment: Comment | undefined = comments[0];
        const headerStart: number = shebang?.range?.[1] ?? 0;
        const isLeading: boolean =
          firstComment?.range !== undefined &&
          sourceCode.text.slice(headerStart, firstComment.range[0]).trim().length === 0;

        // The leading comment region: a single block comment, or a run of consecutive line comments.
        const region: Comment[] = [];
        if (isLeading && firstComment?.type === 'Block') {
          region.push(firstComment);
        } else if (isLeading && firstComment?.type === 'Line') {
          for (const comment of comments) {
            if (comment.type !== 'Line') {
              break;
            }
            region.push(comment);
          }
        }

        const regionText: string = normalize(region.map((comment: Comment) => comment.value).join('\n'));

        if (requiredFragments.every((fragment: string) => regionText.includes(fragment))) {
          return;
        }

        // Only treat the leading comment as a stale header when it looks like one, so unrelated leading comments
        // (e.g. `// @ts-check`) are kept and the header is inserted above them.
        if (region.length === 0 || !/copyright|license|spdx/i.test(regionText)) {
          context.report({
            fix(fixer: Rule.RuleFixer) {
              if (shebang?.range) {
                return fixer.insertTextAfterRange(shebang.range, `\n\n${template}`);
              }

              return fixer.insertTextBeforeRange([0, 0], `${template}\n\n`);
            },
            messageId: 'missingHeader',
            node,
          });

          return;
        }

        const start: number = region[0].range?.[0] ?? 0;
        const end: number = region[region.length - 1].range?.[1] ?? 0;

        context.report({
          fix: (fixer: Rule.RuleFixer) => fixer.replaceTextRange([start, end], template),
          loc: sourceCode.getLocFromIndex(start),
          messageId: 'incorrectHeader',
        });
      },
    };
  },
};

export default copyrightHeaderRule;
