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

/* eslint-disable sort-keys, @typescript-eslint/typedef, @typescript-eslint/explicit-function-return-type */

import {LoginIdPrefix, LoginIdType} from '@asgardeo/browser';
import {act, renderHook} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import useLoginIdInput, {
  assembleLoginIdValue,
  resolveMaxLength,
  resolveRegex,
  validateRawInput,
} from '../useLoginIdInput';

/* ------------------------------------------------------------------ */
/* Fixtures                                                            */
/* ------------------------------------------------------------------ */

const mobilePrefixIND: LoginIdPrefix = {label: 'IND', value: '+91', maxLength: 10};
const mobilePrefixKHM: LoginIdPrefix = {label: 'KHM', value: '+855', maxLength: 9};

const mobileType: LoginIdType = {
  id: 'mobile',
  label: 'Mobile',
  icon: 'Smartphone',
  prefixes: [mobilePrefixIND, mobilePrefixKHM],
  postfix: '@phone',
  regex: '^[0-9]+$',
  default: true,
};

const emailType: LoginIdType = {
  id: 'email',
  label: 'Email',
  maxLength: 254,
};

const nrcType: LoginIdType = {
  id: 'nrc',
  label: 'NRC',
  postfix: '@NRC',
};

const singleType: LoginIdType = {
  id: 'email',
  label: 'Email',
  maxLength: 10,
};

/* ------------------------------------------------------------------ */
/* Pure utility tests                                                  */
/* ------------------------------------------------------------------ */

describe('assembleLoginIdValue', () => {
  it('concatenates prefix + rawInput + postfix', () => {
    expect(assembleLoginIdValue('+91', '9876543210', '@phone')).toBe('+919876543210@phone');
  });

  it('handles empty prefix and postfix', () => {
    expect(assembleLoginIdValue('', 'user@example.com', '')).toBe('user@example.com');
  });

  it('handles only postfix', () => {
    expect(assembleLoginIdValue('', 'NRC123', '@NRC')).toBe('NRC123@NRC');
  });

  it('handles only prefix', () => {
    expect(assembleLoginIdValue('+91', '9876543210', '')).toBe('+919876543210');
  });
});

describe('resolveMaxLength', () => {
  it('returns prefix maxLength when present', () => {
    expect(resolveMaxLength(mobileType, mobilePrefixIND)).toBe(10);
  });

  it('returns prefix maxLength over type maxLength', () => {
    const typeWithMaxLength: LoginIdType = {...mobileType, maxLength: 15};
    expect(resolveMaxLength(typeWithMaxLength, mobilePrefixIND)).toBe(10);
  });

  it('falls back to type maxLength when prefix has none', () => {
    const prefixWithoutMaxLength: LoginIdPrefix = {label: 'IND', value: '+91'};
    expect(resolveMaxLength(emailType, prefixWithoutMaxLength)).toBe(254);
  });

  it('returns undefined when neither type nor prefix define maxLength', () => {
    expect(resolveMaxLength(nrcType, null)).toBeUndefined();
  });
});

describe('resolveRegex', () => {
  it('returns prefix regex when present', () => {
    const prefixWithRegex: LoginIdPrefix = {label: 'IND', value: '+91', regex: '^[0-9]{10}$'};
    expect(resolveRegex(mobileType, prefixWithRegex)).toBe('^[0-9]{10}$');
  });

  it('falls back to type regex when prefix has none', () => {
    expect(resolveRegex(mobileType, mobilePrefixIND)).toBe('^[0-9]+$');
  });

  it('returns undefined when neither define regex', () => {
    expect(resolveRegex(emailType, null)).toBeUndefined();
  });
});

describe('validateRawInput', () => {
  it('returns null for valid input within maxLength', () => {
    expect(validateRawInput('1234567890', mobileType, mobilePrefixIND)).toBeNull();
  });

  it('returns error key when input exceeds maxLength', () => {
    expect(validateRawInput('12345678901', mobileType, mobilePrefixIND)).toBe('validations.invalid.format.error');
  });

  it('returns error key when input fails regex', () => {
    expect(validateRawInput('abc', mobileType, null)).toBe('validations.invalid.format.error');
  });

  it('returns null for empty input (regex not applied to empty)', () => {
    expect(validateRawInput('', mobileType, null)).toBeNull();
  });

  it('returns null when no constraints are defined', () => {
    expect(validateRawInput('anything', nrcType, null)).toBeNull();
  });

  it('uses prefix maxLength over type maxLength', () => {
    // mobilePrefixKHM has maxLength: 9
    expect(validateRawInput('1234567890', mobileType, mobilePrefixKHM)).toBe('validations.invalid.format.error');
  });
});

/* ------------------------------------------------------------------ */
/* Hook tests                                                          */
/* ------------------------------------------------------------------ */

describe('useLoginIdInput', () => {
  describe('default type selection', () => {
    it('selects the type with default:true on mount', () => {
      const {result} = renderHook(() => useLoginIdInput([emailType, mobileType]));
      // mobileType has default: true
      expect(result.current.activeType.id).toBe('mobile');
    });

    it('selects the first type when no default is marked', () => {
      const {result} = renderHook(() => useLoginIdInput([emailType, nrcType]));
      expect(result.current.activeType.id).toBe('email');
    });

    it('selects the first of multiple default:true types', () => {
      const firstDefault: LoginIdType = {...emailType, default: true};
      const secondDefault: LoginIdType = {...nrcType, default: true};
      const {result} = renderHook(() => useLoginIdInput([firstDefault, secondDefault]));
      expect(result.current.activeType.id).toBe('email');
    });
  });

  describe('initial prefix', () => {
    it('selects the first prefix in array-type prefixes on mount', () => {
      const {result} = renderHook(() => useLoginIdInput([mobileType]));
      expect(result.current.selectedPrefix?.value).toBe('+91');
    });

    it('has null selectedPrefix when type has no prefixes', () => {
      const {result} = renderHook(() => useLoginIdInput([emailType]));
      expect(result.current.selectedPrefix).toBeNull();
    });

    it('has null selectedPrefix when type has a static string prefix', () => {
      const typeWithStaticPrefix: LoginIdType = {...emailType, prefixes: '+1'};
      const {result} = renderHook(() => useLoginIdInput([typeWithStaticPrefix]));
      expect(result.current.selectedPrefix).toBeNull();
    });
  });

  describe('value assembly', () => {
    it('assembles prefix + rawInput + postfix', () => {
      const {result} = renderHook(() => useLoginIdInput([mobileType]));
      act(() => {
        result.current.setRawInput('9876543210');
      });
      // prefix: +91, postfix: @phone
      expect(result.current.finalValue).toBe('+919876543210@phone');
    });

    it('assembles with no prefix or postfix', () => {
      const {result} = renderHook(() => useLoginIdInput([emailType]));
      act(() => {
        result.current.setRawInput('user@example.com');
      });
      expect(result.current.finalValue).toBe('user@example.com');
    });

    it('assembles with static string prefix', () => {
      const staticPrefixType: LoginIdType = {...nrcType, prefixes: 'NRC-'};
      const {result} = renderHook(() => useLoginIdInput([staticPrefixType]));
      act(() => {
        result.current.setRawInput('123456');
      });
      expect(result.current.finalValue).toBe('NRC-123456@NRC');
    });

    it('updates final value when prefix is switched', () => {
      const {result} = renderHook(() => useLoginIdInput([mobileType]));
      act(() => {
        result.current.setRawInput('123456789');
      });
      act(() => {
        result.current.setSelectedPrefix(mobilePrefixKHM);
      });
      expect(result.current.finalValue).toBe('+855123456789@phone');
    });
  });

  describe('type switching', () => {
    it('clears raw input on type switch', () => {
      const {result} = renderHook(() => useLoginIdInput([mobileType, emailType]));
      act(() => {
        result.current.setRawInput('9876543210');
      });
      act(() => {
        result.current.setActiveTypeId('email');
      });
      expect(result.current.rawInput).toBe('');
    });

    it('clears errors on type switch', () => {
      const {result} = renderHook(() => useLoginIdInput([mobileType, emailType]));
      act(() => {
        // Trigger a validation error
        result.current.setRawInput('abc');
      });
      expect(result.current.errorKey).toBe('validations.invalid.format.error');
      act(() => {
        result.current.setActiveTypeId('email');
      });
      expect(result.current.errorKey).toBeNull();
    });

    it('resets selectedPrefix to first prefix of the new type', () => {
      const anotherType: LoginIdType = {
        id: 'vid',
        label: 'VID',
        prefixes: [{label: 'US', value: '+1'}],
      };
      const {result} = renderHook(() => useLoginIdInput([mobileType, anotherType]));
      act(() => {
        result.current.setActiveTypeId('vid');
      });
      expect(result.current.selectedPrefix?.value).toBe('+1');
    });

    it('sets selectedPrefix to null when new type has no array prefixes', () => {
      const {result} = renderHook(() => useLoginIdInput([mobileType, emailType]));
      act(() => {
        result.current.setActiveTypeId('email');
      });
      expect(result.current.selectedPrefix).toBeNull();
    });

    it('ignores switching to the already active type', () => {
      const {result} = renderHook(() => useLoginIdInput([mobileType, emailType]));
      act(() => {
        result.current.setRawInput('9876543210');
      });
      act(() => {
        // Switch to the same type
        result.current.setActiveTypeId('mobile');
      });
      // rawInput should NOT be cleared
      expect(result.current.rawInput).toBe('9876543210');
    });
  });

  describe('prefix switching', () => {
    it('does not clear raw input when prefix changes', () => {
      const {result} = renderHook(() => useLoginIdInput([mobileType]));
      act(() => {
        result.current.setRawInput('123456789');
      });
      act(() => {
        result.current.setSelectedPrefix(mobilePrefixKHM);
      });
      expect(result.current.rawInput).toBe('123456789');
    });

    it('re-validates against new prefix maxLength', () => {
      const {result} = renderHook(() => useLoginIdInput([mobileType]));
      // 10 digits is valid for IND (maxLength: 10) but invalid for KHM (maxLength: 9)
      act(() => {
        result.current.setRawInput('1234567890');
      });
      expect(result.current.errorKey).toBeNull();
      act(() => {
        result.current.setSelectedPrefix(mobilePrefixKHM);
      });
      expect(result.current.errorKey).toBe('validations.invalid.format.error');
    });
  });

  describe('degenerate single-type case', () => {
    it('works correctly with a single type', () => {
      const {result} = renderHook(() => useLoginIdInput([singleType]));
      expect(result.current.activeType.id).toBe('email');
      act(() => {
        result.current.setRawInput('hello');
      });
      expect(result.current.finalValue).toBe('hello');
    });

    it('enforces maxLength validation on single type', () => {
      const {result} = renderHook(() => useLoginIdInput([singleType]));
      act(() => {
        result.current.setRawInput('12345678901'); // 11 chars, maxLength is 10
      });
      expect(result.current.errorKey).toBe('validations.invalid.format.error');
    });
  });
});
