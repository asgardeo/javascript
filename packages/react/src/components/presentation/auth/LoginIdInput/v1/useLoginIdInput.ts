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

import {LoginIdPrefix, LoginIdType} from '@asgardeo/browser';
import {useCallback, useMemo, useState} from 'react';

/**
 * Assembles the final submitted value from its three parts.
 * Each part is included only if non-empty to avoid leading/trailing empty strings.
 */
export const assembleLoginIdValue = (prefix: string, rawInput: string, postfix: string): string =>
  `${prefix}${rawInput}${postfix}`;

/**
 * Resolves the effective maxLength for a given type and selected prefix.
 * Prefix-level maxLength overrides the outer type-level maxLength.
 */
export const resolveMaxLength = (activeType: LoginIdType, selectedPrefix: LoginIdPrefix | null): number | undefined => {
  if (selectedPrefix?.maxLength !== undefined) {
    return selectedPrefix.maxLength;
  }
  return activeType.maxLength;
};

/**
 * Resolves the effective regex for a given type and selected prefix.
 * Prefix-level regex overrides the outer type-level regex.
 */
export const resolveRegex = (activeType: LoginIdType, selectedPrefix: LoginIdPrefix | null): string | undefined => {
  if (selectedPrefix?.regex !== undefined) {
    return selectedPrefix.regex;
  }
  return activeType.regex;
};

/**
 * Validates the raw input against maxLength and regex constraints.
 * Returns an error key string if invalid, or null if valid.
 */
export const validateRawInput = (
  rawInput: string,
  activeType: LoginIdType,
  selectedPrefix: LoginIdPrefix | null,
): string | null => {
  const effectiveMaxLength: number | undefined = resolveMaxLength(activeType, selectedPrefix);
  const effectiveRegex: string | undefined = resolveRegex(activeType, selectedPrefix);

  if (effectiveMaxLength !== undefined && rawInput.length > effectiveMaxLength) {
    return 'validations.invalid.format.error';
  }

  if (effectiveRegex && rawInput.length > 0) {
    try {
      if (!new RegExp(effectiveRegex).test(rawInput)) {
        return 'validations.invalid.format.error';
      }
    } catch {
      // Invalid regex from server — skip validation silently
    }
  }

  return null;
};

/**
 * Resolves the default LoginIdType from the list.
 * Picks the first type with default:true, or the first type if none is marked.
 */
const resolveDefaultType = (loginIdTypes: LoginIdType[]): LoginIdType => {
  return loginIdTypes.find((t: LoginIdType) => t.default) ?? loginIdTypes[0];
};

/**
 * Resolves the default prefix for a type.
 * Returns the first prefix in array-type prefixes, or null otherwise.
 */
const resolveDefaultPrefix = (loginIdType: LoginIdType): LoginIdPrefix | null => {
  if (Array.isArray(loginIdType.prefixes) && loginIdType.prefixes.length > 0) {
    return loginIdType.prefixes[0];
  }
  return null;
};

export interface UseLoginIdInputReturn {
  /** The active login ID type */
  activeType: LoginIdType;
  /** Validation error key (to be resolved via t()), or null */
  errorKey: string | null;
  /** Assembled final value (prefix + rawInput + postfix) ready for submission */
  finalValue: string;
  /** Raw text the user typed into the input */
  rawInput: string;
  /** Currently selected prefix object (for array-type prefixes) */
  selectedPrefix: LoginIdPrefix | null;
  /** Sets the active login ID type and resets input/error/prefix to defaults */
  setActiveTypeId: (id: string) => void;
  /** Sets raw input and re-validates immediately */
  setRawInput: (value: string) => void;
  /** Sets the selected prefix and re-validates against the new prefix constraints */
  setSelectedPrefix: (prefix: LoginIdPrefix) => void;
}

/**
 * Manages all state for the LOGIN_ID_INPUT component:
 * active type, prefix selection, raw input, validation, and value assembly.
 */
const useLoginIdInput = (loginIdTypes: LoginIdType[]): UseLoginIdInputReturn => {
  const defaultType: LoginIdType = useMemo(() => resolveDefaultType(loginIdTypes), [loginIdTypes]);

  const [activeType, setActiveType] = useState<LoginIdType>(defaultType);
  const [selectedPrefix, setSelectedPrefixState] = useState<LoginIdPrefix | null>(resolveDefaultPrefix(defaultType));
  const [rawInput, setRawInputState] = useState<string>('');
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const setActiveTypeId: (id: string) => void = useCallback(
    (id: string) => {
      const next: LoginIdType | undefined = loginIdTypes.find((t: LoginIdType) => t.id === id);
      if (!next || next.id === activeType.id) {
        return;
      }
      // Per spec: clear raw input, errors, and reset prefix on type switch
      setActiveType(next);
      setRawInputState('');
      setErrorKey(null);
      setSelectedPrefixState(resolveDefaultPrefix(next));
    },
    [loginIdTypes, activeType.id],
  );

  const setRawInput: (value: string) => void = useCallback(
    (value: string) => {
      setRawInputState(value);
      // Validate immediately on input change
      setErrorKey(validateRawInput(value, activeType, selectedPrefix));
    },
    [activeType, selectedPrefix],
  );

  const setSelectedPrefix: (prefix: LoginIdPrefix) => void = useCallback(
    (prefix: LoginIdPrefix) => {
      setSelectedPrefixState(prefix);
      // Per spec: re-validate existing input against the new prefix's constraints
      setErrorKey(validateRawInput(rawInput, activeType, prefix));
    },
    [rawInput, activeType],
  );

  const finalValue: string = useMemo(() => {
    const prefix: string =
      selectedPrefix?.value ?? (typeof activeType.prefixes === 'string' ? activeType.prefixes : '');
    const postfix: string = activeType.postfix ?? '';
    return assembleLoginIdValue(prefix, rawInput, postfix);
  }, [selectedPrefix, activeType, rawInput]);

  return {
    activeType,
    errorKey,
    finalValue,
    rawInput,
    selectedPrefix,
    setActiveTypeId,
    setRawInput,
    setSelectedPrefix,
  };
};

export default useLoginIdInput;
