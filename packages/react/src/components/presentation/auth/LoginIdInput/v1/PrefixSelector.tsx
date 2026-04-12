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

import {LoginIdPrefix} from '@asgardeo/browser';
import {bem, withVendorCSSClassPrefix} from '@asgardeo/browser';
import {cx} from '@emotion/css';
import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingPortal,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useListNavigation,
  useRole,
} from '@floating-ui/react';
import {FC, ReactElement, useRef, useState} from 'react';
import usePrefixSelectorStyles from './PrefixSelector.styles';
import useTheme from '../../../../../contexts/Theme/useTheme';
import ChevronDown from '../../../../primitives/Icons/ChevronDown';

export interface PrefixSelectorProps {
  /** Whether the parent field is disabled */
  disabled?: boolean;
  /** Whether the parent field has an error */
  hasError?: boolean;
  /** Called when the user picks a different prefix */
  onSelect: (prefix: LoginIdPrefix) => void;
  /** The list of selectable prefix options */
  options: LoginIdPrefix[];
  /** Currently selected prefix */
  selectedPrefix: LoginIdPrefix | null;
}

/**
 * Reusable prefix dropdown selector for LOGIN_ID_INPUT (and future PHONE_INPUT).
 * Renders a custom styled button that opens a Floating UI listbox of prefix options.
 */
const PrefixSelector: FC<PrefixSelectorProps> = ({
  options,
  selectedPrefix,
  onSelect,
  disabled = false,
  hasError = false,
}: PrefixSelectorProps): ReactElement => {
  const {theme, colorScheme}: ReturnType<typeof useTheme> = useTheme();
  const styles: Record<string, string> = usePrefixSelectorStyles(theme, colorScheme, disabled, hasError);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const listRef = useRef<Array<HTMLButtonElement | null>>([]);

  const {refs, floatingStyles, context} = useFloating({
    middleware: [offset(4), flip(), shift()],
    onOpenChange: setIsOpen,
    open: isOpen,
    whileElementsMounted: autoUpdate,
  });

  const click: ReturnType<typeof useClick> = useClick(context, {enabled: !disabled});
  const dismiss: ReturnType<typeof useDismiss> = useDismiss(context, {enabled: !disabled});
  const role: ReturnType<typeof useRole> = useRole(context, {enabled: !disabled, role: 'listbox'});
  const listNavigation: ReturnType<typeof useListNavigation> = useListNavigation(context, {
    listRef,
    activeIndex,
    onNavigate: setActiveIndex,
    loop: true,
  });
  const {getReferenceProps, getFloatingProps, getItemProps} = useInteractions([click, dismiss, role, listNavigation]);

  return (
    <div className={cx(withVendorCSSClassPrefix(bem('login-id-input', 'prefix-selector')), styles['container'])}>
      <button
        ref={refs.setReference}
        type="button"
        disabled={disabled}
        aria-label="Select prefix"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={cx(styles['trigger'], hasError && styles['triggerError'])}
        {...getReferenceProps()}
      >
        <span className={styles['triggerLabel']}>{selectedPrefix?.label ?? ''}</span>
        <ChevronDown />
      </button>

      {isOpen && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              {...getFloatingProps()}
              className={styles['listbox']}
              role="listbox"
              aria-label="Select prefix"
            >
              {options.map((prefix: LoginIdPrefix, index: number) => (
                <button
                  key={prefix.value}
                  ref={(node: HTMLButtonElement | null) => {
                    listRef.current[index] = node;
                  }}
                  type="button"
                  role="option"
                  tabIndex={activeIndex === index ? 0 : -1}
                  aria-selected={prefix.value === selectedPrefix?.value}
                  className={cx(styles['option'], prefix.value === selectedPrefix?.value && styles['optionActive'])}
                  {...getItemProps({
                    onClick: () => {
                      onSelect(prefix);
                      setIsOpen(false);
                    },
                  })}
                >
                  <span className={styles['optionLabel']}>{prefix.label}</span>
                </button>
              ))}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </div>
  );
};

export default PrefixSelector;
