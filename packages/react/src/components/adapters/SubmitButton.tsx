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
import Button from '../primitives/Button/Button';
import Spinner from '../primitives/Spinner/Spinner';

/**
 * Button component for sign-up forms that handles all button variants.
 */
const ButtonComponent: FC<BaseSignUpOptionProps> = ({
  component,
  isLoading,
  isFormValid,
  buttonClassName,
  onSubmit,
  size = 'medium',
}) => {
  const config = component.config || {};
  const buttonText = config['text'] || config['label'] || 'Continue';
  const buttonType = config['type'] || 'submit';
  const componentVariant = component.variant?.toUpperCase() || 'PRIMARY';

  // Map component variants to Button primitive props
  const getButtonProps = () => {
    switch (componentVariant) {
      case 'PRIMARY':
        return {variant: 'solid' as const, color: 'primary' as const};
      case 'SECONDARY':
        return {variant: 'solid' as const, color: 'secondary' as const};
      case 'TEXT':
        return {variant: 'text' as const, color: 'primary' as const};
      case 'SOCIAL':
        return {variant: 'outline' as const, color: 'primary' as const};
      default:
        return {variant: 'solid' as const, color: 'primary' as const};
    }
  };

  const {variant, color} = getButtonProps();

  const handleClick = () => {
    if (onSubmit && buttonType !== 'submit') {
      onSubmit(component);
    }
  };

  return (
    <Button
      key={component.id}
      type={buttonType === 'submit' ? 'submit' : 'button'}
      variant={variant}
      color={color}
      size={size}
      disabled={isLoading || (buttonType === 'submit' && !isFormValid)}
      onClick={buttonType !== 'submit' ? handleClick : undefined}
      className={buttonClassName}
      style={{width: '100%'}}
    >
      {isLoading ? <Spinner size="small" /> : buttonText}
    </Button>
  );
};

export default ButtonComponent;
