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

import {CSSProperties, FC, SyntheticEvent} from 'react';
import useTheme from '../../contexts/Theme/useTheme';
import {AdapterProps} from '../../models/adapters';

/**
 * Image component for sign-up forms.
 */
const ImageComponent: FC<AdapterProps> = ({component}: AdapterProps) => {
  const {theme} = useTheme();
  const config: Record<string, unknown> = component.config || {};
  const src: string = (config['src'] as string) || '';
  const alt: string = (config['alt'] as string) || (config['label'] as string) || 'Image';
  const variant: string = (component.variant?.toLowerCase() as string) || 'image_block';

  const imageStyle: CSSProperties = {
    borderRadius: theme.vars.borderRadius.small,
    display: 'block',
    height: 'auto',
    margin: variant === 'image_block' ? '1rem auto' : '0',
    maxWidth: '100%',
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
        onError={(e: SyntheticEvent<HTMLImageElement>): void => {
          // Hide broken images
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
};

export default ImageComponent;
