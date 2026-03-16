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
import {defineComponent, h} from 'vue';

const Logo = defineComponent({
  name: 'Logo',
  props: {
    src: {type: String, default: undefined},
    alt: {type: String, default: 'Logo'},
    href: {type: String, default: undefined},
    width: {type: [String, Number], default: undefined},
    height: {type: [String, Number], default: undefined},
  },
  setup(props, {attrs}) {
    return () => {
      const img = h('img', {
        class: withVendorCSSClassPrefix('logo__image'),
        src: props.src,
        alt: props.alt,
        width: props.width,
        height: props.height,
      });

      if (props.href) {
        return h(
          'a',
          {
            class: [withVendorCSSClassPrefix('logo'), (attrs['class'] as string) || ''].filter(Boolean).join(' '),
            style: attrs['style'],
            href: props.href,
          },
          [img],
        );
      }

      return h(
        'div',
        {
          class: [withVendorCSSClassPrefix('logo'), (attrs['class'] as string) || ''].filter(Boolean).join(' '),
          style: attrs['style'],
        },
        [img],
      );
    };
  },
});

export default Logo;
