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

import {FC} from 'react';
import {BaseSignUpOptionProps} from '../presentation/SignUp/SignUpOptionFactory';
import useTheme from '../../contexts/Theme/useTheme';

/**
 * Image component for sign-up forms.
 */
const ImageComponent: FC<BaseSignUpOptionProps> = ({component}) => {
  const {theme} = useTheme();
  const config = component.config || {};
  const src = config['src'] || '';
  const alt = config['alt'] || config['label'] || 'Image';
  const variant = component.variant?.toLowerCase() || 'image_block';

  const imageStyle: React.CSSProperties = {
    maxWidth: '100%',
    height: 'auto',
    display: 'block',
    margin: variant === 'image_block' ? '1rem auto' : '0',
    borderRadius: theme.vars.borderRadius.small,
  };

  if (!src) {
    return null;
  }

  return (
    <div key={component.id} style={{textAlign: 'center'}}>
      <img
        src={src}
        alt={alt}
        style={imageStyle}
        onError={e => {
          // Hide broken images
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
};

export default ImageComponent;
