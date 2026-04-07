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

import {
  bem,
  withVendorCSSClassPrefix,
  LoginIdPrefix,
  LoginIdType,
  createPackageComponentLogger,
  resolveFlowTemplateLiterals,
} from '@asgardeo/browser';
import {cx} from '@emotion/css';
import {ChangeEvent, FC, KeyboardEvent, ReactElement, useEffect, useRef} from 'react';
import useLoginIdInputStyles from './LoginIdInput.styles';
import PrefixSelector from './PrefixSelector';
import useLoginIdInput, {assembleLoginIdValue} from './useLoginIdInput';
import useTheme from '../../../../../contexts/Theme/useTheme';
import flowIconRegistry, {FlowIconProps} from '../../../../primitives/Icons/flowIconRegistry';
import FormControl from '../../../../primitives/FormControl/FormControl';
import InputLabel from '../../../../primitives/InputLabel/InputLabel';

const logger: ReturnType<typeof createPackageComponentLogger> = createPackageComponentLogger(
  '@asgardeo/react',
  'LoginIdInput',
);

export interface LoginIdInputProps {
  /** CSS class for the root element */
  className?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** External error message (from form validation, overrides internal validation) */
  error?: string;
  /** Login ID type definitions from the flow component */
  loginIdTypes: LoginIdType[];
  /** Component-level label displayed above the type selector grid */
  outerLabel?: string;
  /** Called on every value change with the assembled final value */
  onInputChange: (finalValue: string) => void;
  /** Whether the field is required */
  required?: boolean;
  /** Resolved translation function for {{t(...)}} literals */
  t?: (key: string) => string;
}

/**
 * LOGIN_ID_INPUT component: renders a type-selector tab grid and a contextual
 * input field that adapts to the selected login ID type.
 */
const LoginIdInput: FC<LoginIdInputProps> = ({
  loginIdTypes,
  outerLabel,
  onInputChange,
  required = false,
  disabled = false,
  error: externalError,
  className,
  t,
}: LoginIdInputProps): ReactElement | null => {
  // Normalise: treat missing/null as empty so hooks always run unconditionally
  const safeLoginIdTypes: LoginIdType[] = loginIdTypes || [];
  // Provide a sentinel type so the hook never crashes when the list is empty
  const hookTypes: LoginIdType[] = safeLoginIdTypes.length > 0 ? safeLoginIdTypes : [{id: '__empty__', label: ''}];

  const {theme, colorScheme}: ReturnType<typeof useTheme> = useTheme();

  const {activeType, rawInput, selectedPrefix, errorKey, setActiveTypeId, setRawInput, setSelectedPrefix} =
    useLoginIdInput(hookTypes);

  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the input on mount and whenever the active type changes
  useEffect(() => {
    inputRef.current?.focus();
  }, [activeType.id]);

  // Compute derived state before styles so they can be used as style params
  const resolvedError: string | undefined = externalError || (errorKey ? (t ? t(errorKey) : errorKey) : undefined);

  const hasPrefix: boolean =
    typeof activeType.prefixes === 'string'
      ? activeType.prefixes !== ''
      : Array.isArray(activeType.prefixes) && activeType.prefixes.length > 0;

  const hasPrefixSelector: boolean = Array.isArray(activeType.prefixes) && activeType.prefixes.length > 0;
  const hasStaticPrefix: boolean = typeof activeType.prefixes === 'string' && activeType.prefixes !== '';

  const styles: Record<string, string> = useLoginIdInputStyles(
    theme,
    colorScheme,
    safeLoginIdTypes.length,
    hasPrefix,
    !!resolvedError,
    disabled,
  );

  if (safeLoginIdTypes.length === 0) {
    logger.warn('LoginIdInput received an empty or null loginIdTypes array. Skipping render.');
    return null;
  }

  const resolvedLabel = (text: string): string => (t ? resolveFlowTemplateLiterals(text, {t, meta: undefined}) : text);
  const resolvedPlaceholder: string = activeType.placeholder ? resolvedLabel(activeType.placeholder) : '';
  const resolvedTypeLabel: string = activeType.label ? resolvedLabel(activeType.label) : '';
  const resolvedOuterLabel: string = outerLabel ? resolvedLabel(outerLabel) : '';

  const getPrefix = (): string =>
    selectedPrefix?.value ?? (typeof activeType.prefixes === 'string' ? activeType.prefixes : '');

  const handleTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>, id: string): void => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const currentIndex: number = loginIdTypes.findIndex((lt: LoginIdType) => lt.id === id);
      const nextIndex: number =
        e.key === 'ArrowRight'
          ? (currentIndex + 1) % loginIdTypes.length
          : (currentIndex - 1 + loginIdTypes.length) % loginIdTypes.length;
      setActiveTypeId(loginIdTypes[nextIndex].id);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveTypeId(id);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setRawInput(e.target.value);
    onInputChange(assembleLoginIdValue(getPrefix(), e.target.value, activeType.postfix ?? ''));
  };

  const showTabGrid: boolean = loginIdTypes.length > 1;

  return (
    <FormControl
      error={resolvedError}
      className={cx(withVendorCSSClassPrefix(bem('login-id-input')), styles['root'], className)}
    >
      {/* Component-level label above the grid */}
      {resolvedOuterLabel && (
        <InputLabel
          required={required}
          error={!!resolvedError}
          className={cx(withVendorCSSClassPrefix(bem('login-id-input', 'label')), styles['label'])}
        >
          {resolvedOuterLabel}
        </InputLabel>
      )}

      {/* Tab grid — hidden when there is only one type */}
      {showTabGrid && (
        <div
          className={cx(withVendorCSSClassPrefix(bem('login-id-input', 'grid')), styles['grid'])}
          role="tablist"
          aria-label={resolvedOuterLabel || 'Login ID type selector'}
        >
          {loginIdTypes.map((loginIdType: LoginIdType) => {
            const isActive: boolean = loginIdType.id === activeType.id;
            const IconComponent: FC<FlowIconProps> | undefined = loginIdType.icon
              ? flowIconRegistry[loginIdType.icon]
              : undefined;

            if (loginIdType.icon && !IconComponent) {
              logger.warn(
                `Unknown icon name "${loginIdType.icon}" on login ID type "${loginIdType.id}". Skipping icon render.`,
              );
            }

            return (
              <button
                key={loginIdType.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                title={resolvedLabel(loginIdType.label)}
                disabled={disabled}
                onClick={() => setActiveTypeId(loginIdType.id)}
                onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) => handleTabKeyDown(e, loginIdType.id)}
                className={cx(
                  withVendorCSSClassPrefix(bem('login-id-input', 'tab')),
                  styles['tab'],
                  isActive && withVendorCSSClassPrefix(bem('login-id-input', 'tab', 'active')),
                  isActive && styles['tabActive'],
                )}
              >
                {IconComponent && (
                  <span className={cx(withVendorCSSClassPrefix(bem('login-id-input', 'tab-icon')), styles['tabIcon'])}>
                    <IconComponent size={16} />
                  </span>
                )}
                <span className={cx(withVendorCSSClassPrefix(bem('login-id-input', 'tab-label')), styles['tabLabel'])}>
                  {resolvedLabel(loginIdType.label)}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Per-type input label below the grid */}
      {resolvedTypeLabel && (
        <InputLabel
          error={!!resolvedError}
          className={cx(withVendorCSSClassPrefix(bem('login-id-input', 'input-label')), styles['inputLabel'])}
        >
          {resolvedTypeLabel}
        </InputLabel>
      )}

      {/* Prefix + input field row */}
      <div
        className={cx(withVendorCSSClassPrefix(bem('login-id-input', 'field-row')), styles['fieldRow'])}
        aria-label={resolvedTypeLabel || resolvedOuterLabel}
      >
        {/* Static prefix label */}
        {hasStaticPrefix && (
          <span
            className={cx(withVendorCSSClassPrefix(bem('login-id-input', 'static-prefix')), styles['staticPrefix'])}
            aria-hidden="true"
          >
            {activeType.prefixes as string}
          </span>
        )}

        {/* Selectable prefix dropdown */}
        {hasPrefixSelector && (
          <PrefixSelector
            options={activeType.prefixes as LoginIdPrefix[]}
            selectedPrefix={selectedPrefix}
            onSelect={(prefix: LoginIdPrefix) => {
              setSelectedPrefix(prefix);
              onInputChange(assembleLoginIdValue(prefix.value, rawInput, activeType.postfix ?? ''));
            }}
            disabled={disabled}
            hasError={!!resolvedError}
          />
        )}

        {/* Text input */}
        <input
          ref={inputRef}
          aria-label={resolvedTypeLabel || resolvedOuterLabel}
          aria-invalid={!!resolvedError}
          aria-required={required}
          type={activeType.inputType ?? 'text'}
          value={rawInput}
          placeholder={resolvedPlaceholder}
          disabled={disabled}
          maxLength={selectedPrefix?.maxLength !== undefined ? selectedPrefix.maxLength : activeType.maxLength}
          onChange={handleInputChange}
          className={cx(
            withVendorCSSClassPrefix(bem('login-id-input', 'input')),
            hasPrefix && withVendorCSSClassPrefix(bem('login-id-input', 'input', 'with-prefix')),
            styles['input'],
          )}
        />
      </div>
    </FormControl>
  );
};

export default LoginIdInput;
