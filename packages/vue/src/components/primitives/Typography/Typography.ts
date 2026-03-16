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

import {withVendorCSSClassPrefix} from '@asgardeo/browser';
import {defineComponent, h, type PropType} from 'vue';

const Typography = defineComponent({
  name: 'Typography',
  props: {
    variant: {
      type: String as PropType<'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2' | 'caption' | 'overline'>,
      default: 'body1',
    },
    component: {
      type: String as PropType<string>,
      default: undefined,
    },
  },
  setup(props, {slots, attrs}) {
    return () => {
      const tagMap: Record<string, string> = {
        h1: 'h1',
        h2: 'h2',
        h3: 'h3',
        h4: 'h4',
        h5: 'h5',
        h6: 'h6',
        subtitle1: 'h6',
        subtitle2: 'h6',
        body1: 'p',
        body2: 'p',
        caption: 'span',
        overline: 'span',
      };

      const tag = props.component || tagMap[props.variant] || 'p';

      return h(
        tag,
        {
          class: [withVendorCSSClassPrefix('typography'), withVendorCSSClassPrefix(`typography--${props.variant}`), (attrs['class'] as string) || '']
            .filter(Boolean)
            .join(' '),
          style: attrs['style'],
        },
        slots['default']?.(),
      );
    };
  },
});

export default Typography;
