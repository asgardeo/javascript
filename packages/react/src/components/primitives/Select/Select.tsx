/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com).
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

import {FC, SelectHTMLAttributes} from 'react';
import useTheme from '../../../contexts/Theme/useTheme';
import {cx} from '@emotion/css';
import FormControl from '../FormControl/FormControl';
import InputLabel from '../InputLabel/InputLabel';
import {withVendorCSSClassPrefix, bem} from '@asgardeo/browser';
import useStyles from './Select.styles';

export interface SelectOption {
  /**
   * The value that will be submitted with the form
   */
  value: string;
  /**
   * The text that will be displayed in the select
   */
  label: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  /**
   * Label text to display above the select
   */
  label?: string;
  /**
   * Error message to display below the select
   */
  error?: string;
  /**
   * Additional CSS class names
   */
  className?: string;
  /**
   * Whether the field is required
   */
  required?: boolean;
  /**
   * Whether the field is disabled
   */
  disabled?: boolean;
  /**
   * Helper text to display below the select
   */
  helperText?: string;
  /**
   * Placeholder text for the default/empty option
   */
  placeholder?: string;
  /**
   * The options to display in the select
   */
  options: SelectOption[];
}

const Select: FC<SelectProps> = ({
  label,
  error,
  className,
  required,
  disabled,
  helperText,
  placeholder,
  options,
  style = {},
  ...rest
}) => {
  const {theme, colorScheme} = useTheme();
  const hasError = !!error;
  const styles = useStyles(theme, colorScheme, disabled, hasError);

  const selectClassName = cx(
    withVendorCSSClassPrefix(bem('select', 'input')),
    styles.select,
    hasError && styles.selectError,
    disabled && styles.selectDisabled,
  );

  return (
    <FormControl
      error={error}
      helperText={helperText}
      className={cx(withVendorCSSClassPrefix(bem('select')), className)}
      style={style}
    >
      {label && (
        <InputLabel required={required} error={hasError}>
          {label}
        </InputLabel>
      )}
      <select
        className={selectClassName}
        disabled={disabled}
        aria-invalid={hasError}
        aria-required={required}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map(option => (
          <option key={option.value} value={option.value} className={styles.option}>
            {option.label}
          </option>
        ))}
      </select>
    </FormControl>
  );
};

export default Select;
